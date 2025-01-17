import prisma from "../lib/prisma";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import multer from 'multer';
import { Router } from "express";
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/profilePictures';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const profileRouter = Router();

// Define interface for authenticated request
interface AuthenticatedRequest extends Request {
  file?: Express.Multer.File;
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Auth middleware with proper typing
const middleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization;
console.log(token)
  if (!token) {
    res.status(401).json({ msg: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ msg: "Invalid or expired token." });
  }
};

// Add this route to your profileRouter or userRouter

profileRouter.get(
  '/userpreferences',
  middleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    
    if (!req.user) {
      res.status(401).json({ msg: "User not authenticated" });
      return;
    }

    try {
      const user = await prisma.userPreferences.findFirst({
        where: { userId: req.user.id },
      select:{
        bio:true,
        receiveMarkettingEmails:true,
        gender:true,
        accountType:true,
        website:true
      }
      });

      if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ msg: "Failed to fetch user profile" });
    }
  }
);


// Profile picture upload endpoint
profileRouter.post(
  '/profile',
  middleware,
  upload.single('displayPictureUrl'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ msg: "User not authenticated" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ msg: "No file uploaded" });
      return;
    }

    try {
      // Get current user to check for existing profile picture
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      // Delete old profile picture if it exists
      if (currentUser?.displayPictureUrl) {
        const oldFilePath = path.join(process.cwd(), currentUser.displayPictureUrl);
        try {
          await fs.promises.unlink(oldFilePath);
        } catch (error) {
          console.error("Error deleting old profile picture:", error);
        }
      }

      // Update user with new profile picture
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          displayPictureUrl: req.file.path
        }
      });

      res.json({
        msg: "Profile picture updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error during uploading profile picture:", error);
      res.status(500).json({ msg: "Failed to update profile picture" });
    }
  }
);

// User preferences endpoint
profileRouter.post(
  '/userpreferences',
  middleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ msg: "User not authenticated" });
      return;
    }

    const { bio, receiveMarkettingEmails, website, gender, accountType } = req.body;

    try {
      // Check if user preferences already exist
      const existingPreferences = await prisma.userPreferences.findUnique({
        where: { userId: req.user.id }
      });

      let userDetails;
      if (existingPreferences) {
        // Update existing preferences
        userDetails = await prisma.userPreferences.update({
          where: { userId: req.user.id },
          data: {
            bio,
            receiveMarkettingEmails,
            website,
            gender,
            accountType
          }
        });
      } else {
        // Create new preferences
        userDetails = await prisma.userPreferences.create({
          data: {
            bio,
            receiveMarkettingEmails,
            website,
            gender,
            accountType,
            user: { connect: { id: req.user.id } }
          }
        });
      }

      res.json({ userDetails });
    } catch (error) {
      console.error("Error in managing UserPreferences:", error);
      res.status(500).json({ msg: "Failed to update user preferences" });
    }
  }
);

export default profileRouter;
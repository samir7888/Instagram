import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { Request, Response } from "express";
var jwt = require("jsonwebtoken");

const Router = require("express");

const userRouter = Router();
const saltRounds = 10;
interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Extend request object to include user
}
function middleware(req: AuthenticatedRequest, res: Response, next: any) {
  const token = req.headers.authorization || req.headers['Authorization'];
  
  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: any;
    };
    req.user = decoded; // Attach user info to request object
    next();
  } catch (error) {
    return res.status(403).json({ msg: "Invalid or expired token." });
  }
}




//signup
userRouter.post("/signup", async (req: any, res: any) => {
  const { email, password, username } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password:hashedPassword,
        username,
      },
    });
    const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({
      id: user.id,
      email,
      password,
      username,
      token,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});




//signin
userRouter.post("/signin", async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    
    // Check if the user exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    if (!existingUser) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }
   // Compare the entered password with the stored hash
   const isMatch = await bcrypt.compare(password, existingUser.password);
   if (!isMatch) {
     return res.status(401).json({ msg: "Invalid email or password" });
   }
    // Validate user and password
    if (!existingUser ) {
      return res.status(401).json({
        msg: "Invalid email or password",
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }
    const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET);

    // Respond with user info and token
    res.status(200).json({
      id: existingUser.id,
      email: existingUser.email,
      token,
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});







//to get  all users
userRouter.get("/", async(req: any, res: any) => {
  try {
    const user = await prisma.user.findMany();
    return res.json(user);
  } catch (error) {
    console.log(error)
  }
});


//to get  all suggested users
userRouter.get("/feed/suggestions", middleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const users = await prisma.user.findMany({
      where: {
        // Exclude the current user
        id: {
          not: req.user.id
        },
        isFollowedByUser:false
    
      },
      select: {
        id: true,
        username: true,
        displayPictureUrl: true,
        isFollowedByUser:true
      }
    });

    return res.json(users);
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return res.status(500).json({ msg: "Failed to fetch suggested users" });
  }
});




//to get each user  detail
userRouter.get("/:id", async (req : Request, res:Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findFirst({
      where: { id },
      include: {
        
        UserPreferences: true,
       followedBy:true,
       following:true,
       createdPosts:true,
       likedPosts:true,
       
      }
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

  return res.json({
    id: user.id,
    username: user.username,
    email:user.email,
    isFollowedByUser:user.isFollowedByUser,
    displayPictureUrl: user.displayPictureUrl,
    UserPreferences: user.UserPreferences,
    createdPosts: user.createdPosts,
    followedBy:user.followedBy,
    following: user.following
    

    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});





//follow section


//to follow a user
userRouter.post("/follow/:id", middleware, async (req:AuthenticatedRequest, res:Response) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized" });
    
  }
  const followerId = req.user.id; // Authenticated user
  const followingId = req.params.id; // User to follow

  if (followerId === followingId) {
    return res.status(400).json({ msg: "You cannot follow yourself" });
  }

  try {
    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existingFollow) {
      return res.status(400).json({ msg: "You are already following this user" });
    }

    // Create follow entry
    await prisma.follow.create({
      data: { followerId, followingId },
    });

    res.json({ msg: "Successfully followed the user" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

//to unfollow a user
userRouter.post("/unfollow/:id", middleware, async (req:AuthenticatedRequest, res:Response) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const followerId = req.user.id; // Authenticated user
  const followingId = req.params.id; // User to unfollow

  try {
    // Check if following
    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (!existingFollow) {
      return res.status(400).json({ msg: "You are not following this user" });
    }

    // Delete follow entry
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });

    res.json({ msg: "Successfully unfollowed the user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});




// Get followers of a user
userRouter.get("/:id/followers", async (req:Request, res:Response) => {
  const { id } = req.params; // User ID

  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: id },
      include: { follower: { select: { id: true, username: true } } },
    });

    res.json(followers.map(f => f.follower));
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Get following list of a user
userRouter.get("/:id/following", async (req:Request, res:Response) => {
  const { id } = req.params; // User ID

  try {
    const following = await prisma.follow.findMany({
      where: { followerId: id },
      include: { following: { select: { id:true, username:true } } },
    });

    res.json(following.map(f => f.following));
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

export default userRouter;

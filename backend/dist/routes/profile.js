"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/profilePictures';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// Configure multer upload
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
const profileRouter = (0, express_1.Router)();
// Auth middleware with proper typing
const middleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ msg: "No token provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ msg: "Invalid or expired token." });
    }
};
// Add this route to your profileRouter or userRouter
profileRouter.get('/userpreferences', middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ msg: "User not authenticated" });
        return;
    }
    try {
        const user = yield prisma_1.default.userPreferences.findFirst({
            where: { userId: req.user.id },
            select: {
                bio: true,
                receiveMarkettingEmails: true,
                gender: true,
                accountType: true,
                website: true
            }
        });
        if (!user) {
            res.status(404).json({ msg: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ msg: "Failed to fetch user profile" });
    }
}));
// Profile picture upload endpoint
profileRouter.post('/profile', middleware, upload.single('displayPictureUrl'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const currentUser = yield prisma_1.default.user.findUnique({
            where: { id: req.user.id }
        });
        // Delete old profile picture if it exists
        if (currentUser === null || currentUser === void 0 ? void 0 : currentUser.displayPictureUrl) {
            const oldFilePath = path_1.default.join(process.cwd(), currentUser.displayPictureUrl);
            try {
                yield fs_1.default.promises.unlink(oldFilePath);
            }
            catch (error) {
                console.error("Error deleting old profile picture:", error);
            }
        }
        // Update user with new profile picture
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: req.user.id },
            data: {
                displayPictureUrl: req.file.path
            }
        });
        res.json({
            msg: "Profile picture updated successfully",
            user: updatedUser
        });
    }
    catch (error) {
        console.error("Error during uploading profile picture:", error);
        res.status(500).json({ msg: "Failed to update profile picture" });
    }
}));
// User preferences endpoint
profileRouter.post('/userpreferences', middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ msg: "User not authenticated" });
        return;
    }
    const { bio, receiveMarkettingEmails, website, gender, accountType } = req.body;
    try {
        // Check if user preferences already exist
        const existingPreferences = yield prisma_1.default.userPreferences.findUnique({
            where: { userId: req.user.id }
        });
        let userDetails;
        if (existingPreferences) {
            // Update existing preferences
            userDetails = yield prisma_1.default.userPreferences.update({
                where: { userId: req.user.id },
                data: {
                    bio,
                    receiveMarkettingEmails,
                    website,
                    gender,
                    accountType
                }
            });
        }
        else {
            // Create new preferences
            userDetails = yield prisma_1.default.userPreferences.create({
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
    }
    catch (error) {
        console.error("Error in managing UserPreferences:", error);
        res.status(500).json({ msg: "Failed to update user preferences" });
    }
}));
exports.default = profileRouter;

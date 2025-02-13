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
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../lib/prisma"));
var jwt = require("jsonwebtoken");
const Router = require("express");
const userRouter = Router();
const saltRounds = 10;
function middleware(req, res, next) {
    const token = req.headers.authorization || req.headers['Authorization'];
    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next();
    }
    catch (error) {
        return res.status(403).json({ msg: "Invalid or expired token." });
    }
}
//signup
userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
    try {
        const user = yield prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
            },
        });
        const token = yield jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.json({
            id: user.id,
            email,
            password,
            username,
            token,
        });
    }
    catch (error) {
        console.log("Error creating blog:", error);
    }
}));
//signin
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { email },
        });
        if (!existingUser) {
            return res.status(401).json({ msg: "Invalid email or password" });
        }
        // Compare the entered password with the stored hash
        const isMatch = yield bcrypt_1.default.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid email or password" });
        }
        // Validate user and password
        if (!existingUser) {
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
    }
    catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
}));
//to get  all users
userRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findMany();
        return res.json(user);
    }
    catch (error) {
        console.log(error);
    }
}));
//to get  all suggested users
userRouter.get("/feed/suggestions", middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: "User not authenticated" });
        }
        const users = yield prisma_1.default.user.findMany({
            where: {
                // Exclude the current user
                id: {
                    not: req.user.id
                },
                isFollowedByUser: false
            },
            select: {
                id: true,
                username: true,
                displayPictureUrl: true,
                isFollowedByUser: true
            }
        });
        return res.json(users);
    }
    catch (error) {
        console.error("Error fetching suggested users:", error);
        return res.status(500).json({ msg: "Failed to fetch suggested users" });
    }
}));
//to get each user  detail
userRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma_1.default.user.findFirst({
            where: { id },
            include: {
                UserPreferences: true,
                followedBy: true,
                following: true,
                createdPosts: true,
                likedPosts: true,
            }
        });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        return res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            isFollowedByUser: user.isFollowedByUser,
            displayPictureUrl: user.displayPictureUrl,
            UserPreferences: user.UserPreferences,
            createdPosts: user.createdPosts,
            followedBy: user.followedBy,
            following: user.following
        });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
}));
//follow section
//to follow a user
userRouter.post("/follow/:id", middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingFollow = yield prisma_1.default.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
        if (existingFollow) {
            return res.status(400).json({ msg: "You are already following this user" });
        }
        // Create follow entry
        yield prisma_1.default.follow.create({
            data: { followerId, followingId },
        });
        res.json({ msg: "Successfully followed the user" });
    }
    catch (error) {
        console.error("Error following user:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
}));
//to unfollow a user
userRouter.post("/unfollow/:id", middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ msg: "Unauthorized" });
    }
    const followerId = req.user.id; // Authenticated user
    const followingId = req.params.id; // User to unfollow
    try {
        // Check if following
        const existingFollow = yield prisma_1.default.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
        if (!existingFollow) {
            return res.status(400).json({ msg: "You are not following this user" });
        }
        // Delete follow entry
        yield prisma_1.default.follow.delete({
            where: { followerId_followingId: { followerId, followingId } },
        });
        res.json({ msg: "Successfully unfollowed the user" });
    }
    catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
}));
// Get followers of a user
userRouter.get("/:id/followers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // User ID
    try {
        const followers = yield prisma_1.default.follow.findMany({
            where: { followingId: id },
            include: { follower: { select: { id: true, username: true } } },
        });
        res.json(followers.map(f => f.follower));
    }
    catch (error) {
        console.error("Error fetching followers:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
}));
// Get following list of a user
userRouter.get("/:id/following", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // User ID
    try {
        const following = yield prisma_1.default.follow.findMany({
            where: { followerId: id },
            include: { following: { select: { id: true, username: true } } },
        });
        res.json(following.map(f => f.following));
    }
    catch (error) {
        console.error("Error fetching following list:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
}));
exports.default = userRouter;

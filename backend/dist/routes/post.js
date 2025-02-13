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
exports.middleware = middleware;
const Router = require('express');
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postRouter = Router();
function middleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next();
    }
    catch (error) {
        return res.status(403).json({ msg: "Invalid or expired token." });
    }
}
postRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma_1.default.post.findMany({
            include: {
                author: true,
                _count: {
                    select: { likes: true, comments: true },
                },
            }
        });
        if (posts.length === 0) {
            return res.status(404).json({ msg: "No posts found" });
        }
        return res.json(posts);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
}));
//to create a new post
postRouter.post('/create/:id', upload.array("imagesUrl"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, caption } = req.body;
    // Ensure `req.files` exists and extract file paths
    const images = req.files
        ? req.files.map(file => file.path) // ✅ Extract file paths
        : [];
    try {
        const post = yield prisma_1.default.post.create({
            data: {
                title,
                caption,
                imagesUrl: images, // ✅ Store file paths instead of binary data
                authorId: id
            },
        });
        return res.json(post);
    }
    catch (error) {
        console.error("Error during post creation:", error);
        return res.status(500).json({ msg: "You cannot create post" });
    }
}));
//to get each person posts
postRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const post = yield prisma_1.default.post.findMany({
            where: {
                authorId: id
            }, select: {
                title: true,
                caption: true,
                imagesUrl: true,
                author: { select: {
                        id: true,
                        username: true,
                        displayPictureUrl: true
                    } },
                createdAt: true,
                updatedAt: true,
                comments: true,
                likes: true
            }
        });
        if (post.length === 0) {
            return res.status(404).json({ msg: "user does not have any post" });
        }
        return res.json(post);
    }
    catch (error) {
        console.log('Post with the given id not found', error);
        return res.status(404).json({ msg: "Post not found" });
    }
}));
//to get specific post
postRouter.get("/posts/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const post = yield prisma_1.default.post.findUnique({
            where: {
                id: id
            }, include: {
                author: true,
                _count: true
            }
        });
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        return res.json(post);
    }
    catch (error) {
        console.log('Post with the given id not found', error);
        return res.status(404).json({ msg: "Post not found" });
    }
}));
//to delete a post
postRouter.delete("/:id", middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const post = yield prisma_1.default.post.delete({
            where: {
                id: id,
            },
        });
        return res.json({
            msg: "Post deleted successfully",
        });
    }
    catch (error) {
        console.log("Post with the given id not found", error);
        return res.status(404).json({ msg: "Post not found" });
    }
}));
//to update a post
postRouter.put("/:id", middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, caption, imagesUrl } = req.body;
    const images = Array.isArray(req.body.imagesUrl)
        ? req.body.imagesUrl
        : [req.body.imagesUrl];
    try {
        const post = yield prisma_1.default.post.update({
            data: {
                title,
                caption,
                imagesUrl: images,
            },
            where: {
                id: id
            }
        });
        return res.json(post);
    }
    catch (error) {
        return res.status(404).json({ msg: "Post not updated" });
    }
}));
// likes
postRouter.get('/:postId/isLiked', middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return null;
        }
        const postId = req.params.postId;
        const userId = req.user.id; // From auth middleware
        const post = yield prisma_1.default.post.findFirst({
            where: {
                id: postId,
                likes: {
                    some: {
                        id: userId
                    }
                },
            },
        });
        return res.json({ liked: !!post });
    }
    catch (error) {
        console.error('Error checking like status:', error);
        return res.status(500).json({ error: 'Failed to check like status' });
    }
}));
// Add like to a post
postRouter.post('/:postId/like', middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return null;
        }
        const postId = req.params.postId;
        const userId = req.user.id;
        // Check if post exists
        const post = yield prisma_1.default.post.findUnique({
            where: { id: postId },
            include: {
                likes: true
            }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // Check if already liked
        const existingLike = post.likes.some(user => user.id === userId);
        if (existingLike) {
            return res.status(400).json({ error: 'Post already liked' });
        }
        // Create like
        const updatedPost = yield prisma_1.default.post.update({
            where: { id: postId },
            data: {
                likes: {
                    connect: { id: userId }
                }
            },
            include: {
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        });
        return res.json({
            message: 'Post liked successfully',
            likeCount: updatedPost._count.likes
        });
    }
    catch (error) {
        console.error('Error liking post:', error);
        return res.status(500).json({ error: 'Failed to like post' });
    }
}));
// Remove like from a post
postRouter.post('/:postId/removeLike', middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return;
        }
        const postId = req.params.postId;
        const userId = req.user.id;
        const updatedPost = yield prisma_1.default.post.update({
            where: { id: postId },
            data: {
                likes: {
                    connect: { id: userId }
                }
            },
            include: {
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        });
        return res.json({
            message: 'Like removed successfully',
            likeCount: updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost._count.likes
        });
    }
    catch (error) {
        console.error('Error removing like:', error);
        return res.status(500).json({ error: 'Failed to remove like' });
    }
}));
exports.default = postRouter;

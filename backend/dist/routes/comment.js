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
const Router = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const commentRouter = Router();
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
//to comment on a post
commentRouter.post("/create/:id", middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { content } = req.body;
    //todo set zod
    try {
        if (!req.user)
            return res.status(401).json({ msg: "Unauthorized" });
        const comment = yield prisma_1.default.comment.create({
            data: {
                content,
                commentUserId: req.user.id,
                postId: id,
            },
        });
        return res.json(comment);
    }
    catch (error) {
        return res.status(404).json({ msg: "You cannot comment on this post" });
    }
}));
//to get all the comments of the post
commentRouter.get("/create/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    //todo set zod
    try {
        const comment = yield prisma_1.default.comment.findMany({ where: {
                postId: id
            }, select: {
                id: true,
                content: true,
                commentedBy: true,
            } });
        return res.json(comment);
    }
    catch (error) {
        return res.status(404).json({ msg: "You cannot see comment on this post" });
    }
}));
exports.default = commentRouter;

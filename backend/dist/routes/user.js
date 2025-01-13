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
var jwt = require("jsonwebtoken");
const Router = require("express");
const userRouter = Router();
//to enter user detail
userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    try {
        const user = yield prisma_1.default.user.create({
            data: {
                email,
                password,
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
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { email },
        });
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
//to get  all users as suggestions
userRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findMany();
        return res.json(user);
    }
    catch (error) {
        console.log(error);
    }
    res.send("Get all posts");
}));
//to get each user  detail
userRouter.get("/:id", (req, res) => {
    res.send("Get all posts");
});
exports.default = userRouter;

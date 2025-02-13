"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const path_1 = __importDefault(require("path"));
const post_1 = __importDefault(require("./routes/post"));
const user_1 = __importDefault(require("./routes/user"));
const comment_1 = __importDefault(require("./routes/comment"));
const profile_1 = __importDefault(require("./routes/profile"));
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/user', user_1.default);
app.use('/api/post', post_1.default);
app.use('/api/comment', comment_1.default);
app.use('/api/me', profile_1.default);
app.use('/uploads', express.static('uploads'));
app.use('/uploads/profilePictures', express.static(path_1.default.join(__dirname, 'uploads/profilePictures')));
app.listen(3000, () => {
    console.log("sever created");
});

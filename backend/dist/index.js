"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const post_1 = __importDefault(require("./routes/post"));
const user_1 = __importDefault(require("./routes/user"));
const app = express();
app.use(express.json());
app.use('/api/user', user_1.default);
app.use('/api/post', post_1.default);
app.listen(3000, () => {
    console.log("sever created");
});

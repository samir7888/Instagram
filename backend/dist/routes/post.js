"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require('express');
const postRouter = Router();
postRouter.get('/', (req, res) => {
    res.send('Get all posts');
});
postRouter.post('/create', (req, res) => {
    res.send('Create a new post');
});
exports.default = postRouter;

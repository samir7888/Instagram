const Router = require("express");
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
const commentRouter = Router();

interface GetCommentsRequest extends Request {}
interface GetCommentsResponse extends Response {}
interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Extend request object to include user
}
function middleware(req: AuthenticatedRequest, res: Response, next: any) {
  const token = req.headers.authorization;
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
//to comment on a post
commentRouter.post(
  "/create/:id",
  middleware,
  async (req: AuthenticatedRequest, res: GetCommentsResponse) => {
    const { id } = req.params;
    const { content } = req.body;
    //todo set zod
    try {
       
      if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
      const comment = await prisma.comment.create({
        data: {
          content,
          commentUserId: req.user.id,
          postId: id,
        },
      });
      return res.json(comment);
    } catch (error) {
      return res.status(404).json({ msg: "You cannot comment on this post" });
    }
  }
);

//to get all the comments of the post
commentRouter.get(
  "/create/:id",
  async (req: AuthenticatedRequest, res: GetCommentsResponse) => {
    const { id } = req.params;
    
    //todo set zod
    try {
       
     
      const comment = await prisma.comment.findMany({ where:{
        postId:id
      },select:{
        id:true,
        content:true,
        commentedBy:true,
        
        
      }});
      return res.json(comment);
    } catch (error) {
      return res.status(404).json({ msg: "You cannot see comment on this post" });
    }
  }
);

export default commentRouter;

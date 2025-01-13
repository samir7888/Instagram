const Router = require('express');
import multer from 'multer';
import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

import { Multer } from 'multer';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
const postRouter = Router();

interface GetPostsRequest extends Request {}
interface GetPostsResponse extends Response {}

export function middleware(req: any, res: any, next: any) {

    
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



  postRouter.get('/', async (req: GetPostsRequest, res: GetPostsResponse) => {
    try {
        const posts = await prisma.post.findMany({
          include: {
            author: true,
            _count: {
              select: { likes: true,comments:true },
            },
        }});

        if (posts.length === 0) {
            return res.status(404).json({ msg: "No posts found" });
        }

        return res.json(posts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
});

interface UploadedFile {
  path: string;
}

interface CreatePostRequest extends Request {
  files?: Express.Multer.File[]; // ✅ Add this to fix the issue
  body: {
    title: string;
    caption: string;
  };
  params: {
    id: string;
  };
}


//to create a new post
postRouter.post('/create/:id', upload.array("imagesUrl"), async (req: CreatePostRequest, res: GetPostsResponse) => {
  const { id } = req.params;
  const { title, caption } = req.body;

  // Ensure `req.files` exists and extract file paths
  const images: string[] = req.files 
    ? req.files.map(file => file.path) // ✅ Extract file paths
    : [];

  try {
      const post = await prisma.post.create({
          data: {
              title,
              caption,
              imagesUrl: images, // ✅ Store file paths instead of binary data
              authorId: id
          },
      });

      return res.json(post);
  } catch (error) {
      console.error("Error during post creation:", error);
      return res.status(500).json({ msg: "You cannot create post" });
  }
});



//to get each person posts
postRouter.get("/:id",async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const post = await prisma.post.findMany({
         where:{
          authorId:id
         },select:{
          title:true,
          caption:true,
          imagesUrl:true,
          author:{select:{
            id: true,
            username:true,
            displayPictureUrl:true
          }},
          createdAt:true,
          updatedAt:true,
          comments:true,
          likes:true
         }
        });
        if (post.length === 0) {
          return res.status(404).json({ msg: "user does not have any post" });
        }
        return res.json(post);
      } catch (error) {
          console.log('Post with the given id not found',error)
        return res.status(404).json({ msg: "Post not found" });
      }
      
    });

    //to get specific post
postRouter.get("/posts/:id",async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const post = await prisma.post.findUnique({
         where:{
          id:id
         },include:{
          author:true,
          _count:true
         }
        });
        if (!post) {
          return res.status(404).json({ msg: "Post not found" });
        }
        return res.json(post);
      } catch (error) {
          console.log('Post with the given id not found',error)
        return res.status(404).json({ msg: "Post not found" });
      }
      
    });

    //to delete a post
    postRouter.delete("/:id",middleware, async (req: any, res: any) => {
        const { id } = req.params;
        try {
          const post = await prisma.post.delete({
            where: {
              id: id,
            },
          });
          return res.json({
            msg: "Post deleted successfully",
          });
        } catch (error) {
          console.log("Post with the given id not found", error);
          return res.status(404).json({ msg: "Post not found" });
        }
    });

    //to update a post
    postRouter.put("/:id",middleware, async (req: any, res: any) => {
        const { id } = req.params;
        const { title, caption, imagesUrl } = req.body;
        const images = Array.isArray(req.body.imagesUrl)
          ? req.body.imagesUrl
          : [req.body.imagesUrl];
          try {
            const post = await prisma.post.update({
                data:{
                    title,
                    caption,
                    imagesUrl: images,
                },
                where:{
                    id:id
                }
            });
            return res.json(post);
          } catch (error) {
            return res.status(404).json({ msg: "Post not updated" });
          }
    });




    // likes


    postRouter.get('/:postId/isLiked', middleware, async (req:AuthenticatedRequest, res:Response) => {
      try {
        if (!req.user) {
          return null
        }
        const postId = req.params.postId;
        const userId = req.user.id; // From auth middleware
    
        const post = await prisma.post.findFirst({
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
      } catch (error) {
        console.error('Error checking like status:', error);
        return res.status(500).json({ error: 'Failed to check like status' });
      }
    });
    
    // Add like to a post
    postRouter.post('/:postId/like', middleware, async (req:AuthenticatedRequest, res:Response) => {
      try {
        if (!req.user) {
          return null
        }
        const postId = req.params.postId;
        const userId = req.user.id;
    
        // Check if post exists
        const post = await prisma.post.findUnique({
          where: { id: postId },
          include:{
            likes:true
          }
        });
    
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }
    
        // Check if already liked
        const existingLike = post.likes.some(user => user.id === userId)
    
        if (existingLike) {
          return res.status(400).json({ error: 'Post already liked' });
        }
    
        // Create like
        const updatedPost = await prisma.post.update({
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
      } catch (error) {
        console.error('Error liking post:', error);
        return res.status(500).json({ error: 'Failed to like post' });
      }
    });
    
    // Remove like from a post
    postRouter.post('/:postId/removeLike', middleware, async (req:AuthenticatedRequest, res:Response) => {
      try {
        if (!req.user) {
          return
        }
        const postId = req.params.postId;
        const userId = req.user.id;
    
        const updatedPost = await prisma.post.update({
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
          likeCount: updatedPost?._count.likes
        });
      } catch (error) {
        console.error('Error removing like:', error);
        return res.status(500).json({ error: 'Failed to remove like' });
      }
    });
    



export default postRouter;


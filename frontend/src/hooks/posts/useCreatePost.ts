import { useSetRecoilState } from "recoil";
import { postState } from "../../store/atoms/posts";
import { useCallback } from "react";
import axios from "axios";
import { IPost } from "../../interfaces";

interface Post{
  id:string,
  title:string,
  caption:string,
  imagesUrl:string[];
  
}

export const useCreatePost = (userId: string) => {
  const setPost = useSetRecoilState(postState);

  const createPost = useCallback(
    async (formData: FormData, token: string) => {
      try {
        const response = await axios.post<IPost>(
          `https://instagram-production-90d9.up.railway.app/api/post/create/${userId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: token,
            },
          }
        );
        const newPost: Post = {
          id: response.data.id,
          title: response.data.title,
          caption: response.data.caption,
          imagesUrl: response.data.imagesUrl,
        };
        setPost((prevPosts) => [...prevPosts, newPost]);
      } catch (error: unknown) {
       console.log(error)
      }
    },
    [setPost, userId]
  );

  return { setPost: createPost };
};

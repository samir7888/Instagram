import { useSetRecoilState } from "recoil";
import { postState } from "../../store/atoms/posts";
import { useCallback } from "react";
import axios, { AxiosError } from "axios";
import { IPost } from "../../interfaces";

// Define types for post data
interface Post {
  id: string;
  title: string;
  caption: string;
  imagesUrl: string[];
  // Add other post properties as needed
}

export const useCreatePost = (userId: string) => {
  const setPost = useSetRecoilState(postState);

  const createPost = useCallback(
    async (formData: FormData, token: string) => {
      try {
        const response = await axios.post<Post>(
          `https://instagram-production-90d9.up.railway.app/api/post/create/${userId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: token,
            },
          }
        );
        const newPost: any = {
          id: response.data.id,
          title: response.data.title,
          caption: response.data.caption,
          imagesUrl: response.data.imagesUrl,
        };
        setPost((prevPosts) => [...prevPosts, newPost]);
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        throw new Error(
          axiosError.response?.data?.message || "Failed to create post"
        );
      }
    },
    [setPost, userId]
  );

  return { setPost: createPost };
};

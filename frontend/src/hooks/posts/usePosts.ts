import { useSetRecoilState } from "recoil";
import { useCallback, useEffect } from "react";
import { postState } from "../../store/atoms/posts";
import axios from "axios";
import { IPost } from "../../interfaces";





export function usePosts() {
  const setPosts = useSetRecoilState<IPost[]>(postState);

  const getPosts = useCallback(async () => {
    try {
      const response = await axios.get<IPost[]>(
        "https://instagram-production-90d9.up.railway.app/api/post/"
      );
      setPosts(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
      throw error;
    }
  }, [setPosts]);

  // Fetch posts when hook is initialized
  useEffect(() => {
    getPosts();
  }, [getPosts]);

  return { getPosts };
}

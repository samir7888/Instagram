import { postUserState } from "./../../store/atoms/posts";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";

import { postStateWithID } from "../../store/atoms/posts";
import axios from "axios";

export function useSinglePost(postId: string) {
  const setPost = useSetRecoilState(postStateWithID(postId));

  const getPost = useCallback(
    async (postId: string) => {
      const response = await axios.get(
        `https://instagram-production-90d9.up.railway.app/api/post/posts/${postId}`
      );

      setPost(response.data);
    },
    [setPost, postId]
  );

  return { getPost };
}

//user posts
export function useSingleUserPost() {
  const postUserStateValue = useSetRecoilState(postUserState);

  const getUserPost = useCallback(
    async (userId: string) => {
      const response = await axios.get(
        `https://instagram-production-90d9.up.railway.app/api/post/${userId}`
      );
      postUserStateValue(response.data);
    },
    [postUserStateValue]
  );

  return { getUserPost };
}

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";

import { postStateWithID } from "../../store/atoms/posts";
import { IPost } from "../../interfaces/";
import axios from "axios";

export function useLike(postId: string) {
  const [postState, setPostState] = useRecoilState(postStateWithID(postId));
  const [isLiked, setIsLiked] = useState(false);
  const token = localStorage.getItem("token");
  const isPostLiked = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://instagram-production-90d9.up.railway.app/api/post/${postId}/isLiked`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data.liked as boolean;
    } catch {
      toast.error("Error happened while fetching likes");
    }
  }, [postId]);

  useEffect(() => {
    isPostLiked().then((value) => {
      setIsLiked(value!);
    });
  }, [isPostLiked]);

  //to like
  const like = useCallback(async () => {
    try {
      await axios.post(
        `https://instagram-production-90d9.up.railway.app/api/post/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      if (postState !== null) {
        // Update the likes property
        const updatedPost: IPost = {
          ...postState,
          _count: {
            ...postState._count,
            likes: postState._count.likes + 1,
          },
        };
        // Set the updated state
        setPostState(updatedPost);
        setIsLiked(true);
      }
    } catch {
      toast.error("Unable to like the post");
    }
  }, [postId, postState, setPostState]);

  const unLike = useCallback(async () => {
    try {
      await axios.post(
        `https://instagram-production-90d9.up.railway.app/api/post/${postId}/removeLike`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      if (postState !== null) {
        // Update the likes property
        const updatedPost: IPost = {
          ...postState,
          _count: {
            ...postState._count,
            likes: postState._count.likes - 1,
          },
        };
        // Set the updated state
        setPostState(updatedPost);
        setIsLiked(false);
      }
    } catch {
      toast.error("Unable to remove like from the post");
    }
  }, [postId, postState, setPostState]);

  return { like, unLike, isLiked };
}

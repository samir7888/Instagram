import { useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";

import { commentStateWithPostID } from "../../store/atoms/comments";
import { IComment } from "../../interfaces";
import axios from "axios";

export const useComments = (postId: string) => {
  const token = localStorage.getItem("token");
  const [comments, setComments] = useRecoilState(
    commentStateWithPostID(postId)
  );

  useEffect(() => {
    const getComments = async () => {
      const response = await axios.get(
        `https://instagram-production-90d9.up.railway.app/api/comment/create/${postId}`
      );
      const responseData = response.data as IComment[];
      setComments(responseData);
    };

    getComments();
  }, [postId, setComments]);

  const postComment = useCallback(
    async (content: string) => {
      await axios.post(
        `https://instagram-production-90d9.up.railway.app/api/comment/create/${postId}`,
        {
          content,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
    },
    [postId]
  );

  return { comments, postComment };
};

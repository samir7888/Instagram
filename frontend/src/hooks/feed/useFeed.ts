import { useRecoilState } from "recoil";
import { useEffect } from "react";

import { postUrlsState } from "../../store/atoms/posts";
import axios from "axios";

export function useFeed() {
  const [postUrls, setPostUrls] = useRecoilState(postUrlsState);

  useEffect(() => {
    const getPosts = async () => {
      const response = await axios.get(
        "https://instagram-production-90d9.up.railway.app/api/post/"
      );
      setPostUrls([...response.data]);
    };

    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { posts: postUrls };
}

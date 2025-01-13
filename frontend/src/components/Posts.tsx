import Post from "../common/Post";

import { useRecoilValue } from "recoil";
import { postState } from "../store/atoms/posts";

import { usePosts } from "../hooks/posts/usePosts";
import { useEffect } from "react";
const Posts = () => {
  const posts = useRecoilValue(postState);
  const { getPosts } = usePosts();
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        await getPosts();
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [getPosts]);
  if (!posts.length) {
    return (
      <div className="text-white text-center py-8">No posts available</div>
    );
  }

  return (
    <div className="space-y-2 text-white">
      {posts.map((post) => {
       
        return <Post postId={post.id} key={post.id} />;
      })}
    </div>
  );
};

export default Posts;

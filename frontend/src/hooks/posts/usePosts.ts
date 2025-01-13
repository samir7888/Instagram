import { useSetRecoilState } from 'recoil';
import { useCallback, useEffect } from 'react';
import { postState } from '../../store/atoms/posts';
import axios from 'axios';

interface Author {
  id: string;
  username: string;
  displayPictureUrl: string;
}

interface Post {
  id: string;
  caption: string;
  imagesUrl: string[];
  likes: number;
  comments: number;
  author: Author;
  username: string;
}

export function usePosts() {
  const setPosts = useSetRecoilState<Post[]>(postState);

  const getPosts = useCallback(async () => {
    try {
      const response = await axios.get<Post[]>('http://localhost:3000/api/post/');
      setPosts(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
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
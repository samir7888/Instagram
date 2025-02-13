export interface IPost {
    id: string;
    title: string;
    caption: string;
    imagesUrl: string[];
    comments?:string[];
    author?: {
      id: string;
      username: string;
      displayPictureUrl: string;
    };
    createdAt?: string;
    updatedAt?: string;
    _count?: {
      comments?: number;
      likes?: number;
    };
  }
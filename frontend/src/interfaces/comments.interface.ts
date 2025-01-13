export interface IComment {
    content: string;
    commentedBy: {
      id:string;
      username: string;
      displayPictureUrl: string;
    };
  }
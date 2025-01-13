export interface ICurrentProfile {
  loading: boolean;
  id: string;
  email: string;
  username: string;
  password?: string; // Consider omitting this in frontend for security reasons
  isVerified: boolean;
  createdPosts:number[]
  displayPictureUrl: string | null;
  displayPictureKey: string | null;
  UserPreferences: {
    accountType?: 'PUBLIC' | 'PRIVATE'; // Optional since API returns `null`
    bio?: string | null;
    gender?: 'PREFER_NOT_SAY' | 'MALE' | 'FEMALE';
    website?: string | null;
  } | null; // API returns `null`, so making it optional,
  followedBy:number[],
  following:number[],
  _count: {
    createdPosts: number;
    followedBy: number;
    following: number;
  };
  isFollowedByUser: boolean;
}

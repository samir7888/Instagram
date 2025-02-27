import { atom } from 'recoil';

import { ICurrentProfile, IloggedInUserProfile } from '../../interfaces';

export const profileFilterState = atom({
  key: 'profileFilterState',
  default: '',
});

export const currentProfileState = atom<ICurrentProfile>({
  key: 'currentProfileState',
  default: {
    loading: true,
    id: '',
    username: '',
    displayPictureUrl: '',
    email: '',
    isVerified: false,
    displayPictureKey: '',
    createdPosts:[],
    followedBy: [],
    following: [],
    UserPreferences: {
      accountType: 'PUBLIC',
      bio: null,
      gender: 'PREFER_NOT_SAY',
      website: null,
    },
    _count: {
      createdPosts: 0,
      followedBy: 0,
      following: 0,
    },
    isFollowedByUser: false,
  },
});

export const loggedInUserProfileState = atom<IloggedInUserProfile>({
  key: 'loggedInUserProfileState',
  default: {
    id: '',
    username: '',
    displayPictureUrl: '',
  },
});
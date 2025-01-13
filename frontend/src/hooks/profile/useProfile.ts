import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { currentProfileState } from '../../store/atoms/profile';
import { ICurrentProfile } from '../../interfaces';
import axios from 'axios';
export function useProfile() {
  const setCurrentUserProfile = useSetRecoilState(currentProfileState);
  const [userNotFound, setUserNotFound] = useState(false);

  const getProfile = useCallback(
    async (id: string) => {
      setUserNotFound(false);
      try {
        const response = await axios.get(`http://localhost:3000/api/user/${id}`);
        const profileData = response.data as ICurrentProfile;
        setCurrentUserProfile(profileData);
      } catch (e: unknown) {
        if (e instanceof AxiosError) {
          console.log(e.response?.status);
          if (e.response?.status) {
            setUserNotFound(true);
            localStorage.removeItem('token');
          }
        }
      }
    },
    [setCurrentUserProfile],
  );

  return { getProfile, userNotFound };
}

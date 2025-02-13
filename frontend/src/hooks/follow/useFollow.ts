import { useSetRecoilState } from "recoil";

import { suggestedUsersState } from "../../store/atoms/suggestedPeople";
import { currentProfileState } from "../../store/atoms/profile";
import axios from "axios";

export function useFollow() {
  const setSuggested = useSetRecoilState(suggestedUsersState);
  const setCurrentProfile = useSetRecoilState(currentProfileState);
  const token = localStorage.getItem("token");
  const followFn = async (id: string) => {
    await axios.post(
      `https://instagram-production-90d9.up.railway.app/api/user/follow/${id}`,
      {},
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    setSuggested((oldSuggestions) =>
      oldSuggestions.filter((user) => user.id !== id)
    );

    setCurrentProfile((currentProfile) => ({
      ...currentProfile,
      isFollowedByUser: true,
    }));
  };

  const unfollowFn = async (id: string) => {
    await axios.post(
      `https://instagram-production-90d9.up.railway.app/api/user/unfollow/${id}`,
      {},
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    setCurrentProfile((currentProfile) => ({
      ...currentProfile,
      isFollowedByUser: false,
    }));
  };

  return { followFn, unfollowFn };
}

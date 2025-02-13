import React, { useEffect } from "react";

import { useRecoilValue } from "recoil";
import { suggestedUsersState } from "../store/atoms/suggestedPeople";
import {
  currentProfileState,
  loggedInUserProfileState,
} from "../store/atoms/profile";
import { useSuggestedPeople } from "../hooks/feed/useSuggestedPeople";
import { useNavigate } from "react-router-dom";
import { useFollow } from "../hooks/follow/useFollow";

const Suggestionbar = () => {
  const currentUser  = useRecoilValue(currentProfileState)
  const navigate = useNavigate();
  useSuggestedPeople();
  const users = useRecoilValue(suggestedUsersState);
  const loginUser = useRecoilValue(loggedInUserProfileState);
  const { followFn, unfollowFn } = useFollow();
  
  return (
    <>
      {/* User profile */}
      <div
        onClick={() => {
          navigate(`/${loginUser.id}`);
        }}
        className="cursor-pointer mb-8 flex items-center gap-4"
      >
        <img
          src={
            loginUser.displayPictureUrl
              ? `http://localhost:3000/${loginUser.displayPictureUrl}`
              : "../assets/user.png"
          }
          alt="Your profile"
          className="h-14 w-14 rounded-full"
        />

        <div className="font-semibold text-white">
          {loginUser?.username || "me"}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <div className="mb-4 flex justify-between">
          <span className="text-sm font-semibold text-gray-400">
            Suggestions For You
          </span>
          <button className="text-xs font-semibold text-white">See All</button>
        </div>

        <div className="space-y-4">
          {users.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between"
            >
              <div
                onClick={() => {
                  navigate(`/${suggestion.id}`);
                }}
                className="cursor-pointer flex items-center gap-3"
              >
                <img
                  src={
                    suggestion.displayPictureUrl
                      ? `http://localhost:3000/${suggestion.displayPictureUrl}`
                      : "/path/to/default/image.jpg"
                  }
                  alt={suggestion.username}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {suggestion.username}
                  </div>
                  <div className="text-xs text-gray-400">Suggested for you</div>
                </div>
              </div>
              <button
                onClick={async() => {
                  if (!currentUser.isFollowedByUser) {
                    await followFn(suggestion.id || "");
                   
                  } else {
                   await unfollowFn(suggestion.id);
                    
                  }
                }
            }
                className="text-xs font-semibold text-blue-500"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Suggestionbar;



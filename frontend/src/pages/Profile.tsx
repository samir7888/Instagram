import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useNavigate, useParams } from "react-router-dom";
import { Grid } from "lucide-react";
import { currentProfileState } from "../store/atoms/profile";
import { useProfile } from "../hooks/profile/useProfile";
import Navigationbar from "../common/Navigationbar";
import { useSingleUserPost } from "../hooks/posts/useSinglepost";
import { postUserState } from "../store/atoms/posts";

export const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { getProfile, userNotFound } = useProfile();
  const { getUserPost } = useSingleUserPost();
  const userState = useRecoilValue(currentProfileState);
  const userPost = useRecoilValue(postUserState);
  console.log(userState);
  useEffect(() => {
    if (id) {
      getProfile(id);
      getUserPost(id);
    }
  }, [id, getProfile, getUserPost]);

  if (!userState || userState.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (userNotFound) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">User not found</div>
      </div>
    );
  }
  console.log(userState.isFollowedByUser);
  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className=" hidden md:block border-r border-gray-800 w-[30%]">
        <Navigationbar />
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-8 py-8">
        {/* Profile Header */}
        <div className="flex items-start gap-8 mb-8">
          <div className="w-[150px] h-[150px] flex-shrink-0">
            <img
              src={
                userState.displayPictureUrl
                  ? `https://instagram-production-90d9.up.railway.app/${userState.displayPictureUrl}`
                  : "/path/to/default/image.jpg"
              }
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-gray-800"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-xl font-semibold">{userState.username}</h1>

              {id === localStorage.getItem("id") ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/edit");
                    }}
                    className="px-4 py-1.5 bg-gray-800 rounded-lg text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate("/signin");
                    }}
                    className="px-4 py-1.5 bg-red-800 rounded-lg text-sm font-medium"
                  >
                    LogOut
                  </button>
                </>
              ) : (
                <p></p>
              )}

              {userState.isFollowedByUser && (
                <button className="px-4 py-1.5 bg-red-800 rounded-lg text-sm font-medium">
                  UnFollow
                </button>
              )}
            </div>

            <div className="flex gap-8 mb-4">
              <div className="text-sm">
                <span className="font-semibold">
                  {userState?.createdPosts?.length ?? 0}
                </span>{" "}
                posts
              </div>
              <div className="text-sm cursor-pointer">
                <span className="font-semibold">
                  {userState.following.length ?? 0}
                </span>{" "}
                followers
              </div>
              <div className="text-sm cursor-pointer">
                <span className="font-semibold">
                  {userState.followedBy.length ?? 0}
                </span>{" "}
                following
              </div>
            </div>

            <div className="text-sm">
              <p className="whitespace-pre-wrap">
                {userState.UserPreferences?.bio || "No bio available"}
              </p>
            </div>
          </div>
        </div>

        {/* Stories Highlights */}
        <div className="border-t border-gray-800 py-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-gray-800 flex items-center justify-center mb-1">
                <span className="text-2xl">+</span>
              </div>
              <span className="text-xs">New</span>
            </div>
          </div>
        </div>

        {/* Posts Grid Header */}
        <div className="border-t border-gray-800 mt-4">
          <div className="flex justify-center gap-12 py-4">
            <div className="flex items-center gap-1 text-sm border-t border-white pt-4">
              <Grid className="w-4 h-4" />
              <span className="uppercase font-semibold">Posts</span>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {userPost.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {userPost[0]?.imagesUrl?.map((post, index) => (
              <div key={index} className="aspect-square bg-gray-800">
                <img
                  src={`https://instagram-production-90d9.up.railway.app/${post}`}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white text-center py-8">No posts available</div>
        )}
      </div>
    </div>
  );
};

export default Profile;

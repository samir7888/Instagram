import { useRecoilValue } from "recoil";
import { suggestedUsersState } from "../store/atoms/suggestedPeople";
import { useNavigate } from "react-router-dom";


const Stories = () => {
  const stories = useRecoilValue(suggestedUsersState);
  const navigate = useNavigate();
  return (
    <>
    <div className="flex gap-4 p-4 max-w-12   scrollbar-hide">
  {stories.map((story) => (
    <div
      onClick={() => {
        navigate(`/${story.id}`);
      }}
      key={story.id}
      className="cursor-pointer flex flex-col items-center"
    >
      <div className="h-16 w-16 rounded-full ring-2 ring-pink-500 ring-offset-2 ring-offset-black">
        <img
          src={
            story.displayPictureUrl
              ? `https://instagram-production-90d9.up.railway.app/${story.displayPictureUrl}`
              : "https://avatar.iran.liara.run/public"
          }
          alt={story.username}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
      <span className="mt-1 text-xs text-gray-400">{story.username}</span>
    </div>
  ))}
</div>

    </>
  );
};

export default Stories;

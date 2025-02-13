import "react-responsive-carousel/lib/styles/carousel.min.css";

import Navigationbar from "../common/Navigationbar";
import Suggestionbar from "../components/Suggestionbar";
import Posts from "../components/Posts";
import Stories from "../components/Stories";
import { useSetRecoilState } from "recoil";
import { loggedInUserProfileState } from "../store/atoms/profile";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(loggedInUserProfileState);
  useEffect(() => {
    const id = localStorage.getItem("id");
    if (!id) {
      navigate('/signin')
    }
    const loggedUser = async () => {
      const res = await axios.get(`http://localhost:3000/api/user/${id}`);
      setUser(res.data);
    };
    loggedUser();
  }, [setUser]);

  return (
    <div className="min-h-screen bg-black ">
      {/* Main content container */}
      <div className="w-full flex max-w-6xl gap-8  py-4">
        {/* Menu sidebar - hidden on mobile */}
        <div className=" hidden lg:block w-80 relative ">
          <Navigationbar />
        </div>

        {/* Feed section */}
        <div className="flex-grow w-[80%]">
          {/* Stories */}
          <div className="mb-8 overflow-x-auto">
            <Stories />
          </div>

          {/* Posts */}
          <Posts />
        </div>

        {/* Suggestions sidebar - hidden on mobile */}
        <div className="hidden w-80 lg:block bg-black">
          <Suggestionbar />
        </div>
      </div>
    </div>
  );
};

export default Home;

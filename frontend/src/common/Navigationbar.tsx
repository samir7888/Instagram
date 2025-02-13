import Instagram from "../assets/Screenshot 2025-01-04 111342.png";
import { useNavigate } from "react-router-dom";
import {
    House,
    SquarePlus,
    User
  } from "lucide-react";

const Navigationbar = () => {
    const navigate = useNavigate();
    const id = localStorage.getItem("id")
  return (
    <>
     <div className="fixed left-0  ">
            <img src={Instagram} className=" mb-8 w-[175px]" alt="Instagram" />

            <div className=" text-white space-y-4 flex flex-col items-start p-5 justify-center gap-6">
              <div onClick={()=>{
                navigate('/')
              }}  className="flex items-center gap-4 cursor-pointer">
                <House className="h-6 w-6" />
                <h3>Home</h3>
              </div>
             
             
             
              <div onClick={()=>{
                navigate(`/create/${id}`)
              }} className="flex items-center gap-4 cursor-pointer">
                <SquarePlus className="h-6 w-6" />
                <h3>Create</h3>
                
              </div>
              <div onClick={()=>{
                navigate(`/${id}`)
              }} className="flex items-center gap-4 cursor-pointer">
                <User className="h-6 w-6" />
                <h3>Profile</h3>
                
              </div>
            </div>
          </div>
    </>
  )
}

// useEffect(()=>{
//   const userState = useSetRecoilState(loggedInUserProfileState);
// },[])

export default Navigationbar
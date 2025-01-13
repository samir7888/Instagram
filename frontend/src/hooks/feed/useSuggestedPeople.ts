import { useRecoilState } from "recoil";
import { useEffect } from "react";
import { suggestedUsersState } from "../../store/atoms/suggestedPeople";
import axios from "axios";

export function useSuggestedPeople(){
    const [suggestedUsers, setSuggestedUsers] =
    useRecoilState(suggestedUsersState);
const token = localStorage.getItem("token")
    useEffect(()=>{
        const getPosts = async() =>{
            const response = await axios.get('http://localhost:3000/api/user/feed/suggestions', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setSuggestedUsers([...response.data]);
        }
        getPosts();
    },[token, setSuggestedUsers]);
    return {suggestedUsers};
}
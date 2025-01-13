
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { CreatePost } from "./components/Create";
import {Profile} from "./pages/Profile";
import { RecoilRoot } from "recoil";
import { Edit } from "./pages/Edit";
function App() {
  // const id = localStorage.getItem("id");
  return (
    <div className="">
      <RecoilRoot>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create/:id" element={<CreatePost />} />
          <Route path="/:id" element={<Profile />} />
          <Route path="/edit" element={<Edit />} />
        </Routes>
      </Router>
          <ToastContainer  />
      </RecoilRoot>
    </div>
  );
}

export default App;

import React, { useState } from "react";
import Instagram from "../assets/Screenshot 2025-01-04 111342.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "https://instagram-production-90d9.up.railway.app/api/user/signup",
        formData // Send formData directly
      );

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      if (res.data?.id) {
        localStorage.setItem("id", res.data.id);
      }
    } catch (error) {
      console.log("error signing up", error);
    } finally {
      setLoading(false); // Always reset loading state
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="mb-8 w-full max-w-sm">
        <img
          src={Instagram}
          alt="Instagram"
          className="mx-auto mb-8 w-[175px]"
        />
        <div className="rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email" // Changed to email type
              placeholder="Email"
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required // Added required attribute
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6} // Added minimum length
            />
            <input
              type="text"
              placeholder="Username"
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

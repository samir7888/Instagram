import React, { useState } from 'react';
import Instagram from '../assets/Screenshot 2025-01-04 111342.png'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Signin = () => {
  const  navigate = useNavigate();
  const [loading,setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setLoading(true);
        localStorage.clear()
        const res = await axios.post('http://localhost:3000/api/user/signin',
          formData
        );
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
        if (res.data?.id) {
          localStorage.setItem("id", res.data.id);
          
        }
      } catch (error) {
        console.error('Error signing in', error);
      } finally {
        setLoading(false);
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
        
        <div className="rounded-lg  p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type=""
              placeholder="Phone number, username, or email"
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })
            }required
            />
            
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              {loading ? 'Loading...' : 'Log In'}
            </button>
          </form>
          
          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-zinc-700"></div>
            <span className="mx-4 text-sm text-zinc-400">OR</span>
            <div className="flex-1 border-t border-zinc-700"></div>
          </div>
          
          <button 
            onClick={() => {/* Handle Facebook login */}}
            className="mb-4 flex w-full items-center justify-center gap-2 text-sm font-semibold text-blue-500"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Continue with Facebook
          </button>
          
          <a href="#" className="block text-center text-xs text-white">
            Forgot password?
          </a>
        </div>
        
        <div className="mt-4 rounded-lg  p-4 text-center">
          <p className="text-sm text-white">
            Don't have an account?{' '}
            <a href="/signup" className="font-semibold text-blue-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home Link */}
          <div className="flex items-center" onClick={() => navigate('/')}>
            <div className="relative w-8 h-8 mr-2">
              <div className="absolute inset-0 bg-[#D4FF56] rounded-sm rotate-45"></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-black">S</div>
            </div>
            <span className="text-2xl font-bold text-white cursor-pointer">SkillStream</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/upload-course"
              className="bg-[#D4FF56] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[#D4FF56]/90 transition"
            >
              Upload Course
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = checkAuth();
    if (user) {
      setUserData(user);
    }
  }, []);

  const isTeacher = userData?.role === 'teacher';

  const handleLogout = () => {
    logout();
    setUserData(null);
  };

  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home Link */}
          <div 
            className="flex items-center group cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="relative w-10 h-10 mr-3">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4FF56] to-[#96b52a] rounded-sm rotate-45 group-hover:rotate-[60deg] transition-all duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-black">S</div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-[#D4FF56] to-white text-transparent bg-clip-text hover:from-[#D4FF56] hover:via-white hover:to-[#D4FF56] transition-all duration-300">
              SkillStream
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/store"
              className="text-gray-300 hover:text-[#D4FF56] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Browse Courses
            </Link>
            
            {userData && (
              isTeacher ? (
                <Link
                  to="/upload-course"
                  className="bg-gradient-to-r from-[#D4FF56] to-[#96b52a] text-black px-4 py-2 rounded-md text-sm font-medium hover:from-[#96b52a] hover:to-[#D4FF56] transition-all duration-300"
                >
                  Upload Course
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-[#D4FF56] to-[#96b52a] text-black px-4 py-2 rounded-md text-sm font-medium hover:from-[#96b52a] hover:to-[#D4FF56] transition-all duration-300"
                >
                  My Dashboard
                </Link>
              )
            )}

            {userData ? (
              <div className="flex items-center space-x-6 border-l border-gray-800 pl-6">
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-[#D4FF56] via-white to-[#D4FF56] text-transparent bg-clip-text">
                    {userData.displayName || userData.email.split('@')[0]}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">
                    {isTeacher ? 'Instructor' : 'Student'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-[#D4FF56] text-sm font-medium transition-colors duration-200 flex items-center gap-2 hover:scale-105 transform"
                >
                  <span>Logout</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-black border border-[#D4FF56] text-[#D4FF56] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#D4FF56] hover:text-black transition-all duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
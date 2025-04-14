import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { checkAuth } from '../utils/auth';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';
import Chat from '../components/Chat';
import { Sun, Moon, Minimize2, Maximize2, XCircle } from 'lucide-react';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatWidth, setChatWidth] = useState(380); // Default width in pixels
  const navigate = useNavigate();
  const chatSidebarRef = useRef(null);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Enhanced Chat UI Props
  const [minimized, setMinimized] = useState(false);
  const [chatTheme, setChatTheme] = useState('dark'); // 'dark' or 'light'

  useEffect(() => {
    const fetchUserDataAndCourses = async () => {
      try {
        const userData = checkAuth();
        if (!userData) {
          navigate('/login');
          return;
        }

        if (userData.role !== 'student') {
          navigate('/lectures');
          return;
        }

        setStudentName(userData.name || userData.displayName || 'Student');

        // Get student's enrolled courses from userData
        const userEnrolledCourses = userData.enrolledCourses || [];
        
        // Fetch enrolled courses
        const coursesData = await Promise.all(
          userEnrolledCourses.map(async (enrolledCourse) => {
            const courseRef = doc(db, 'courses', enrolledCourse.courseId);
            const courseDoc = await getDoc(courseRef);
            
            if (courseDoc.exists()) {
              return {
                ...courseDoc.data(),
                id: enrolledCourse.courseId, // Use courseId from enrolled course
                progress: enrolledCourse.completedLectures?.length || 0,
                enrolledAt: enrolledCourse.enrolledAt
              };
            }
            return null;
          })
        );

        // Filter and sort enrolled courses
        const validCourses = coursesData
          .filter(course => course !== null)
          .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

        setEnrolledCourses(validCourses);

        // Fetch recommended courses
        const enrolledCourseIds = validCourses.map(course => course.id);
        
        // Only fetch recommendations if there are enrolled courses
        if (enrolledCourseIds.length > 0) {
          const recommendedCoursesQuery = query(
            collection(db, 'courses'),
            where('id', 'not-in', enrolledCourseIds),
            limit(3)
          );
          
          const recommendedSnapshot = await getDocs(recommendedCoursesQuery);
          const recommendedData = recommendedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRecommendedCourses(recommendedData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndCourses();
  }, [navigate]);

  // Set up event listeners for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;
      
      const width = startWidthRef.current - (e.clientX - startXRef.current);
      // Set min and max width constraints
      if (width >= 300 && width <= 600) {
        setChatWidth(width);
      }
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = (e) => {
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = chatWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const toggleTheme = () => {
    setChatTheme(chatTheme === 'dark' ? 'light' : 'dark');
  };

  // Enhanced Chat Component with proper theme handling
  const EnhancedChatUI = () => {
    return (
      <div className={`flex flex-col h-full ${chatTheme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
        {/* Chat Header with controls */}
        <div className={`flex justify-between items-center p-4 border-b ${chatTheme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#D4FF56] animate-pulse"></div>
            <h2 className={`font-medium ${chatTheme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              AI Learning Assistant
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className={`p-1.5 rounded-full ${
                chatTheme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {chatTheme === 'dark' ? (
                <Sun size={16} className="text-gray-400" />
              ) : (
                <Moon size={16} className="text-gray-600" />
              )}
            </button>
            
            {/* Minimize Button */}
            <button 
              onClick={toggleMinimize} 
              className={`p-1.5 rounded-full ${
                chatTheme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {minimized ? (
                <Maximize2 size={16} className={chatTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} />
              ) : (
                <Minimize2 size={16} className={chatTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} />
              )}
            </button>
            
            {/* Close Button */}
            <button 
              onClick={() => setShowChat(false)} 
              className={`p-1.5 rounded-full ${
                chatTheme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <XCircle size={16} className={chatTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} />
            </button>
          </div>
        </div>
        
        {/* Chat Component with minimized state handling */}
        {!minimized ? (
          <div className="flex-grow overflow-hidden relative">
            {/* Background decorations */}
            <div className="absolute inset-0 z-0 opacity-5">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-gradient-to-br from-[#D4FF56] to-green-400 blur-2xl"></div>
              <div className="absolute bottom-12 left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 blur-2xl"></div>
            </div>
            
            {/* Chat component wrapper */}
            <div className={`relative z-10 h-full flex flex-col ${
              chatTheme === 'light' ? 'bg-white bg-opacity-80' : 'bg-gray-900 bg-opacity-60'
            }`}>
              <Chat 
                theme={chatTheme}
                onClose={() => setShowChat(false)}
                onMinimize={toggleMinimize}
                isMinimized={minimized}
              />
            </div>
          </div>
        ) : (
          <div className={`py-6 px-4 text-center ${
            chatTheme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <p>Chat minimized. Click the arrow to expand.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl text-gray-400">Hello, {studentName}! 👋</h2>
              <h1 className="text-4xl font-bold mt-2">My Learning Dashboard</h1>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 bg-[#D4FF56] text-black rounded-full flex items-center gap-2 hover:bg-[#D4FF56]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>AI Assistant</span>
            </button>
          </div>
          <p className="text-gray-400 text-lg">
            Continue learning from where you left off
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${showChat ? 'pr-8 lg:pr-16' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4FF56] mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading your courses...</p>
            </div>
          ) : (
            <>
              {/* Enrolled Courses Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">My Enrolled Courses</h2>
                {enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course, index) => (
                      <div 
                        key={`enrolled-${course.id}-${index}`} 
                        className="relative cursor-pointer transition-transform duration-300 hover:-translate-y-1" 
                        onClick={() => handleCourseClick(course.id)}
                      >
                        <CourseCard
                          course={course}
                          isEnrolled={true}
                        />
                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 h-1">
                          <div
                            className="bg-[#D4FF56] h-full transition-all duration-300"
                            style={{
                              width: `${(course.progress / (course.lectures?.length || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-xl text-gray-400 mb-4">You haven't enrolled in any courses yet</h3>
                    <button
                      onClick={() => navigate('/store')}
                      className="px-6 py-3 bg-[#D4FF56] text-black font-medium rounded-lg hover:bg-[#D4FF56]/90 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>

              {/* Recommended Courses Section */}
              {recommendedCourses.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedCourses.map((course, index) => (
                      <div 
                        key={`recommended-${course.id}-${index}`} 
                        className="cursor-pointer transition-transform duration-300 hover:-translate-y-1" 
                        onClick={() => handleCourseClick(course.id)}
                      >
                        <CourseCard course={course} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Enhanced AI Chat Sidebar */}
      {showChat && (
        <div 
          ref={chatSidebarRef}
          className="fixed top-0 right-0 h-full shadow-2xl border-l border-gray-800 flex flex-col z-50"
          style={{ 
            width: `${chatWidth}px`,
            transition: !resizingRef.current ? 'width 0.3s ease' : 'none'
          }}
        >
          {/* Resizer handle */}
          <div 
            className="absolute top-0 left-0 w-1 h-full cursor-ew-resize hover:w-2 group flex items-center justify-center"
            onMouseDown={startResizing}
          >
            <div className="hidden group-hover:block absolute h-16 w-4 bg-[#D4FF56]/80 rounded-full opacity-70"></div>
            <div className="absolute h-full w-0.5 bg-[#D4FF56]/30 group-hover:bg-[#D4FF56]/60"></div>
          </div>
          
          {/* Enhanced Chat UI */}
          <EnhancedChatUI />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
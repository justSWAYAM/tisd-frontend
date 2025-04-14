import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, where, doc, getDoc, limit } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  const { userData } = useSelector(state => state.user);

  useEffect(() => {
    const fetchUserDataAndCourses = async () => {
      try {
        if (!auth.currentUser) {
          navigate('/');
          return;
        }

        // Get user document
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.error('User document not found');
          return;
        }

        const userData = userDoc.data();
        setStudentName(userData.name || 'Student');

        const userEnrolledCourses = userData.enrolledCourses || [];
        
        // Fetch enrolled courses
        const coursesData = await Promise.all(
          userEnrolledCourses.map(async (enrolledCourse) => {
            const courseRef = doc(db, 'courses', enrolledCourse.courseId);
            const courseDoc = await getDoc(courseRef);
            
            if (courseDoc.exists()) {
              return {
                ...courseDoc.data(),
                id: courseDoc.id,
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
        const recommendedCoursesQuery = query(
          collection(db, 'courses'),
          where('id', 'not-in', enrolledCourseIds.length ? enrolledCourseIds : ['dummy']),
          limit(3)
        );
        
        const recommendedSnapshot = await getDocs(recommendedCoursesQuery);
        const recommendedData = recommendedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecommendedCourses(recommendedData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndCourses();
  }, [navigate]);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
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
              className="px-4 py-2 bg-[#D4FF56] text-black rounded-full flex items-center gap-2 hover:bg-[#D4FF56]/90 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Assistant
            </button>
          </div>
          <p className="text-gray-400 text-lg">
            Continue learning from where you left off
          </p>
        </div>
      </div>

      {/* Main Content */}
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
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="relative cursor-pointer" onClick={() => handleCourseClick(course.id)}>
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
                <div className="text-center py-12">
                  <h3 className="text-xl text-gray-400 mb-4">You haven't enrolled in any courses yet</h3>
                  <button
                    onClick={() => navigate('/store')}
                    className="px-6 py-3 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition"
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
                  {recommendedCourses.map(course => (
                    <div key={course.id} className="cursor-pointer" onClick={() => handleCourseClick(course.id)}>
                      <CourseCard course={course} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* AI Chat Widget */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-gray-900 rounded-lg shadow-xl border border-gray-800 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h3 className="font-medium">AI Learning Assistant</h3>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Chat messages will be rendered here */}
          </div>
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask anything about your courses..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56]"
              />
              <button className="px-4 py-2 bg-[#D4FF56] text-black rounded hover:bg-[#D4FF56]/90 transition">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard; 
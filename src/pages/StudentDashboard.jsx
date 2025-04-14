import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userData } = useSelector(state => state.user);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
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

        const userEnrolledCourses = userDoc.data().enrolledCourses || [];
        
        // Fetch full course details for each enrolled course
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

        // Filter out any null values and sort by enrollment date
        const validCourses = coursesData
          .filter(course => course !== null)
          .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

        setEnrolledCourses(validCourses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [navigate]);

  const handleContinueCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">My Learning Dashboard</h1>
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
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map(course => (
                  <div key={course.id} className="relative">
                    <CourseCard
                      course={course}
                      isEnrolled={true}
                      onEnroll={() => handleContinueCourse(course.id)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 
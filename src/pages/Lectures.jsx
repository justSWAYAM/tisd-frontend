import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { checkAuth } from '../utils/auth';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Lectures = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      const userData = checkAuth();
      
      if (!userData) {
        navigate('/');
        return;
      }

      if (userData.role !== 'teacher') {
        navigate('/store');
        return;
      }

      try {
        setLoading(true);
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('instructorId', '==', userData.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedCourses = [];
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() });
        });

        console.log('Fetched courses:', fetchedCourses);
        setCourses(fetchedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-[#D4FF56] to-white text-transparent bg-clip-text">
            My Courses
          </h1>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">You haven't uploaded any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                isTeacher={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lectures;
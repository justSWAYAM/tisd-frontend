import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';

const Lectures = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!auth.currentUser) {
        console.log('No authenticated user');
        return;
      }

      try {
        setLoading(true);
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('instructorId', '==', auth.currentUser.uid));
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
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black text-white p-8">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Courses</h1>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">You haven't uploaded any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
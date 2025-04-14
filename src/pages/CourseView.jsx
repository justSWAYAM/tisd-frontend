import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Navbar from '../components/Navbar';
import LectureCard from '../components/LectureCard';

const CourseView = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
  if (!course) return <div className="min-h-screen bg-black text-white p-8">Course not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-400">by {course.instructor}</p>
        </div>

        <div className="space-y-4">
          {course.lectures?.map((lecture, index) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              index={index}
              courseId={courseId}
              isTeacher={false}
              onComplete={(lectureId) => {
                // Handle lecture completion
                // This will be implemented in the next iteration
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseView;
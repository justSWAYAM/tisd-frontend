import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import Navbar from '../components/Navbar';
import LectureCard from '../components/LectureCard';

const CourseView = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get course data
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() });
        }

        // Get student data
        if (auth.currentUser) {
          const studentRef = doc(db, 'students', auth.currentUser.uid);
          const studentSnap = await getDoc(studentRef);
          if (studentSnap.exists()) {
            setStudentData(studentSnap.data());
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const isLectureCompleted = (lectureId) => {
    const enrolledCourse = studentData?.enrolledCourses?.find(
      course => course.courseId === courseId
    );
    return enrolledCourse?.completedLectures?.includes(lectureId) || false;
  };

  const handleUpdateStudent = (updatedData) => {
    setStudentData(updatedData);
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
  if (!course) return <div className="min-h-screen bg-black text-white p-8">Course not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {course.lectures?.map((lecture, index) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              index={index}
              courseId={courseId}
              course={course}
              isTeacher={false}
              isCompleted={isLectureCompleted(lecture.id)}
              onUpdateStudent={handleUpdateStudent}
              studentData={studentData}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseView;
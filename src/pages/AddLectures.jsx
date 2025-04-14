import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import Navbar from '../components/Navbar';
import LectureCard from '../components/LectureCard';

const AddLectures = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [newLecture, setNewLecture] = useState({ title: '', videoUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() });
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Error fetching course');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleAddLecture = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        lectures: arrayUnion({
          id: Date.now().toString(),
          ...newLecture,
          createdAt: new Date().toISOString()
        })
      });

      // Update local state
      setCourse(prev => ({
        ...prev,
        lectures: [...(prev.lectures || []), {
          id: Date.now().toString(),
          ...newLecture,
          createdAt: new Date().toISOString()
        }]
      }));

      setNewLecture({ title: '', videoUrl: '' });
      alert('Lecture added successfully!');
    } catch (error) {
      console.error('Error adding lecture:', error);
      alert('Failed to add lecture');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLecture = async (lectureId) => {
    if (!window.confirm('Are you sure you want to remove this lecture?')) return;

    try {
      const updatedLectures = course.lectures.filter(lecture => lecture.id !== lectureId);
      const courseRef = doc(db, 'courses', courseId);
      
      await updateDoc(courseRef, {
        lectures: updatedLectures
      });

      // Update local state
      setCourse(prev => ({
        ...prev,
        lectures: updatedLectures
      }));

      alert('Lecture removed successfully!');
    } catch (error) {
      console.error('Error removing lecture:', error);
      alert('Failed to remove lecture');
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black text-white p-8">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/lectures')}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Add Lecture Form */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Add New Lecture</h2>
            <form onSubmit={handleAddLecture} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Lecture Title
                </label>
                <input
                  type="text"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={newLecture.videoUrl}
                  onChange={(e) => setNewLecture(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Lecture'}
              </button>
            </form>
          </div>

          {/* Right Column - Existing Lectures */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Course Lectures</h2>
            <div className="space-y-4">
              {course.lectures?.length === 0 ? (
                <p className="text-gray-400">No lectures added yet.</p>
              ) : (
                course.lectures?.map((lecture, index) => (
                  <LectureCard
                    key={lecture.id}
                    lecture={lecture}
                    index={index}
                    courseId={courseId}
                    isTeacher={true}
                    onRemove={handleRemoveLecture}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLectures;
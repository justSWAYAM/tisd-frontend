import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

const LecturesSidebar = ({ isOpen, onClose, course }) => {
  const [newLecture, setNewLecture] = useState({ title: '', videoUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddLecture = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const courseRef = doc(db, 'courses', course.id);
      await updateDoc(courseRef, {
        lectures: arrayUnion({
          id: Date.now().toString(),
          ...newLecture,
          createdAt: new Date().toISOString()
        })
      });

      setNewLecture({ title: '', videoUrl: '' });
      alert('Lecture added successfully!');
    } catch (error) {
      console.error('Error adding lecture:', error);
      alert('Failed to add lecture');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } shadow-xl z-50`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Course Lectures</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-400">{course.title}</p>
        </div>

        {/* Lectures List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {course.lectures?.map((lecture, index) => (
              <div
                key={lecture.id}
                className="p-4 bg-black rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#D4FF56] font-medium">#{index + 1}</span>
                  <div>
                    <h3 className="text-white font-medium">{lecture.title}</h3>
                    <a
                      href={lecture.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-[#D4FF56]"
                    >
                      View Video
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Lecture Form */}
        <div className="p-6 border-t border-gray-800">
          <form onSubmit={handleAddLecture} className="space-y-4">
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
              className={`w-full py-2 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Lecture'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LecturesSidebar;
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';

const categories = ["All", "Web Development", "Data Science", "Mobile Development", "Design", "Business"];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];

const Store = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const navigate = useNavigate();
  const { userData } = useSelector(state => state.user);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedCourses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getSortedCourses = (filteredCourses) => {
    switch (sortBy) {
      case 'newest':
        return [...filteredCourses].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      case 'price-low':
        return [...filteredCourses].sort((a, b) => 
          parseFloat(a.price) - parseFloat(b.price)
        );
      case 'price-high':
        return [...filteredCourses].sort((a, b) => 
          parseFloat(b.price) - parseFloat(a.price)
        );
      case 'popular':
      default:
        return [...filteredCourses].sort((a, b) => 
          (b.rating * b.studentsEnrolled) - (a.rating * a.studentsEnrolled)
        );
    }
  };

  const filteredCourses = getSortedCourses(
    courses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    })
  );

  const handleEnrollCourse = async (course) => {
    if (!auth.currentUser) {
      alert('Please login to enroll in courses');
      return;
    }

    try {
      // Update user's enrolledCourses
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion({
          courseId: course.id,
          enrolledAt: new Date().toISOString(),
          completedLectures: []
        })
      });

      // Update course's studentsEnrolled count
      const courseRef = doc(db, 'courses', course.id);
      const courseDoc = await getDoc(courseRef);
      await updateDoc(courseRef, {
        studentsEnrolled: (courseDoc.data().studentsEnrolled || 0) + 1
      });

      // Navigate to course view
      navigate(`/course/${course.id}`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-gray-400 text-lg">Discover the perfect course to advance your skills</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            className="bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <select
            className="bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4FF56] mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading courses...</p>
          </div>
        ) : (
          <>
            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  onEnroll={() => handleEnrollCourse(course)}
                  isEnrolled={userData?.enrolledCourses?.some(
                    enrolled => enrolled.courseId === course.id
                  )}
                />
              ))}
            </div>

            {/* No Results */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl text-gray-400">No courses found matching your criteria</h3>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Store;
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User role:', userData.role); // Log the user's role
          // You can store this role in your app's state management or context
        }
      } else {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user role and additional data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date().toISOString(),
          displayName: email.split('@')[0], // Default display name
          isVerified: false,
          lastLogin: new Date().toISOString()
        });

        // Create role-specific collections
        if (role === 'teacher') {
          await setDoc(doc(db, 'teachers', user.uid), {
            userId: user.uid,
            email: user.email,
            courses: [],
            students: [],
            createdAt: new Date().toISOString()
          });
        } else if (role === 'student') {
          await setDoc(doc(db, 'students', user.uid), {
            userId: user.uid,
            email: user.email,
            enrolledCourses: [],
            progress: {},
            createdAt: new Date().toISOString()
          });
        }
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-black p-8 text-white border border-gray-800 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-3xl font-bold">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">I want to join as a</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      role === 'student'
                        ? 'border-[#D4FF56] bg-[#D4FF56]/10 text-[#D4FF56]'
                        : 'border-gray-800 hover:border-gray-700 text-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl mb-2">🎓</span>
                      <span className="font-medium">Student</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      role === 'teacher'
                        ? 'border-[#D4FF56] bg-[#D4FF56]/10 text-[#D4FF56]'
                        : 'border-gray-800 hover:border-gray-700 text-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl mb-2">👨‍🏫</span>
                      <span className="font-medium">Teacher</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#D4FF56] text-black font-medium rounded-xl hover:bg-[#D4FF56]/90 transition-colors text-lg"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#D4FF56] hover:text-[#D4FF56]/80 transition-colors"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AuthModal; 
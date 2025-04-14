import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const auth = getAuth();
    const db = getFirestore();

    try {
      if (isLogin) {
        // Handle Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          throw new Error('User data not found');
        }

        const userData = userDoc.data();
        
        // Get role-specific data
        const roleDoc = await getDoc(doc(db, `${userData.role}s`, user.uid));
        const roleData = roleDoc.data();

        const combinedData = {
          uid: user.uid,
          email: user.email,
          ...userData,
          ...roleData
        };

        // Store complete user data in localStorage
        localStorage.setItem('userData', JSON.stringify(combinedData));
        localStorage.setItem('authToken', await user.getIdToken());

        // Navigate based on profile completion
        if (roleData.profileCompleted) {
          navigate(userData.role === "teacher" ? '/lectures' : '/dashboard');
        } else {
          navigate('/profile');
        }

      } else {
        // Handle Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newUserData = {
          email: user.email,
          role: role,
          createdAt: new Date().toISOString(),
          displayName: email.split('@')[0],
          isVerified: false,
          lastLogin: new Date().toISOString(),
          profileCompleted: false,
          uid: user.uid
        };

        // Create base user document
        await setDoc(doc(db, 'users', user.uid), newUserData);

        // Create role-specific document
        const roleSpecificData = role === 'teacher' 
          ? {
              userId: user.uid,
              email: user.email,
              courses: [],
              students: [],
              createdAt: new Date().toISOString()
            }
          : {
              userId: user.uid,
              email: user.email,
              enrolledCourses: [],
              progress: {},
              createdAt: new Date().toISOString()
            };

        await setDoc(doc(db, `${role}s`, user.uid), roleSpecificData);

        // Store complete user data in localStorage
        const combinedData = {
          ...newUserData,
          ...roleSpecificData
        };
        
        localStorage.setItem('userData', JSON.stringify(combinedData));
        localStorage.setItem('authToken', await user.getIdToken());

        navigate('/profile');
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      let errorMessage = 'Authentication failed';
      
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">I want to join as a</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    disabled={isLoading}
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
                    disabled={isLoading}
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
              disabled={isLoading}
              className={`w-full py-3 bg-[#D4FF56] text-black font-medium rounded-xl transition-colors text-lg ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D4FF56]/90'
              }`}
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              disabled={isLoading}
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
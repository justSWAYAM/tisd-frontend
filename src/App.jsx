// only thing present here should be routing all the logic should be performed in the components 
// the pages file only here only do routing strictly
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import Store from './pages/Store';
import CodeEditor from './components/CodeEditor'
import UploadCourse from './pages/UploadCourse';
import Lectures from './pages/Lectures';
import AddLectures from './pages/AddLectures';
import CourseView from './pages/CourseView';
import StudentDashboard from './pages/StudentDashboard';
import Chat from './components/Chat';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/store' element={<Store />} />
            <Route path='/dashboard' element={<StudentDashboard />} />
            <Route path='/Code/:courseId/:lectureId' element={<CodeEditor/>}/>
            <Route path="/upload-course" element={<UploadCourse />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/add-lectures/:courseId" element={<AddLectures />} />
            <Route path="/course/:courseId" element={<CourseView />} />
            <Route path="/chat" element={<Chat />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

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

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/Store' element={<Store />} />
            <Route path='/Code' element={<CodeEditor/>}/>
            <Route path="/upload-course" element={<UploadCourse />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

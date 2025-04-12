// only thing present here should be routing all the logic should be performed in the components 
// the pages file only here only do routing strictly
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Store from './pages/Store';
import CodeEditor from './components/CodeEditor'
import UploadCourse from './pages/UploadCourse';
function App() {
  return (
    <Router>
        <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/Store' element={<Store />} />
            <Route path='/Code' element={<CodeEditor/>}/>
            <Route path="/upload-course" element={<UploadCourse />} />
        </Routes>
    </Router>
  );
}

export default App;

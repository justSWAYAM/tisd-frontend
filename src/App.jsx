// only thing present here should be routing all the logic should be performed in the components 
// the pages file only here only do routing strictly
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
        <Routes>
            <Route path='/' element={<LandingPage />} />
        </Routes>
    </Router>
  );
}

export default App;

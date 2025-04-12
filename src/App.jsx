// only thing present here should be routing all the logic should be performed in the components 
// the pages file only here only do routing strictly
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/profile' element={<ProfilePage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

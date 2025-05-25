import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { Login, Signup } from './pages/auth/Auth';

// PrivateRoute component to protect LandingPage
// const PrivateRoute = ({ children, isAuthenticated }) => {
//   return isAuthenticated ? children : <Navigate to="/login" />;
// };

const App = () => {
  const [isLogin, setIsLogin] = useState(false);

  // Check token in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLogin(!!token);
  }, []);

  // Update isLogin after successful signup/login
  const handleAuthSuccess = () => {
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100">
      <Router>
        <Routes>
          {/* <Route
            path="/landingpage"
            element={
              <PrivateRoute isAuthenticated={isLogin}>
                <LandingPage />
              </PrivateRoute>
            }
          /> */}
          <Route
            path="/login"
            element={<Login onSwitchToSignup={() => {}} onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/signup"
            element={<Signup onSwitchToLogin={() => {}} onAuthSuccess={handleAuthSuccess} />}
          />

          <Route path='/landingPage'  element={<LandingPage />}/>
       
        </Routes>
      </Router>
    </div>
  );
};

export default App;
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
// import Navbar from './Navbar';
import Home from './pages/Home';
import AddGoal from './pages/AddGoals';
import Timeline from './pages/Timeline'
import Knowledge from './pages/Knowledge'
import MainDash from './pages/MainDash'
import Dashboard from './pages/Dashboard'
import Commitment from './pages/Commitment'
import GoalSummary from './pages/GoalSummary'
import Login from './pages/Login'
import Header from './components/Header'
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}




function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Header />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/add_goals"
                element={
                  <RequireAuth>
                    <AddGoal />
                  </RequireAuth>
                }
              />
              <Route
                path="/add_goals/previous_knowledge"
                element={
                  <RequireAuth>
                    <Knowledge />
                  </RequireAuth>
                }
              />
              <Route
                path="/add_goals/commitment"
                element={
                  <RequireAuth>
                    <Commitment />
                  </RequireAuth>
                }
              />
              <Route
                path="/add_goals/timeline"
                element={
                  <RequireAuth>
                    <Timeline />
                  </RequireAuth>
                }
              />
              <Route
                path="/add_goals/goal_summary"
                element={
                  <RequireAuth>
                    <GoalSummary />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/main_dashboard"
                element={
                  <RequireAuth>
                    <MainDash />
                  </RequireAuth>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

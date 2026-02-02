import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './Navbar';
import Home from './pages/Home';
import AddGoal from './pages/AddGoals';
import Timeline from './pages/Timeline'
import Knowledge from './pages/Knowledge'
import MainDash from './pages/MainDash'
import Commitment from './pages/Commitment'
import GoalSummary from './pages/GoalSummary'
import Login from './pages/Login'
import Header from './components/Header'
import BackButton from './components/BackButton'




function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add_goals" element={<AddGoal />} />
            <Route path="/add_goals/previous_knowledge" element={<Knowledge />} />
            <Route path="/add_goals/commitment" element={<Commitment />} />
            <Route path="/add_goals/timeline" element={<Timeline />} />
            <Route path="/add_goals/goal_summary" element={<GoalSummary />} />
            <Route path="/main_dashboard" element={<MainDash />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
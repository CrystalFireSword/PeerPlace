
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import StudentDashBoard from "./pages/StudentDashboard";
import FacultyDashBoard from "./pages/FacultyDashboard";
import LandingPage from "./pages/LandingPage";
// to be checked later if student and faculty dashboard pages work and then design these pages
const App = () => {
  return (
    <Router> {/* Wrap the entire application with Router */}
      {/* Navbar visible on all pages */}
      <Navbar />
      
      {/* Main content with routes */}
      <main>
        <Routes> {/* Define the routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/:section" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/studentdashboard" element={<StudentDashBoard />} />
          <Route path="/facultydashboard" element={<FacultyDashBoard />} />
        </Routes>
      </main>

      {/* Footer visible on all pages */}
      <Footer />
    </Router>
  );
};

export default App;

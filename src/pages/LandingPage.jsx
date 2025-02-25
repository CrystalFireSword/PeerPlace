import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import OurTeam from "./OurTeam";
import Contact from "./Contact";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const { section } = useParams(); // Get the section from the URL
  const location = useLocation(); // Get the current URL location object

  useEffect(() => {
    // Scroll to the section based on URL parameter
    const scrollToSection = (section) => {
      const sectionElement = document.getElementById(section);
      if (sectionElement) {
        window.scrollTo({
          top: sectionElement.offsetTop, // Scroll to the top of the section
          behavior: "smooth", // Smooth scrolling
        });
      }
    };

    // Scroll to the specific section when the route changes
    if (section) {
      scrollToSection(section);
    } else {
      // Default to home section if no section is provided
      scrollToSection("home");
    }
  }, [section, location]);

  return (
    <div className = "home-container">
      <Home id="home" />
      <About id="about" />
      <OurTeam id="our-team" />
      <Contact id="contact" />
    </div>
  );
};

export default LandingPage;

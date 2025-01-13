import React from "react";
import Header from "./components/Header";
import Home from "./components/Home";
import Education from "./components/Education";
import Projects from "./components/Projects";
//import Certificates from "./components/Certificates";
import WorkExperience from "./components/WorkExperience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Courses from './components/Courses';
import Awards from './components/Awards';
import "./App.css";


function App() {
  return (
    <div className="App">
      <Header />
      <div className="App background">
        <Home />
        <Education />
      </div>
      <Projects />
      <WorkExperience />
      <Courses />
      <Awards />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;


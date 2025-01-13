import React from "react";
import Header from "./components/Header";
import Home from "./components/Home";
import Education from "./components/Education";
import Projects from "./components/Projects";
import Certificates from "./components/Certificates";
import WorkExperience from "./components/WorkExperience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <Home />
      <Education />
      <Projects />
      <Certificates />
      <WorkExperience />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;


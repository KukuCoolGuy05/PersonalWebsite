import React from "react";
import "./Projects.css";

const Projects = () => {
  const projects = [
    { title: "UW-Madison Scheduler", description: "A platform for managing schedules." },
    { title: "Electric Field Visualization", description: "A physics simulation project." },
    { title: "Excel Form Updater", description: "Web app updating Excel sheets dynamically." },
  ];

  return (
    <section id="projects">
      <h2>Projects</h2>
      <div className="project-list">
        {projects.map((project, index) => (
          <div key={index} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;

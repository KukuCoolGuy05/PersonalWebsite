import React from "react";
import "./Projects.css";

const Projects = () => {
  const projects = [
    { title: "UW-Madison Scheduler", description: "A platform for managing schedules.", link: "" },
    { title: "Electric Field Visualization", description: "A physics simulation project.", link: "https://github.com/KukuCoolGuy05/Physics3DModel" },
    { title: "Excel Form Updater", description: "Web app updating Excel sheets dynamically.", link: "https://github.com/KukuCoolGuy05/ExcelForm" },
    { title: "MyHeap", description: "Dynamic memory allocation and freeing with immmediate coalescing in C language", link: ""}
  ];

  return (
    <section id="projects">
      <h2>Projects</h2>
      <div className="project-list">
        {projects.map((project, index) => (
          <a key={index} href = {project.link}>
            <div key={index} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Projects;

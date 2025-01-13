import React from 'react';
import './Projects.css';

const Projects = () => {
  return (
    <div className="projects">
      <h2>Projects</h2>
      <div className="project-card">
        <h3>Electric Field Visualizer</h3>
        <p>Visualizing physics simulations using Python and Flask.</p>
      </div>
      <div className="project-card">
        <h3>UW-Madison Scheduler</h3>
        <p>A React-based tool for managing student schedules effectively.</p>
      </div>
    </div>
  );
};

export default Projects;

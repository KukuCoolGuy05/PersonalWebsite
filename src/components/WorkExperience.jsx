import React from "react";
import "./WorkExperience.css";

const experiences = [
  {
    role: "Code Sensei",
    company: "Code Ninjas",
    description: "Taught programming concepts to kids aged 5–16.",
  },
  {
    role: "Grading Assistant",
    company: "Kumon",
    description: "Mentored students in Math and English.",
  },
];

const WorkExperience = () => (
  <section id="work-experience" className="work-experience">
    <h2>Work Experience</h2>
    <ul>
      {experiences.map((experience, index) => (
        <li key={index}>
          <h3>{experience.role}</h3>
          <p><strong>{experience.company}</strong>: {experience.description}</p>
        </li>
      ))}
    </ul>
  </section>
);

export default WorkExperience;

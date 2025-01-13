import React from "react";
import "./Education.css";
import uwLogo from "./uw-logo.png"; // Add UW Madison logo
import stevensonLogo from "./stevenson-logo.png"; // Add Adlai E. Stevenson logo

const Education = () => {
  const educationData = [
    {
      logo: uwLogo,
      institution: "University of Wisconsin-Madison",
      degree: "B.S. in Computer Science and Data Science",
      year: "2022 - 2026",
    },
    {
      logo: stevensonLogo,
      institution: "Adlai E. Stevenson High School",
      degree: "High School Diploma",
      year: "2018 - 2022",
    },
  ];

  return (
    <section id="education">
      <h2>Education</h2>
      <div className="education-grid">
        {educationData.map((edu, index) => (
          <div key={index} className="education-card">
            <img src={edu.logo} alt={`${edu.institution} logo`} className="edu-logo" />
            <h3>{edu.institution}</h3>
            <p>{edu.degree}</p>
            <span>{edu.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Education;

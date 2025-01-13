import React from 'react';
import "./Courses.css";

const courses = [
  { name: "AP Calculus BC", institution: "Stevenson High School, Lincolnshire, IL" },
  { name: "AP Computer Science A", institution: "Stevenson High School, Lincolnshire, IL" },
  { name: "AP Computer Science Principles", institution: "Stevenson High School, Lincolnshire, IL" },
  { name: "AP Macroeconomics", institution: "Stevenson High School, Lincolnshire, IL" },
  { name: "AP Physics 1", institution: "Stevenson High School, Lincolnshire, IL" },
  { name: "AP Physics C", institution: "Stevenson High School, Lincolnshire, IL" },
  { name: "Discrete Mathematics (MATH 240)", institution: "University of Wisconsin-Madison" },
  { name: "Introduction to Optimization (CS 524)", institution: "University of Wisconsin-Madison" },
  { name: "Programming II (CS 300)", institution: "University of Wisconsin-Madison" },
  { name: "Programming III (CS 400)", institution: "University of Wisconsin-Madison" },
  { name: "Topics in Multi-Variable Calculus and Differential Equations (MATH 376)", institution: "University of Wisconsin-Madison" },
  { name: "Topics in Multi-Variable Calculus and Linear Algebra (MATH 375)", institution: "University of Wisconsin-Madison" },
];

const Courses = () => {
  return (
    <div className="courses">
      <h2>Relevant Courses</h2>
      <div className="course-list">
        {courses.map((course, index) => (
          <div className="course-item" key={index}>
            <h3>{course.name}</h3>
            <p>{course.institution}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;

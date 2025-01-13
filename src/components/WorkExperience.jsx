import React from 'react';
import Slider from 'react-slick';
import './WorkExperience.css';

const WorkExperience = () => {
  const experiences = [
    {
      title: 'Code Sensei',
      description: 'Taught programming and robotics to students aged 5-16 at Code Ninjas.',
    },
    {
      title: 'Mentor at Kumon',
      description: 'Guided students in Math and English, promoting a safe learning environment.',
    },
    {
      title: 'Intern at Doodle Inc.',
      description: 'Developed an optimized interview scheduling system using Julia and JuMP.',
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="work-experience">
      <h2>Work Experience</h2>
      <Slider {...settings}>
        {experiences.map((exp, index) => (
          <div key={index} className="experience-slide">
            <h3>{exp.title}</h3>
            <p>{exp.description}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default WorkExperience;

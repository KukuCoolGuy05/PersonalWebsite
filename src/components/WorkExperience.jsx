import React from 'react';
import Slider from 'react-slick';
import './WorkExperience.css';

const WorkExperience = () => {
  const experiences = [
    {
      title: 'Code Sensei',
      description:
        'Led engaging sessions in LEGO robotics, Roblox development, web development, and stop-motion animation for students aged 5–16. Created a supportive environment that inspired student growth in both technical skills and teamwork.',
    },
    {
      title: 'Mentor at Kumon',
      description:
        'Provided personalized mentorship in advanced Math and English concepts. Fostered a safe learning environment that promoted student improvement and self-confidence.',
    },
    {
      title: 'Chess Instructor',
      description:
        'Designed and implemented a chess curriculum, helping students improve openings, tactics, and endgame strategies. Successfully guided students to participate in tournaments.',
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
    arrows: true,
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

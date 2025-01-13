import React from 'react';
import Slider from 'react-slick';
import './Certificates.css';

const Certificates = () => {
  const certificates = [
    'Ambassador Award - Stevenson High School (Mar 2022)',
    'AP Scholar with Distinction (Jan 2023)',
    'Hackathon Second Place Winner (Jan 2023)',
    'Gold Honor Roll (Jan 2023)',
    '3-time IHSA Chess Team State Champion',
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
    <div className="certificates">
      <h2>Certificates</h2>
      <Slider {...settings}>
        {certificates.map((cert, index) => (
          <div key={index} className="certificate-slide">
            <p>{cert}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Certificates;

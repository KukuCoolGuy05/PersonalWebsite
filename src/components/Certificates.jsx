import React from "react";
import "./Certificates.css";

const certificates = [
  "AP Scholar with Distinction",
  "IHSA Chess Team State Champion (3-time winner)",
  "Hackathon Second Place Winner",
];

const Certificates = () => (
  <section id="certificates" className="certificates">
    <h2>Certificates</h2>
    <ul>
      {certificates.map((cert, index) => (
        <li key={index}>{cert}</li>
      ))}
    </ul>
  </section>
);

export default Certificates;

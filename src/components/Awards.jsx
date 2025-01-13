import React from 'react';
import './Awards.css'; // Import the CSS file for styling

const Awards = () => {
  const awards = [
    {
      title: "Ambassador Award",
      issuedBy: "Adlai E. Stevenson High School",
      date: "Mar 2023",
      description: "IHSA Chess Team State Champion",
    },
    {
      title: "AP Scholar with Distinction",
      issuedBy: "CollegeBoard",
      date: "Jan 2023",
      description: "Granted to students who achieve an average score of at least 3.5 on all AP Exams taken and scores of 3 or higher on five or more of these exams.",
    },
    {
      title: "Gold Honor Roll",
      issuedBy: "Adlai E. Stevenson High School",
      date: "Jan 2023",
      description: "Graduated with highest honors for being on the Gold Honor Roll for all four years of high school.",
    },
    {
      title: "Hack-A-Thon First Place Winner",
      issuedBy: "Adlai E. Stevenson High School",
      date: "Jan 2023",
      description: "Designed an application that takes a 3D scan of the user's foot using a LiDAR scanner to create custom insoles for flat feet or high arches.",
    },
    {
      title: "Ambassador Award",
      issuedBy: "Adlai E. Stevenson High School",
      date: "Mar 2022",
      description: "IHSA Chess Team State Champion",
    },
    {
      title: "AP Scholar",
      issuedBy: "CollegeBoard",
      date: "Jan 2022",
      description: "Granted to students who receive scores of 3 or higher on three or more AP Exams.",
    },
    {
      title: "Ambassador Award",
      issuedBy: "Innerview",
      date: "Jan 2022",
      description: "100 hours of volunteering service.",
    },
    {
      title: "POOM Certificate",
      issuedBy: "Kukkiwon: WORLD TAEKWONDO HEADQUARTERS",
      date: "Mar 2020",
      description: "Awarded for completing Kukkiwon's 1st Poom Taekwondo Promotion Test.",
    },
    {
      title: "IHSA Chess State Champions",
      issuedBy: "Illinois High School Association",
      date: "Feb 2020",
      description: "Won state championships three times (2019-20, 2021-22, 2022-23).",
    },
  ];

  return (
    <section id="awards">
      <h2 className="awards-title">Awards & Honors</h2>
      <ul className="awards-list">
        {awards.map((award, index) => (
          <li key={index} className="award-item">
            <h3 className="award-title">{award.title}</h3>
            <p className="award-details">
              <strong>Issued By:</strong> {award.issuedBy} <br />
              <strong>Date:</strong> {award.date}
            </p>
            <p className="award-description">{award.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Awards;

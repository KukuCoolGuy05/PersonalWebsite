import lspaceLogo from '../assets/logos/lspace.png';
import codeNinjasLogo from '../assets/logos/code-ninjas.png';
import kumonLogo from '../assets/logos/kumon.png';
import chessLogo from '../assets/logos/chess.png';

// Dates are 'YYYY-MM'; use end: 'Present' for something ongoing. The timeline sorts
// itself newest first, so order here doesn't matter.
// Each entry shows its `logo`, or a `monogram` tile when there's no logo file.
export const experience = [
  {
    role: 'NASA Proposal Writing and Evaluation Experience',
    org: 'NASA L’SPACE Program',
    location: 'Remote',
    start: '2026-09',
    end: 'Present',
    logo: lspaceLogo,
    description:
      'Learning NASA’s proposal process in an academy sponsored by Marshall Space Flight Center — identifying a NASA need, developing an innovative solution with a team, and formulating a proposal to a specific solicitation.',
    skills: ['Proposal writing', 'Problem framing', 'Teamwork'],
  },
  {
    role: 'Deputy Project Manager of Resources',
    org: 'NASA L’SPACE Mission Concept Academy',
    location: 'Remote',
    start: '2026-05',
    end: '2026-08',
    logo: lspaceLogo,
    description:
      'Led the programmatics sub-team through NASA Formulation Reviews by delegating cost, schedule, and risk deliverables across members and tracking each to closure on a 5-person team.',
    skills: ['Risk Management', 'Team Management'],
  },
  {
    role: 'Cashier / Tech Support',
    org: 'JCPenney',
    type: 'Part-time',
    location: 'Middleton, WI · On-site',
    start: '2025-08',
    end: '2026-04',
    monogram: 'JCP',
    description:
      'Maintained and troubleshot POS systems, including registers, receipt printers, monitors, and cash drawers, ensuring minimal downtime and smooth store operations.',
    skills: ['Communication', 'Customer Service'],
  },
  {
    role: 'Summer Camp Counselor',
    org: 'Code Ninjas',
    type: 'Part-time',
    location: 'Buffalo Grove, IL · On-site',
    start: '2023-05',
    end: '2023-09',
    logo: codeNinjasLogo,
    description:
      'Led engaging sessions in LEGO robotics, Roblox development, web development, and stop-motion animation for students (ages 5–16), combining technical instruction with creative projects.',
    skills: ['Creative Coding', 'Creativity Skills'],
  },
  {
    role: 'Mentor',
    org: 'Kumon North America, Inc.',
    type: 'Part-time',
    location: 'Arlington Heights, IL · On-site',
    start: '2022-08',
    end: '2023-01',
    logo: kumonLogo,
    description:
      'Provided personalized mentorship in advanced math and English concepts, fostering deep understanding and mastery.',
    skills: ['Leadership', 'Collaborative Learning'],
  },
  {
    role: 'Chess Instructor',
    org: 'Self-employed',
    location: 'Buffalo Grove, IL · Hybrid',
    start: '2020-08',
    end: '2022-12',
    logo: chessLogo,
    description:
      'Created a chess curriculum focused on improving openings, tactics, and endgame strategies, successfully teaching students of all skill levels.',
    skills: ['Teaching', 'Leadership'],
  },
];

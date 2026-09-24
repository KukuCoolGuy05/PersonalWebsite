// Featured projects render as the stacked, interactive cards on the home page.
// `art` picks the animated cover (see components/home/ProjectArt.jsx).
// Wrap words in *asterisks* to render them in the italic accent serif.

export const projects = [
  {
    id: 'kalvi',
    title: 'Kalvi AI',
    tagline: 'An AI tutor that adapts to how *you* learn.',
    year: '2026',
    type: 'AI agent · Full-stack',
    summary:
      'An adaptive learning agent with first-class support for dyslexia, ADHD and ESL learners. It gets to know each learner through a conversational onboarding, then keeps refining how it teaches from their feedback and confusion signals.',
    highlights: [
      'Designed the tutoring “brain”: a learner profile becomes a stack of teaching rules that are injected into dynamic Claude system prompts.',
      'Deterministic confusion detection — three confused messages in a row trigger a RETEACH protocol and a profile update.',
      'Spaced-repetition scheduler with mastery bands (review in 1, 3 or 7 days) and EMA-blended mastery scores.',
      'Streams a multi-round tool-use loop to the browser, with six validated tools such as update_learner_profile and schedule_review.',
      'Accessibility as a baseline (WCAG 2.1 AA): OpenDyslexic font, a font-size slider, high-contrast and reduce-motion modes.',
    ],
    stack: ['Next.js 14', 'TypeScript', 'Claude API', 'Prisma', 'Postgres', 'Upstash Redis', 'Tailwind', 'NextAuth'],
    links: { github: 'https://github.com/KukuCoolGuy05/Kalvi' },
    art: 'kalvi',
  },
  {
    id: 'sign-language-reader',
    title: 'Sign Language Reader',
    tagline: 'Real-time ASL fingerspelling, *translated*.',
    year: '2025 – 26',
    type: 'Computer vision · ML',
    summary:
      'A webcam app that reads American Sign Language hand signs and spells out words letter by letter. A YOLOv8 detector trained on 29 classes (A–Z plus space, delete and nothing) runs on every frame, with a custom-drawn OpenCV interface on top.',
    highlights: [
      'Trained a YOLOv8 object detector on an ASL alphabet dataset — 26 letters plus space, delete and nothing.',
      'Majority vote over a rolling window of frames, with a 0.55 confidence floor, so letters only commit once they’re stable.',
      'Space and delete signs build and edit whole sentences hands-free.',
      'Hand-built OpenCV HUD — glass panels, a hold-to-commit letter ring and eased animations — in a “Midnight Violet” palette.',
    ],
    stack: ['Python', 'YOLOv8', 'OpenCV', 'PyTorch', 'NumPy'],
    links: { github: 'https://github.com/KukuCoolGuy05/HandSignReader' },
    art: 'sign',
  },
  {
    id: 'physics-3d',
    title: 'Physics 3D',
    tagline: 'Electric & magnetic fields you can *spin around*.',
    year: '2023 – 24',
    type: 'Physics · Simulation',
    summary:
      'An interactive 3D physics visualizer. A Flask backend computes fields with NumPy and Coulomb’s law, and Plotly renders them in the browser so you can rotate, zoom and toggle charges.',
    highlights: [
      'Electric field of a proton and an electron, each toggleable on the fly.',
      'Gaussian surfaces — sphere, cylinder or plane — with adjustable radius and charge, validated server-side.',
      'Magnetic fields around current-carrying wires.',
    ],
    stack: ['Python', 'Flask', 'NumPy', 'Plotly', 'JavaScript'],
    links: { github: 'https://github.com/KukuCoolGuy05/Physics3DModel' },
    art: 'field',
  },
];

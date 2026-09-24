// The logomark: an eight-petal bloom, a nod to the kurinji flower.
const PETAL = 'M50 50 C 41 38, 40 16, 50 4 C 60 16, 59 38, 50 50 Z';

export default function BloomMark({ className, petals = 8, title }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {Array.from({ length: petals }, (_, i) => (
        <path
          key={i}
          d={PETAL}
          transform={`rotate(${(360 / petals) * i} 50 50)`}
          fill="currentColor"
          opacity={i % 2 ? 0.55 : 1}
        />
      ))}
      <circle cx="50" cy="50" r="7" fill="currentColor" />
    </svg>
  );
}

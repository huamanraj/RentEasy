const HeroPattern = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 600"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="2" fill="#FF6F61" />
      </pattern>
    </defs>
    <rect width="800" height="600" fill="url(#dots)" />
  </svg>
);

export default HeroPattern;
import React from 'react';

const LanternIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-slate-500" // text-xl é aproximadamente 1.25rem, h-5 é 1.25rem
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ transform: 'rotate(-45deg)' }}
      aria-label="Lanterna"
      role="img"
    >
      <path d="M12 2C9.79 2 8 3.79 8 6v14h8V6c0-2.21-1.79-4-4-4zm-2 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z" />
    </svg>
  );
};

export default LanternIcon;

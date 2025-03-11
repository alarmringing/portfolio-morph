import React from 'react';

interface NavbarProps {
  onAboutClick: () => void;
  onProjectsClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAboutClick, onProjectsClick }) => {
  return (
    <nav className="flex justify-between px-8 py-4 latin-font">
      <button 
        onClick={onAboutClick}
        className="transition-colors navbar-text"
      >
        About
      </button>
      <button 
        onClick={onProjectsClick}
        className="transition-colors navbar-text"
      >
        Projects
      </button>
    </nav>
  );
};

export default Navbar; 
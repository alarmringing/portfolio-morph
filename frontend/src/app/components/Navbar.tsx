import React, { useState } from 'react';

interface NavbarProps {
  onAboutClick: () => void;
  onProjectsClick: () => void;
  onNavItemHover?: (isHovered: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onAboutClick, 
  onProjectsClick,
  onNavItemHover
}) => {
  // Track hover state
  const handleMouseEnter = () => {
    if (onNavItemHover) onNavItemHover(true);
  };

  const handleMouseLeave = () => {
    if (onNavItemHover) onNavItemHover(false);
  };

  return (
    <nav className="flex justify-between px-8 py-4 latin-font">
      <button 
        onClick={onAboutClick}
        className="transition-colors navbar-text"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        About
      </button>
      <button 
        onClick={onProjectsClick}
        className="transition-colors navbar-text"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Projects
      </button>
    </nav>
  );
};

export default Navbar; 
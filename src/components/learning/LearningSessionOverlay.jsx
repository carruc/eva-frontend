import React, { useState } from 'react';
import ThemeToggle from '../ThemeToggle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './LearningSessionOverlay.css';

const LearningSessionOverlay = ({ onToggleTimer, onEndEarly, onQuit, showTimer }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (action) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <div className="learning-session-overlay">
      <div className="learning-session-overlay-buttons">
        <ThemeToggle className="learning-session-overlay-theme-btn" />
        <div className="menu-container">
        <button 
            className={`menu-button ${isMenuOpen ? 'active' : ''}`}
            onClick={handleMenuToggle}
          aria-label="Open session menu"
          title="Open session menu"
        >
          <MoreVertIcon />
        </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              <button 
                className="menu-item"
                onClick={() => handleMenuItemClick(onToggleTimer)}
              >
                {showTimer ? 'Hide Timer' : 'Show Timer'}
              </button>
              <button 
                className="menu-item"
                onClick={() => handleMenuItemClick(onEndEarly)}
              >
                End Session Early
              </button>
              <button 
                className="menu-item danger"
                onClick={() => handleMenuItemClick(onQuit)}
              >
                Quit Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningSessionOverlay; 
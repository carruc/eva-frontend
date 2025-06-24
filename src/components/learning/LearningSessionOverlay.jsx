import React from 'react';
import ThemeToggle from '../ThemeToggle';
import { IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './LearningSessionOverlay.css';

const LearningSessionOverlay = ({ onMenuOpen }) => {
  return (
    <div className="learning-session-overlay">
      <div className="learning-session-overlay-buttons">
        <ThemeToggle className="learning-session-overlay-theme-btn" />
        <button 
          className="menu-button"
          onClick={onMenuOpen}
          aria-label="Open session menu"
          title="Open session menu"
        >
          <MoreVertIcon />
        </button>
      </div>
    </div>
  );
};

export default LearningSessionOverlay; 
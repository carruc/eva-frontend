import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import ThemeToggle from './ThemeToggle';
import './PageOverlay.css';

const PageOverlay = ({ 
  sidebarCollapsed, 
  onToggleSidebar,
  className = ''
}) => {
  return (
    <div className={`page-overlay ${className}`}>
      {/* Sidebar expand button - only show when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button 
          className="page-overlay-sidebar-btn"
          onClick={onToggleSidebar}
          aria-label="Expand sidebar"
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </button>
      )}
      
      {/* Theme toggle button */}
      <ThemeToggle className="page-overlay-theme-btn" />
    </div>
  );
};

export default PageOverlay; 
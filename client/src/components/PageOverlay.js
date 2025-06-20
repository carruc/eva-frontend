import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faHome, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './PageOverlay.css';

const PageOverlay = ({ 
  sidebarCollapsed, 
  onToggleSidebar,
  className = ''
}) => {
  const [showQuickNav, setShowQuickNav] = useState(false);
  const navigate = useNavigate();

  // Show quick navigation buttons after a short delay when sidebar is collapsed
  useEffect(() => {
    if (sidebarCollapsed) {
      const timer = setTimeout(() => {
        setShowQuickNav(true);
      }, 300); // 300ms delay for smooth transition
      return () => clearTimeout(timer);
    } else {
      setShowQuickNav(false);
    }
  }, [sidebarCollapsed]);

  const handleQuickNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className={`page-overlay ${className}`}>
      {/* Sidebar expand button - only show when sidebar is collapsed */}
      {sidebarCollapsed && (
        <div className="page-overlay-left-controls">
          <button 
            className="page-overlay-sidebar-btn"
            onClick={onToggleSidebar}
            aria-label="Expand sidebar"
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          
          {/* Quick navigation buttons */}
          <div className={`quick-nav-buttons ${showQuickNav ? 'visible' : ''}`}>
            <button
              className="quick-nav-btn"
              onClick={() => handleQuickNavClick('/')}
              aria-label="Go to Homepage"
              title="Homepage"
            >
              <FontAwesomeIcon icon={faHome} />
            </button>
            <button
              className="quick-nav-btn"
              onClick={() => handleQuickNavClick('/planning')}
              aria-label="Go to Planning"
              title="Planning"
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
            </button>
          </div>
        </div>
      )}
      
      {/* Theme toggle button */}
      <ThemeToggle className="page-overlay-theme-btn" />
    </div>
  );
};

export default PageOverlay; 
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAngleRight, 
  faAngleLeft, 
  faCog, 
  faSearch,
  faHome,
  faCalendarAlt,
  faUser,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
import { dataUtils } from '../services/api';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle, projects = [], events = [], onNewProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrollable, setIsScrollable] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ top: false, bottom: false });
  const projectsListRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  console.log('Current theme:', theme);

  const navigationItems = [
    { 
      id: 'homepage', 
      label: 'Homepage', 
      isActive: location.pathname === '/',
      icon: faHome,
      path: '/'
    },
    { 
      id: 'planning', 
      label: 'Planning', 
      isActive: location.pathname === '/planning',
      icon: faCalendarAlt,
      path: '/planning'
    }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleItemClick = (itemPath) => {
    navigate(itemPath);
    
    // Auto-collapse sidebar when navigating to a project page
    if (itemPath.startsWith('/project/')) {
      onToggle(); // Collapse the sidebar
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name && project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply deadline-based ordering to filtered projects (same logic as App.js)
  const orderedFilteredProjects = useMemo(() => {
    const projectsWithDeadlines = [];
    const projectsWithoutDeadlines = [];
    const projectsWithOverdueDeadlines = [];

    for (const project of filteredProjects) {
      const deadline = dataUtils.getProjectDeadline(events, project.id);
      
      if (deadline) {
        // Project has a deadline - calculate days until deadline
        const deadlineDate = new Date(deadline.date);
        const now = new Date();
        const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDeadline < 0) {
          // Deadline is overdue (in the past)
          projectsWithOverdueDeadlines.push({
            project,
            deadline,
            daysUntilDeadline: Math.abs(daysUntilDeadline) // Use absolute value for sorting
          });
        } else {
          // Deadline is in the future
          projectsWithDeadlines.push({
            project,
            deadline,
            daysUntilDeadline
          });
        }
      } else {
        // Project has no deadline
        projectsWithoutDeadlines.push(project);
      }
    }

    // Sort projects with deadlines by proximity (closest first)
    projectsWithDeadlines.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
    
    // Sort overdue projects by how overdue they are (most overdue first)
    projectsWithOverdueDeadlines.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);

    // Return ordered projects: future deadlines first, then projects without deadlines, then overdue deadlines
    return [
      ...projectsWithDeadlines.map(({ project }) => project),
      ...projectsWithoutDeadlines,
      ...projectsWithOverdueDeadlines.map(({ project }) => project)
    ];
  }, [filteredProjects, events]);

  // Simple scroll state checker with hysteresis to prevent glitching
  const checkScrollState = useCallback(() => {
    if (!projectsListRef.current) return;
    
    const element = projectsListRef.current;
    const container = element.parentElement;
    
    if (!container) return;
    
    // Get measurements
    const listContentHeight = element.scrollHeight;
    const buttonHeight = 52; // 36px button + 16px margin
    const availableHeight = container.clientHeight;
    const currentlyScrollable = element.classList.contains('scrollable');
    
    // Add hysteresis to prevent rapid switching at the threshold
    // Use different thresholds for entering and exiting scrollable mode
    let needsScrolling;
    if (currentlyScrollable) {
      // When already scrollable, require more space to switch back (add 48px buffer)
      needsScrolling = (listContentHeight + buttonHeight + 48) > availableHeight;
    } else {
      // When not scrollable, use normal threshold
      needsScrolling = (listContentHeight + buttonHeight) > availableHeight;
    }
    
    // Only update if state actually changes
    if (needsScrolling !== currentlyScrollable) {
      if (needsScrolling) {
        element.classList.add('scrollable');
        setIsScrollable(true);
      } else {
        // Add a small delay when removing scrollable state to prevent rapid toggling
        setTimeout(() => {
          if (!projectsListRef.current) return;
          element.classList.remove('scrollable');
          setIsScrollable(false);
          setScrollPosition({ top: false, bottom: false });
        }, 50);
        return;
      }
    }
    
    // Update scroll position for fade effects (only when scrollable)
    if (needsScrolling && element.classList.contains('scrollable')) {
      const isAtTop = element.scrollTop === 0;
      const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
      
      setScrollPosition({
        top: !isAtTop,
        bottom: !isAtBottom
      });
    }
  }, []);

  // Check scroll state when projects change
  useEffect(() => {
    // Use a small timeout to ensure DOM has updated
    const timeoutId = setTimeout(checkScrollState, 10);
    return () => clearTimeout(timeoutId);
  }, [orderedFilteredProjects, checkScrollState]);

  // Check on window resize
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScrollState, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollState]);

  const handleProjectsScroll = () => {
    // Only update scroll position, don't recalculate scrollable state
    if (!projectsListRef.current || !isScrollable) return;
    
    const element = projectsListRef.current;
    const isAtTop = element.scrollTop === 0;
    const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    
    setScrollPosition({
      top: !isAtTop,
      bottom: !isAtBottom
    });
  };

  const handleNewProject = () => {
    if (onNewProject) {
      onNewProject();
    }
  };

  if (isCollapsed) {
    return null; // Don't render anything when collapsed - PageOverlay handles the expand button
  }

  return (
    <>
      {/* Sidebar overlay for mobile */}
      <div 
        className="sidebar-overlay"
        onClick={onToggle}
      />
      
      <aside className="sidebar sidebar-expanded">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img 
              src={theme === 'dark' ? `${process.env.PUBLIC_URL}/logo_white.png` : `${process.env.PUBLIC_URL}/logo_black.png`}
              alt="EVA Logo"
              className="brand-logo"
            />
          </div>
          <button 
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="sidebar-search">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>

        <div className="sidebar-content">
          {/* Main Navigation */}
          <nav className="sidebar-nav">
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${item.isActive ? 'nav-link-active' : ''}`}
                    onClick={() => handleItemClick(item.path)}
                  >
                    <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Projects Section */}
              <div className="projects-section">
              <div className={`projects-container ${isScrollable ? 'has-sticky-button' : ''}`}>
                {/* Top fade overlay */}
                <div className={`projects-fade-overlay projects-fade-top ${scrollPosition.top ? 'visible' : ''}`} />
                
                <div 
                  className="projects-list"
                  ref={projectsListRef}
                  onScroll={handleProjectsScroll}
                >
                  {orderedFilteredProjects.map((project) => {
                    const isOverdue = dataUtils.hasOverdueDeadline(events, project.id);
                    return (
                      <button
                        key={project.id}
                        className={`project-item ${isOverdue ? 'project-overdue' : ''}`}
                        onClick={() => handleItemClick(`/project/${project.id}`)}
                        title={project.name}
                      >
                        <span className="project-color" style={{ backgroundColor: project.color }}></span>
                        <span className="project-name">{project.name}</span>
                      </button>
                    );
                  })}
                  {orderedFilteredProjects.length === 0 && searchTerm && (
                    <div className="no-projects">No projects found</div>
                  )}
                  {orderedFilteredProjects.length === 0 && !searchTerm && projects.length === 0 && (
                    <div className="no-projects">No projects yet</div>
                  )}
                  {/* Add project button when list is not scrollable */}
                  {!isScrollable && (
                    <button
                      className="new-project-button inline"
                      onClick={handleNewProject}
                      title="Create new project"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  )}
                </div>
                
                {/* Bottom fade overlay */}
                <div className={`projects-fade-overlay projects-fade-bottom ${scrollPosition.bottom ? 'visible' : ''}`} />
                
                {/* Sticky new project button when list is scrollable */}
                {isScrollable && (
                  <button
                    className="new-project-button sticky"
                    onClick={handleNewProject}
                    title="Create new project"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="settings-button" title="Settings">
            <FontAwesomeIcon icon={faCog} />
          </button>
          <div className="user-pill">
            <div className="user-avatar">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <span className="user-name">User</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAngleRight, 
  faAngleLeft, 
  faCog, 
  faSearch,
  faChartLine,
  faCalendarAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle, projects = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      isActive: false,
      icon: faChartLine
    },
    { 
      id: 'planning', 
      label: 'Planning', 
      isActive: false,
      icon: faCalendarAlt
    }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleItemClick = (itemId) => {
    console.log(`Navigation to ${itemId}`);
    // Navigation logic will be implemented when routing is added
  };

  const filteredProjects = projects.filter(project =>
    project.name && project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <button 
        className="sidebar-expand-button"
        onClick={onToggle}
        aria-label="Expand sidebar"
      >
        <FontAwesomeIcon icon={faAngleRight} />
      </button>
    );
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
            <span className="brand-text">EVA</span>
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
                    onClick={() => handleItemClick(item.id)}
                  >
                    <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Projects Section */}
            {projects.length > 0 && (
              <div className="projects-section">
                <div className="projects-list">
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      className="project-item"
                      onClick={() => handleItemClick(`project-${project.id}`)}
                      title={project.name}
                    >
                      <span className="project-color" style={{ backgroundColor: project.color }}></span>
                      <span className="project-name">{project.name}</span>
                    </button>
                  ))}
                  {filteredProjects.length === 0 && searchTerm && (
                    <div className="no-projects">No projects found</div>
                  )}
                </div>
              </div>
            )}
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
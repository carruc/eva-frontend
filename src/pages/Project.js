import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import ProjectFiles from '../components/ProjectFiles';
import ProjectProgressBars from '../components/ProjectProgressBars';
import StudyTimeline from '../components/StudyTimeline';
import LearningSession from './LearningSession';
import { useLearningSession } from '../contexts/LearningSessionContext';
// Keep import but comment out for now
// import Events from '../components/Events';
import './Project.css';
import { differenceInDays, isPast, isToday, startOfDay, subDays, addDays } from 'date-fns';

// Utility function to convert hex to RGB
const hexToRgb = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert 3-digit hex to 6-digits
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
};

const Project = () => {
  const { projectId } = useParams();
  const { startSession } = useLearningSession();
  const headerRef = useRef(null);
  const [project, setProject] = useState(null);
  const [deadlineText, setDeadlineText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studySessions, setStudySessions] = useState([]);
  const [isFilesExpanded, setIsFilesExpanded] = useState(false);
  const [showLearningSession, setShowLearningSession] = useState(false);
  // Keep state but comment out for now
  // const [showEvents, setShowEvents] = useState(false);

  // Enhanced mock data for development
  const mockStudySessions = [
    {
      date: '2024-03-01',
      topic: 'Project Setup & Requirements Analysis',
      duration: 120,
      performance: {
        comprehension: 85,
        focus: 90,
        efficiency: 88
      },
      subtopics: [
        'Project Structure Setup',
        'Development Environment Configuration',
        'Requirements Documentation'
      ],
      notes: 'Initial project setup completed. Identified key requirements and potential challenges.'
    },
    {
      date: '2024-03-02',
      topic: 'Database Schema Design',
      duration: 90,
      performance: {
        comprehension: 92,
        focus: 85,
        efficiency: 87
      },
      subtopics: [
        'Entity Relationship Diagrams',
        'Data Models Definition',
        'Schema Optimization'
      ],
      notes: 'Completed initial database schema design. Need to review indexing strategy.'
    },
    {
      date: '2024-03-02',
      topic: 'API Endpoints Planning',
      duration: 60,
      performance: {
        comprehension: 88,
        focus: 82,
        efficiency: 85
      },
      subtopics: [
        'REST API Design',
        'Endpoint Documentation',
        'Security Considerations'
      ],
      notes: 'Mapped out core API endpoints. Authentication flow needs more detail.'
    },
    {
      date: '2024-03-04',
      topic: 'Frontend Architecture',
      duration: 180,
      performance: {
        comprehension: 95,
        focus: 88,
        efficiency: 92
      },
      subtopics: [
        'Component Structure',
        'State Management',
        'Routing Setup'
      ],
      notes: 'Established core frontend architecture. Good progress on component hierarchy.'
    },
    {
      date: '2024-03-06',
      topic: 'User Authentication Implementation',
      duration: 150,
      performance: {
        comprehension: 87,
        focus: 93,
        efficiency: 89
      },
      subtopics: [
        'JWT Implementation',
        'Auth Middleware',
        'User Sessions'
      ],
      notes: 'Implemented basic authentication flow. Need to add password reset functionality.'
    },
    {
      date: '2024-03-08',
      topic: 'Data Models & Validation',
      duration: 120,
      performance: {
        comprehension: 91,
        focus: 87,
        efficiency: 90
      },
      subtopics: [
        'Model Validation Rules',
        'Error Handling',
        'Data Sanitization'
      ],
      notes: 'Completed core data models. Added comprehensive validation rules.'
    },
    {
      date: '2024-03-10',
      topic: 'UI Components Development',
      duration: 240,
      performance: {
        comprehension: 94,
        focus: 91,
        efficiency: 93
      },
      subtopics: [
        'Form Components',
        'Data Display Components',
        'Navigation Elements'
      ],
      notes: 'Built core UI component library. Good progress on accessibility features.'
    }
  ];

  // Add effect to update header height CSS variable
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const projectData = await apiService.getProject(projectId);
        setProject(projectData);

        const eventData = await apiService.getEvents(projectId);
        
        const deadlineEvent = eventData.find(e => e.type === 'deadline');
        if (deadlineEvent) {
          const deadlineDate = new Date(deadlineEvent.date);
          const today = new Date();
          
          if (isPast(deadlineDate) && !isToday(deadlineDate)) {
            setDeadlineText('Deadline has passed');
          } else if (isToday(deadlineDate)) {
            setDeadlineText('Deadline is today');
          } else {
            const daysRemaining = differenceInDays(startOfDay(deadlineDate), startOfDay(today));
            setDeadlineText(daysRemaining === 1 ? 'Deadline in 1 day' : `Deadline in ${daysRemaining} days`);
          }
        }

        // TODO: Replace with actual API call when endpoint is ready
        // const studySessionsData = await apiService.getStudySessions(projectId);
        setStudySessions(mockStudySessions);
        
        setError(null);
      } catch (err) {
        setError('Failed to load project data. Please try again.');
        console.error('Error loading project data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [projectId]);

  // Comment out events visibility effect
  /*
  useEffect(() => {
    if (!isFilesExpanded) {
      const timer = setTimeout(() => {
        setShowEvents(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowEvents(true);
    }
  }, [isFilesExpanded]);
  */

  const handleLearningSession = () => {
    startSession(false); // Always collapse sidebar when starting session
    setShowLearningSession(true);
  };

  const handleCloseLearningSession = () => {
    setShowLearningSession(false);
  };

  // Calculate timeline date range
  const getTimelineRange = () => {
    const today = new Date();
    return {
      startDate: subDays(today, 14).toISOString(), // Show last 2 weeks
      endDate: addDays(today, 14).toISOString()    // Show next 2 weeks
    };
  };

  if (loading) {
    return (
      <div className="project-page">
        <div className="project-loading">
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-page">
        <div className="project-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-page">
        <div className="project-error">
          <p>Project not found.</p>
        </div>
      </div>
    );
  }

  const { startDate, endDate } = getTimelineRange();

  return (
    <div className="project-page">
      {showLearningSession ? (
        <LearningSession 
          projectId={projectId} 
          onClose={handleCloseLearningSession}
        />
      ) : (
        <>
          <div className="project-header" ref={headerRef}>
            <h1 className="project-title">{project.name}</h1>
            {deadlineText && <span className="deadline-text">{deadlineText}</span>}
          </div>
          
          <div className={`project-content ${isFilesExpanded ? 'blur' : ''}`}>
            <StudyTimeline 
              studySessions={studySessions}
              startDate={startDate}
              endDate={endDate}
              project={project}
            />
          </div>

          <div 
            className="project-bottom-container"
            style={{ 
              '--project-color': project.color,
              '--accent-color-rgb': hexToRgb(project.color)
            }}
          >
            {/* Comment out Events component for now */}
            {/* {isFilesExpanded && <Events />} */}
            <div className="project-actions-container">
              <ProjectProgressBars project={project} />
              <button 
                className="btn btn-primary btn-pill learning-session-btn"
                onClick={handleLearningSession}
              >
                Start Learning Session
              </button>
            </div>
            <ProjectFiles 
              project={project} 
              onExpandChange={setIsFilesExpanded}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Project; 
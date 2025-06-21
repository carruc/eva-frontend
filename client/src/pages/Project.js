import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import ProjectFiles from '../components/ProjectFiles';
import './Project.css';
import { differenceInDays, isPast, isToday, startOfDay } from 'date-fns';

const Project = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [deadlineText, setDeadlineText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleLearningSession = () => {
    // TODO: Implement learning session functionality
    console.log('Starting learning session for project:', project?.name);
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

  return (
    <div className="project-page">
      <div className="project-header">
        <h1 className="project-title">{project.name}</h1>
        {deadlineText && <span className="deadline-text">{deadlineText}</span>}
      </div>
      
      <div className="project-content">
        {/* Project content will be mostly empty, letting the drawer take space */}
      </div>

      <div className="project-bottom-container">
        <div className="project-actions-container">
          <button 
            className="btn btn-primary btn-pill learning-session-btn"
            onClick={handleLearningSession}
          >
            Start Learning Session
          </button>
        </div>
        <ProjectFiles project={project} />
      </div>
    </div>
  );
};

export default Project; 
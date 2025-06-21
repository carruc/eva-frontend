import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { apiService, dataUtils } from '../services/api';
import ProjectFiles from '../components/ProjectFiles';
import './Project.css';

const Project = ({ events }) => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await apiService.getProject(projectId);
      setProject(projectData);
      setError(null);
    } catch (err) {
      setError('Failed to load project. Please try again.');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const daysUntilDeadline = useMemo(() => {
    if (!events || !project) return null;
    const deadline = dataUtils.getProjectDeadline(events, project.id);
    if (!deadline) return null;
    return dataUtils.daysUntil(deadline.date);
  }, [events, project]);

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
        {daysUntilDeadline !== null && (
          <div className="deadline-indicator">
            Deadline in {daysUntilDeadline} {daysUntilDeadline === 1 ? 'day' : 'days'}.
          </div>
        )}
        <h1 className="project-title">{project.name}</h1>
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
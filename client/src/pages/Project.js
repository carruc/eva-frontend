import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import './Project.css';

const Project = () => {
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
      </div>
      
      <div className="project-content">
        <div className="project-center">
          <button 
            className="btn btn-primary btn-pill learning-session-btn"
            onClick={handleLearningSession}
          >
            learning session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Project; 
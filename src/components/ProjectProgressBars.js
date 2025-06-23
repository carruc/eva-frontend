import React from 'react';
import './ProjectProgressBars.css';

const ProjectProgressBars = ({ project }) => {
  // Mock progress data - in a real app, this would come from the project prop
  const progressData = {
    overall: 75,
    resources: 60,
    exams: 85
  };

  return (
    <div className="project-progress-bars">
      <div className="progress-bar-container">
        <div className="progress-bar-top">
          <div className="progress-percentage">{progressData.overall}%</div>
          <div className="progress-label">of resources</div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill progress-fill-primary" 
            style={{ width: `${progressData.overall}%` }}
          ></div>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar-top">
          <div className="progress-percentage">{progressData.resources}%</div>
          <div className="progress-label">of exams</div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill progress-fill-secondary" 
            style={{ width: `${progressData.resources}%` }}
          ></div>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar-top">
          <div className="progress-percentage">{progressData.exams}%</div>
          <div className="progress-label">of time</div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill progress-fill-tertiary" 
            style={{ width: `${progressData.exams}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgressBars; 
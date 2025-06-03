import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Target, Brain, Battery, Star, TrendingUp, CheckCircle } from 'lucide-react';
import { LearningSessionType, DefaultValues, ValidationRules } from '../types';
import './LearningSession.css';

/**
 * LEARNING SESSION COMPONENT
 * New component for EVA - manages learning sessions and study tracking
 * Implements PurpLLe's learning session functionality for EVA
 */

// Main Learning Session Card Component
export const LearningSessionCard = ({ session, documents, onEdit, onDelete, onViewDetails }) => {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getAverageMetric = (metrics) => {
    const values = Object.values(metrics).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  };

  const { date, time } = formatTimestamp(session.timestamp);
  const averageScore = getAverageMetric(session.metrics);

  return (
    <div className="learning-session-card">
      <div className="session-header">
        <div className="session-meta">
          <div className="session-date-time">
            <span className="session-date">{date}</span>
            <span className="session-time">{time}</span>
          </div>
          <div className="session-duration">
            <Clock size={14} />
            <span>{formatDuration(session.durationMinutes)}</span>
          </div>
        </div>
        
        {averageScore && (
          <div className="session-score">
            <Star size={14} />
            <span>{averageScore}%</span>
          </div>
        )}
      </div>

      <div className="session-content">
        {session.learningObjective && (
          <div className="session-objective">
            <Target size={16} />
            <span>{session.learningObjective}</span>
          </div>
        )}

        {session.motivation && (
          <div className="session-motivation">
            <Brain size={16} />
            <span>{session.motivation}</span>
          </div>
        )}

        {/* Document and Question counts */}
        <div className="session-stats">
          {session.resourceDocuments?.length > 0 && (
            <div className="stat-item">
              <BookOpen size={14} />
              <span>{session.resourceDocuments.length} resources</span>
            </div>
          )}
          
          {session.testDocuments?.length > 0 && (
            <div className="stat-item">
              <CheckCircle size={14} />
              <span>{session.testDocuments.length} tests</span>
            </div>
          )}
          
          {session.questions?.length > 0 && (
            <div className="stat-item">
              <span>{session.questions.length} questions</span>
            </div>
          )}
        </div>

        {/* Metrics visualization */}
        {averageScore && (
          <div className="session-metrics-preview">
            <div className="metrics-bar">
              <div 
                className="metrics-fill" 
                style={{ width: `${averageScore}%` }}
              />
            </div>
            <span className="metrics-label">Overall performance</span>
          </div>
        )}
      </div>

      <div className="session-actions">
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => onViewDetails(session)}
          title="View session details"
        >
          View Details
        </button>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(session)}
          title="Edit session"
        >
          Edit
        </button>
        <button 
          className="btn btn-ghost btn-sm text-error"
          onClick={() => onDelete(session.id)}
          title="Delete session"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Learning Session Form Component
export const LearningSessionForm = ({ session, project, documents, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...DefaultValues.learningSession,
    projectId: project?.id || '',
    ...(session || {})
  });
  const [errors, setErrors] = useState({});
  const [selectedResourceDocs, setSelectedResourceDocs] = useState(
    session?.resourceDocuments?.map(doc => doc.id) || []
  );
  const [selectedTestDocs, setSelectedTestDocs] = useState(
    session?.testDocuments?.map(doc => doc.id) || []
  );

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const actualValue = type === 'number' ? (value === '' ? null : Number(value)) : value;
    
    if (name.startsWith('metrics.')) {
      const metricName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          [metricName]: actualValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: actualValue
      }));
    }

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDocumentToggle = (docId, isResource = true) => {
    if (isResource) {
      setSelectedResourceDocs(prev => 
        prev.includes(docId) 
          ? prev.filter(id => id !== docId)
          : [...prev, docId]
      );
    } else {
      setSelectedTestDocs(prev => 
        prev.includes(docId) 
          ? prev.filter(id => id !== docId)
          : [...prev, docId]
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const rules = ValidationRules.learningSession;

    if (!formData.durationMinutes || formData.durationMinutes < rules.durationMinutes.min) {
      newErrors.durationMinutes = `Duration must be at least ${rules.durationMinutes.min} minute(s)`;
    }

    if (formData.durationMinutes > rules.durationMinutes.max) {
      newErrors.durationMinutes = `Duration cannot exceed ${rules.durationMinutes.max} minutes`;
    }

    // Validate metrics if provided
    Object.keys(formData.metrics).forEach(metricName => {
      const value = formData.metrics[metricName];
      if (value !== null && (value < 0 || value > 100)) {
        newErrors[`metrics.${metricName}`] = 'Metrics must be between 0 and 100';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const sessionData = {
        ...formData,
        resourceDocumentIds: selectedResourceDocs,
        testDocumentIds: selectedTestDocs,
        timestamp: session?.timestamp || new Date().toISOString()
      };
      
      onSave(sessionData);
    }
  };

  const resourceDocuments = documents?.filter(doc => doc.category === 'RESOURCE') || [];
  const testDocuments = documents?.filter(doc => doc.category === 'TEST') || [];

  return (
    <form onSubmit={handleSubmit} className="learning-session-form">
      <div className="form-section">
        <h4>Session Overview</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="durationMinutes" className="form-label">
              Duration (minutes) *
            </label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min="1"
              max="1440"
              className={`input ${errors.durationMinutes ? 'input-error' : ''}`}
              value={formData.durationMinutes || ''}
              onChange={handleInputChange}
              placeholder="60"
            />
            {errors.durationMinutes && (
              <div className="form-error">{errors.durationMinutes}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="learningObjective" className="form-label">
            Learning Objective
          </label>
          <textarea
            id="learningObjective"
            name="learningObjective"
            className="input"
            value={formData.learningObjective || ''}
            onChange={handleInputChange}
            placeholder="What do you aim to learn in this session?"
            rows="2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="motivation" className="form-label">
            Motivation
          </label>
          <textarea
            id="motivation"
            name="motivation"
            className="input"
            value={formData.motivation || ''}
            onChange={handleInputChange}
            placeholder="What motivates you to study this topic?"
            rows="2"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Learning Metrics (0-100)</h4>
        <div className="metrics-grid">
          <div className="form-group">
            <label htmlFor="awarenessLevel" className="form-label">
              <Brain size={16} />
              Awareness Level
            </label>
            <input
              id="awarenessLevel"
              name="metrics.awarenessLevel"
              type="number"
              min="0"
              max="100"
              className={`input ${errors['metrics.awarenessLevel'] ? 'input-error' : ''}`}
              value={formData.metrics.awarenessLevel || ''}
              onChange={handleInputChange}
              placeholder="0-100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confidenceLevel" className="form-label">
              <TrendingUp size={16} />
              Confidence Level
            </label>
            <input
              id="confidenceLevel"
              name="metrics.confidenceLevel"
              type="number"
              min="0"
              max="100"
              className={`input ${errors['metrics.confidenceLevel'] ? 'input-error' : ''}`}
              value={formData.metrics.confidenceLevel || ''}
              onChange={handleInputChange}
              placeholder="0-100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="energyLevel" className="form-label">
              <Battery size={16} />
              Energy Level
            </label>
            <input
              id="energyLevel"
              name="metrics.energyLevel"
              type="number"
              min="0"
              max="100"
              className={`input ${errors['metrics.energyLevel'] ? 'input-error' : ''}`}
              value={formData.metrics.energyLevel || ''}
              onChange={handleInputChange}
              placeholder="0-100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="performanceLevel" className="form-label">
              <Star size={16} />
              Performance Level
            </label>
            <input
              id="performanceLevel"
              name="metrics.performanceLevel"
              type="number"
              min="0"
              max="100"
              className={`input ${errors['metrics.performanceLevel'] ? 'input-error' : ''}`}
              value={formData.metrics.performanceLevel || ''}
              onChange={handleInputChange}
              placeholder="0-100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="satisfactionLevel" className="form-label">
              <CheckCircle size={16} />
              Satisfaction Level
            </label>
            <input
              id="satisfactionLevel"
              name="metrics.satisfactionLevel"
              type="number"
              min="0"
              max="100"
              className={`input ${errors['metrics.satisfactionLevel'] ? 'input-error' : ''}`}
              value={formData.metrics.satisfactionLevel || ''}
              onChange={handleInputChange}
              placeholder="0-100"
            />
          </div>
        </div>
      </div>

      {/* Document Selection */}
      {(resourceDocuments.length > 0 || testDocuments.length > 0) && (
        <div className="form-section">
          <h4>Associated Documents</h4>
          
          {resourceDocuments.length > 0 && (
            <div className="document-section">
              <h5>Resource Documents</h5>
              <div className="document-list">
                {resourceDocuments.map(doc => (
                  <label key={doc.id} className="document-option">
                    <input
                      type="checkbox"
                      checked={selectedResourceDocs.includes(doc.id)}
                      onChange={() => handleDocumentToggle(doc.id, true)}
                    />
                    <span className="document-name">{doc.filename}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {testDocuments.length > 0 && (
            <div className="document-section">
              <h5>Test Documents</h5>
              <div className="document-list">
                {testDocuments.map(doc => (
                  <label key={doc.id} className="document-option">
                    <input
                      type="checkbox"
                      checked={selectedTestDocs.includes(doc.id)}
                      onChange={() => handleDocumentToggle(doc.id, false)}
                    />
                    <span className="document-name">{doc.filename}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {session ? 'Update Session' : 'Create Session'}
        </button>
      </div>
    </form>
  );
};

// Learning Session Details Modal
export const LearningSessionDetails = ({ session, onClose, onEdit }) => {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getMetricIcon = (metricName) => {
    const icons = {
      awarenessLevel: Brain,
      confidenceLevel: TrendingUp,
      energyLevel: Battery,
      performanceLevel: Star,
      satisfactionLevel: CheckCircle
    };
    return icons[metricName] || Star;
  };

  const getMetricLabel = (metricName) => {
    const labels = {
      awarenessLevel: 'Awareness Level',
      confidenceLevel: 'Confidence Level',
      energyLevel: 'Energy Level',
      performanceLevel: 'Performance Level',
      satisfactionLevel: 'Satisfaction Level'
    };
    return labels[metricName] || metricName;
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content learning-session-details">
        <div className="modal-header">
          <h3>Learning Session Details</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="session-overview">
            <div className="overview-item">
              <Clock size={20} />
              <div>
                <span className="label">Duration</span>
                <span className="value">{formatDuration(session.durationMinutes)}</span>
              </div>
            </div>
            
            <div className="overview-item">
              <span className="label">Date & Time</span>
              <span className="value">{formatTimestamp(session.timestamp)}</span>
            </div>
          </div>

          {(session.learningObjective || session.motivation) && (
            <div className="session-description">
              {session.learningObjective && (
                <div className="description-item">
                  <Target size={16} />
                  <div>
                    <span className="label">Learning Objective</span>
                    <p className="text">{session.learningObjective}</p>
                  </div>
                </div>
              )}

              {session.motivation && (
                <div className="description-item">
                  <Brain size={16} />
                  <div>
                    <span className="label">Motivation</span>
                    <p className="text">{session.motivation}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metrics */}
          <div className="metrics-section">
            <h4>Learning Metrics</h4>
            <div className="metrics-grid">
              {Object.entries(session.metrics).map(([key, value]) => {
                if (value === null || value === undefined) return null;
                const Icon = getMetricIcon(key);
                return (
                  <div key={key} className="metric-item">
                    <div className="metric-header">
                      <Icon size={16} />
                      <span className="metric-label">{getMetricLabel(key)}</span>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="metric-value">{value}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents */}
          {(session.resourceDocuments?.length > 0 || session.testDocuments?.length > 0) && (
            <div className="documents-section">
              <h4>Associated Documents</h4>
              
              {session.resourceDocuments?.length > 0 && (
                <div className="document-group">
                  <h5><BookOpen size={16} /> Resource Documents</h5>
                  <ul className="document-list">
                    {session.resourceDocuments.map(doc => (
                      <li key={doc.id} className="document-item">
                        {doc.filename}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {session.testDocuments?.length > 0 && (
                <div className="document-group">
                  <h5><CheckCircle size={16} /> Test Documents</h5>
                  <ul className="document-list">
                    {session.testDocuments.map(doc => (
                      <li key={doc.id} className="document-item">
                        {doc.filename}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Questions */}
          {session.questions?.length > 0 && (
            <div className="questions-section">
              <h4>Questions ({session.questions.length})</h4>
              <div className="questions-list">
                {session.questions.map(question => (
                  <div key={question.id} className="question-item">
                    <div className="question-text">{question.question}</div>
                    <div className="answer-text">{question.answer}</div>
                    {question.evaluation && (
                      <div className="question-score">Score: {question.evaluation}%</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(session)}>
            Edit Session
          </button>
        </div>
      </div>
    </div>
  );
}; 
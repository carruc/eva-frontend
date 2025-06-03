import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle, 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  FileText,
  MessageCircle,
  Award,
  Link
} from 'lucide-react';
import { QuestionType, DefaultValues, ValidationRules } from '../types';
import './QuestionManager.css';

/**
 * QUESTION MANAGER COMPONENT
 * New component for EVA - manages questions and answers in learning sessions
 * Implements PurpLLe's question management functionality for EVA
 */

// Main Question Manager Component
export const QuestionManager = ({ 
  session,
  questions, 
  documents,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion
}) => {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleCreateQuestion = (questionData) => {
    onCreateQuestion(questionData);
    setShowQuestionForm(false);
  };

  const handleUpdateQuestion = (questionData) => {
    onUpdateQuestion(editingQuestion.id, questionData);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      onDeleteQuestion(questionId);
    }
  };

  const getAverageScore = () => {
    const evaluatedQuestions = questions.filter(q => q.evaluation !== null && q.evaluation !== undefined);
    if (evaluatedQuestions.length === 0) return null;
    
    const totalScore = evaluatedQuestions.reduce((sum, q) => sum + q.evaluation, 0);
    return Math.round(totalScore / evaluatedQuestions.length);
  };

  const averageScore = getAverageScore();
  const evaluatedCount = questions.filter(q => q.evaluation !== null && q.evaluation !== undefined).length;

  return (
    <div className="question-manager">
      <div className="question-header">
        <div className="header-info">
          <h3>Questions & Answers</h3>
          <div className="question-stats">
            <span className="stat-item">
              <MessageCircle size={16} />
              {questions.length} Questions
            </span>
            {evaluatedCount > 0 && (
              <span className="stat-item">
                <Award size={16} />
                {evaluatedCount} Evaluated
              </span>
            )}
            {averageScore !== null && (
              <span className="stat-item score">
                <CheckCircle size={16} />
                {averageScore}% Average
              </span>
            )}
          </div>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowQuestionForm(true)}
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      {/* Questions List */}
      <div className="questions-list">
        {questions.length === 0 ? (
          <div className="empty-state">
            <HelpCircle size={48} />
            <h4>No questions yet</h4>
            <p>Add questions to track your learning progress and understanding.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowQuestionForm(true)}
            >
              Add First Question
            </button>
          </div>
        ) : (
          questions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              documents={documents}
              onEdit={() => handleEditQuestion(question)}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))
        )}
      </div>

      {/* Question Form Modal */}
      {(showQuestionForm || editingQuestion) && (
        <QuestionForm
          question={editingQuestion}
          session={session}
          documents={documents}
          onSave={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
          onCancel={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

// Individual Question Card Component
export const QuestionCard = ({ question, documents, onEdit, onDelete }) => {
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [showReferences, setShowReferences] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTestDocument = () => {
    if (!question.testDocumentId) return null;
    return documents.find(doc => doc.id === question.testDocumentId);
  };

  const getResourceDocuments = () => {
    if (!question.resourceDocuments) return [];
    return question.resourceDocuments;
  };

  const testDocument = getTestDocument();
  const resourceDocuments = getResourceDocuments();

  return (
    <div className="question-card">
      <div className="question-content">
        <div className="question-section">
          <div className="section-header">
            <HelpCircle size={16} />
            <span className="section-title">Question</span>
          </div>
          <div className="question-text">{question.question}</div>
        </div>

        <div className="answer-section">
          <div className="section-header">
            <MessageCircle size={16} />
            <span className="section-title">Your Answer</span>
          </div>
          <div className="answer-text">
            {showFullAnswer ? question.answer : truncateText(question.answer)}
            {question.answer.length > 150 && (
              <button 
                className="btn btn-link btn-sm"
                onClick={() => setShowFullAnswer(!showFullAnswer)}
              >
                {showFullAnswer ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>

        {question.correction && (
          <div className="correction-section">
            <div className="section-header">
              <CheckCircle size={16} />
              <span className="section-title">Correction/Ideal Answer</span>
            </div>
            <div className="correction-text">{question.correction}</div>
          </div>
        )}

        {/* Document References */}
        {(testDocument || resourceDocuments.length > 0 || question.references?.length > 0) && (
          <div className="references-section">
            <div 
              className="section-header clickable"
              onClick={() => setShowReferences(!showReferences)}
            >
              <Link size={16} />
              <span className="section-title">References</span>
              <span className="expand-icon">{showReferences ? '−' : '+'}</span>
            </div>
            
            {showReferences && (
              <div className="references-content">
                {testDocument && (
                  <div className="reference-item">
                    <div className="reference-type">
                      <CheckCircle size={14} />
                      Test Document
                    </div>
                    <div className="reference-name">{testDocument.filename}</div>
                  </div>
                )}

                {resourceDocuments.map(doc => (
                  <div key={doc.id} className="reference-item">
                    <div className="reference-type">
                      <BookOpen size={14} />
                      Resource Document
                    </div>
                    <div className="reference-name">{doc.filename}</div>
                  </div>
                ))}

                {question.references?.map(ref => (
                  <div key={ref.id} className="reference-item detailed">
                    <div className="reference-type">
                      <FileText size={14} />
                      Document Reference
                    </div>
                    <div className="reference-details">
                      <div className="reference-location">
                        {ref.pageNumber && `Page ${ref.pageNumber}`}
                        {ref.lineNumber && `Line ${ref.lineNumber}`}
                        {ref.charOffset && `Position ${ref.charOffset}`}
                      </div>
                      {ref.contextText && (
                        <div className="reference-context">"{ref.contextText}"</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="question-footer">
        <div className="question-score">
          {question.evaluation !== null && question.evaluation !== undefined ? (
            <div 
              className="score-badge"
              style={{ backgroundColor: getScoreColor(question.evaluation) }}
            >
              {question.evaluation}%
            </div>
          ) : (
            <div className="score-badge unscored">
              Not Scored
            </div>
          )}
        </div>

        <div className="question-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onEdit}
            title="Edit question"
          >
            <Edit size={14} />
          </button>
          <button
            className="btn btn-ghost btn-sm text-error"
            onClick={onDelete}
            title="Delete question"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Question Form Component
export const QuestionForm = ({ question, session, documents, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...DefaultValues.question,
    sessionId: session?.id || '',
    ...(question || {})
  });
  const [selectedResourceDocs, setSelectedResourceDocs] = useState(
    question?.resourceDocuments?.map(doc => doc.id) || []
  );
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const actualValue = type === 'number' ? (value === '' ? null : Number(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: actualValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleResourceDocToggle = (docId) => {
    setSelectedResourceDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const rules = ValidationRules.question;

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (formData.question.trim().length < rules.question.minLength) {
      newErrors.question = `Question must be at least ${rules.question.minLength} characters`;
    } else if (formData.question.trim().length > rules.question.maxLength) {
      newErrors.question = `Question must be less than ${rules.question.maxLength} characters`;
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    } else if (formData.answer.trim().length < rules.answer.minLength) {
      newErrors.answer = `Answer must be at least ${rules.answer.minLength} characters`;
    } else if (formData.answer.trim().length > rules.answer.maxLength) {
      newErrors.answer = `Answer must be less than ${rules.answer.maxLength} characters`;
    }

    if (formData.evaluation !== null && 
        (formData.evaluation < rules.evaluation.min || formData.evaluation > rules.evaluation.max)) {
      newErrors.evaluation = `Evaluation must be between ${rules.evaluation.min} and ${rules.evaluation.max}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const questionData = {
        ...formData,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        correction: formData.correction?.trim() || null,
        resourceDocumentIds: selectedResourceDocs
      };
      
      onSave(questionData);
    }
  };

  const resourceDocuments = documents?.filter(doc => doc.category === 'RESOURCE') || [];
  const testDocuments = documents?.filter(doc => doc.category === 'TEST') || [];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content question-form">
        <div className="modal-header">
          <h3>{question ? 'Edit Question' : 'Add Question'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Question Input */}
            <div className="form-group">
              <label htmlFor="question" className="form-label">
                Question *
              </label>
              <textarea
                id="question"
                name="question"
                className={`input ${errors.question ? 'input-error' : ''}`}
                value={formData.question}
                onChange={handleInputChange}
                placeholder="Enter your question..."
                rows="3"
              />
              {errors.question && (
                <div className="form-error">{errors.question}</div>
              )}
            </div>

            {/* Answer Input */}
            <div className="form-group">
              <label htmlFor="answer" className="form-label">
                Your Answer *
              </label>
              <textarea
                id="answer"
                name="answer"
                className={`input ${errors.answer ? 'input-error' : ''}`}
                value={formData.answer}
                onChange={handleInputChange}
                placeholder="Enter your answer..."
                rows="4"
              />
              {errors.answer && (
                <div className="form-error">{errors.answer}</div>
              )}
            </div>

            {/* Correction Input */}
            <div className="form-group">
              <label htmlFor="correction" className="form-label">
                Correction/Ideal Answer (optional)
              </label>
              <textarea
                id="correction"
                name="correction"
                className="input"
                value={formData.correction || ''}
                onChange={handleInputChange}
                placeholder="Enter the correct or ideal answer..."
                rows="3"
              />
            </div>

            {/* Evaluation Input */}
            <div className="form-group">
              <label htmlFor="evaluation" className="form-label">
                Score (0-100, optional)
              </label>
              <input
                id="evaluation"
                name="evaluation"
                type="number"
                min="0"
                max="100"
                className={`input ${errors.evaluation ? 'input-error' : ''}`}
                value={formData.evaluation || ''}
                onChange={handleInputChange}
                placeholder="0-100"
              />
              {errors.evaluation && (
                <div className="form-error">{errors.evaluation}</div>
              )}
            </div>

            {/* Test Document Selection */}
            {testDocuments.length > 0 && (
              <div className="form-group">
                <label htmlFor="testDocumentId" className="form-label">
                  Test Document (optional)
                </label>
                <select
                  id="testDocumentId"
                  name="testDocumentId"
                  className="input"
                  value={formData.testDocumentId || ''}
                  onChange={handleInputChange}
                >
                  <option value="">No test document</option>
                  {testDocuments.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.filename}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Resource Documents Selection */}
            {resourceDocuments.length > 0 && (
              <div className="form-group">
                <label className="form-label">
                  Resource Documents (optional)
                </label>
                <div className="document-list">
                  {resourceDocuments.map(doc => (
                    <label key={doc.id} className="document-option">
                      <input
                        type="checkbox"
                        checked={selectedResourceDocs.includes(doc.id)}
                        onChange={() => handleResourceDocToggle(doc.id)}
                      />
                      <span className="document-name">{doc.filename}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {question ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Question Statistics Component
export const QuestionStats = ({ questions }) => {
  const totalQuestions = questions.length;
  const evaluatedQuestions = questions.filter(q => q.evaluation !== null && q.evaluation !== undefined);
  const evaluatedCount = evaluatedQuestions.length;
  
  const averageScore = evaluatedCount > 0 
    ? Math.round(evaluatedQuestions.reduce((sum, q) => sum + q.evaluation, 0) / evaluatedCount)
    : null;

  const scoreDistribution = {
    excellent: evaluatedQuestions.filter(q => q.evaluation >= 90).length,
    good: evaluatedQuestions.filter(q => q.evaluation >= 70 && q.evaluation < 90).length,
    fair: evaluatedQuestions.filter(q => q.evaluation >= 50 && q.evaluation < 70).length,
    poor: evaluatedQuestions.filter(q => q.evaluation < 50).length
  };

  if (totalQuestions === 0) {
    return null;
  }

  return (
    <div className="question-stats-panel">
      <h4>Question Statistics</h4>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalQuestions}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{evaluatedCount}</div>
          <div className="stat-label">Evaluated</div>
        </div>
        
        {averageScore !== null && (
          <div className="stat-card">
            <div className="stat-value">{averageScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        )}
      </div>

      {evaluatedCount > 0 && (
        <div className="score-distribution">
          <h5>Score Distribution</h5>
          <div className="distribution-bars">
            <div className="distribution-item">
              <div className="distribution-label">Excellent (90-100%)</div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill excellent"
                  style={{ width: `${(scoreDistribution.excellent / evaluatedCount) * 100}%` }}
                />
              </div>
              <div className="distribution-count">{scoreDistribution.excellent}</div>
            </div>
            
            <div className="distribution-item">
              <div className="distribution-label">Good (70-89%)</div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill good"
                  style={{ width: `${(scoreDistribution.good / evaluatedCount) * 100}%` }}
                />
              </div>
              <div className="distribution-count">{scoreDistribution.good}</div>
            </div>
            
            <div className="distribution-item">
              <div className="distribution-label">Fair (50-69%)</div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill fair"
                  style={{ width: `${(scoreDistribution.fair / evaluatedCount) * 100}%` }}
                />
              </div>
              <div className="distribution-count">{scoreDistribution.fair}</div>
            </div>
            
            <div className="distribution-item">
              <div className="distribution-label">Poor (0-49%)</div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill poor"
                  style={{ width: `${(scoreDistribution.poor / evaluatedCount) * 100}%` }}
                />
              </div>
              <div className="distribution-count">{scoreDistribution.poor}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
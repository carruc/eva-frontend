import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faTimes, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './ProjectFiles.css';

// Using more descriptive mock data based on the screenshot
const mockFiles = [
  { id: 'res1', name: 'appunti-cazzola.pdf', type: 'Resource', progress: 90 },
  { id: 'res2', name: 'lecture-slides-w1.pdf', type: 'Resource', progress: 75 },
  { id: 'res3', name: 'reading-material-ch1.pdf', type: 'Resource', progress: 60 },
  { id: 'res4', name: 'summary-of-concepts.docx', type: 'Resource', progress: 40 },
  { id: 'res5', name: 'extra-notes.pdf', type: 'Resource', progress: 20 },
  { id: 'res6', name: 'additional-reading-1.pdf', type: 'Resource', progress: 95 },
  { id: 'res7', name: 'seminar-notes.pdf', type: 'Resource', progress: 80 },
  { id: 'res8', name: 'case-study-analysis.pdf', type: 'Resource', progress: 55 },
  { id: 'res9', name: 'lab-report-template.docx', type: 'Resource', progress: 35 },
  { id: 'res10', name: 'bibliography.pdf', type: 'Resource', progress: 10 },
  { id: 'exam1', name: 'midterm-2022-solution.pdf', type: 'Exam', progress: 100 },
  { id: 'exam2', name: 'final-exam-prep.pdf', type: 'Exam', progress: 85 },
  { id: 'exam3', name: 'quiz-1-questions.pdf', type: 'Exam', progress: 50 },
  { id: 'exam4', name: 'practice-test.pdf', type: 'Exam', progress: 30 },
  { id: 'exam5', name: 'mock-exam-a.pdf', type: 'Exam', progress: 15 },
  { id: 'exam6', name: 'past-paper-2021.pdf', type: 'Exam', progress: 98 },
  { id: 'exam7', name: 'sample-questions-set-b.pdf', type: 'Exam', progress: 70 },
  { id: 'exam8', name: 'oral-exam-notes.pdf', type: 'Exam', progress: 45 },
  { id: 'exam9', name: 'essay-questions.pdf', type: 'Exam', progress: 25 },
  { id: 'exam10', name: 'multiple-choice-quiz.pdf', type: 'Exam', progress: 5 },
];

const FileItem = ({ file }) => (
  <div className="file-item">
    <span className="file-name">{file.name}</span>
    <div className="file-meta">
      <span className="file-type-tag">{file.type}</span>
      <div className="file-progress-bar">
        <div 
          className={`file-progress ${file.type.toLowerCase()}`} 
          style={{ width: `${file.progress}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const ProjectFiles = ({ project, onExpandChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  // In a real app, these files would come from the project prop
  const files = mockFiles;

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandChange?.(newExpandedState);
  };

  const filteredFiles = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) return files;
    return files.filter(file =>
      file.name.toLowerCase().includes(lowercasedTerm)
    );
  }, [files, searchTerm]);

  const groupedFiles = useMemo(() => {
    return filteredFiles.reduce((acc, file) => {
      const { type } = file;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(file);
      return acc;
    }, {});
  }, [filteredFiles]);

  return (
    <div 
      className={`project-files ${isExpanded ? 'expanded' : 'collapsed'}`}
      style={{ '--project-color': project.color }}
    >
      <div className="project-files-header">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search project files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={handleClearSearch}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        <div className="project-files-header-actions">
          <button className="add-file-btn">
            <FontAwesomeIcon icon={faPlus} />
            Add New File
          </button>
          <button className="expand-collapse-btn" onClick={toggleExpanded}>
            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronUp} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="files-display-area">
          {Object.entries(groupedFiles).map(([type, filesOfType]) => (
            <div key={type} className="file-group">
              <h3 className="file-group-title">{type}s:</h3>
              <div className="file-list">
                {filesOfType.map(file => (
                  <FileItem key={file.id} file={file} />
                ))}
              </div>
            </div>
          ))}
          {filteredFiles.length === 0 && (
            <div className="no-files-found">No files found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectFiles; 
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  BookOpen, 
  Download, 
  Eye, 
  Trash2, 
  Edit, 
  Search,
  Filter,
  X
} from 'lucide-react';
import { DocumentType, DocumentCategory, DefaultValues, ValidationRules } from '../types';
import './DocumentManager.css';

/**
 * DOCUMENT MANAGER COMPONENT
 * New component for EVA - manages document uploads and organization
 * Implements PurpLLe's document management functionality for EVA
 */

// Main Document Manager Component
export const DocumentManager = ({ 
  project, 
  documents, 
  onUploadDocument, 
  onDeleteDocument, 
  onDownloadDocument,
  onViewDocument 
}) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
      const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.content && doc.content.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'uploadDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const resourceCount = documents.filter(doc => doc.category === 'RESOURCE').length;
  const testCount = documents.filter(doc => doc.category === 'TEST').length;

  return (
    <div className="document-manager">
      <div className="document-header">
        <div className="header-info">
          <h3>Documents</h3>
          <div className="document-stats">
            <span className="stat-item">
              <BookOpen size={16} />
              {resourceCount} Resources
            </span>
            <span className="stat-item">
              <CheckCircle size={16} />
              {testCount} Tests
            </span>
          </div>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadForm(true)}
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="document-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Categories</option>
              <option value="RESOURCE">Resources</option>
              <option value="TEST">Tests</option>
            </select>
          </div>

          <div className="sort-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="uploadDate">Upload Date</option>
              <option value="filename">Name</option>
              <option value="fileSize">Size</option>
            </select>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="document-list">
        {filteredDocuments.length === 0 ? (
          <div className="empty-state">
            {documents.length === 0 ? (
              <>
                <FileText size={48} />
                <h4>No documents yet</h4>
                <p>Upload learning resources and test materials to get started.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowUploadForm(true)}
                >
                  Upload First Document
                </button>
              </>
            ) : (
              <>
                <Search size={48} />
                <h4>No documents found</h4>
                <p>Try adjusting your search or filter criteria.</p>
              </>
            )}
          </div>
        ) : (
          filteredDocuments.map(document => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={() => onDeleteDocument(document.id)}
              onDownload={() => onDownloadDocument(document.id)}
              onView={() => onViewDocument(document)}
            />
          ))
        )}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <DocumentUploadForm
          project={project}
          onSave={onUploadDocument}
          onCancel={() => setShowUploadForm(false)}
        />
      )}
    </div>
  );
};

// Individual Document Card Component
export const DocumentCard = ({ document, onDelete, onDownload, onView }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatUploadDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const textFormats = ['txt', 'md', 'rtf'];
    
    if (textFormats.includes(extension)) {
      return <FileText size={20} />;
    }
    
    return <FileText size={20} />;
  };

  const getCategoryIcon = (category) => {
    return category === 'RESOURCE' ? <BookOpen size={14} /> : <CheckCircle size={14} />;
  };

  const getCategoryColor = (category) => {
    return category === 'RESOURCE' ? 'var(--success-color)' : 'var(--warning-color)';
  };

  return (
    <div className="document-card">
      <div className="document-info">
        <div className="document-icon">
          {getFileIcon(document.filename)}
        </div>
        
        <div className="document-details">
          <div className="document-name">{document.filename}</div>
          <div className="document-meta">
            <span className="upload-date">
              Uploaded {formatUploadDate(document.uploadDate)}
            </span>
            {document.fileSize && (
              <span className="file-size">
                {formatFileSize(document.fileSize)}
              </span>
            )}
          </div>
        </div>

        <div className="document-category">
          <span 
            className="category-badge"
            style={{ color: getCategoryColor(document.category) }}
          >
            {getCategoryIcon(document.category)}
            {document.category}
          </span>
        </div>
      </div>

      <div className="document-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onView}
          title="View document"
        >
          <Eye size={14} />
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onDownload}
          title="Download document"
        >
          <Download size={14} />
        </button>
        <button
          className="btn btn-ghost btn-sm text-error"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this document?')) {
              onDelete();
            }
          }}
          title="Delete document"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// Document Upload Form Component
export const DocumentUploadForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...DefaultValues.document,
    projectId: project?.id || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      filename: file.name
    }));

    if (errors.file) {
      setErrors(prev => ({ ...prev, file: null }));
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const rules = ValidationRules.document;

    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    } else {
      // File size validation (16MB max)
      const maxSize = 16 * 1024 * 1024; // 16MB
      if (selectedFile.size > maxSize) {
        newErrors.file = 'File size must be less than 16MB';
      }
    }

    if (!formData.category || !['RESOURCE', 'TEST'].includes(formData.category)) {
      newErrors.category = 'Please select a valid category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const documentData = new FormData();
      documentData.append('file', selectedFile);
      documentData.append('category', formData.category);
      documentData.append('projectId', formData.projectId);
      
      onSave(documentData);
    }
  };

  const getFileIcon = (file) => {
    if (!file) return <Upload size={48} />;
    return <FileText size={48} />;
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content document-upload-form">
        <div className="modal-header">
          <h3>Upload Document</h3>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Project Info */}
            <div className="project-info">
              <div className="project-info-label">Uploading to:</div>
              <div className="project-info-content">
                <div 
                  className="project-color-indicator"
                  style={{ backgroundColor: project.color }}
                />
                <span className="project-name">{project.name}</span>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="form-group">
              <label className="form-label">Document File *</label>
              <div 
                className={`file-upload-area ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                />
                
                <div className="upload-content">
                  {getFileIcon(selectedFile)}
                  {selectedFile ? (
                    <div className="file-info">
                      <div className="file-name">{selectedFile.name}</div>
                      <div className="file-size">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div className="upload-instructions">
                      <div className="upload-text">
                        Drop a file here or click to select
                      </div>
                      <div className="upload-hint">
                        Supports PDF, DOC, DOCX, TXT, MD, RTF (max 16MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {errors.file && (
                <div className="form-error">{errors.file}</div>
              )}
            </div>

            {/* Category Selection */}
            <div className="form-group">
              <label className="form-label">Document Category *</label>
              <div className="category-selector">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="RESOURCE"
                    checked={formData.category === 'RESOURCE'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-label">
                    <BookOpen size={16} />
                    <div>
                      <div className="category-name">Resource</div>
                      <div className="category-description">
                        Learning materials, references, notes
                      </div>
                    </div>
                  </span>
                </label>
                
                <label className="radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="TEST"
                    checked={formData.category === 'TEST'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-label">
                    <CheckCircle size={16} />
                    <div>
                      <div className="category-name">Test</div>
                      <div className="category-description">
                        Exams, quizzes, practice questions
                      </div>
                    </div>
                  </span>
                </label>
              </div>
              {errors.category && (
                <div className="form-error">{errors.category}</div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!selectedFile}>
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Document Viewer Component (for viewing document content)
export const DocumentViewer = ({ document, onClose }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatUploadDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content document-viewer">
        <div className="modal-header">
          <div className="document-header-info">
            <h3>{document.filename}</h3>
            <div className="document-metadata">
              <span className="category-badge" style={{ 
                color: document.category === 'RESOURCE' ? 'var(--success-color)' : 'var(--warning-color)' 
              }}>
                {document.category === 'RESOURCE' ? <BookOpen size={14} /> : <CheckCircle size={14} />}
                {document.category}
              </span>
              {document.fileSize && (
                <span className="file-size">{formatFileSize(document.fileSize)}</span>
              )}
              <span className="upload-date">
                Uploaded {formatUploadDate(document.uploadDate)}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {document.content ? (
            <div className="document-content">
              <div className="content-text">
                {document.content}
              </div>
            </div>
          ) : (
            <div className="no-preview">
              <FileText size={48} />
              <h4>Preview not available</h4>
              <p>This document type cannot be previewed. Download the file to view its contents.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import './ProjectModal.css';

// Implements requirement D5: Project creation modal with deadline support
const ProjectModal = ({ project, existingDeadline, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    deadline: '',
    deadlineTime: '23:59', // Default to end of day
    deadlineName: '' // Add deadline name field
  });
  const [errors, setErrors] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [dateInput, setDateInput] = useState(''); // For dd/mm/yy format

  // Predefined color palette
  const colorPalette = [
    '#3b82f6', '#10b981', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#f43f5e', '#8b5a2b', '#64748b', '#dc2626'
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (project) {
      setFormData(prev => ({
        ...prev,
        name: project.name,
        color: project.color
      }));

      // If there's an existing deadline, populate the deadline fields
      if (existingDeadline) {
        const deadlineDate = new Date(existingDeadline.date);
        const dateValue = deadlineDate.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          deadline: dateValue,
          deadlineTime: deadlineDate.toTimeString().slice(0, 5),
          deadlineName: existingDeadline.name
        }));
        setDateInput(formatDateToShort(dateValue));
      }
    }
  }, [project, existingDeadline]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color: color
    }));
  };

  // Helper function to format date from YYYY-MM-DD to dd/mm/yy
  const formatDateToShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2); // Last 2 digits
    return `${day}/${month}/${year}`;
  };

  // Helper function to parse dd/mm/yy format
  const parseDateInput = (dateStr) => {
    const parts = dateStr.split(/[/.-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      
      // Convert 2-digit year to 4-digit year
      if (year >= 0 && year <= 30) {
        year += 2000; // 00-30 -> 2000-2030
      } else if (year >= 31 && year <= 99) {
        year += 1900; // 31-99 -> 1931-1999
      } else if (year >= 1900) {
        // Already 4-digit year, keep as is
      } else {
        return null; // Invalid year
      }
      
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        // Convert to YYYY-MM-DD format for internal use
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
    return null;
  };

  // Handle date input change
  const handleDateInputChange = (e) => {
    let value = e.target.value;
    
    // Remove all non-numeric characters except slashes
    value = value.replace(/[^\d/]/g, '');
    
    // Auto-format with slashes as user types
    if (value.length >= 2 && value.charAt(2) !== '/') {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5 && value.charAt(5) !== '/') {
      value = value.substring(0, 5) + '/' + value.substring(5);
    }
    
    // Limit to 8 characters (dd/mm/yy)
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    setDateInput(value);
    
    // Only try to parse if we have a complete date (8 characters: dd/mm/yy)
    if (value.length === 8) {
      const parsedDate = parseDateInput(value);
      if (parsedDate) {
        // Additional validation for deadlines - must be today or future
        const selectedDate = new Date(parsedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        if (selectedDate >= today) {
          setFormData(prev => ({ ...prev, deadline: parsedDate }));
          if (errors.deadline) {
            setErrors(prev => ({ ...prev, deadline: null }));
          }
        } else {
          // Clear the internal date if deadline is in the past
          setFormData(prev => ({ ...prev, deadline: '' }));
        }
      } else {
        // Clear the internal date if input is invalid
        setFormData(prev => ({ ...prev, deadline: '' }));
      }
    } else {
      // Clear the internal date if input is incomplete
      setFormData(prev => ({ ...prev, deadline: '' }));
    }
  };

  // Handle date key press for better UX
  const handleDateKeyPress = (e) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number or slash and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 96 || e.keyCode > 105) && 
        e.keyCode !== 191 && e.keyCode !== 111) {
      e.preventDefault();
    }
  };

  // Format date for display
  const formatDateLong = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Project name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Project name must be less than 50 characters';
    }

    if (!formData.color) {
      newErrors.color = 'Project color is required';
    }

    // Validate deadline only if user has started entering deadline information
    const hasDeadlineInput = dateInput.trim() || formData.deadline || formData.deadlineTime !== '23:59';
    
    if (hasDeadlineInput) {
      if (!formData.deadline) {
        if (dateInput.trim()) {
          newErrors.deadline = 'Please enter a valid date in dd/mm/yy format (e.g., 25/12/24)';
        } else {
          newErrors.deadline = 'Please complete the deadline date';
        }
      } else {
        const selectedDate = new Date(formData.deadline + 'T' + formData.deadlineTime);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
        const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        
        // Check if date is in the past
        if (selectedDate < now) {
          newErrors.deadline = 'Deadline cannot be in the past';
        }
        
        // Additional validation for deadlines - must be today or after today
        if (selectedDateOnly < today) {
          newErrors.deadline = 'Deadlines must be set for today or a future date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const projectData = {
        name: formData.name.trim(),
        color: formData.color
      };

      // Include deadline data if both date and time are provided
      if (formData.deadline && formData.deadlineTime) {
        const deadlineDateTime = new Date(formData.deadline + 'T' + formData.deadlineTime);
        projectData.deadline = {
          date: deadlineDateTime.toISOString(),
          name: formData.deadlineName.trim() || `${formData.name.trim()} Deadline`
        };
      }

      onSave(projectData);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content project-modal">
        <div className="modal-header">
          <h3>{project ? 'Edit Project' : 'Create New Project'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Project name input */}
            <div className="form-group">
              <label htmlFor="projectName" className="form-label">
                Project Name *
              </label>
              <input
                id="projectName"
                name="name"
                type="text"
                className={`input ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter project name..."
                autoFocus
              />
              {errors.name && (
                <div className="form-error">{errors.name}</div>
              )}
            </div>

            {/* Color selection */}
            <div className="form-group">
              <label className="form-label">
                Project Color *
              </label>
              
              {/* Color palette */}
              <div className="color-palette">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={`Select ${color}`}
                  />
                ))}
                <button
                  type="button"
                  className={`color-swatch custom-color ${showColorPicker ? 'selected' : ''}`}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  title="Custom color"
                >
                  <span>+</span>
                </button>
              </div>

              {/* Custom color picker */}
              {showColorPicker && (
                <div className="color-picker-container">
                  <HexColorPicker 
                    color={formData.color} 
                    onChange={handleColorChange}
                  />
                  <div className="color-picker-info">
                    <input
                      type="text"
                      className="input color-input"
                      value={formData.color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              )}

              {/* Color preview */}
              <div className="color-preview">
                <span className="color-preview-label">Selected color:</span>
                <div 
                  className="color-preview-swatch"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="color-preview-value">{formData.color}</span>
              </div>

              {errors.color && (
                <div className="form-error">{errors.color}</div>
              )}
            </div>

            {/* Deadline section */}
            <div className="form-group">
              <label className="form-label">
                Deadline *
              </label>
              
              {/* Deadline name input */}
              <div className="form-subgroup">
                <input
                  id="deadlineName"
                  name="deadlineName"
                  type="text"
                  className="input"
                  value={formData.deadlineName}
                  onChange={handleInputChange}
                  placeholder={`${formData.name.trim() || 'Project'} Deadline`}
                />
              </div>
              
              <div className="deadline-inputs">
                <div className="datetime-inputs">
                  <div className="date-input-group">
                    <Calendar size={16} className="input-icon" />
                    <input
                      name="deadline"
                      type="text"
                      className={`input ${errors.deadline ? 'input-error' : ''}`}
                      value={dateInput}
                      onChange={handleDateInputChange}
                      onKeyDown={handleDateKeyPress}
                      placeholder="dd/mm/yy"
                      title="Enter date in dd/mm/yy format (e.g., 25/12/24)"
                      maxLength={8}
                    />
                    {formData.deadline && (
                      <span className="date-display">
                        ✓ {formatDateLong(formData.deadline)}
                      </span>
                    )}
                  </div>
                  
                  <div className="time-input-group">
                    <Clock size={16} className="input-icon" />
                    <input
                      name="deadlineTime"
                      type="time"
                      className={`input ${errors.deadlineTime ? 'input-error' : ''}`}
                      value={formData.deadlineTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {errors.deadline && (
                  <div className="form-error">
                    {errors.deadline}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal; 
// API service for Heat of the Day application
// Handles all backend communication and error management

const BASE_URL = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'Network error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use default message
    }
    throw new ApiError(errorMessage, response.status);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('Invalid response format', response.status);
  }
};

const makeRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network connection failed', 0);
  }
};

// Helper function to convert camelCase to snake_case for backend
const toSnakeCase = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = toSnakeCase(value);
  }
  return converted;
};

// Helper function to convert snake_case to camelCase for frontend
const toCamelCase = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = toCamelCase(value);
  }
  return converted;
};

export const apiService = {
  // Project endpoints - Implements R1.1, R1.2, R2.1, R2.2, R3.1, R3.2
  async getProjects() {
    const projects = await makeRequest('/projects');
    // Add default colors if backend doesn't provide them
    const defaultColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return projects.map((project, index) => {
      const camelProject = toCamelCase(project);
      // Ensure every project has a color
      if (!camelProject.color) {
        camelProject.color = defaultColors[index % defaultColors.length];
      }
      return camelProject;
    });
  },

  async getProject(projectId) {
    const project = await makeRequest(`/projects/${projectId}`);
    const camelProject = toCamelCase(project);
    // Ensure project has a color
    if (!camelProject.color) {
      camelProject.color = '#3B82F6';
    }
    return camelProject;
  },

  async createProject(projectData) {
    const snakeData = toSnakeCase(projectData);
    const project = await makeRequest('/projects', {
      method: 'POST',
      body: snakeData,
    });
    return toCamelCase(project);
  },

  async updateProject(projectId, updates) {
    const snakeData = toSnakeCase(updates);
    const project = await makeRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: snakeData,
    });
    return toCamelCase(project);
  },

  async deleteProject(projectId) {
    return makeRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  // Event endpoints - Implements R7.1, R7.2, R8.1, R8.2, R9.1, R9.2, R9.3, R4, R5.1, R5.2
  async getEvents(projectId) {
    if (!projectId) {
      throw new ApiError('Project ID is required for getting events', 400);
    }
    const events = await makeRequest(`/projects/${projectId}/events`);
    return events.map(toCamelCase);
  },

  async getEvent(projectId, eventId) {
    const event = await makeRequest(`/projects/${projectId}/events/${eventId}`);
    return toCamelCase(event);
  },

  async createEvent(projectId, eventData) {
    // Convert date to due_date for backend compatibility and set isDeadline for deadlines
    const backendData = {
      name: eventData.name,
      date: eventData.date, // Backend expects 'date' field for creation
      isDeadline: eventData.type === 'deadline' || eventData.isDeadline || false,
    };
    
    const event = await makeRequest(`/projects/${projectId}/events`, {
      method: 'POST',
      body: backendData,
    });
    return toCamelCase(event);
  },

  async updateEvent(projectId, eventId, updates) {
    const snakeData = toSnakeCase(updates);
    const event = await makeRequest(`/projects/${projectId}/events/${eventId}`, {
      method: 'PUT',
      body: snakeData,
    });
    return toCamelCase(event);
  },

  async deleteEvent(projectId, eventId) {
    return makeRequest(`/projects/${projectId}/events/${eventId}`, {
      method: 'DELETE',
    });
  },

  // Task endpoints - Implements R10.1, R10.2, R11.1, R11.2, R12.1, R12.2, R12.3, R13.1, R13.2, R6.1, R6.2
  async getTasks(projectId) {
    if (!projectId) {
      throw new ApiError('Project ID is required for getting tasks', 400);
    }
    const tasks = await makeRequest(`/projects/${projectId}/tasks`);
    return tasks.map(toCamelCase);
  },

  async getTask(projectId, taskId) {
    const task = await makeRequest(`/projects/${projectId}/tasks/${taskId}`);
    return toCamelCase(task);
  },

  async createTask(projectId, taskData) {
    const snakeData = toSnakeCase(taskData);
    const task = await makeRequest(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: snakeData,
    });
    return toCamelCase(task);
  },

  async updateTask(projectId, taskId, updates) {
    const snakeData = toSnakeCase(updates);
    const task = await makeRequest(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: snakeData,
    });
    return toCamelCase(task);
  },

  async deleteTask(projectId, taskId) {
    return makeRequest(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Learning Session endpoints - NEW: Implements PurpLLe learning management
  async getLearningSession(projectId, sessionId) {
    const session = await makeRequest(`/projects/${projectId}/sessions/${sessionId}`);
    return toCamelCase(session);
  },

  async getLearningSessions(projectId) {
    const sessions = await makeRequest(`/projects/${projectId}/sessions`);
    return sessions.map(toCamelCase);
  },

  async createLearningSession(projectId, sessionData) {
    const snakeData = toSnakeCase(sessionData);
    const session = await makeRequest(`/projects/${projectId}/sessions`, {
      method: 'POST',
      body: snakeData,
    });
    return toCamelCase(session);
  },

  async updateLearningSession(projectId, sessionId, updates) {
    const snakeData = toSnakeCase(updates);
    const session = await makeRequest(`/projects/${projectId}/sessions/${sessionId}`, {
      method: 'PUT',
      body: snakeData,
    });
    return toCamelCase(session);
  },

  async deleteLearningSession(projectId, sessionId) {
    return makeRequest(`/projects/${projectId}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async addDocumentsToSession(projectId, sessionId, documentData) {
    const snakeData = toSnakeCase(documentData);
    const session = await makeRequest(`/projects/${projectId}/sessions/${sessionId}/documents`, {
      method: 'POST',
      body: snakeData,
    });
    return toCamelCase(session);
  },

  // Document endpoints - NEW: Implements PurpLLe document management
  async getDocuments(projectId) {
    const documents = await makeRequest(`/projects/${projectId}/documents`);
    return documents.map(toCamelCase);
  },

  async getDocument(projectId, documentId) {
    const document = await makeRequest(`/projects/${projectId}/documents/${documentId}`);
    return toCamelCase(document);
  },

  async uploadDocument(projectId, formData) {
    // For file uploads, we don't use JSON - send FormData directly
    const document = await makeRequest(`/projects/${projectId}/documents`, {
      method: 'POST',
      headers: {}, // Don't set Content-Type for FormData
      body: formData,
    });
    return toCamelCase(document);
  },

  async downloadDocument(projectId, documentId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/documents/${documentId}/download`);
    if (!response.ok) {
      throw new ApiError('Download failed', response.status);
    }
    return response.blob();
  },

  async deleteDocument(projectId, documentId) {
    return makeRequest(`/projects/${projectId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  // Question endpoints - NEW: For future implementation
  async getQuestions(sessionId) {
    // TODO: Implement when backend endpoint is ready
    throw new ApiError('Questions endpoint not yet implemented', 501);
  },

  async createQuestion(sessionId, questionData) {
    // TODO: Implement when backend endpoint is ready
    throw new ApiError('Questions endpoint not yet implemented', 501);
  },

  // Analytics endpoints for heatmap visualization
  async getHeatmapData(startDate = null, endDate = null, timeScale = 1) {
    // TODO: This endpoint needs to be implemented in the backend
    // For now, we'll generate mock data from existing project data
    console.warn('Heatmap endpoint not implemented in backend, using mock data');
    
    try {
      const projects = await this.getProjects();
      const heatmapData = [];
      
      const dates = dataUtils.generateDateRange(new Date(), timeScale, 30);
      
      for (const date of dates) {
        for (const project of projects) {
          try {
            const tasks = await this.getTasks(project.id);
            const events = await this.getEvents(project.id);
            
            const completedTasksOnDate = tasks.filter(task => {
              if (!task.completed) return false;
              const taskDate = new Date(task.createdAt).toDateString();
              return taskDate === date.toDateString();
            }).length;

            heatmapData.push({
              date: date.toISOString().split('T')[0],
              projectId: project.id,
              projectColor: project.color || '#3B82F6', // Ensure color is always present
              completedTasks: completedTasksOnDate,
              sessionsCount: 0, // TODO: Add when sessions are available
              sessionDuration: 0,
              intensity: Math.min(completedTasksOnDate / 10, 1),
              events: dataUtils.getEventsForDate(events, date)
            });
          } catch (error) {
            // If we can't get tasks/events for a project, skip it
            console.warn(`Failed to get data for project ${project.id}:`, error);
          }
        }
      }
      
      return heatmapData;
    } catch (error) {
      throw new ApiError('Failed to generate heatmap data', 500);
    }
  },
};

// Helper functions for data processing
export const dataUtils = {
  // Sort projects by order
  sortProjects(projects) {
    return [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  // Filter visible projects (not hidden)
  getVisibleProjects(projects) {
    return projects.filter(p => !p.hidden);
  },

  // Filter hidden projects
  getHiddenProjects(projects) {
    return projects.filter(p => p.hidden);
  },

  // Get tasks for a specific project
  getProjectTasks(tasks, projectId) {
    return tasks.filter(t => t.projectId === projectId);
  },

  // Get events for a specific project
  getProjectEvents(events, projectId) {
    return events.filter(e => e.projectId === projectId);
  },

  // Get completed tasks count for a project on a specific date
  getCompletedTasksCount(tasks, projectId, date) {
    const projectTasks = this.getProjectTasks(tasks, projectId);
    return projectTasks.filter(task => {
      if (!task.completed) return false;
      
      // For backward compatibility: use completedAt if available, otherwise fall back to createdAt
      const completionDate = task.completedAt || task.createdAt;
      if (!completionDate) return false;
      
      const taskCompletionDate = new Date(completionDate).toDateString();
      const targetDate = new Date(date).toDateString();
      return taskCompletionDate === targetDate;
    }).length;
  },

  // Get events for a specific date
  getEventsForDate(events, date) {
    // Normalize the target date to compare only the date part (YYYY-MM-DD)
    const targetDate = new Date(date);
    const targetDateString = targetDate.getFullYear() + '-' + 
                           String(targetDate.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(targetDate.getDate()).padStart(2, '0');
    
    console.log(`Looking for events on date: ${targetDateString} (from ${date})`);
    
    const matchingEvents = events.filter(event => {
      // Handle both 'date' and 'dueDate' fields for backend compatibility
      const eventDateField = event.date || event.dueDate;
      if (!eventDateField) return false;
      
      // Normalize the event date to compare only the date part (YYYY-MM-DD)
      const eventDate = new Date(eventDateField);
      const eventDateString = eventDate.getFullYear() + '-' + 
                             String(eventDate.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(eventDate.getDate()).padStart(2, '0');
      
      const matches = eventDateString === targetDateString;
      console.log(`  Event "${event.name}" (${eventDateField}) -> ${eventDateString} | Matches: ${matches}`);
      
      return matches;
    });
    
    return matchingEvents;
  },

  // Calculate heatmap intensity (0-1) based on task completion
  getHeatmapIntensity(completedCount, maxTasks = 10) {
    return Math.min(completedCount / maxTasks, 1);
  },

  // Generate color with opacity based on project color and intensity
  getHeatmapCellColor(projectColor, intensity) {
    // Provide default color if projectColor is undefined/null
    const defaultColor = '#3B82F6'; // Default blue color
    const color = projectColor || defaultColor;
    
    // Validate color format
    if (typeof color !== 'string' || !color.startsWith('#') || color.length !== 7) {
      console.warn(`Invalid project color: ${color}, using default`);
      const validColor = defaultColor;
      const hex = validColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const opacity = Math.max(0.1, intensity || 0);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Convert hex to RGB and apply opacity
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) || 0;
    const g = parseInt(hex.substr(2, 2), 16) || 0;
    const b = parseInt(hex.substr(4, 2), 16) || 0;
    
    const opacity = Math.max(0.1, intensity || 0); // Minimum opacity for visibility
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  // Format date for display
  formatDate(date, format = 'short') {
    const d = new Date(date);
    
    switch (format) {
      case 'short':
        // DD/MM format
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
      case 'long':
        // DD/MM/YYYY format with day name
        const longDay = d.getDate().toString().padStart(2, '0');
        const longMonth = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
        return `${weekday}, ${longDay}/${longMonth}/${year}`;
      case 'date-only':
        // DD/MM/YYYY format
        const dateDay = d.getDate().toString().padStart(2, '0');
        const dateMonth = (d.getMonth() + 1).toString().padStart(2, '0');
        const dateYear = d.getFullYear();
        return `${dateDay}/${dateMonth}/${dateYear}`;
      case 'time':
        return d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'datetime':
        // DD/MM/YYYY HH:MM format
        const dtDay = d.getDate().toString().padStart(2, '0');
        const dtMonth = (d.getMonth() + 1).toString().padStart(2, '0');
        const dtYear = d.getFullYear();
        const time = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `${dtDay}/${dtMonth}/${dtYear} ${time}`;
      default:
        // Default to DD/MM/YYYY
        const defDay = d.getDate().toString().padStart(2, '0');
        const defMonth = (d.getMonth() + 1).toString().padStart(2, '0');
        const defYear = d.getFullYear();
        return `${defDay}/${defMonth}/${defYear}`;
    }
  },

  // Generate date range for heatmap
  generateDateRange(centerDate, timeScale, daysToShow = 30) {
    const dates = [];
    const center = new Date(centerDate);
    
    // Start from 7 days before the center date
    const startDate = new Date(center);
    startDate.setDate(center.getDate() - 7);
    
    for (let i = 0; i < daysToShow; i += timeScale) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(new Date(date));
    }
    
    return dates;
  },

  // Check if project has deadline
  hasDeadline(events, projectId) {
    return events.some(e => e.projectId === projectId && (e.type === 'deadline' || e.isDeadline));
  },

  // Get project deadline
  getProjectDeadline(events, projectId) {
    return events.find(e => e.projectId === projectId && (e.type === 'deadline' || e.isDeadline));
  },

  // Get project milestones
  getProjectMilestones(events, projectId) {
    return events.filter(e => e.projectId === projectId && e.type === 'milestone' && !e.isDeadline);
  },

  // Check if project has overdue deadline
  hasOverdueDeadline(events, projectId) {
    const deadline = this.getProjectDeadline(events, projectId);
    if (!deadline) return false;
    
    const deadlineDate = new Date(deadline.date);
    const now = new Date();
    return deadlineDate < now;
  },

  // Calculate days until a date
  daysUntil(dateString) {
    const targetDate = new Date(dateString);
    const now = new Date();
    // Reset time part to compare dates only
    now.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate - now;
    if (diffTime < 0) return null; // Date is in the past
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Validate task assignment to event
  validateTaskEventAssignment(task, event) {
    if (!event) return true; // No event assignment is valid
    return task.projectId === event.projectId;
  },

  // Helper to create FormData for file uploads
  createDocumentFormData(file, category = 'Resource') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return formData;
  },

  // Helper to validate learning session data
  validateLearningSessionData(sessionData) {
    const errors = [];
    
    if (!sessionData.projectId) {
      errors.push('Project ID is required');
    }
    
    if (!sessionData.durationMinutes || sessionData.durationMinutes < 1) {
      errors.push('Duration must be at least 1 minute');
    }
    
    if (sessionData.metrics) {
      const { metrics } = sessionData;
      const validRange = (value) => value === null || value === undefined || (value >= 0 && value <= 100);
      
      if (!validRange(metrics.awarenessLevel)) errors.push('Awareness level must be between 0-100');
      if (!validRange(metrics.confidenceLevel)) errors.push('Confidence level must be between 0-100');
      if (!validRange(metrics.energyLevel)) errors.push('Energy level must be between 0-100');
      if (!validRange(metrics.performanceLevel)) errors.push('Performance level must be between 0-100');
      if (!validRange(metrics.satisfactionLevel)) errors.push('Satisfaction level must be between 0-100');
    }
    
    return errors;
  },
}; 
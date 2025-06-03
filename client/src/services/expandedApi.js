// Expanded API service for EVA-PurpLLe integrated system
// Combines EVA's existing functionality with PurpLLe's learning management features

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

  // Handle FormData (for file uploads)
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type']; // Let browser set multipart boundary
  } else if (config.body && typeof config.body !== 'string') {
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

export const expandedApiService = {
  // ========================================
  // EXPANDED PROJECT ENDPOINTS
  // Merges EVA's basic projects with PurpLLe's learning project features
  // ========================================

  async getProjects() {
    return makeRequest('/projects');
  },

  async createProject(projectData) {
    // Transform EVA format to include PurpLLe fields
    const purpLLeData = {
      ...projectData,
      title: projectData.name || projectData.title, // PurpLLe uses 'title'
      motivations: projectData.motivations || [],
      overall_performance: projectData.metrics?.overallPerformance || null,
      difficulty: projectData.metrics?.difficulty || null,
      interest: projectData.metrics?.interest || null
    };
    
    return makeRequest('/projects', {
      method: 'POST',
      body: purpLLeData,
    });
  },

  async updateProject(projectId, updates) {
    // Transform updates to include both EVA and PurpLLe fields
    const purpLLeUpdates = {
      ...updates,
      title: updates.name || updates.title,
      overall_performance: updates.metrics?.overallPerformance,
      difficulty: updates.metrics?.difficulty,
      interest: updates.metrics?.interest
    };
    
    return makeRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: purpLLeUpdates,
    });
  },

  async deleteProject(projectId) {
    return makeRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  // ========================================
  // MILESTONE ENDPOINTS  
  // Unifies EVA's Events with PurpLLe's Milestones
  // ========================================

  async getMilestones(projectId = null) {
    const url = projectId ? `/projects/${projectId}/milestones` : `/milestones`;
    return makeRequest(url);
  },

  async createMilestone(milestoneData) {
    // Transform EVA Event to PurpLLe Milestone format
    const purpLLeData = {
      title: milestoneData.name || milestoneData.title,
      due_date: milestoneData.date || milestoneData.dueDate,
      is_deadline: milestoneData.type === 'deadline' || milestoneData.isDeadline || false,
      project_id: milestoneData.projectId
    };
    
    return makeRequest(`/projects/${milestoneData.projectId}/milestones`, {
      method: 'POST',
      body: purpLLeData,
    });
  },

  async updateMilestone(milestoneId, updates) {
    // Find project ID from milestone or require it in updates
    const projectId = updates.projectId;
    if (!projectId) {
      throw new ApiError('Project ID required for milestone update', 400);
    }
    
    const purpLLeUpdates = {
      title: updates.name || updates.title,
      due_date: updates.date || updates.dueDate,
      is_deadline: updates.type === 'deadline' || updates.isDeadline
    };
    
    return makeRequest(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: purpLLeUpdates,
    });
  },

  async deleteMilestone(projectId, milestoneId) {
    return makeRequest(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  },

  // Legacy EVA Events compatibility (maps to milestones)
  async getEvents(projectId = null) {
    return this.getMilestones(projectId);
  },

  async createEvent(eventData) {
    return this.createMilestone(eventData);
  },

  async updateEvent(eventId, updates) {
    return this.updateMilestone(eventId, updates);
  },

  async deleteEvent(projectId, eventId) {
    return this.deleteMilestone(projectId, eventId);
  },

  // ========================================
  // ENHANCED TASK ENDPOINTS
  // Extends EVA's tasks with PurpLLe milestone associations
  // ========================================

  async getTasks(projectId = null) {
    const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    return makeRequest(url);
  },

  async createTask(taskData) {
    // Support both EVA eventId and PurpLLe milestoneId
    const enhancedData = {
      ...taskData,
      milestone_id: taskData.milestoneId || taskData.eventId || null // Map eventId to milestoneId
    };
    
    return makeRequest('/tasks', {
      method: 'POST',
      body: enhancedData,
    });
  },

  async updateTask(taskId, updates) {
    const enhancedUpdates = {
      ...updates,
      milestone_id: updates.milestoneId || updates.eventId || null
    };
    
    return makeRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: enhancedUpdates,
    });
  },

  async deleteTask(taskId) {
    return makeRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // ========================================
  // NEW: LEARNING SESSION ENDPOINTS
  // Complete new functionality from PurpLLe
  // ========================================

  async getLearningSessions(projectId = null) {
    const url = projectId ? `/projects/${projectId}/sessions` : '/sessions';
    return makeRequest(url);
  },

  async createLearningSession(sessionData) {
    const purpLLeData = {
      project_id: sessionData.projectId,
      duration_minutes: sessionData.durationMinutes,
      motivation: sessionData.motivation || null,
      learning_objective: sessionData.learningObjective || null,
      
      // Metrics
      awareness_level: sessionData.metrics?.awarenessLevel || null,
      confidence_level: sessionData.metrics?.confidenceLevel || null,
      energy_level: sessionData.metrics?.energyLevel || null,
      performance_level: sessionData.metrics?.performanceLevel || null,
      satisfaction_level: sessionData.metrics?.satisfactionLevel || null
    };
    
    const session = await makeRequest(`/projects/${sessionData.projectId}/sessions`, {
      method: 'POST',
      body: purpLLeData,
    });

    // Associate documents if provided
    if (sessionData.resourceDocumentIds?.length > 0 || sessionData.testDocumentIds?.length > 0) {
      await this.associateDocumentsWithSession(
        sessionData.projectId,
        session.id,
        {
          resourceDocumentIds: sessionData.resourceDocumentIds || [],
          testDocumentIds: sessionData.testDocumentIds || []
        }
      );
    }

    return session;
  },

  async updateLearningSession(projectId, sessionId, updates) {
    const purpLLeUpdates = {
      duration_minutes: updates.durationMinutes,
      motivation: updates.motivation,
      learning_objective: updates.learningObjective,
      awareness_level: updates.metrics?.awarenessLevel,
      confidence_level: updates.metrics?.confidenceLevel,
      energy_level: updates.metrics?.energyLevel,
      performance_level: updates.metrics?.performanceLevel,
      satisfaction_level: updates.metrics?.satisfactionLevel
    };
    
    return makeRequest(`/projects/${projectId}/sessions/${sessionId}`, {
      method: 'PUT',
      body: purpLLeUpdates,
    });
  },

  async deleteLearningSession(projectId, sessionId) {
    return makeRequest(`/projects/${projectId}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async associateDocumentsWithSession(projectId, sessionId, documentData) {
    return makeRequest(`/projects/${projectId}/sessions/${sessionId}/documents`, {
      method: 'POST',
      body: documentData,
    });
  },

  // ========================================
  // NEW: DOCUMENT ENDPOINTS
  // Complete new functionality from PurpLLe
  // ========================================

  async getDocuments(projectId) {
    return makeRequest(`/projects/${projectId}/documents`);
  },

  async uploadDocument(projectId, formData) {
    // formData should contain: file, category
    return makeRequest(`/projects/${projectId}/documents`, {
      method: 'POST',
      body: formData, // FormData object
    });
  },

  async getDocument(projectId, documentId) {
    return makeRequest(`/projects/${projectId}/documents/${documentId}`);
  },

  async downloadDocument(projectId, documentId) {
    // Returns blob for download
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

  // ========================================
  // NEW: QUESTION ENDPOINTS
  // Complete new functionality from PurpLLe
  // ========================================

  async getQuestions(sessionId) {
    return makeRequest(`/sessions/${sessionId}/questions`);
  },

  async createQuestion(questionData) {
    const purpLLeData = {
      session_id: questionData.sessionId,
      question: questionData.question,
      answer: questionData.answer,
      correction: questionData.correction || null,
      evaluation: questionData.evaluation || null,
      test_document_id: questionData.testDocumentId || null,
      resource_document_ids: questionData.resourceDocumentIds || []
    };
    
    return makeRequest('/questions', {
      method: 'POST',
      body: purpLLeData,
    });
  },

  async updateQuestion(questionId, updates) {
    const purpLLeUpdates = {
      question: updates.question,
      answer: updates.answer,
      correction: updates.correction,
      evaluation: updates.evaluation,
      test_document_id: updates.testDocumentId,
      resource_document_ids: updates.resourceDocumentIds
    };
    
    return makeRequest(`/questions/${questionId}`, {
      method: 'PUT',
      body: purpLLeUpdates,
    });
  },

  async deleteQuestion(questionId) {
    return makeRequest(`/questions/${questionId}`, {
      method: 'DELETE',
    });
  },

  // ========================================
  // NEW: DOCUMENT REFERENCE ENDPOINTS
  // Complete new functionality from PurpLLe
  // ========================================

  async createDocumentReference(referenceData) {
    const purpLLeData = {
      question_id: referenceData.questionId,
      document_id: referenceData.documentId,
      line_number: referenceData.lineNumber || null,
      page_number: referenceData.pageNumber || null,
      char_offset: referenceData.charOffset || null,
      context_text: referenceData.contextText || null
    };
    
    return makeRequest('/document-references', {
      method: 'POST',
      body: purpLLeData,
    });
  },

  async updateDocumentReference(referenceId, updates) {
    return makeRequest(`/document-references/${referenceId}`, {
      method: 'PUT',
      body: updates,
    });
  },

  async deleteDocumentReference(referenceId) {
    return makeRequest(`/document-references/${referenceId}`, {
      method: 'DELETE',
    });
  },

  // ========================================
  // ENHANCED ANALYTICS ENDPOINTS
  // Extends EVA's heatmap with learning session data
  // ========================================

  async getHeatmapData(startDate = null, endDate = null, timeScale = 1) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (timeScale) params.append('timeScale', timeScale.toString());
    
    const url = `/analytics/heatmap${params.toString() ? '?' + params.toString() : ''}`;
    return makeRequest(url);
  },

  async getLearningAnalytics(projectId = null, dateRange = null) {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    
    const url = `/analytics/learning${params.toString() ? '?' + params.toString() : ''}`;
    return makeRequest(url);
  },

  async getProjectMetrics(projectId) {
    return makeRequest(`/analytics/projects/${projectId}/metrics`);
  },

  // ========================================
  // UNIFIED DATA TRANSFORMATION UTILITIES
  // Helper functions to transform between EVA and PurpLLe formats
  // ========================================

  transformProjectFromPurpLLe(purpLLeProject) {
    return {
      // EVA Core Properties
      id: purpLLeProject.id,
      name: purpLLeProject.title,
      color: purpLLeProject.color || '#3B82F6', // Default blue
      hidden: purpLLeProject.hidden || false,
      order: purpLLeProject.order || 0,
      createdAt: purpLLeProject.createdAt || new Date().toISOString(),

      // PurpLLe Properties
      title: purpLLeProject.title,
      motivations: purpLLeProject.motivations || [],
      metrics: {
        overallPerformance: purpLLeProject.overall_performance,
        difficulty: purpLLeProject.difficulty,
        interest: purpLLeProject.interest
      },

      // Relationships
      documents: purpLLeProject.documents || [],
      milestones: purpLLeProject.milestones || [],
      deadlineMilestone: purpLLeProject.deadline_milestone || null,
      learningSessions: purpLLeProject.learning_sessions || [],
      tasks: purpLLeProject.tasks || []
    };
  },

  transformMilestoneFromPurpLLe(purpLLeMilestone) {
    return {
      // Core Properties
      id: purpLLeMilestone.id,
      title: purpLLeMilestone.title,
      name: purpLLeMilestone.title, // EVA compatibility
      projectId: purpLLeMilestone.project_id,
      date: purpLLeMilestone.due_date,
      dueDate: purpLLeMilestone.due_date, // PurpLLe compatibility
      createdAt: purpLLeMilestone.createdAt || new Date().toISOString(),

      // Type Identification
      type: purpLLeMilestone.is_deadline ? 'deadline' : 'milestone',
      isDeadline: purpLLeMilestone.is_deadline,

      // Relationships
      tasks: purpLLeMilestone.tasks || []
    };
  },

  transformLearningSessionFromPurpLLe(purpLLeSession) {
    return {
      id: purpLLeSession.id,
      projectId: purpLLeSession.project_id,
      timestamp: purpLLeSession.timestamp,
      durationMinutes: purpLLeSession.duration_minutes,
      motivation: purpLLeSession.motivation,
      learningObjective: purpLLeSession.learning_objective,
      
      metrics: {
        awarenessLevel: purpLLeSession.awareness_level,
        confidenceLevel: purpLLeSession.confidence_level,
        energyLevel: purpLLeSession.energy_level,
        performanceLevel: purpLLeSession.performance_level,
        satisfactionLevel: purpLLeSession.satisfaction_level
      },
      
      resourceDocuments: purpLLeSession.resource_documents || [],
      testDocuments: purpLLeSession.test_documents || [],
      questions: purpLLeSession.questions || [],
      project: purpLLeSession.project
    };
  },

  transformDocumentFromPurpLLe(purpLLeDocument) {
    return {
      id: purpLLeDocument.id,
      projectId: purpLLeDocument.project_id,
      filename: purpLLeDocument.filename,
      filePath: purpLLeDocument.file_path,
      category: purpLLeDocument.category,
      content: purpLLeDocument.content,
      uploadDate: purpLLeDocument.upload_date || new Date().toISOString(),
      fileSize: purpLLeDocument.file_size,
      mimeType: purpLLeDocument.mime_type,
      
      project: purpLLeDocument.project,
      relatedQuestions: purpLLeDocument.related_questions || [],
      resourceSessions: purpLLeDocument.resource_sessions || [],
      testSessions: purpLLeDocument.test_sessions || [],
      documentReferences: purpLLeDocument.document_references || []
    };
  },

  transformQuestionFromPurpLLe(purpLLeQuestion) {
    return {
      id: purpLLeQuestion.id,
      sessionId: purpLLeQuestion.session_id,
      question: purpLLeQuestion.question,
      answer: purpLLeQuestion.answer,
      correction: purpLLeQuestion.correction,
      evaluation: purpLLeQuestion.evaluation,
      testDocumentId: purpLLeQuestion.test_document_id,
      
      session: purpLLeQuestion.session,
      testDocument: purpLLeQuestion.test_document,
      resourceDocuments: purpLLeQuestion.resource_documents || [],
      references: purpLLeQuestion.references || []
    };
  }
};

// Helper functions for data processing - Enhanced from original EVA
export const expandedDataUtils = {
  // Original EVA utilities
  sortProjects(projects) {
    return [...projects].sort((a, b) => a.order - b.order);
  },

  getVisibleProjects(projects) {
    return projects.filter(p => !p.hidden);
  },

  getHiddenProjects(projects) {
    return projects.filter(p => p.hidden);
  },

  getProjectTasks(tasks, projectId) {
    return tasks.filter(t => t.projectId === projectId);
  },

  getProjectEvents(events, projectId) {
    return events.filter(e => e.projectId === projectId);
  },

  // New PurpLLe utilities
  getProjectMilestones(milestones, projectId) {
    return milestones.filter(m => m.projectId === projectId);
  },

  getProjectLearningSessions(sessions, projectId) {
    return sessions.filter(s => s.projectId === projectId);
  },

  getProjectDocuments(documents, projectId) {
    return documents.filter(d => d.projectId === projectId);
  },

  getSessionQuestions(questions, sessionId) {
    return questions.filter(q => q.sessionId === sessionId);
  },

  getResourceDocuments(documents) {
    return documents.filter(d => d.category === 'RESOURCE');
  },

  getTestDocuments(documents) {
    return documents.filter(d => d.category === 'TEST');
  },

  // Enhanced analytics
  calculateLearningMetrics(sessions) {
    if (sessions.length === 0) return null;

    const metrics = {
      totalSessions: sessions.length,
      totalDuration: sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
      averageDuration: 0,
      averageMetrics: {
        awarenessLevel: null,
        confidenceLevel: null,
        energyLevel: null,
        performanceLevel: null,
        satisfactionLevel: null
      }
    };

    metrics.averageDuration = Math.round(metrics.totalDuration / sessions.length);

    // Calculate average metrics
    const metricKeys = Object.keys(metrics.averageMetrics);
    metricKeys.forEach(key => {
      const values = sessions
        .map(s => s.metrics[key])
        .filter(v => v !== null && v !== undefined);
      
      if (values.length > 0) {
        metrics.averageMetrics[key] = Math.round(
          values.reduce((sum, v) => sum + v, 0) / values.length
        );
      }
    });

    return metrics;
  },

  calculateQuestionStats(questions) {
    const evaluatedQuestions = questions.filter(q => 
      q.evaluation !== null && q.evaluation !== undefined
    );

    if (evaluatedQuestions.length === 0) {
      return {
        totalQuestions: questions.length,
        evaluatedCount: 0,
        averageScore: null,
        scoreDistribution: null
      };
    }

    const averageScore = Math.round(
      evaluatedQuestions.reduce((sum, q) => sum + q.evaluation, 0) / evaluatedQuestions.length
    );

    const scoreDistribution = {
      excellent: evaluatedQuestions.filter(q => q.evaluation >= 90).length,
      good: evaluatedQuestions.filter(q => q.evaluation >= 70 && q.evaluation < 90).length,
      fair: evaluatedQuestions.filter(q => q.evaluation >= 50 && q.evaluation < 70).length,
      poor: evaluatedQuestions.filter(q => q.evaluation < 50).length
    };

    return {
      totalQuestions: questions.length,
      evaluatedCount: evaluatedQuestions.length,
      averageScore,
      scoreDistribution
    };
  },

  // Enhanced heatmap data processing
  calculateHeatmapIntensity(data) {
    const taskWeight = 0.5;
    const sessionWeight = 0.3;
    const durationWeight = 0.2;

    const taskIntensity = Math.min(data.completedTasks / 10, 1);
    const sessionIntensity = Math.min(data.sessionsCount / 3, 1);
    const durationIntensity = Math.min(data.sessionDuration / 180, 1); // Max 3 hours

    return (
      taskIntensity * taskWeight +
      sessionIntensity * sessionWeight +
      durationIntensity * durationWeight
    );
  },

  // Date formatting utilities
  formatDate(date, format = 'short') {
    const d = new Date(date);
    
    switch (format) {
      case 'short':
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
      
      case 'long':
        const longDay = d.getDate().toString().padStart(2, '0');
        const longMonth = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
        return `${weekday}, ${longDay}/${longMonth}/${year}`;
      
      case 'datetime':
        const dtDay = d.getDate().toString().padStart(2, '0');
        const dtMonth = (d.getMonth() + 1).toString().padStart(2, '0');
        const dtYear = d.getFullYear();
        const time = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `${dtDay}/${dtMonth}/${dtYear} ${time}`;
      
      default:
        return d.toLocaleDateString();
    }
  },

  // Validation utilities
  validateProject(projectData) {
    const errors = {};
    
    if (!projectData.name?.trim()) {
      errors.name = 'Project name is required';
    }
    
    if (projectData.metrics) {
      Object.keys(projectData.metrics).forEach(key => {
        const value = projectData.metrics[key];
        if (value !== null && (value < 0 || value > 100)) {
          errors[`metrics.${key}`] = 'Metrics must be between 0 and 100';
        }
      });
    }
    
    return errors;
  },

  validateLearningSession(sessionData) {
    const errors = {};
    
    if (!sessionData.durationMinutes || sessionData.durationMinutes < 1) {
      errors.durationMinutes = 'Duration must be at least 1 minute';
    }
    
    if (sessionData.durationMinutes > 1440) {
      errors.durationMinutes = 'Duration cannot exceed 24 hours';
    }
    
    return errors;
  }
}; 
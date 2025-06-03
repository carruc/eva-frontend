// Data type definitions for the expanded EVA-PurpLLe system
// This file defines all data structures for the integrated learning management and project tracking system

/**
 * EXPANDED PROJECT TYPE
 * Merges EVA's basic project with PurpLLe's learning project attributes
 * Implements: Project management + Learning metrics + Document organization
 */
export const ProjectType = {
  id: 'string',
  name: 'string',
  title: 'string',
  color: 'string',
  hidden: 'boolean',
  order: 'number',
  createdAt: 'string',
  motivations: 'array',
  
  metrics: {
    overallPerformance: 'number|null',
    difficulty: 'number|null',
    interest: 'number|null'
  },

  documents: 'array',
  events: 'array',
  deadlineEvent: 'object|null',
  learningSessions: 'array',
  tasks: 'array'
};

/**
 * EXPANDED EVENT TYPE
 * Unifies EVA's Events (Milestones/Deadlines) with PurpLLe's Event concept
 * An Event in EVA maps to an Event in PurpLLe, with isDeadline flag for deadlines
 */
export const EventType = {
  id: 'string',
  name: 'string',
  title: 'string',
  projectId: 'string',
  date: 'string',
  dueDate: 'string',
  createdAt: 'string',
  type: 'string',
  isDeadline: 'boolean',
  tasks: 'array'
};

/**
 * EXPANDED TASK TYPE
 * Enhances EVA's tasks with PurpLLe's extended task capabilities
 * Tasks can be associated with events and have enhanced tracking
 */
export const TaskType = {
  id: 'string',
  name: 'string',
  projectId: 'string',
  completed: 'boolean',
  createdAt: 'string',
  eventId: 'string|null',
  description: 'string|null',
  event: 'object|null'
};

/**
 * NEW: LEARNING SESSION TYPE
 * Completely new component for EVA - tracks study sessions and learning activities
 * Core component of PurpLLe's learning management functionality
 */
export const LearningSessionType = {
  id: 'string',
  projectId: 'string',
  timestamp: 'string',
  durationMinutes: 'number',
  motivation: 'string|null',
  learningObjective: 'string|null',
  
  metrics: {
    awarenessLevel: 'number|null',
    confidenceLevel: 'number|null',
    energyLevel: 'number|null',
    performanceLevel: 'number|null',
    satisfactionLevel: 'number|null'
  },
  
  resourceDocuments: 'array',
  testDocuments: 'array',
  questions: 'array',
  project: 'object'
};

/**
 * NEW: DOCUMENT TYPE
 * Document management system from PurpLLe - supports Resources and Tests
 * Enables file-based learning material organization
 */
export const DocumentType = {
  id: 'string',
  projectId: 'string',
  filename: 'string',
  filePath: 'string',
  category: 'string',
  content: 'string|null',
  uploadDate: 'string',
  fileSize: 'number|null',
  mimeType: 'string|null',
  project: 'object',
  relatedQuestions: 'array',
  resourceSessions: 'array',
  testSessions: 'array',
  documentReferences: 'array'
};

/**
 * NEW: DOCUMENT REFERENCE TYPE
 * Granular references to specific parts of documents
 * Allows precise linking between questions and document sections
 */
export const DocumentReferenceType = {
  id: 'string',
  questionId: 'string',
  documentId: 'string',
  lineNumber: 'number|null',
  pageNumber: 'number|null',
  charOffset: 'number|null',
  contextText: 'string|null',
  document: 'object',
  question: 'object'
};

/**
 * NEW: QUESTION TYPE
 * Question and answer tracking for learning assessment
 * Links questions to documents and learning sessions
 */
export const QuestionType = {
  id: 'string',
  sessionId: 'string',
  question: 'string',
  answer: 'string',
  correction: 'string|null',
  evaluation: 'number|null',
  testDocumentId: 'string|null',
  session: 'object',
  testDocument: 'object|null',
  resourceDocuments: 'array',
  references: 'array'
};

/**
 * ANALYTICS DATA TYPES
 * For heatmap and progress visualization
 */
export const HeatmapDataType = {
  date: 'string',
  projectId: 'string',
  completedTasks: 'number',
  sessionsCount: 'number',
  sessionDuration: 'number',
  intensity: 'number',
  events: 'array'
};

/**
 * API RESPONSE TYPES
 * Standard response structures for the integrated API
 */
export const ApiResponseType = {
  success: 'boolean',
  data: 'any',
  error: 'string|null',
  message: 'string|null'
};

/**
 * FORM DATA TYPES
 * For form handling and validation
 */
export const ProjectFormDataType = {
  name: 'string',
  title: 'string',
  color: 'string', 
  hidden: 'boolean',
  motivations: 'array',
  metrics: {
    overallPerformance: 'number|null',
    difficulty: 'number|null', 
    interest: 'number|null'
  }
};

export const EventFormDataType = {
  name: 'string',
  title: 'string',
  date: 'string',
  type: 'string',
  isDeadline: 'boolean',
  projectId: 'string'
};

export const TaskFormDataType = {
  name: 'string',
  projectId: 'string',
  completed: 'boolean',
  eventId: 'string|null',
  estimatedHours: 'number|null',
  description: 'string|null'
};

export const LearningSessionFormDataType = {
  projectId: 'string',
  durationMinutes: 'number',
  motivation: 'string|null',
  learningObjective: 'string|null',
  metrics: {
    awarenessLevel: 'number|null',
    confidenceLevel: 'number|null',
    energyLevel: 'number|null',
    performanceLevel: 'number|null',
    satisfactionLevel: 'number|null'
  },
  resourceDocumentIds: 'array',
  testDocumentIds: 'array'
};

export const DocumentFormDataType = {
  projectId: 'string',
  category: 'string',
  file: 'File'
};

export const QuestionFormDataType = {
  sessionId: 'string',
  question: 'string',
  answer: 'string',
  testDocumentId: 'string|null',
  resourceDocumentIds: 'array'
};

/**
 * ENUM DEFINITIONS
 * Constants for categorical data
 */
export const DocumentCategory = {
  RESOURCE: 'Resource',
  TEST: 'Test'
};

export const TaskPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM', 
  LOW: 'LOW'
};

export const EventTypeEnum = {
  MILESTONE: 'milestone',
  DEADLINE: 'deadline'
};

/**
 * VALIDATION SCHEMAS
 * Validation rules for data integrity
 */
export const ValidationRules = {
  project: {
    name: { required: true, minLength: 2, maxLength: 100 },
    title: { required: true, minLength: 2, maxLength: 100 },
    color: { required: true, pattern: /^#[0-9A-F]{6}$/i },
    metrics: {
      overallPerformance: { min: 0, max: 100 },
      difficulty: { min: 0, max: 100 },
      interest: { min: 0, max: 100 }
    }
  },
  
  event: {
    name: { required: true, minLength: 2, maxLength: 100 },
    title: { required: true, minLength: 2, maxLength: 100 },
    date: { required: true, futureDate: true },
    projectId: { required: true }
  },
  
  task: {
    name: { required: true, minLength: 2, maxLength: 200 },
    projectId: { required: true },
    estimatedHours: { min: 0, max: 1000 }
  },
  
  learningSession: {
    projectId: { required: true },
    durationMinutes: { required: true, min: 1, max: 1440 },
    metrics: {
      awarenessLevel: { min: 0, max: 100 },
      confidenceLevel: { min: 0, max: 100 },
      energyLevel: { min: 0, max: 100 },
      performanceLevel: { min: 0, max: 100 },
      satisfactionLevel: { min: 0, max: 100 }
    }
  },
  
  document: {
    filename: { required: true, maxLength: 200 },
    category: { required: true, enum: ['Resource', 'Test'] },
    projectId: { required: true }
  },
  
  question: {
    question: { required: true, minLength: 5, maxLength: 1000 },
    answer: { required: true, minLength: 1, maxLength: 2000 },
    sessionId: { required: true },
    evaluation: { min: 0, max: 100 }
  }
};

/**
 * DEFAULT VALUES
 * Default values for new entities
 */
export const DefaultValues = {
  project: {
    name: '',
    title: '',
    color: '#3B82F6',
    hidden: false,
    order: 0,
    motivations: [],
    metrics: {
      overallPerformance: null,
      difficulty: null,
      interest: null
    }
  },
  
  event: {
    name: '',
    title: '',
    type: 'milestone',
    isDeadline: false,
    date: null
  },
  
  task: {
    name: '',
    completed: false,
    estimatedHours: null,
    actualHours: null,
    description: null
  },
  
  learningSession: {
    durationMinutes: 60,
    motivation: '',
    learningObjective: '',
    metrics: {
      awarenessLevel: null,
      confidenceLevel: null,
      energyLevel: null,
      performanceLevel: null,
      satisfactionLevel: null
    }
  },
  
  document: {
    category: 'Resource',
    content: null
  },
  
  question: {
    question: '',
    answer: '',
    correction: null,
    evaluation: null
  }
}; 
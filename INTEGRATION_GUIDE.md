# EVA-PurpLLe Integration Guide

This document describes the comprehensive integration between EVA (existing frontend) and PurpLLe (Python backend), creating a unified learning management and project tracking system.

## Overview

The integration expands EVA's basic project management capabilities with PurpLLe's advanced learning management features, creating a comprehensive platform for:

- **Project Management** (EVA + PurpLLe): Enhanced project tracking with learning metrics
- **Task Management** (EVA + PurpLLe): Task tracking with milestone associations
- **Learning Sessions** (New): Study session tracking and metrics
- **Document Management** (New): Resource and test file management
- **Question & Answer System** (New): Learning assessment and progress tracking
- **Advanced Analytics** (Enhanced): Learning progress and performance analytics

## Data Structure Mapping

### 1. Project Structure (Merged)

**EVA → PurpLLe Mapping:**

| EVA Field | PurpLLe Field | Type | Description |
|-----------|---------------|------|-------------|
| `id` | `id` | UUID | Project identifier |
| `name` | `title` | String | Project name/title |
| `color` | `color` | String | Hex color for visualization |
| `hidden` | `hidden` | Boolean | UI visibility state |
| `order` | `order` | Integer | Display order |
| `createdAt` | `created_at` | DateTime | Creation timestamp |
| *(New)* | `motivations` | Array | List of motivation strings |
| *(New)* | `overall_performance` | Integer (0-100) | Overall performance metric |
| *(New)* | `difficulty` | Integer (0-100) | Perceived difficulty level |
| *(New)* | `interest` | Integer (0-100) | Interest/engagement level |

**Expanded Project Structure:**
```javascript
{
  // EVA Core Properties
  id: 'uuid',
  name: 'Project Name',
  color: '#3B82F6',
  hidden: false,
  order: 0,
  createdAt: '2024-01-01T00:00:00Z',

  // PurpLLe Learning Properties
  title: 'Project Name', // Alias for name
  motivations: ['Learn React', 'Build portfolio'],
  metrics: {
    overallPerformance: 85,
    difficulty: 70,
    interest: 90
  },

  // Relationships
  documents: [...],
  milestones: [...],
  deadlineMilestone: {...},
  learningSessions: [...],
  tasks: [...]
}
```

### 2. Event/Milestone Structure (Unified)

**EVA Events → PurpLLe Milestones:**

| EVA Event Field | PurpLLe Milestone Field | Type | Description |
|-----------------|-------------------------|------|-------------|
| `id` | `id` | UUID | Milestone identifier |
| `name` | `title` | String | Milestone name |
| `projectId` | `project_id` | UUID | Associated project |
| `date` | `due_date` | DateTime | Due date |
| `type` | `is_deadline` | String/Boolean | 'deadline'/'milestone' → true/false |
| `createdAt` | `created_at` | DateTime | Creation timestamp |

**Mapping Logic:**
- EVA Event with `type: 'deadline'` → PurpLLe Milestone with `is_deadline: true`
- EVA Event with `type: 'milestone'` → PurpLLe Milestone with `is_deadline: false`

**Unified Structure:**
```javascript
{
  // Core Properties
  id: 'uuid',
  title: 'Complete Module 1',
  name: 'Complete Module 1', // EVA compatibility
  projectId: 'project-uuid',
  date: '2024-02-01T09:00:00Z',
  dueDate: '2024-02-01T09:00:00Z', // PurpLLe compatibility
  createdAt: '2024-01-01T00:00:00Z',

  // Type Identification
  type: 'deadline', // EVA compatibility
  isDeadline: true, // PurpLLe format

  // Relationships
  tasks: [...]
}
```

### 3. Task Structure (Enhanced)

**EVA Tasks + PurpLLe Extensions:**

| Field | EVA | PurpLLe | Type | Description |
|-------|-----|---------|------|-------------|
| `id` | ✓ | ✓ | UUID | Task identifier |
| `name` | ✓ | ✓ | String | Task description |
| `projectId` | ✓ | ✓ | UUID | Associated project |
| `completed` | ✓ | ✓ | Boolean | Completion status |
| `eventId` | ✓ | → `milestone_id` | UUID | Associated event/milestone |
| `milestoneId` | *(New)* | ✓ | UUID | Associated milestone |
| `description` | *(New)* | ✓ | String | Extended description |
| `priority` | *(New)* | ✓ | Enum | HIGH/MEDIUM/LOW |
| `estimatedHours` | *(New)* | ✓ | Number | Estimated completion time |
| `actualHours` | *(New)* | ✓ | Number | Actual time spent |

### 4. Learning Session Structure (New)

**Complete new component from PurpLLe:**

```javascript
{
  // Core Properties
  id: 'uuid',
  projectId: 'project-uuid',
  timestamp: '2024-01-15T14:30:00Z',
  durationMinutes: 90,
  
  // Learning Objectives
  motivation: 'Understanding React hooks',
  learningObjective: 'Master useState and useEffect',
  
  // Learning Metrics (0-100 scale)
  metrics: {
    awarenessLevel: 60,    // Self-assessed awareness before session
    confidenceLevel: 75,   // Confidence level in the subject
    energyLevel: 80,       // Energy/focus level during session
    performanceLevel: 85,  // Performance assessment after session
    satisfactionLevel: 90  // Satisfaction with session outcomes
  },
  
  // Relationships
  resourceDocuments: [...], // Resource documents used
  testDocuments: [...],     // Test documents used
  questions: [...],         // Questions from this session
  project: {...}            // Associated project
}
```

### 5. Document Structure (New)

**Complete new component from PurpLLe:**

```javascript
{
  // Core Properties
  id: 'uuid',
  projectId: 'project-uuid',
  filename: 'react-tutorial.pdf',
  filePath: '/uploads/projects/uuid/react-tutorial.pdf',
  category: 'RESOURCE', // 'RESOURCE' or 'TEST'
  content: 'Extracted text content...',
  uploadDate: '2024-01-10T10:00:00Z',
  fileSize: 2048576, // bytes
  mimeType: 'application/pdf',
  
  // Relationships
  project: {...},
  relatedQuestions: [...],     // Questions referencing this document
  resourceSessions: [...],     // Sessions using this as resource
  testSessions: [...],         // Sessions using this as test
  documentReferences: [...]    // Specific references to sections
}
```

### 6. Question Structure (New)

**Complete new component from PurpLLe:**

```javascript
{
  // Core Properties
  id: 'uuid',
  sessionId: 'session-uuid',
  question: 'What is the difference between props and state?',
  answer: 'Props are read-only data passed from parent...',
  correction: 'Props are immutable data passed from parent components...',
  evaluation: 85, // Score 0-100
  
  // Document Associations
  testDocumentId: 'test-doc-uuid',
  
  // Relationships
  session: {...},
  testDocument: {...},
  resourceDocuments: [...],
  references: [...] // DocumentReference objects
}
```

### 7. Document Reference Structure (New)

**Complete new component from PurpLLe:**

```javascript
{
  // Core Properties
  id: 'uuid',
  questionId: 'question-uuid',
  documentId: 'document-uuid',
  
  // Location References
  lineNumber: 42,
  pageNumber: 15,
  charOffset: 1250,
  contextText: 'In React, components can receive props...',
  
  // Relationships
  document: {...},
  question: {...}
}
```

## API Endpoint Mapping

### Project Endpoints

| Operation | EVA Endpoint | PurpLLe Endpoint | Merged Endpoint |
|-----------|-------------|------------------|-----------------|
| Get All | `GET /api/projects` | `GET /api/projects` | `GET /api/projects` |
| Create | `POST /api/projects` | `POST /api/projects` | `POST /api/projects` |
| Update | `PUT /api/projects/:id` | `PUT /api/projects/:id` | `PUT /api/projects/:id` |
| Delete | `DELETE /api/projects/:id` | `DELETE /api/projects/:id` | `DELETE /api/projects/:id` |

### Event/Milestone Endpoints

| Operation | EVA Endpoint | PurpLLe Endpoint | Merged Endpoint |
|-----------|-------------|------------------|-----------------|
| Get All | `GET /api/events` | `GET /api/milestones` | `GET /api/milestones` (with EVA compat) |
| Get by Project | `GET /api/events?projectId=:id` | `GET /api/projects/:id/milestones` | `GET /api/projects/:id/milestones` |
| Create | `POST /api/events` | `POST /api/projects/:id/milestones` | `POST /api/projects/:id/milestones` |
| Update | `PUT /api/events/:id` | `PUT /api/projects/:projectId/milestones/:id` | `PUT /api/projects/:projectId/milestones/:id` |
| Delete | `DELETE /api/events/:id` | `DELETE /api/projects/:projectId/milestones/:id` | `DELETE /api/projects/:projectId/milestones/:id` |

### Task Endpoints

| Operation | EVA Endpoint | PurpLLe Endpoint | Merged Endpoint |
|-----------|-------------|------------------|-----------------|
| Get All | `GET /api/tasks` | `GET /api/tasks` | `GET /api/tasks` |
| Create | `POST /api/tasks` | `POST /api/tasks` | `POST /api/tasks` |
| Update | `PUT /api/tasks/:id` | `PUT /api/tasks/:id` | `PUT /api/tasks/:id` |
| Delete | `DELETE /api/tasks/:id` | `DELETE /api/tasks/:id` | `DELETE /api/tasks/:id` |

### New Learning Session Endpoints

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Get All | `GET /api/sessions` | Get all learning sessions |
| Get by Project | `GET /api/projects/:id/sessions` | Get sessions for specific project |
| Create | `POST /api/projects/:id/sessions` | Create new learning session |
| Update | `PUT /api/projects/:projectId/sessions/:id` | Update learning session |
| Delete | `DELETE /api/projects/:projectId/sessions/:id` | Delete learning session |

### New Document Endpoints

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Get by Project | `GET /api/projects/:id/documents` | Get documents for project |
| Upload | `POST /api/projects/:id/documents` | Upload new document |
| Get | `GET /api/projects/:projectId/documents/:id` | Get specific document |
| Download | `GET /api/projects/:projectId/documents/:id/download` | Download document file |
| Delete | `DELETE /api/projects/:projectId/documents/:id` | Delete document |

### New Question Endpoints

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Get by Session | `GET /api/sessions/:id/questions` | Get questions for learning session |
| Create | `POST /api/questions` | Create new question |
| Update | `PUT /api/questions/:id` | Update question |
| Delete | `DELETE /api/questions/:id` | Delete question |

## Component Integration

### New Components Added

1. **LearningSession Components:**
   - `LearningSessionCard` - Display session summary
   - `LearningSessionForm` - Create/edit sessions
   - `LearningSessionDetails` - Detailed session view

2. **Document Management Components:**
   - `DocumentManager` - Main document interface
   - `DocumentCard` - Individual document display
   - `DocumentUploadForm` - File upload interface
   - `DocumentViewer` - Document content viewer

3. **Question Management Components:**
   - `QuestionManager` - Main question interface
   - `QuestionCard` - Individual question display
   - `QuestionForm` - Create/edit questions
   - `QuestionStats` - Question analytics

### Enhanced Existing Components

1. **Project Components:**
   - Added learning metrics fields
   - Added motivation tracking
   - Enhanced with document/session counts

2. **Task Components:**
   - Added milestone association
   - Added priority and time tracking
   - Enhanced with learning context

3. **Heatmap Calendar:**
   - Added learning session data
   - Enhanced intensity calculations
   - Added session duration tracking

## Data Flow Integration

### Frontend State Management

```javascript
// Enhanced App.js state structure
const [projects, setProjects] = useState([]); // Enhanced with PurpLLe fields
const [tasks, setTasks] = useState([]); // Enhanced with milestone associations
const [milestones, setMilestones] = useState([]); // Unified events/milestones
const [learningSessions, setLearningSessions] = useState([]); // New
const [documents, setDocuments] = useState([]); // New
const [questions, setQuestions] = useState([]); // New
```

### API Service Integration

The `expandedApiService` provides:
- **Backward compatibility** with existing EVA endpoints
- **Data transformation** between EVA and PurpLLe formats
- **Unified interface** for all operations
- **Error handling** and validation

```javascript
// Example usage
import { expandedApiService } from './services/expandedApi';

// Works with both EVA and PurpLLe data formats
const project = await expandedApiService.createProject({
  name: 'Learn React', // EVA format
  motivations: ['Build skills'], // PurpLLe format
  metrics: { difficulty: 70 } // PurpLLe format
});

// Legacy EVA events work seamlessly
const milestone = await expandedApiService.createEvent({
  name: 'Complete Module 1',
  type: 'deadline', // EVA format
  date: '2024-02-01T09:00:00Z',
  projectId: project.id
}); // Automatically converts to PurpLLe milestone format
```

## Migration Strategy

### Phase 1: Core Integration (Complete)
- ✅ Data structure definitions
- ✅ Type system implementation
- ✅ API service expansion
- ✅ Core component development

### Phase 2: Backend Implementation (Next)
1. **PurpLLe API Integration:**
   - Configure PurpLLe backend endpoints
   - Implement data transformation middleware
   - Add file upload handling

2. **Database Migration:**
   - Add PurpLLe fields to existing tables
   - Create new tables for learning sessions, documents, questions
   - Implement data migration scripts

### Phase 3: UI Enhancement (Future)
1. **Learning Dashboard:**
   - Learning metrics visualization
   - Progress tracking charts
   - Performance analytics

2. **Enhanced User Experience:**
   - Drag-and-drop document uploads
   - Real-time learning session tracking
   - Advanced search and filtering

## Implementation Checklist

### Data Structures ✅
- [x] Type definitions (`client/src/types/index.js`)
- [x] Validation schemas
- [x] Default values and enums

### Components ✅
- [x] LearningSession components
- [x] DocumentManager components
- [x] QuestionManager components
- [x] Enhanced existing components

### API Integration ✅
- [x] Expanded API service (`client/src/services/expandedApi.js`)
- [x] Data transformation utilities
- [x] Error handling and validation

### Backend Integration (Next Steps)
- [ ] PurpLLe backend configuration
- [ ] Database schema updates
- [ ] File upload endpoints
- [ ] Authentication integration

### Testing & Documentation
- [ ] Component unit tests
- [ ] API integration tests
- [ ] User documentation
- [ ] Developer documentation

## Usage Examples

### Creating a Learning Project

```javascript
// Create enhanced project with learning metrics
const project = await expandedApiService.createProject({
  name: 'Advanced React Course',
  color: '#10B981',
  motivations: [
    'Master modern React patterns',
    'Build production-ready applications',
    'Understand performance optimization'
  ],
  metrics: {
    difficulty: 80,
    interest: 95,
    overallPerformance: null // Will be updated as learning progresses
  }
});
```

### Recording a Learning Session

```javascript
// Upload study materials
const document = await expandedApiService.uploadDocument(project.id, formData);

// Create learning session
const session = await expandedApiService.createLearningSession({
  projectId: project.id,
  durationMinutes: 120,
  learningObjective: 'Understand React Context API',
  motivation: 'Need for state management in complex apps',
  metrics: {
    awarenessLevel: 40,
    confidenceLevel: 60,
    energyLevel: 85,
    performanceLevel: 75,
    satisfactionLevel: 90
  },
  resourceDocumentIds: [document.id]
});

// Add questions from the session
const question = await expandedApiService.createQuestion({
  sessionId: session.id,
  question: 'When should I use Context vs Redux?',
  answer: 'Context is good for relatively stable data...',
  evaluation: 85,
  resourceDocumentIds: [document.id]
});
```

### Analytics and Progress Tracking

```javascript
// Get learning analytics
const analytics = await expandedApiService.getLearningAnalytics(project.id);

// Calculate progress metrics
const learningMetrics = expandedDataUtils.calculateLearningMetrics(sessions);
const questionStats = expandedDataUtils.calculateQuestionStats(questions);

// Enhanced heatmap with learning data
const heatmapData = await expandedApiService.getHeatmapData();
```

This integration creates a comprehensive learning management platform that maintains EVA's simplicity while adding PurpLLe's powerful learning tracking capabilities. 
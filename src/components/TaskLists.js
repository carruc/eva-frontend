import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, ChevronDown, ChevronRight, EyeOff, Edit, Trash2, X } from 'lucide-react';
import { dataUtils } from '../services/api';
import TaskModal from './TaskModal';
import './TaskLists.css';

// Implements requirements R16, D9-D12
const TaskLists = ({
  projects,
  tasks,
  events,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  onProjectUpdate,
  onProjectEdit,
  onProjectDelete
}) => {
  const [hiddenProjects, setHiddenProjects] = useState(new Set());
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [creatingTaskForProject, setCreatingTaskForProject] = useState(null);
  
  // Scroll state management (matching Sidebar pattern)
  const [isScrollable, setIsScrollable] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ top: false, bottom: false });
  const taskListsContentRef = useRef(null);

  // Sort projects and filter visible ones
  const visibleProjects = useMemo(() => {
    return dataUtils.sortProjects(projects).filter(p => !hiddenProjects.has(p.id));
  }, [projects, hiddenProjects]);

  const hiddenProjectsList = useMemo(() => {
    return projects.filter(p => hiddenProjects.has(p.id));
  }, [projects, hiddenProjects]);

  // Simple scroll state checker with hysteresis to prevent glitching (matching Sidebar)
  const checkScrollState = useCallback(() => {
    if (!taskListsContentRef.current) return;
    
    const element = taskListsContentRef.current;
    const container = element.parentElement;
    
    if (!container) return;
    
    // Get measurements
    const contentHeight = element.scrollHeight;
    const availableHeight = container.clientHeight;
    const currentlyScrollable = element.classList.contains('scrollable');
    
    // Add hysteresis to prevent rapid switching at the threshold
    // Use different thresholds for entering and exiting scrollable mode
    let needsScrolling;
    if (currentlyScrollable) {
      // When already scrollable, require more space to switch back (add 48px buffer)
      needsScrolling = (contentHeight + 48) > availableHeight;
    } else {
      // When not scrollable, use normal threshold
      needsScrolling = contentHeight > availableHeight;
    }
    
    // Only update if state actually changes
    if (needsScrolling !== currentlyScrollable) {
      if (needsScrolling) {
        element.classList.add('scrollable');
        setIsScrollable(true);
      } else {
        // Add a small delay when removing scrollable state to prevent rapid toggling
        setTimeout(() => {
          if (!taskListsContentRef.current) return;
          element.classList.remove('scrollable');
          setIsScrollable(false);
          setScrollPosition({ top: false, bottom: false });
        }, 50);
        return;
      }
    }
    
    // Update scroll position for fade effects (only when scrollable)
    if (needsScrolling && element.classList.contains('scrollable')) {
      const isAtTop = element.scrollTop === 0;
      const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
      
      setScrollPosition({
        top: !isAtTop,
        bottom: !isAtBottom
      });
    }
  }, []);

  // Check scroll state when projects change (matching Sidebar)
  useEffect(() => {
    // Use a small timeout to ensure DOM has updated
    const timeoutId = setTimeout(checkScrollState, 10);
    return () => clearTimeout(timeoutId);
  }, [visibleProjects, hiddenProjects, checkScrollState]);

  // Check on window resize (matching Sidebar)
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScrollState, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollState]);

  // Handle scroll events (matching Sidebar)
  const handleTaskListsScroll = () => {
    // Only update scroll position, don't recalculate scrollable state
    if (!taskListsContentRef.current || !isScrollable) return;
    
    const element = taskListsContentRef.current;
    const isAtTop = element.scrollTop === 0;
    const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    
    setScrollPosition({
      top: !isAtTop,
      bottom: !isAtBottom
    });
  };

  // Toggle project visibility - Implements D12
  const handleToggleHidden = (projectId) => {
    setHiddenProjects(prev => {
      const newSet = new Set(prev);
      
      // If we're trying to show a hidden project, check the 6-project limit
      if (newSet.has(projectId)) {
        // This project is currently hidden, check if we can show it
        const currentlyVisible = projects.filter(p => !newSet.has(p.id));
        if (currentlyVisible.length >= 6) {
          alert('You can only have 6 visible projects at a time. Please hide another project first.');
          return prev; // Return the previous state unchanged
        }
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      
      return newSet;
    });
  };

  // Toggle project expansion - Implements D10
  const handleToggleExpanded = (projectId) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Handle task creation - Implements D9, D11 (now inline)
  const handleCreateTask = (projectId) => {
    setCreatingTaskForProject(projectId);
  };

  // Handle task editing (still uses modal)
  const handleEditTask = (task) => {
    setEditingTask(task);
    setSelectedProject(projects.find(p => p.id === task.projectId));
    setShowTaskModal(true);
  };

  // Handle inline task creation save
  const handleInlineTaskSave = async (taskData) => {
    try {
      await onTaskCreate(taskData);
      setCreatingTaskForProject(null);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Handle inline task creation cancel
  const handleInlineTaskCancel = () => {
    setCreatingTaskForProject(null);
  };

  // Handle task modal save (for editing)
  const handleTaskModalSave = async (taskData) => {
    try {
      if (editingTask) {
        await onTaskUpdate(editingTask.id, taskData);
      }
      setShowTaskModal(false);
      setSelectedProject(null);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Handle task modal close
  const handleTaskModalClose = () => {
    setShowTaskModal(false);
    setSelectedProject(null);
    setEditingTask(null);
  };

  return (
    <div className="task-lists">
      <div className="task-lists-wrapper">
        <div className={`task-lists-container ${isScrollable ? 'has-scrollable-content' : ''}`}>
          {/* Top fade overlay */}
          <div className={`task-lists-fade-overlay task-lists-fade-top ${scrollPosition.top ? 'visible' : ''}`} />
          
          <div 
            className="task-lists-content"
            ref={taskListsContentRef}
            onScroll={handleTaskListsScroll}
          >
            <div className="project-cards-grid">
              {visibleProjects.map(project => (
                <ProjectTaskCard
                  key={project.id}
                  project={project}
                  tasks={dataUtils.getProjectTasks(tasks, project.id)}
                  events={dataUtils.getProjectEvents(events, project.id)}
                  isExpanded={expandedProjects.has(project.id)}
                  isCreatingTask={creatingTaskForProject === project.id}
                  onToggleExpanded={() => handleToggleExpanded(project.id)}
                  onToggleHidden={() => handleToggleHidden(project.id)}
                  onCreateTask={() => handleCreateTask(project.id)}
                  onEditTask={handleEditTask}
                  onTaskToggle={onTaskToggle}
                  onTaskDelete={onTaskDelete}
                  onProjectEdit={() => onProjectEdit(project)}
                  onProjectDelete={() => onProjectDelete(project.id)}
                  onInlineTaskSave={handleInlineTaskSave}
                  onInlineTaskCancel={handleInlineTaskCancel}
                />
              ))}
            </div>
          </div>

          {/* Bottom fade overlay */}
          <div className={`task-lists-fade-overlay task-lists-fade-bottom ${scrollPosition.bottom ? 'visible' : ''}`} />
        </div>

        {/* Vertical hidden projects sidebar */}
        {hiddenProjectsList.length > 0 && (
          <div className="hidden-projects-sidebar">
            <div className="sidebar-header">
              <span className="text-muted">Hidden projects:</span>
            </div>
            <div className="sidebar-content">
              {hiddenProjectsList.map(project => (
                <button
                  key={project.id}
                  className="hidden-project-item"
                  onClick={() => handleToggleHidden(project.id)}
                  style={{ borderLeftColor: project.color }}
                  title={`Show ${project.name}`}
                >
                  <span className="project-name-truncated">{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task editing modal (only for editing existing tasks) */}
      {showTaskModal && selectedProject && editingTask && (
        <TaskModal
          task={editingTask}
          project={selectedProject}
          events={dataUtils.getProjectEvents(events, selectedProject.id)}
          onSave={handleTaskModalSave}
          onClose={handleTaskModalClose}
        />
      )}
    </div>
  );
};

// Individual project task card component - Implements D9-D11
const ProjectTaskCard = ({
  project,
  tasks,
  events,
  isExpanded,
  isCreatingTask,
  onToggleExpanded,
  onToggleHidden,
  onCreateTask,
  onEditTask,
  onTaskToggle,
  onTaskDelete,
  onProjectEdit,
  onProjectDelete,
  onInlineTaskSave,
  onInlineTaskCancel
}) => {
  const navigate = useNavigate();
  
  // Separate completed and uncompleted tasks
  const uncompletedTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  // Get task with event info
  const getTaskWithEvent = (task) => {
    const event = task.eventId ? events.find(e => e.id === task.eventId) : null;
    return { ...task, event };
  };

  const handleProjectTitleClick = () => {
    navigate(`/project/${project.id}`);
  };

  // Check if project has overdue deadline
  const isOverdue = dataUtils.hasOverdueDeadline(events, project.id);

  return (
    <div className={`project-task-card ${isOverdue ? 'project-overdue' : ''}`} style={{ borderTopColor: project.color }}>
      {/* Card header */}
      <div className="card-header">
        <div className="project-card-header">
          <div className="project-card-info">
            <h3 
              className="project-card-title clickable" 
              style={{ color: project.color }}
              onClick={handleProjectTitleClick}
              title={`View ${project.name} details`}
            >
              {project.name}
            </h3>
            <div className="project-card-stats">
              <span className="tasks-count">
                {completedCount}/{totalTasks} tasks completed
              </span>
              {/* 
              {events.length > 0 && (
                <span className="events-count text-muted">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </span>
              )}
              */}
            </div>
          </div>
          
          {/* Only hide button in upper right corner */}
          <div className="project-card-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={onToggleExpanded}
              title={isExpanded ? "Show only incomplete tasks" : "Show all tasks"}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={onToggleHidden}
              title="Hide this task list"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {/* 
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: project.color
              }}
            />
          </div>
          <span className="progress-text">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        */}
      </div>

      {/* Task list - Implements D10 */}
      <div className="card-body">
        {/* Uncompleted tasks - always shown */}
        <div className="task-section">
          {uncompletedTasks.length > 0 && (
            <div className="task-list">
              {uncompletedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={getTaskWithEvent(task)}
                  onToggle={() => onTaskToggle(task.id)}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onTaskDelete(task.id)}
                />
              ))}
            </div>
          )}

          {/* Inline task creation form */}
          {isCreatingTask && (
            <div className="task-list">
              <InlineTaskCreator
                project={project}
                events={events}
                onSave={onInlineTaskSave}
                onCancel={onInlineTaskCancel}
              />
            </div>
          )}
        </div>

        {/* Completed tasks - shown when expanded - Implements D10 */}
        {isExpanded && completedTasks.length > 0 && (
          <div className="task-section completed-section">
            <div className="section-divider">
              <span className="text-muted">Completed Tasks</span>
            </div>
            <div className="task-list">
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={getTaskWithEvent(task)}
                  onToggle={() => onTaskToggle(task.id)}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onTaskDelete(task.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card footer with pill-shaped add task button and hover actions */}
      <div className="card-footer">
        <button
          className="btn btn-primary btn-pill add-task-btn"
          onClick={onCreateTask}
        >
          <Plus size={16} />
          Add Task
        </button>
        
        {/* Edit and delete buttons - appear on hover in bottom right */}
        <div className="card-hover-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onProjectEdit}
            title="Edit project"
          >
            <Edit size={16} />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this project? All associated tasks and events will be removed.')) {
                onProjectDelete();
              }
            }}
            title="Delete project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual task item component - Implements R13.1, R13.2
const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
    setShowActions(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete();
    }
    setShowActions(false);
  };

  return (
    <div 
      className={`task-item ${task.completed ? 'completed' : ''}`}
      onClick={() => setShowActions(!showActions)}
    >
      <div className="task-main">
        <button
          className="task-checkbox"
          onClick={handleToggle}
          title={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed ? (
            <Check size={14} className="check-icon" />
          ) : (
            <div className="checkbox-empty" />
          )}
        </button>

        <div className="task-content">
          <span className={`task-name ${task.completed ? 'completed-text' : ''}`}>
            {task.name}
          </span>
          {task.event && (
            <span className={`task-event-badge ${task.event.type}`}>
              {task.event.name}
            </span>
          )}
        </div>

        <div className="task-actions">
          {showActions && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleEdit}
                title="Edit task"
              >
                <Edit size={12} />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                title="Delete task"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline task creator component for creating tasks directly in the list
const InlineTaskCreator = ({ project, events, onSave, onCancel }) => {
  const [taskName, setTaskName] = useState('');
  const [eventId, setEventId] = useState('');

  const handleSubmit = () => {
    if (taskName.trim()) {
      const taskData = {
        name: taskName.trim(),
        projectId: project.id
      };
      
      if (eventId) {
        taskData.eventId = eventId;
      }
      
      onSave(taskData);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleEventSelect = (selectedEventId) => {
    setEventId(selectedEventId === eventId ? '' : selectedEventId);
  };

  // Sort events by date for better UX
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="inline-task-creator">
      <div className="task-creator-main">
        <div className="task-checkbox-placeholder">
          <div className="checkbox-empty" />
        </div>
        
        <div className="task-creator-content">
          <input
            type="text"
            className="task-creator-input"
            placeholder="Enter task description..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
          />
          
          {sortedEvents.length > 0 && (
            <div className="task-creator-events">
              <div className="events-list">
                <div 
                  className={`event-option ${eventId === '' ? 'selected' : ''}`}
                  onClick={() => setEventId('')}
                >
                  <div className="event-radio">
                    <div className={`radio-indicator ${eventId === '' ? 'active' : ''}`} />
                  </div>
                  <span className="event-name">No specific event</span>
                </div>
                
                {sortedEvents.map(event => (
                  <div 
                    key={event.id}
                    className={`event-option ${eventId === event.id ? 'selected' : ''}`}
                    onClick={() => handleEventSelect(event.id)}
                  >
                    <div className="event-radio">
                      <div className={`radio-indicator ${eventId === event.id ? 'active' : ''}`} />
                    </div>
                    <div className="event-info">
                      <span className="event-name">{event.name}</span>
                      <span className={`event-type-badge ${event.type}`}>
                        {event.type}
                      </span>
                      <span className="event-date">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="task-creator-actions">
          <button
            className="btn btn-accent btn-sm task-creator-ok"
            onClick={handleSubmit}
            disabled={!taskName.trim()}
            title="Save task (Enter)"
          >
            <Check size={14} />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleCancel}
            title="Cancel (Escape)"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskLists; 
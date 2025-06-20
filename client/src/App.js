import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Planning from './pages/Planning';
import Project from './pages/Project';
import ProjectModal from './components/ProjectModal';
import EventModal from './components/EventModal';
import Sidebar from './components/Sidebar';
import PageOverlay from './components/PageOverlay';
import { apiService } from './services/api';
import './App.css';
import { PROJECTS_LIMIT } from './components/HeatmapCalendar';

function App() {
  // State management for all entities - Implements requirements R1-R16
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal states - Implements D5, D6
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Heatmap settings - Implements R15, D1.3
  const [timeScale, setTimeScale] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventTitles, setShowEventTitles] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // First load projects
      const projectsData = await apiService.getProjects();
      setProjects(projectsData);
      
      // Then load tasks and events for each project
      const allTasks = [];
      const allEvents = [];

      let index = 0;
      
      //PARTIAL SOLUTION - IMPLEMENT WITH DATES
      for (const project of projectsData) {
        console.log(project.order)
        project.order = index;
        console.log(project.order)
        index++;
        try {
          const projectTasks = await apiService.getTasks(project.id);
          const projectEvents = await apiService.getEvents(project.id);
          allTasks.push(...projectTasks);
          allEvents.push(...projectEvents);
        } catch (err) {
          console.warn(`Failed to load data for project ${project.id}:`, err);
          // Continue loading other projects even if one fails
        }
      }
      
      setTasks(allTasks);
      setEvents(allEvents);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Project management functions - Implements R1.1, R1.2, R2.1, R2.2, R3.1, R3.2
  const handleCreateProject = async (projectData) => {
    try {
      // Check if there are already 6 visible projects
      const visibleProjects = projects.filter(p => !p.hidden);
      const shouldHideNewProject = visibleProjects.length >= PROJECTS_LIMIT;
      
      // Separate deadline data from project data
      const { deadline, ...pureProjectData } = projectData;
      
      // Create project data with hidden flag if limit is reached
      const newProjectData = {
        ...pureProjectData,
        hidden: shouldHideNewProject
      };
      
      const newProject = await apiService.createProject(newProjectData);
      setProjects(prev => [...prev, newProject]);
      
      // Create deadline event if provided
      if (deadline) {
        try {
          const deadlineEventData = {
            name: deadline.name,
            date: deadline.date,
            type: 'deadline'
          };
          const newDeadline = await apiService.createEvent(newProject.id, deadlineEventData);
          setEvents(prev => [...prev, newDeadline]);
        } catch (deadlineErr) {
          console.error('Error creating deadline:', deadlineErr);
          setError('Project created but failed to create deadline. You can add a deadline later.');
        }
      }
      
      setShowProjectModal(false);
      setEditingProject(null);
      
      // Show a message to user if project was automatically hidden
      if (shouldHideNewProject) {
        setError('Project created as hidden because you already have 6 visible projects. You can show it by hiding another project first.');
        // Clear the message after a few seconds
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error('Error creating project:', err);
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      // Separate deadline data from project updates
      const { deadline, ...pureProjectUpdates } = updates;
      
      const updatedProject = await apiService.updateProject(projectId, pureProjectUpdates);
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      
      // Handle deadline updates
      const existingDeadline = events.find(e => e.projectId === projectId && e.type === 'deadline');
      
      if (deadline) {
        const deadlineEventData = {
          name: deadline.name,
          date: deadline.date,
          type: 'deadline'
        };
        
        if (existingDeadline) {
          // Update existing deadline
          try {
            const updatedDeadline = await apiService.updateEvent(projectId, existingDeadline.id, deadlineEventData);
            setEvents(prev => prev.map(e => e.id === existingDeadline.id ? updatedDeadline : e));
          } catch (deadlineErr) {
            console.error('Error updating deadline:', deadlineErr);
            setError('Project updated but failed to update deadline.');
          }
        } else {
          // Create new deadline
          try {
            const newDeadline = await apiService.createEvent(projectId, deadlineEventData);
            setEvents(prev => [...prev, newDeadline]);
          } catch (deadlineErr) {
            console.error('Error creating deadline:', deadlineErr);
            setError('Project updated but failed to create deadline.');
          }
        }
      } else if (existingDeadline) {
        // If deadline checkbox was unchecked, we could optionally delete the existing deadline
        // For now, we'll leave it as is to preserve user data
      }
      
      if (editingProject) {
        setShowProjectModal(false);
        setEditingProject(null);
      }
    } catch (err) {
      setError('Failed to update project. Please try again.');
      console.error('Error updating project:', err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks and events will be removed.')) {
      return;
    }

    try {
      await apiService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
      setEvents(prev => prev.filter(e => e.projectId !== projectId));
    } catch (err) {
      setError('Failed to delete project. Please try again.');
      console.error('Error deleting project:', err);
    }
  };

  // Event management functions - Implements R7.1, R7.2, R8.1, R8.2, R9.1, R9.2, R9.3
  const handleCreateEvent = async (eventData) => {
    try {
      const { projectId, ...eventDetails } = eventData;
      const newEvent = await apiService.createEvent(projectId, eventDetails);
      setEvents(prev => [...prev, newEvent]);
      setShowEventModal(false);
      setEditingEvent(null);
    } catch (err) {
      setError(err.message || 'Failed to create event. Please try again.');
      console.error('Error creating event:', err);
    }
  };

  const handleUpdateEvent = async (eventId, updates) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      const updatedEvent = await apiService.updateEvent(event.projectId, eventId, updates);
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      
      if (editingEvent) {
        setShowEventModal(false);
        setEditingEvent(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to update event. Please try again.');
      console.error('Error updating event:', err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      await apiService.deleteEvent(event.projectId, eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      // Update tasks that were associated with this event
      setTasks(prev => prev.map(task => 
        task.eventId === eventId ? { ...task, eventId: null } : task
      ));
    } catch (err) {
      setError('Failed to delete event. Please try again.');
      console.error('Error deleting event:', err);
    }
  };

  // Task management functions - Implements R10.1, R10.2, R11.1, R11.2, R12.1, R12.2, R12.3, R13.1, R13.2
  const handleCreateTask = async (taskData) => {
    try {
      const { projectId, ...taskDetails } = taskData;
      const newTask = await apiService.createTask(projectId, taskDetails);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      const updatedTask = await apiService.updateTask(task.projectId, taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      await apiService.deleteTask(task.projectId, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleTaskComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await handleUpdateTask(taskId, { completed: !task.completed });
    }
  };

  // Modal handlers
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleToggleEventTitles = () => {
    setShowEventTitles(prev => !prev);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Heat of the Day...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          projects={projects}
          onNewProject={() => setShowProjectModal(true)}
        />

        {/* Main application content */}
        <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
          {/* Error display */}
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button 
                className="btn-ghost"
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          )}

          <main className="app-main">
            <Routes>
              <Route 
                path="/" 
                element={<Homepage />} 
              />
              <Route 
                path="/planning" 
                element={
                  <Planning
                    projects={projects}
                    tasks={tasks}
                    events={events}
                    timeScale={timeScale}
                    currentDate={currentDate}
                    onTimeScaleChange={setTimeScale}
                    onCurrentDateChange={setCurrentDate}
                    onProjectUpdate={handleUpdateProject}
                    onProjectDelete={handleDeleteProject}
                    onProjectEdit={handleEditProject}
                    onEventEdit={handleEditEvent}
                    onEventDelete={handleDeleteEvent}
                    onNewProject={() => setShowProjectModal(true)}
                    onNewEvent={handleCreateEvent}
                    showEventTitles={showEventTitles}
                    onToggleEventTitles={handleToggleEventTitles}
                    sidebarCollapsed={sidebarCollapsed}
                    onTaskCreate={handleCreateTask}
                    onTaskUpdate={handleUpdateTask}
                    onTaskDelete={handleDeleteTask}
                    onTaskToggle={handleToggleTaskComplete}
                  />
                } 
              />
              <Route 
                path="/project/:projectId" 
                element={<Project />} 
              />
            </Routes>
          </main>

          {/* Page overlay with sidebar expand and theme toggle buttons */}
          <PageOverlay 
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />
        </div>

        {/* Modals */}
        {showProjectModal && (
          <ProjectModal
            project={editingProject}
            existingDeadline={editingProject ? 
              events.find(e => e.projectId === editingProject.id && e.type === 'deadline') : 
              null
            }
            onSave={editingProject ? 
              (data) => handleUpdateProject(editingProject.id, data) : 
              handleCreateProject
            }
            onClose={() => {
              setShowProjectModal(false);
              setEditingProject(null);
            }}
          />
        )}

        {showEventModal && (
          <EventModal
            event={editingEvent}
            projects={projects}
            onSave={editingEvent ? 
              (data) => handleUpdateEvent(editingEvent.id, data) : 
              handleCreateEvent
            }
            onClose={() => {
              setShowEventModal(false);
              setEditingEvent(null);
            }}
          />
        )}
      </div>
    </Router>
  );
}

export default App; 
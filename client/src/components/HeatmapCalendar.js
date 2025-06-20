import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import { dataUtils } from '../services/api';
import EventCard from './EventCard';
import './HeatmapCalendar.css';

export const PROJECTS_LIMIT = 8;

// Implements requirements R14, R15, D1-D8
const HeatmapCalendar = ({
  projects,
  tasks,
  events,
  timeScale,
  currentDate,
  onTimeScaleChange,
  onCurrentDateChange,
  onProjectUpdate,
  onProjectDelete,
  onProjectEdit,
  onEventEdit,
  onEventDelete,
  onNewProject,
  onNewEvent,
  showEventTitles,
  onToggleEventTitles,
  sidebarCollapsed = false
}) => {
  const [daysToShow, setDaysToShow] = useState(51); // Simple fixed value for now
  const [contextMenu, setContextMenu] = useState(null);
  const [isCustomTimeScale, setIsCustomTimeScale] = useState(false);
  const [showEventCard, setShowEventCard] = useState(false);
  const [eventCardPosition, setEventCardPosition] = useState({ x: 0, y: 0 });
  const [isCompactView, setIsCompactView] = useState(false);
  const calendarRef = useRef(null);
  const newEventButtonRef = useRef(null);

  // Automatically set custom mode if timeScale doesn't match presets
  useEffect(() => {
    const presetValues = [1, 3, 7];
    if (!presetValues.includes(timeScale)) {
      setIsCustomTimeScale(true);
    }
  }, [timeScale]);

  // Calculate how many days can fit in the visible area
  // This determines the number of columns that will be visible without horizontal scrolling
  const calculateDaysThatFit = useCallback(() => {
    if (!calendarRef.current) return 52; // Fallback
    
    // Calculate available width more accurately based on sidebar state
    const viewportWidth = window.innerWidth;
    
    // Account for sidebar width
    const sidebarWidth = sidebarCollapsed ? 0 : (window.innerWidth <= 1024 ? 260 : 280);
    
    // Account for main content padding
    const contentPadding = window.innerWidth <= 480 ? 32 : window.innerWidth <= 768 ? 48 : 64; // 2 * spacing
    
    // Calculate available width for the heatmap
    const availableWidth = viewportWidth - sidebarWidth - contentPadding;
    
    // Project column width (from CSS)
    const projectColumnWidth = window.innerWidth <= 768 ? 160 : window.innerWidth <= 1024 ? 200 : 250;
    
    // Calculate available space for date columns
    const availableSpaceForDates = availableWidth - projectColumnWidth;
    
    // Minimum column width for date columns
    const minColumnWidth = window.innerWidth <= 768 ? 28 : 32;
    
    // Calculate maximum number of columns that can fit
    const maxColumns = Math.floor(availableSpaceForDates / minColumnWidth);
    
    // Return the calculated number, with reasonable bounds
    return Math.max(Math.min(maxColumns, 200), 15); // Min 15, Max 100 columns
  }, [sidebarCollapsed]);

  // Use the calculated number of days that fit in the visible area
  const visibleDays = calculateDaysThatFit();

  // Update daysToShow when the calculation changes
  useEffect(() => {
    const newDaysToShow = calculateDaysThatFit();
    setDaysToShow(newDaysToShow);
  }, [calculateDaysThatFit]);

  // Recalculate when sidebar state changes with a slight delay for transition
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newDaysToShow = calculateDaysThatFit();
      setDaysToShow(newDaysToShow);
    }, 350); // Slightly longer than the 300ms sidebar transition

    return () => clearTimeout(timeoutId);
  }, [sidebarCollapsed, calculateDaysThatFit]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        const newDaysToShow = calculateDaysThatFit();
        setDaysToShow(newDaysToShow);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateDaysThatFit]);

  // Create the grid template for exactly the number of visible days
  const gridTemplateColumns = `250px repeat(${visibleDays}, minmax(20px, 32px))`;

  // Generate date range for the heatmap - Implements D1.1, D4
  const dateRange = useMemo(() => {
    // Custom date range generation for fixed number of columns
    const generateFixedColumnDateRange = (centerDate, timeScale, numColumns) => {
      const dates = [];
      const center = new Date(centerDate);
      
      // Start from 7 days before the center date
      const startDate = new Date(center);
      startDate.setDate(center.getDate() - 7);
      
      // Generate exactly numColumns dates, each representing timeScale days
      for (let i = 0; i < numColumns; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (i * timeScale));
        dates.push(new Date(date));
      }
      
      return dates;
    };
    
    return generateFixedColumnDateRange(currentDate, timeScale, visibleDays);
  }, [currentDate, timeScale, visibleDays]);

  // Sort and filter projects - Implements D7, D8
  const visibleProjects = useMemo(() => {
    return dataUtils.getVisibleProjects(dataUtils.sortProjects(projects));
  }, [projects]);

  const hiddenProjects = useMemo(() => {
    return dataUtils.getHiddenProjects(projects);
  }, [projects]);

  // Calculate heatmap data - Implements D2
  const heatmapData = useMemo(() => {
    const data = {};
    
    // Debug: Log all events to see what we have
    if (events.length > 0) {
      console.log('All events in heatmap calculation:', events);
    }
    
    projects.forEach(project => {
      data[project.id] = {};
      const projectEvents = dataUtils.getProjectEvents(events, project.id);
      
      // Debug: Log project events
      if (projectEvents.length > 0) {
        console.log(`Project "${project.name}" events:`, projectEvents);
      }
      
      dateRange.forEach(date => {
        const completedCount = dataUtils.getCompletedTasksCount(tasks, project.id, date);
        const intensity = dataUtils.getHeatmapIntensity(completedCount);
        const eventsForDate = dataUtils.getEventsForDate(projectEvents, date);
        
        // Debug: Log when events are found for a date
        if (eventsForDate.length > 0) {
          console.log(`Found ${eventsForDate.length} events for ${date.toISOString().split('T')[0]}:`, eventsForDate);
        }
        
        data[project.id][date.toISOString()] = {
          completedTasks: completedCount,
          intensity,
          events: eventsForDate,
          color: dataUtils.getHeatmapCellColor(project.color, intensity)
        };
      });
    });
    
    return data;
  }, [projects, tasks, events, dateRange]);

  // Handle project order changes - Implements D8
  const handleMoveProject = async (projectId, direction) => {
    const project = projects.find(p => p.id === projectId);
    console.log('AAAAAA');
    if (!project) return;
    
    const currentOrder = project.order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    console.log('oldposition: %d', currentOrder);
    console.log('newposition: %d', newOrder);
    // Find the project to swap with
    const targetProject = projects.find(p => p.order === newOrder);
    if (!targetProject) return;
    
    
    // Swap orders
    await onProjectUpdate(projectId, { order: newOrder });
    await onProjectUpdate(targetProject.id, { order: currentOrder });
  };

  // Handle project visibility toggle - Implements D7
  const handleToggleHidden = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      // If we're trying to show a hidden project, check the 6-project limit
      if (project.hidden) {
        const visibleProjects = projects.filter(p => !p.hidden);
        if (visibleProjects.length >= PROJECTS_LIMIT) {
          // Don't show the project and display an error message
          alert('You can only have 6 visible projects at a time. Please hide another project first.');
          return;
        }
      }
      
      await onProjectUpdate(projectId, { hidden: !project.hidden });
    }
  };

  // Navigate calendar - Implements D4
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    const days = direction === 'left' ? -timeScale * 7 : timeScale * 7;
    newDate.setDate(newDate.getDate() + days);
    onCurrentDateChange(newDate);
  };

  // Handle context menu
  const handleCellContextMenu = (e, project, date) => {
    e.preventDefault();
    const cellEvents = heatmapData[project.id]?.[date.toISOString()]?.events || [];
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      project,
      date,
      events: cellEvents,
      data: heatmapData[project.id]?.[date.toISOString()]
    });
  };

  // Handle context menu clicks outside to close
  useEffect(() => {
    if (contextMenu) {
      const handleClickOutside = () => setContextMenu(null);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Handle New Event button click with positioning
  const handleNewEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newEventButtonRef.current) {
      const buttonRect = newEventButtonRef.current.getBoundingClientRect();
      const cardWidth = 400; // Card width from CSS
      const cardHeight = 600; // Estimated max height
      const margin = 10; // Margin from edges
      
      // Calculate initial position (to the left of the button)
      let x = buttonRect.left - cardWidth - margin;
      let y = buttonRect.top;
      
      // Check if card would go off the left edge of the screen
      if (x < margin) {
        // If so, position it to the right of the button instead
        x = buttonRect.right + margin;
      }
      
      // Check if card would go off the right edge of the screen
      if (x + cardWidth > window.innerWidth - margin) {
        // Position it centered under the button as fallback
        x = buttonRect.left + (buttonRect.width / 2) - (cardWidth / 2);
        y = buttonRect.bottom + margin;
      }
      
      // Ensure it doesn't go off the left edge (final check)
      if (x < margin) {
        x = margin;
      }
      
      // Ensure it doesn't go off the right edge (final check)
      if (x + cardWidth > window.innerWidth - margin) {
        x = window.innerWidth - cardWidth - margin;
      }
      
      // Check if card would go off the bottom of the screen
      if (y + cardHeight > window.innerHeight - margin) {
        // Position it above the button instead
        y = buttonRect.top - cardHeight - margin;
      }
      
      // Ensure it doesn't go off the top edge
      if (y < margin) {
        y = margin;
      }
      
      setEventCardPosition({ x, y });
      setShowEventCard(true);
    }
  };

  // Handle event card close
  const handleEventCardClose = () => {
    setShowEventCard(false);
  };

  // Handle event card save
  const handleEventCardSave = (eventData) => {
    onNewEvent(eventData);
    setShowEventCard(false);
  };

  // Get month headers - Implements D1.2
  const getMonthHeaders = () => {
    const potentialHeaders = [];
    
    dateRange.forEach((date, index) => {
      // For each cell, check if the 1st of any month falls within its timeScale period
      const cellStartDate = new Date(date);
      const cellEndDate = new Date(date);
      cellEndDate.setDate(cellStartDate.getDate() + timeScale - 1);
      
      // Check if the 1st of any month falls within this cell's date range
      let monthStartInCell = null;
      
      // Check each day within the cell's timeScale period
      for (let dayOffset = 0; dayOffset < timeScale; dayOffset++) {
        const checkDate = new Date(cellStartDate);
        checkDate.setDate(cellStartDate.getDate() + dayOffset);
        
        if (checkDate.getDate() === 1) {
          monthStartInCell = checkDate;
          break;
        }
      }
      
      // If we found a month start within this cell, add to potential headers
      if (monthStartInCell) {
        const monthYear = `${monthStartInCell.getFullYear()}-${monthStartInCell.getMonth()}`;
        
        // Make sure we haven't already added this month
        if (!potentialHeaders.some(h => h.monthYear === monthYear)) {
          const monthName = monthStartInCell.toLocaleDateString('en-US', { month: 'short' });
          
          potentialHeaders.push({
            month: monthName,
            monthYear: monthYear,
            position: index + 1, // +1 to account for project column
            year: monthStartInCell.getFullYear(),
            date: new Date(monthStartInCell),
            isJanuary: monthName === 'Jan'
          });
        }
      }
      
      // Special case: if this is the first cell and no month header was added yet,
      // add the current month to avoid empty headers
      if (index === 0 && potentialHeaders.length === 0) {
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        
        potentialHeaders.push({
          month: monthName,
          monthYear: monthYear,
          position: index + 1,
          year: date.getFullYear(),
          date: new Date(date),
          isJanuary: monthName === 'Jan'
        });
      }
    });
    
    // Different filtering logic based on timeScale
    if (timeScale > 10) {
      // For large timescales, show most recent month and then every 3-4 cells
      const filteredHeaders = [];
      
      // Sort by date (most recent first)
      const sortedHeaders = potentialHeaders.sort((a, b) => b.date - a.date);
      
      if (sortedHeaders.length > 0) {
        // Always include the most recent month
        const mostRecent = sortedHeaders[0];
        filteredHeaders.push(mostRecent);
        
        // Then add months that are approximately 3-4 cells away
        const targetSpacing = 3.5; // Average of 3 and 4
        let lastIncludedPosition = mostRecent.position;
        
        // Sort remaining headers by position for consistent spacing
        const remainingHeaders = sortedHeaders.slice(1).sort((a, b) => a.position - b.position);
        
        for (const header of remainingHeaders) {
          const distance = Math.abs(header.position - lastIncludedPosition);
          
          // Include if it's far enough from the last included header
          if (distance >= Math.floor(targetSpacing)) {
            filteredHeaders.push(header);
            lastIncludedPosition = header.position;
          }
        }
      }
      
      return filteredHeaders.sort((a, b) => a.position - b.position);
    } else {
      // Original logic for smaller timescales
      const filteredHeaders = [];
      
      // Sort by position (chronological order)
      const sortedHeaders = potentialHeaders.sort((a, b) => a.position - b.position);
      
      for (let i = 0; i < sortedHeaders.length; i++) {
        const currentHeader = sortedHeaders[i];
        let shouldInclude = true;
        
        // Check if this header is too close to any already included header
        for (const includedHeader of filteredHeaders) {
          const distance = Math.abs(currentHeader.position - includedHeader.position);
          
          if (distance < 3) {
            // Too close - prioritize the more recent one
            if (currentHeader.date > includedHeader.date) {
              // Remove the older header and include the current one
              const indexToRemove = filteredHeaders.findIndex(h => h.monthYear === includedHeader.monthYear);
              filteredHeaders.splice(indexToRemove, 1);
            } else {
              // Keep the existing newer header, skip current one
              shouldInclude = false;
              break;
            }
          }
        }
        
        if (shouldInclude) {
          filteredHeaders.push(currentHeader);
        }
      }
      
      return filteredHeaders;
    }
  };

  const monthHeaders = getMonthHeaders();

  return (
    <div className={`heatmap-calendar ${isCompactView ? 'compact-view' : ''}`} ref={calendarRef}>
      {/* Header with controls - Implements R15, D1.3 */}
      <div className="heatmap-header">
        <div className="heatmap-controls">
          <button 
            className="btn btn-ghost"
            onClick={() => navigateCalendar('left')}
            title="Previous week"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button 
            className="btn btn-ghost"
            onClick={() => onCurrentDateChange(new Date())}
            title="Go to today"
          >
            Today
          </button>
          
          <button 
            className="btn btn-ghost"
            onClick={() => navigateCalendar('right')}
            title="Next week"
          >
            <ChevronRight size={16} />
          </button>

          <button
            className={`btn ${isCompactView ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setIsCompactView(!isCompactView)}
            title={isCompactView ? "Exit compact view" : "Enter compact view"}
          >
            <FontAwesomeIcon 
              icon={isCompactView ? faCompress : faExpand} 
              size="sm" 
            />
          </button>
        </div>

        <div className="timescale-control">
          <label className="form-label">Days per Cell:</label>
          <div className="timescale-buttons">
            <button
              className={`timescale-btn ${timeScale === 1 && !isCustomTimeScale ? 'active' : ''}`}
              onClick={() => {
                setIsCustomTimeScale(false);
                onTimeScaleChange(1);
              }}
            >
              1 day
            </button>
            <button
              className={`timescale-btn ${timeScale === 3 && !isCustomTimeScale ? 'active' : ''}`}
              onClick={() => {
                setIsCustomTimeScale(false);
                onTimeScaleChange(3);
              }}
            >
              3 day
            </button>
            <button
              className={`timescale-btn ${timeScale === 7 && !isCustomTimeScale ? 'active' : ''}`}
              onClick={() => {
                setIsCustomTimeScale(false);
                onTimeScaleChange(7);
              }}
            >
              week
            </button>
            <button
              className={`timescale-btn ${isCustomTimeScale ? 'active' : ''}`}
              onClick={() => setIsCustomTimeScale(true)}
            >
              Custom
            </button>
            {isCustomTimeScale && (
              <input
                type="number"
                min="1"
                max="30"
                value={timeScale}
                onChange={(e) => onTimeScaleChange(parseInt(e.target.value) || 1)}
                className="input custom-timescale-input"
              />
            )}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="heatmap-grid">
        {/* Month headers - Implements D1.2 */}
        <div className="month-headers" style={{ gridTemplateColumns }}>
          <div className="heatmap-project-column-header"></div>
          {dateRange.map((date, index) => {
            const monthHeader = monthHeaders.find(h => h.position === index + 1);
            return (
              <div key={index} className={`month-header ${monthHeader?.isJanuary ? 'january-header' : ''}`}>
                {monthHeader && (
                  <>
                    {monthHeader.isJanuary && (
                      <div className="month-year">{monthHeader.year}</div>
                    )}
                    <div className="month-name">{monthHeader.month}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Date headers */}
        <div className="date-headers" style={{ gridTemplateColumns }}>
          <div className="heatmap-project-column-header">Projects</div>
          {dateRange.map((date, index) => {
            const today = new Date();
            const isPastDate = date < today && date.toDateString() !== today.toDateString();
            
            // Get weekday initial (M, T, W, T, F, S, SS)
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const weekdayInitials = ['SS', 'M', 'T', 'W', 'T', 'F', 'S'];
            const weekdayInitial = weekdayInitials[dayOfWeek];
            
            return (
              <div key={index} className={`date-header ${isPastDate ? 'past-date' : ''}`}>
                <span className="date-day">{date.getDate()}</span>
                <span className="date-weekday">
                  {weekdayInitial}
                </span>
              </div>
            );
          })}
        </div>

        {/* Project rows - Implements D1.1, D3, D7, D8 */}
        {visibleProjects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            dateRange={dateRange}
            heatmapData={heatmapData[project.id] || {}}
            gridTemplateColumns={gridTemplateColumns}
            onMoveUp={() => handleMoveProject(project.id, 'up')}
            onMoveDown={() => handleMoveProject(project.id, 'down')}
            onToggleHidden={() => handleToggleHidden(project.id)}
            onEdit={() => onProjectEdit(project)}
            onDelete={() => onProjectDelete(project.id)}
            onCellContextMenu={handleCellContextMenu}
            onEventEdit={onEventEdit}
            events={dataUtils.getProjectEvents(events, project.id)}
            showEventTitles={showEventTitles}
            isCompactView={isCompactView}
          />
        ))}

        {/* Action buttons */}
        <div className="heatmap-action-buttons" style={{ position: 'relative' }}>
          <button 
            className="btn btn-primary btn-project"
            onClick={onNewProject}
          >
            + New Project
          </button>
          
          {/* Hidden projects bar - moved between buttons */}
          {hiddenProjects.length > 0 && (
            <div className="hidden-projects-bar">
              <span className="text-muted">Hidden projects:</span>
              {hiddenProjects.map(project => (
                <button
                  key={project.id}
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleToggleHidden(project.id)}
                  style={{ color: project.color }}
                >
                  {project.name}
                </button>
              ))}
            </div>
          )}
          
          <button 
            className="btn btn-secondary btn-event"
            ref={newEventButtonRef}
            onClick={handleNewEvent}
          >
            + New Event
          </button>
        </div>
      </div>

      {/* Context menu for cells */}
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onEventEdit={onEventEdit}
          onEventDelete={onEventDelete}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Event card */}
      {showEventCard && (
        <EventCard
          event={null}
          projects={projects}
          onSave={handleEventCardSave}
          onClose={handleEventCardClose}
          position={eventCardPosition}
        />
      )}
    </div>
  );
};

// Project row component - Implements D3, D8
const ProjectRow = ({
  project,
  dateRange,
  heatmapData,
  gridTemplateColumns,
  onMoveUp,
  onMoveDown,
  onToggleHidden,
  onEdit,
  onDelete,
  onCellContextMenu,
  onEventEdit,
  events,
  showEventTitles,
  isCompactView
}) => {
  // Check if project has overdue deadline
  const isOverdue = dataUtils.hasOverdueDeadline(events, project.id);

  return (
    <>
      <div className={`heatmap-project-row ${isOverdue ? 'project-overdue' : ''}`} style={{ gridTemplateColumns }}>
        {/* Project header */}
        <div 
          className="heatmap-project-header"
          style={{ '--project-pill-color': project.color }}
        >
          {/* Project info */}
          <div className="heatmap-project-info">
            <div className="heatmap-project-main-info">
              <span className="heatmap-project-name" title={project.name}>{project.name}</span>
            </div>
          </div>

          {/* Move and hide buttons - appear on hover on the right */}
          <div className="heatmap-project-actions-right">
            <div className="move-buttons-stack">
              <button 
                className="btn-ghost btn-sm move-up"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                title="Move up"
              >
                <ChevronUp size={12} />
              </button>
              <button 
                className="btn-ghost btn-sm move-down"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                title="Move down"
              >
                <ChevronDown size={12} />
              </button>
            </div>
            <button
              className="btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleHidden();
              }}
              title="Hide project"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Heatmap cells - Implements D2, D3 */}
        {dateRange.map((date, dateIndex) => {
          const cellData = heatmapData[date.toISOString()] || {
            completedTasks: 0,
            intensity: 0,
            events: [],
            color: 'transparent'
          };
          //HERE is probably where we need to fix the outline shi
          const hasDeadline = cellData.events.some(e => e.type === 'deadline');

          const hasMilestone = cellData.events.some(e => e.type === 'milestone');

          const today = new Date();
          const isPastDate = date < today && date.toDateString() !== today.toDateString();

          return (
            <div
              key={dateIndex}
              className={`heatmap-cell ${hasDeadline ? 'has-deadline' : ''} ${hasMilestone ? 'has-milestone' : ''} ${isPastDate ? 'past-date' : ''}`}
              style={hasDeadline ? { '--deadline-color': project.color } : {}}
              onContextMenu={(e) => onCellContextMenu(e, project, date)}
              title={`${project.name} - ${dataUtils.formatDate(date)}: ${cellData.completedTasks} tasks completed`}
            >
              {/* Rounded square indicator for heatmap intensity */}
              <div 
                className="heatmap-square"
                style={{ 
                  backgroundColor: cellData.intensity > 0 ? project.color : 'var(--border)',
                  border: cellData.intensity === 0 ? `1px solid ${project.color}15` : 'none',
                  opacity: (() => {
                    let baseOpacity;
                    if (cellData.intensity === 0) {
                      baseOpacity = 0.4; // Subtle grey for 0 tasks
                    } else {
                      // Scale from 0.3 to 1.0 based on tasks (max at 10+ tasks)
                      const normalizedIntensity = Math.min(cellData.completedTasks / 10, 1);
                      baseOpacity = 0.3 + (normalizedIntensity * 0.7);
                    }
                    // Reduce opacity for past dates
                    return isPastDate ? baseOpacity * 0.7 : baseOpacity;
                  })()
                }}
              />
              
              {/* Event names directly under the heatmap square - hidden in compact view */}
              {cellData.events.length > 0 && showEventTitles && !isCompactView && (
                <div className="cell-event-names">
                  {cellData.events.map(event => (
                    <div
                      key={event.id}
                      className={`event-name ${event.type}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventEdit(event);
                      }}
                      title={event.name}
                    >
                      {event.name.length > 50 ? `${event.name.substring(0, 50)}...` : event.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// Context menu component
const ContextMenu = ({ contextMenu, onEventEdit, onEventDelete, onClose }) => {
  const { x, y, project, date, events, data } = contextMenu;

  return (
    <div
      className="context-menu"
      style={{ 
        position: 'fixed', 
        left: x, 
        top: y,
        zIndex: 1000
      }}
    >
      <div className="context-menu-header">
        <span className="text-muted">{dataUtils.formatDate(date, 'long')}, {data?.completedTasks || 0} tasks completed</span>
      </div>
      
      {events.length > 0 && (
        <div className="context-menu-section">
          <div className="context-menu-label">Events:</div>
          {events.map(event => (
            <div key={event.id} className="context-menu-item">
              <span className={`event-type-badge ${event.type}`}>
                {event.type}
              </span>
              <span>{event.name}</span>
              <div className="event-actions">
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    onEventEdit(event);
                    onClose();
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    onEventDelete(event.id);
                    onClose();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeatmapCalendar; 
import React from 'react';
import HeatmapCalendar from '../components/HeatmapCalendar';
import TaskLists from '../components/TaskLists';
import './Planning.css';

const Planning = ({
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
  sidebarCollapsed,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle
}) => {
  return (
    <div className="planning">
      {/* Upper part: Heatmap Calendar */}
      <section className="planning-heatmap-section">
        <HeatmapCalendar
          projects={projects}
          tasks={tasks}
          events={events}
          timeScale={timeScale}
          currentDate={currentDate}
          onTimeScaleChange={onTimeScaleChange}
          onCurrentDateChange={onCurrentDateChange}
          onProjectUpdate={onProjectUpdate}
          onProjectDelete={onProjectDelete}
          onProjectEdit={onProjectEdit}
          onEventEdit={onEventEdit}
          onEventDelete={onEventDelete}
          onNewProject={onNewProject}
          onNewEvent={onNewEvent}
          showEventTitles={showEventTitles}
          onToggleEventTitles={onToggleEventTitles}
          sidebarCollapsed={sidebarCollapsed}
        />
      </section>

      {/* Lower part: Scrollable TaskLists */}
      <section className="planning-tasklists-section">
        <TaskLists
          projects={projects}
          tasks={tasks}
          events={events}
          onTaskCreate={onTaskCreate}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          onTaskToggle={onTaskToggle}
          onProjectUpdate={onProjectUpdate}
          onProjectEdit={onProjectEdit}
          onProjectDelete={onProjectDelete}
        />
      </section>
    </div>
  );
};

export default Planning; 
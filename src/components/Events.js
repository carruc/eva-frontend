import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './Events.css';

// Mock data - in a real app this would come from props or an API
const mockEvents = [
  {
    id: 1,
    title: 'Project Proposal Due',
    dueDate: '2024-04-15',
    type: 'deadline'
  },
  {
    id: 2,
    title: 'First Sprint Review',
    dueDate: '2024-04-20',
    type: 'milestone'
  },
  {
    id: 3,
    title: 'Client Meeting',
    dueDate: '2024-04-25',
    type: 'milestone'
  },
  {
    id: 4,
    title: 'Final Submission',
    dueDate: '2024-05-01',
    type: 'deadline'
  },
  {
    id: 5,
    title: 'Team Presentation',
    dueDate: '2024-05-05',
    type: 'milestone'
  },
  {
    id: 6,
    title: 'Project Review',
    dueDate: '2024-05-10',
    type: 'milestone'
  }
];

const EventCard = ({ event }) => {
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(event.dueDate);
  const formattedDate = new Date(event.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className={`event-card ${event.type}`}>
      <div className="event-date">{formattedDate}</div>
      <div className="event-info">
        <h3 className="event-title">{event.title}</h3>
        <div className="days-remaining">
          {daysRemaining}d
        </div>
      </div>
    </div>
  );
};

const Events = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add a small delay to trigger the animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateEvent = () => {
    // Handle event creation - to be implemented
    console.log('Create new event clicked');
  };

  return (
    <div className={`events-container ${isVisible ? 'visible' : ''}`} aria-label="Project events overlay">
      <div className="events-header">
        <button className="create-event-btn" onClick={handleCreateEvent}>
          <FontAwesomeIcon icon={faPlus} />
          Create New Event
        </button>
      </div>
      <div className="events-grid">
        {mockEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default Events; 
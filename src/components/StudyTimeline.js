import React, { useRef, useEffect, useState } from 'react';
import { format, eachDayOfInterval, parseISO, addDays } from 'date-fns';
import './StudyTimeline.css';

// Helper function to format duration in hours and minutes
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins.toString().padStart(2, '0')}m`;
};

// Helper function to calculate line height based on study time
const calculateLineHeight = (timeStudiedMinutes) => {
  const MIN_TIME = 15; // 15 minutes
  const MAX_TIME = 480; // 8 hours in minutes
  const MIN_HEIGHT = 40; // pixels
  const MAX_HEIGHT = 240; // pixels

  if (timeStudiedMinutes <= MIN_TIME) return MIN_HEIGHT;
  if (timeStudiedMinutes >= MAX_TIME) return MAX_HEIGHT;

  // Linear interpolation between min and max heights
  const timeRange = MAX_TIME - MIN_TIME;
  const heightRange = MAX_HEIGHT - MIN_HEIGHT;
  const timeRatio = (timeStudiedMinutes - MIN_TIME) / timeRange;
  
  return MIN_HEIGHT + (timeRatio * heightRange);
};

// Function to get learning session data for a specific date
const getLearningSessionData = (date, studySessions) => {
  // In real implementation, this would filter and aggregate actual study sessions
  // For now, return mock data with some randomization for variety
  
  // Generate deterministic but "random" number based on date
  const dateNum = new Date(date).getDate();
  const monthNum = new Date(date).getMonth();
  const seed = dateNum + monthNum;
  
  // No data for some days (30% chance)
  if (seed % 3 === 0) return null;

  // Mock data with some variation
  const mockData = {
    // Time studied: between 15 minutes and 10 hours (in minutes)
    timeStudied: 15 + (seed * 47) % 585,
    // Scores between 65-95%
    performance: 65 + (seed * 17) % 30,
    awareness: 65 + (seed * 23) % 30,
    // Additional metadata for potential future use
    sessions: 1 + (seed * 7) % 3,
    topics: [
      'Project Planning',
      'Database Design',
      'API Development',
      'UI Components',
      'Testing',
    ].slice(0, 1 + (seed * 11) % 3),
  };

  return {
    timeStudied: formatDuration(mockData.timeStudied),
    timeStudiedMinutes: mockData.timeStudied,
    performance: Math.round(mockData.performance),
    awareness: Math.round(mockData.awareness),
    sessions: mockData.sessions,
    topics: mockData.topics,
  };
};

const formatTimeStudied = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const StudyTimeline = ({ studySessions, startDate, endDate, project }) => {
  const scrollContainerRef = useRef(null);
  const [visibleDates, setVisibleDates] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);

  // Generate dates for the timeline
  const generateDates = (start, end) => {
    return eachDayOfInterval({
      start: parseISO(start),
      end: parseISO(end)
    });
  };

  // Load more dates when scrolling near the edges
  const handleScroll = (e) => {
    if (!isScrolling) {
      setIsScrolling(true);
      const container = e.target;
      const { scrollLeft, scrollWidth, clientWidth } = container;
      
      // Load more dates when near the edges (20% of container width)
      const threshold = clientWidth * 0.2;
      
      if (scrollLeft < threshold) {
        // Load more dates at the start
        const firstDate = parseISO(visibleDates[0].toISOString());
        const newStartDate = addDays(firstDate, -14);
        const newDates = generateDates(newStartDate.toISOString(), firstDate.toISOString());
        setVisibleDates(prev => [...newDates.slice(0, -1), ...prev]);
      } else if (scrollWidth - (scrollLeft + clientWidth) < threshold) {
        // Load more dates at the end
        const lastDate = parseISO(visibleDates[visibleDates.length - 1].toISOString());
        const newEndDate = addDays(lastDate, 14);
        const newDates = generateDates(lastDate.toISOString(), newEndDate.toISOString());
        setVisibleDates(prev => [...prev, ...newDates.slice(1)]);
      }
      
      setTimeout(() => setIsScrolling(false), 150);
    }
  };

  // Initialize visible dates
  useEffect(() => {
    if (startDate && endDate) {
      const initialDates = generateDates(startDate, endDate);
      setVisibleDates(initialDates);
      
      // Scroll to middle of container after initial render
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          const { scrollWidth, clientWidth } = scrollContainerRef.current;
          scrollContainerRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        }
      });
    }
  }, [startDate, endDate]);

  const renderDateMarker = (date) => {
    const sessionData = getLearningSessionData(date, studySessions);
    
    const lineHeight = sessionData ? 
      calculateLineHeight(sessionData.timeStudiedMinutes) : 
      null;
    
    const style = lineHeight ? 
      { '--session-line-height': `${lineHeight}px` } : 
      {};

    return (
      <div 
        key={date.toISOString()} 
        className={`date-marker ${sessionData ? 'has-session' : ''}`}
        style={style}
        title={sessionData ? 
          `Time: ${sessionData.timeStudied}\nPerformance: ${sessionData.performance}%\nAwareness: ${sessionData.awareness}%` 
          : 'No learning sessions'
        }
      >
        {sessionData?.topics && (
          <div className="date-topics">
            {sessionData.topics.map((topic, index) => (
              <React.Fragment key={topic}>
                <span className="date-topics-item">{topic}</span>
                {index < sessionData.topics.length - 1 && ', '}
              </React.Fragment>
            ))}
          </div>
        )}
        <span>{format(date, 'd MMM')}</span>
        {sessionData && (
          <div className="date-time-studied">
            {formatTimeStudied(sessionData.timeStudiedMinutes)}
          </div>
        )}
        {sessionData && (
          <div className="date-scores">
            <div className="date-score">
              <div className="date-score-label">Performance</div>
              <div className="date-score-value">{sessionData.performance}%</div>
            </div>
            <div className="date-score">
              <div className="date-score-label">Awareness</div>
              <div className="date-score-value">{sessionData.awareness}%</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="study-timeline" style={{ '--project-color': project?.color }}>
      <div className="timeline-arrow" />
      <div className="timeline-content">
        <div 
          className="timeline-scroll-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <div className="timeline-dates">
            {visibleDates.map(renderDateMarker)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimeline; 

import React, { useRef, useEffect, useState } from 'react';
import { format, eachDayOfInterval, parseISO, addDays } from 'date-fns';
import './StudyTimeline.css';

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
            {visibleDates.map((date, index) => (
              <div key={date.toISOString()} className="date-marker">
                {format(date, 'd MMM')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimeline;

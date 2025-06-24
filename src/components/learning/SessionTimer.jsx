import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(remainingSeconds.toString().padStart(2, '0'));

  return parts.join(':');
};

const parseDuration = (durationString) => {
  // Parse duration string like "30 minutes", "1 hour", "1.5 hours"
  const number = parseFloat(durationString.match(/[\d.]+/)[0]);
  const unit = durationString.toLowerCase();
  
  if (unit.includes('hour')) {
    return Math.floor(number * 3600);
  } else if (unit.includes('minute')) {
    return Math.floor(number * 60);
  }
  return Math.floor(number); // Assume seconds if no unit specified
};

const SessionTimer = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(() => parseDuration(duration));
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  return (
    <motion.div
      className="timer-display"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {formatTime(timeLeft)}
    </motion.div>
  );
};

export default SessionTimer; 
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '@mui/material';

const generateRandomPrime = () => {
  const primes = [7, 11, 13, 17, 19];
  return primes[Math.floor(Math.random() * primes.length)];
};

const CustomSlider = ({ value, onChange, min, max }) => {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (clientX) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = (clientX - rect.left) / rect.width;
    const newValue = Math.round(min + percentage * (max - min));
    return Math.min(Math.max(newValue, min), max);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // Update value immediately on click
    onChange(calculateValue(e.clientX));
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      onChange(calculateValue(e.clientX));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div 
      className="custom-slider-container"
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
    >
      <div 
        className="custom-slider"
        style={{
          '--slider-percentage': `${percentage}%`,
        }}
      >
        <div 
          className="custom-slider-thumb"
          style={{
            left: `${percentage}%`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        />
      </div>
    </div>
  );
};

const prompts = [
  {
    question: "How well do you think you have studied?",
    key: "studyQuality",
  },
  {
    question: "How well do you feel today?",
    key: "wellbeing",
  },
  {
    question: "How ready do you feel for the test?",
    key: "readiness",
    isLast: true,
  },
];

const AssessmentPrompts = ({ onComplete }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [maxValues, setMaxValues] = useState({});
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Generate random prime numbers for each prompt
    const newMaxValues = {};
    prompts.forEach(prompt => {
      newMaxValues[prompt.key] = generateRandomPrime();
    });
    setMaxValues(newMaxValues);
  }, []);

  const handleSliderChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [prompts[currentPromptIndex].key]: value
    }));
  };

  const handleNext = () => {
    if (currentPromptIndex === prompts.length - 1) {
      onComplete(answers);
    } else {
      setCurrentPromptIndex(prev => prev + 1);
    }
  };

  const currentPrompt = prompts[currentPromptIndex];
  const currentMaxValue = maxValues[currentPrompt?.key] || 7;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPromptIndex}
        className="prompt-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2 
          className="prompt-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {currentPrompt.question}
        </motion.h2>

        <div className="slider-container">
          <CustomSlider
            value={answers[currentPrompt.key] || 1}
            onChange={(value) => handleSliderChange(value)}
            min={1}
            max={currentMaxValue}
          />
          <div className="slider-value">
            {answers[currentPrompt.key] || 1} / {currentMaxValue}
          </div>
        </div>

        <button
          className="btn btn-primary btn-pill prompt-button"
          onClick={handleNext}
        >
          {currentPrompt.isLast ? 'Start Test' : 'Next'}
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssessmentPrompts; 
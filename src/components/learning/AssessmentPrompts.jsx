import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider, Typography, Button } from '@mui/material';

const generateRandomPrime = () => {
  const primes = [7, 11, 13, 17, 19];
  return primes[Math.floor(Math.random() * primes.length)];
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
          <Slider
            value={answers[currentPrompt.key] || 1}
            onChange={(_, value) => handleSliderChange(value)}
            min={1}
            max={currentMaxValue}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
          <Typography className="slider-value" variant="body1">
            {answers[currentPrompt.key] || 1} / {currentMaxValue}
          </Typography>
        </div>

        <Button
          variant="contained"
          className="prompt-button"
          onClick={handleNext}
          style={{ marginTop: '32px' }}
        >
          {currentPrompt.isLast ? 'Start Test' : 'Next'}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssessmentPrompts; 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField, Button } from '@mui/material';

const prompts = [
  {
    question: "What do you want to study today?",
    key: "topic",
    placeholder: "Enter your study topic",
  },
  {
    question: "For how much time?",
    key: "duration",
    placeholder: "Enter duration (e.g. 30 minutes)",
  },
  {
    question: "Why?",
    key: "reason",
    placeholder: "Enter your motivation",
    isLast: true,
  },
];

const InitialPrompts = ({ onComplete }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [answers, setAnswers] = useState({
    topic: '',
    duration: '',
    reason: '',
  });

  const handleInputChange = (e) => {
    setAnswers(prev => ({
      ...prev,
      [prompts[currentPromptIndex].key]: e.target.value
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

        <TextField
          fullWidth
          variant="outlined"
          placeholder={currentPrompt.placeholder}
          value={answers[currentPrompt.key]}
          onChange={handleInputChange}
          autoFocus
          InputProps={{
            className: 'prompt-input',
            style: { color: 'inherit' }
          }}
        />

        <Button
          variant="contained"
          className="prompt-button"
          onClick={handleNext}
          disabled={!answers[currentPrompt.key]}
        >
          {currentPrompt.isLast ? 'Begin' : 'Next'}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default InitialPrompts; 
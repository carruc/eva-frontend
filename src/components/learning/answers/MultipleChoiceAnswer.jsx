import React, { useState } from 'react';
import { RadioGroup, FormControlLabel, Radio, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const MultipleChoiceAnswer = ({ choices, onAnswer }) => {
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    
    if (onAnswer) {
      onAnswer(newValue);
    }
  };

  return (
    <RadioGroup
      value={value}
      onChange={handleChange}
      className="multiple-choice-container"
    >
      {choices.map((choice, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Paper 
            elevation={1}
            className={`choice-item ${value === choice ? 'selected' : ''}`}
            style={{ 
              marginBottom: '8px',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FormControlLabel
              value={choice}
              control={<Radio />}
              label={choice}
              style={{ width: '100%', margin: 0 }}
            />
          </Paper>
        </motion.div>
      ))}
    </RadioGroup>
  );
};

export default MultipleChoiceAnswer; 
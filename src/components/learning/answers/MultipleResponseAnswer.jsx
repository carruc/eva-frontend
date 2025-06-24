import React, { useState } from 'react';
import { FormGroup, FormControlLabel, Checkbox, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const MultipleResponseAnswer = ({ choices, onAnswer }) => {
  const [selected, setSelected] = useState([]);

  const handleChange = (choice) => (event) => {
    const newSelected = event.target.checked
      ? [...selected, choice]
      : selected.filter(item => item !== choice);
    
    setSelected(newSelected);
    
    if (onAnswer) {
      onAnswer(newSelected);
    }
  };

  return (
    <FormGroup className="multiple-response-container">
      {choices.map((choice, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Paper 
            elevation={1}
            className={`choice-item ${selected.includes(choice) ? 'selected' : ''}`}
            style={{ 
              marginBottom: '8px',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selected.includes(choice)}
                  onChange={handleChange(choice)}
                />
              }
              label={choice}
              style={{ width: '100%', margin: 0 }}
            />
          </Paper>
        </motion.div>
      ))}
    </FormGroup>
  );
};

export default MultipleResponseAnswer; 
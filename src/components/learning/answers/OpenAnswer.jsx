import React, { useState } from 'react';
import { TextField } from '@mui/material';

const OpenAnswer = ({ onAnswer, placeholder = "Enter your answer" }) => {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (onAnswer) {
      onAnswer(newValue);
    }
  };

  return (
    <TextField
      fullWidth
      multiline
      rows={4}
      variant="outlined"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      InputProps={{
        className: 'answer-input',
      }}
    />
  );
};

export default OpenAnswer; 
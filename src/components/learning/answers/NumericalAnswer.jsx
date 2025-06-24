import React, { useState } from 'react';
import { TextField } from '@mui/material';

const NumericalAnswer = ({ onAnswer, validation }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Only allow numbers, decimal points, and minus signs
    if (!/^-?\d*\.?\d*$/.test(newValue) && newValue !== '') {
      return;
    }

    setValue(newValue);
    setError(false);

    if (validation) {
      const isValid = validation.some(pattern => {
        const regex = new RegExp(pattern);
        return regex.test(newValue);
      });
      
      if (isValid && onAnswer) {
        onAnswer(newValue);
      }
    }
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      value={value}
      onChange={handleChange}
      error={error}
      helperText={error ? "Please enter a valid number" : ""}
      placeholder="Enter your numerical answer"
      type="text"
      InputProps={{
        className: 'answer-input',
      }}
    />
  );
};

export default NumericalAnswer; 
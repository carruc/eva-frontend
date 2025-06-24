import React, { useState } from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const TrueFalseAnswer = ({ onAnswer }) => {
  const [value, setValue] = useState(null);

  const handleChange = (_, newValue) => {
    if (newValue !== null) {
      setValue(newValue);
      if (onAnswer) {
        onAnswer(newValue);
      }
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label="true or false"
      className="true-false-container"
      style={{ width: '100%', justifyContent: 'center', gap: '16px' }}
    >
      <ToggleButton 
        value={true}
        aria-label="true"
        style={{ 
          width: '120px',
          height: '48px',
          borderRadius: '8px'
        }}
      >
        <CheckIcon style={{ marginRight: '8px' }} />
        True
      </ToggleButton>
      <ToggleButton 
        value={false}
        aria-label="false"
        style={{ 
          width: '120px',
          height: '48px',
          borderRadius: '8px'
        }}
      >
        <CloseIcon style={{ marginRight: '8px' }} />
        False
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default TrueFalseAnswer; 
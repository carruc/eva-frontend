import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const OpenMathAnswer = ({ onAnswer }) => {
  const [value, setValue] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const renderPreview = () => {
      if (!value) {
        setPreview('');
        return;
      }

      try {
        const rendered = katex.renderToString(value, {
          displayMode: true,
          throwOnError: false
        });
        setPreview(rendered);
        setError(false);
        
        if (onAnswer) {
          onAnswer(value);
        }
      } catch (err) {
        setError(true);
      }
    };

    const timeoutId = setTimeout(renderPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [value, onAnswer]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="open-math-container">
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        value={value}
        onChange={handleChange}
        error={error}
        helperText={error ? "Invalid LaTeX syntax" : "Enter your answer in LaTeX format"}
        placeholder="Enter your mathematical expression (LaTeX)"
        InputProps={{
          className: 'answer-input',
        }}
      />
      {preview && (
        <div 
          className="math-preview"
          style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}
    </div>
  );
};

export default OpenMathAnswer; 
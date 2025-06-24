import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Dialog, DialogContent, Button } from '@mui/material';
import InitialPrompts from '../components/learning/InitialPrompts';
import AssessmentPrompts from '../components/learning/AssessmentPrompts';
import SessionTimer from '../components/learning/SessionTimer';
import MarkdownQuestion from '../components/learning/MarkdownQuestion';
import LearningSessionOverlay from '../components/learning/LearningSessionOverlay';
import {
  NumericalAnswer,
  OpenAnswer,
  MultipleChoiceAnswer,
  TrueFalseAnswer,
  MultipleResponseAnswer,
  OpenMathAnswer
} from '../components/learning/answers';
import '../styles/LearningSession.css';

const LearningSession = ({ projectId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [currentStage, setCurrentStage] = useState('initial'); // initial, study, assessment, testing
  const [sessionData, setSessionData] = useState({
    topic: '',
    duration: '',
    reason: '',
  });
  const [assessmentData, setAssessmentData] = useState({
    studyQuality: 0,
    wellbeing: 0,
    readiness: 0,
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Menu dialog handlers
  const handleMenuOpen = () => setMenuOpen(true);
  const handleMenuClose = () => setMenuOpen(false);

  const handleQuitSession = () => {
    if (window.confirm('Are you sure you want to quit? All progress will be lost.')) {
      onClose();
    }
  };

  const handleEndEarly = () => {
    if (window.confirm('Do you want to end the session early and proceed to assessment?')) {
      setCurrentStage('assessment');
      handleMenuClose();
    }
  };

  const handleInitialPromptsComplete = (data) => {
    setSessionData(data);
    setCurrentStage('study');
  };

  const handleStudyComplete = () => {
    setCurrentStage('assessment');
  };

  const handleAssessmentComplete = (data) => {
    setAssessmentData(data);
    setCurrentStage('testing');
    // Here you would fetch questions from the server
    fetchQuestions();
  };

  const fetchQuestions = async () => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/projects/${projectId}/questions`);
      const data = await response.json();
      setQuestions(data);
      setCurrentQuestion(data[0]);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswer = (answer) => {
    // Save answer and move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentQuestion(questions[currentQuestionIndex + 1]);
    } else {
      // Session complete
      onClose();
    }
  };

  const renderAnswerComponent = () => {
    if (!currentQuestion) return null;

    const props = { onAnswer: handleAnswer };

    switch (currentQuestion.answerType) {
      case 'numerical':
        return <NumericalAnswer {...props} validation={currentQuestion.validation} />;
      case 'open':
        return <OpenAnswer {...props} />;
      case 'multipleChoice':
        return <MultipleChoiceAnswer {...props} choices={currentQuestion.choices} />;
      case 'trueFalse':
        return <TrueFalseAnswer {...props} />;
      case 'multipleResponse':
        return <MultipleResponseAnswer {...props} choices={currentQuestion.choices} />;
      case 'openMath':
        return <OpenMathAnswer {...props} />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className={`learning-session-container ${isDarkMode ? 'dark' : 'light'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LearningSessionOverlay onMenuOpen={handleMenuOpen} />

      {/* Timer display */}
      {showTimer && currentStage === 'study' && (
        <SessionTimer 
          duration={sessionData.duration} 
          onComplete={handleStudyComplete}
        />
      )}

      {/* Main content area */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStage}
          className="session-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStage === 'initial' && (
            <InitialPrompts onComplete={handleInitialPromptsComplete} />
          )}

          {currentStage === 'study' && (
            <div className="study-container">
              {/* Empty container for study time */}
            </div>
          )}

          {currentStage === 'assessment' && (
            <AssessmentPrompts onComplete={handleAssessmentComplete} />
          )}

          {currentStage === 'testing' && currentQuestion && (
            <div className="testing-container">
              <MarkdownQuestion content={currentQuestion.content} />
              {renderAnswerComponent()}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Menu Dialog */}
      <Dialog 
        open={menuOpen} 
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
          }
        }}
      >
        <DialogContent>
          <Button 
            fullWidth 
            onClick={() => setShowTimer(!showTimer)}
            style={{ marginBottom: 8 }}
          >
            {showTimer ? 'Hide Timer' : 'Show Timer'}
          </Button>
          <Button 
            fullWidth 
            onClick={handleEndEarly}
            style={{ marginBottom: 8, color: 'text.secondary' }}
          >
            End Session Early
          </Button>
          <Button 
            fullWidth 
            onClick={handleQuitSession}
            color="error"
          >
            Quit Session
          </Button>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default LearningSession; 
import React, { createContext, useContext, useState } from 'react';

const LearningSessionContext = createContext();

export const useLearningSession = () => {
  const context = useContext(LearningSessionContext);
  if (!context) {
    throw new Error('useLearningSession must be used within a LearningSessionProvider');
  }
  return context;
};

export const LearningSessionProvider = ({ children }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [previousSidebarState, setPreviousSidebarState] = useState(false);

  const startSession = (currentSidebarState) => {
    setPreviousSidebarState(currentSidebarState);
    setIsSessionActive(true);
  };

  const endSession = () => {
    setIsSessionActive(false);
  };

  const value = {
    isSessionActive,
    previousSidebarState,
    startSession,
    endSession,
  };

  return (
    <LearningSessionContext.Provider value={value}>
      {children}
    </LearningSessionContext.Provider>
  );
}; 
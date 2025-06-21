import React, { createContext, useContext, useState, useEffect } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: (originPosition?: { x: number; y: number }) => void;
  animationState: {
    isAnimating: boolean;
    originPosition: { x: number; y: number } | null;
    onComplete?: () => void;
  };
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animationState, setAnimationState] = useState<{
    isAnimating: boolean;
    originPosition: { x: number; y: number } | null;
  }>({
    isAnimating: false,
    originPosition: null,
  });

  useEffect(() => {
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setIsDarkMode(JSON.parse(savedMode));
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = (originPosition?: { x: number; y: number }) => {
    // Animate when we have origin position (both directions)
    if (originPosition) {
      setAnimationState({
        isAnimating: true,
        originPosition,
      });
      
      // Start the theme change after a short delay to see the animation start
      setTimeout(() => {
        setIsDarkMode(prev => !prev);
      }, 100);
    } else {
      // Immediate toggle when no origin position
      setIsDarkMode(prev => !prev);
    }
  };

  const handleAnimationComplete = () => {
    setAnimationState({
      isAnimating: false,
      originPosition: null,
    });
  };

  return (
    <DarkModeContext.Provider value={{ 
      isDarkMode, 
      toggleDarkMode, 
      animationState: {
        ...animationState,
        onComplete: handleAnimationComplete,
      }
    }}>
      {children}
    </DarkModeContext.Provider>
  );
};

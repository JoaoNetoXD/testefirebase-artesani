'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AccessibilityContextType {
  isKeyboardNavigation: boolean;
  announceToScreenReader: (message: string) => void;
  focusElement: (selector: string) => void;
  skipToContent: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main, #main-content, .main-content') as HTMLElement;
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    // Detect keyboard navigation
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Tab') {
        setIsKeyboardNavigation(true);
        document.body.classList.add('keyboard-navigation');
      }
    }

    function handleMouseDown() {
      setIsKeyboardNavigation(false);
      document.body.classList.remove('keyboard-navigation');
    }

    // Add global keyboard shortcuts
    function handleGlobalKeyDown(event: KeyboardEvent) {
      // Skip to main content (Alt + 1)
      if (event.altKey && event.key === '1') {
        event.preventDefault();
        skipToContent();
      }
      
      // Skip to navigation (Alt + 2)
      if (event.altKey && event.key === '2') {
        event.preventDefault();
        focusElement('nav');
      }
      
      // Skip to search (Alt + 3)
      if (event.altKey && event.key === '3') {
        event.preventDefault();
        focusElement('input[type="search"], input[placeholder*="buscar"], input[placeholder*="Buscar"]');
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [skipToContent, focusElement]);

  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        isKeyboardNavigation,
        announceToScreenReader,
        focusElement,
        skipToContent,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Skip to content button
export function SkipToContentButton() {
  const { skipToContent } = useAccessibility();

  return (
    <button
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      onClick={skipToContent}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          skipToContent();
        }
      }}
    >
      Pular para o conteúdo principal
    </button>
  );
} 
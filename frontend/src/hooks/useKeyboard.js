import { useEffect } from 'react';

export function useKeyboard(handleKeyPress, isModalOpen = false) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (isModalOpen) return;

      const key = event.key.toUpperCase();
      
      // Handle letter keys (A-Z only)
      if (/^[A-Z]$/.test(key)) {
        event.preventDefault();
        handleKeyPress(key);
        return;
      }

      // Handle special keys
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          handleKeyPress('ENTER');
          break;
        case 'Backspace':
          event.preventDefault();
          handleKeyPress('BACKSPACE');
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, isModalOpen]);
}
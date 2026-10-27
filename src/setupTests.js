import React from 'react';
import { expect, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Add custom jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock framer-motion to avoid animation-related test issues
vi.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }) => React.createElement('div', props, children),
      button: ({ children, ...props }) => React.createElement('button', props, children),
      p: ({ children, ...props }) => React.createElement('p', props, children)
    },
    AnimatePresence: ({ children }) => children,
  };
});

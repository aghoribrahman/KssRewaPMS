import * as React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock import.meta.env for Supabase client
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'test-key-12345',
  },
  writable: true,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
});

// Mock crypto.randomUUID
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2, 10),
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
    },
  });
}
// Robust mock for lucide-react to handle any icon component
const MockIcon = React.forwardRef((props: any, ref) => 
  React.createElement('span', { ...props, ref, 'data-testid': 'lucide-icon' })
);

vi.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      return MockIcon;
    },
    has: (target, prop) => true
  });
});



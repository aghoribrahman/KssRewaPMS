/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider } from './hooks/useAuth';
import { Toaster } from 'sonner';
import Dashboard from './components/Dashboard';

import { GlobalErrorBoundary } from './components/shared/GlobalErrorBoundary';
import { GlobalListener } from './components/shared/GlobalListener';

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <GlobalListener>
          <div className="min-h-screen bg-neutral-50 flex flex-col">
            <Dashboard />
            <Toaster position="top-right" />
          </div>
        </GlobalListener>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider } from './hooks/useAuth';
import { Toaster } from 'sonner';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Dashboard />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

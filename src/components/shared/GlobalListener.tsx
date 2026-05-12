import * as React from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { Breadcrumbs } from '../../lib/breadcrumbs';

/**
 * GlobalListener catches "uncatchable" errors (async, event handlers) 
 * and pipes them into the nearest ErrorBoundary.
 * It also acts as a hub for interaction breadcrumbs.
 */
export function GlobalListener({ children }: { children: React.ReactNode }) {
  const { showBoundary } = useErrorBoundary();

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      Breadcrumbs.add('ERROR', `Global Error: ${event.message}`);
      // Pipe to boundary so the user sees the fallback UI
      showBoundary(event.error || new Error(event.message));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      Breadcrumbs.add('ERROR', `Unhandled Promise Rejection: ${event.reason?.message || 'Unknown'}`);
      showBoundary(event.reason || new Error('Unhandled Promise Rejection'));
    };

    const handleInteraction = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'BUTTON' || target.closest('button'))) {
        const label = target.innerText || target.getAttribute('aria-label') || 'unlabeled button';
        Breadcrumbs.add('CLICK', `Clicked: ${label.substring(0, 30)}`);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('click', handleInteraction, true);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('click', handleInteraction, true);
    };
  }, [showBoundary]);

  // Log navigation-like actions (view changes) if we had a router, 
  // but for this app, view changes are handled via state.
  
  return <>{children}</>;
}

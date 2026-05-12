import { supabase } from './supabase';
import { Breadcrumbs } from './breadcrumbs';
import { useStore } from '../store/useStore';

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  state?: any;
}

// Simple hash map for deduplication to prevent flooding
const recentErrors = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60000; // 1 minute

/**
 * Redacts sensitive PII fields recursively.
 */
function redactPII(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = [
    'name', 'contact', 'address', 'abha_id', 'aadhar_number', 
    'village', 'block', 'display_name', 'email'
  ];

  if (Array.isArray(obj)) {
    return obj.map(redactPII);
  }

  const redacted: any = {};
  for (const key in obj) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object') {
      redacted[key] = redactPII(obj[key]);
    } else {
      redacted[key] = obj[key];
    }
  }
  return redacted;
}

/**
 * Logs an application error with full context and persistent fallback.
 */
export async function logError({ message, stack, componentStack, userId, state }: ErrorDetails) {
  try {
    // 1. Deduplication
    const errorHash = `${message}-${componentStack || ''}`;
    const now = Date.now();
    const lastSeen = recentErrors.get(errorHash);
    
    if (lastSeen && (now - lastSeen) < DEDUPE_WINDOW_MS) {
      console.warn('Duplicate error suppressed:', message);
      return;
    }
    recentErrors.set(errorHash, now);

    // 2. Prepare Payload
    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
      online: navigator.onLine,
      timestamp: new Date().toISOString(),
    };

    const payload = {
      userId: userId || null,
      message,
      stack: stack || null,
      componentStack: componentStack || null,
      deviceInfo,
      appState: state ? redactPII(state) : null,
      breadcrumbs: Breadcrumbs.get(),
    };

    // 3. Attempt immediate push if online
    if (navigator.onLine) {
      const { error } = await supabase.from('app_errors').insert({
        user_id: payload.userId || null,
        error_message: payload.message,
        error_stack: payload.stack || null,
        component_stack: payload.componentStack || null,
        app_state_snapshot: payload.appState as any,
        device_info: { ...payload.deviceInfo, breadcrumbs: payload.breadcrumbs } as any
      });

      if (!error) return; // Success
      console.error('Supabase logging failed, falling back to local queue:', error);
    }

    // 4. Persistence Fallback (Queue for later sync)
    useStore.getState().addToErrorQueue(payload);
    
  } catch (err) {
    console.error('Critical failure in errorLogger:', err);
  }
}

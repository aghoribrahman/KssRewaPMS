import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCw, Trash2, ChevronDown, ChevronUp, Copy, Check, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { logError } from '@/lib/errorLogger';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ExtendedFallbackProps extends FallbackProps {
  variant?: 'full-page' | 'card' | 'inline';
  name?: string;
  customFallback?: React.ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary, variant = 'full-page', name, customFallback }: ExtendedFallbackProps) {
  const err = error as any;
  let translations: any = null;
  try {
    translations = useTranslation();
  } catch (e) {
    // Context not available (e.g. if I18n provider crashed)
  }
  
  const t = translations?.t || {
    errorTitle: "Something went wrong",
    errorSubtitle: "The application encountered an unexpected error.",
    retryButton: "Try Again",
    reloadButton: "Reload Application",
    showTechnical: "Show Technical Details",
    copyDiagnostics: "Copy Debug Info",
    diagnosticsCopied: "Diagnostics copied to clipboard",
    componentFailed: "Component Failure"
  };

  const [showTechnical, setShowTechnical] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleHardReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const copyToClipboard = () => {
    const diagnosticInfo = {
      component: name || 'Unknown',
      variant,
      message: err.message,
      stack: err.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    navigator.clipboard.writeText(JSON.stringify(diagnosticInfo, null, 2));
    setCopied(true);
    toast.success(t.diagnosticsCopied);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Custom Fallback Override
  if (customFallback) return <>{customFallback}</>;

  // 2. Inline Variant (Minimal)
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between gap-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in fade-in slide-in-from-top-1">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-rose-900 truncate">{name || t.componentFailed}</p>
            <p className="text-[10px] text-rose-700/70 truncate">{err.message}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetErrorBoundary}
          className="h-8 rounded-lg bg-white/50 hover:bg-white text-rose-600 font-bold text-[10px]"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          {t.retryButton}
        </Button>
      </div>
    );
  }

  // 3. Card Variant (Dashboard Sections)
  if (variant === 'card') {
    return (
      <Card className="border-rose-100 bg-white/50 backdrop-blur-sm shadow-xl shadow-rose-500/5 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <CardHeader className="bg-rose-50/50 p-6 flex flex-row items-center gap-4 border-b border-rose-100/50">
          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-rose-950 leading-none">
              {name || t.errorTitle}
            </CardTitle>
            <p className="text-xs text-rose-700/70 mt-1 font-medium">{t.errorSubtitle}</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
           <div className="bg-rose-50/30 rounded-xl p-3 border border-rose-100/50 mb-4">
              <p className="text-xs font-mono text-rose-800 break-words line-clamp-2">
                {err.message}
              </p>
           </div>
           <div className="flex items-center gap-2">
             <Button 
                onClick={resetErrorBoundary} 
                size="sm"
                className="rounded-xl h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                {t.retryButton}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-10 px-4 rounded-xl text-rose-700 hover:bg-rose-100/50 font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-2 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                {t.copyDiagnostics}
              </Button>
           </div>
        </CardContent>
      </Card>
    );
  }

  // 4. Full Page Variant (Default)
  return (
    <div className="min-h-[400px] w-full flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-neutral-200 shadow-2xl shadow-neutral-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-rose-50 border-b border-rose-100 p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-rose-900 leading-tight">
                  {t.errorTitle}
                </CardTitle>
                <p className="text-rose-700/80 font-medium mt-1">
                  {t.errorSubtitle}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
              <p className="text-sm font-mono text-neutral-600 break-words">
                <span className="font-bold text-rose-600 mr-2">Error:</span>
                {err.message}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={resetErrorBoundary} 
                  size="lg"
                  className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t.retryButton}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleHardReset}
                  className="rounded-xl h-12 px-8 border-neutral-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-bold text-neutral-600 transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t.reloadButton}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="text-neutral-500 hover:text-neutral-900 h-10 px-4 rounded-lg font-bold"
                >
                  {showTechnical ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                  {t.showTechnical}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-neutral-500 hover:text-neutral-900 h-10 px-4 rounded-lg font-bold"
                >
                  {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                  {t.copyDiagnostics}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showTechnical && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-neutral-900 rounded-2xl p-6 mt-2 overflow-x-auto">
                    <pre className="text-xs text-neutral-400 font-mono leading-relaxed">
                      {err.stack}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          
          <CardFooter className="bg-neutral-50 border-t border-neutral-100 px-8 py-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
              Kiran Seva Sansthan &bull; Support ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  name?: string;
  variant?: 'full-page' | 'card' | 'inline';
  onReset?: () => void;
  fallback?: React.ReactNode;
}

export function GlobalErrorBoundary({ children, name, variant = 'full-page', onReset, fallback }: GlobalErrorBoundaryProps) {
  let user: any = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (e) {
    // Context not available
  }

  const handleOnError = (error: any, info: any) => {
    logError({
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      userId: user?.id,
      componentName: name,
    });
  };

  try {
    return (
      <ErrorBoundary 
        fallbackRender={(props) => (
          <ErrorFallback 
            {...props} 
            variant={variant} 
            name={name} 
            customFallback={fallback} 
          />
        )}
        onError={handleOnError}
        onReset={() => {
          onReset?.();
        }}
      >
        {children}
      </ErrorBoundary>
    );
  } catch (criticalError) {
    // Plan C: Native HTML fallback if React rendering fails completely
    return (
      <div style={{ 
        padding: '40px', 
        fontFamily: 'system-ui, sans-serif', 
        textAlign: 'center',
        background: '#fff1f2',
        color: '#9f1239',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>System Critical Error</h1>
        <p style={{ margin: '0 0 20px 0', opacity: 0.8 }}>The application failed to initialize properly.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: '12px 24px', 
            background: '#e11d48', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Hard Reload Application
        </button>
      </div>
    );
  }
}

/**
 * HOC to wrap components with an Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<GlobalErrorBoundaryProps, 'children'> = {}
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary {...options} name={options.name || displayName}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  return WrappedComponent;
}


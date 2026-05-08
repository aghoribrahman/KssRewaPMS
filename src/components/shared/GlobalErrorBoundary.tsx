import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCw, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { logError } from '@/lib/errorLogger';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  let translations: any = null;
  try {
    translations = useTranslation();
  } catch (e) {
    // Context not available
  }
  const t = translations?.t || {
    errorTitle: "Something went wrong",
    errorSubtitle: "The application encountered an unexpected error.",
    retryButton: "Try Again",
    reloadButton: "Reload Application",
    showTechnical: "Show Technical Details",
    copyDiagnostics: "Copy Debug Info",
    diagnosticsCopied: "Diagnostics copied to clipboard"
  };

  const [showTechnical, setShowTechnical] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleHardReset = () => {
    localStorage.clear(); // Clear all persisted state
    window.location.reload();
  };

  const copyToClipboard = () => {
    const diagnosticInfo = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    navigator.clipboard.writeText(JSON.stringify(diagnosticInfo, null, 2));
    setCopied(true);
    toast.success(t.diagnosticsCopied);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
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
                {error.message}
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
                      {error.stack}
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

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  let user: any = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (e) {
    // Context not available
  }

  const handleOnError = (error: Error, info: { componentStack: string }) => {
    // Attempt to log the error to Supabase
    logError({
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      userId: user?.id,
    });
  };

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={handleOnError}
      onReset={() => {
        // Reset state that might have caused the error
        // For example, if we had a local error state, we'd clear it here
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

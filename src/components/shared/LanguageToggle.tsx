import * as React from 'react';
import { Button } from '../ui/button';
import { Languages } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * A reusable language toggle component.
 * Allows users to switch between English and Hindi.
 */
export function LanguageToggle({ className, showLabel = true }: LanguageToggleProps) {
  const { profile, updateLanguage } = useAuth();
  const currentLang = profile?.preferred_language || 'hi';

  const toggleLanguage = () => {
    const next = currentLang === 'hi' ? 'en' : 'hi';
    updateLanguage(next);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className={cn(
        "rounded-full gap-2 text-neutral-600 hover:bg-neutral-100 font-medium px-4 h-10",
        className
      )}
    >
      <Languages className="w-4 h-4 text-primary" />
      {showLabel && (
        <span className="hidden sm:inline">
          {currentLang === 'hi' ? 'English' : 'हिंदी'}
        </span>
      )}
    </Button>
  );
}

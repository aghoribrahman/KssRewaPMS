import * as React from 'react';

interface DialogFooterProps {
  children: React.ReactNode;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <div className="p-8 flex flex-col sm:flex-row gap-3 bg-transparent px-8 absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col sm:flex-row gap-3 w-full pointer-events-auto">
        {children}
      </div>
    </div>
  );
}

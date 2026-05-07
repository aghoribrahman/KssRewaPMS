import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isImmersive?: boolean;
}

export function DashboardLayout({ children, isImmersive = false }: DashboardLayoutProps) {
  return (
    <main className={`flex-1 w-full mx-auto transition-all duration-300 ${isImmersive ? 'p-2 max-w-full' : 'max-w-7xl p-4 md:p-8'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-8 pb-12">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

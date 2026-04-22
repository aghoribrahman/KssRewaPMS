import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Shield, Activity, ClipboardList, Stethoscope, Utensils } from 'lucide-react';
import { Navbar } from './Navbar';
import AdminDashboard from './roles/AdminDashboard';
import RegistrarDashboard from './roles/RegistrarDashboard';
import ConsultantDashboard from './roles/ConsultantDashboard';
import MealDistributorDashboard from './roles/MealDistributorDashboard';
import AdminSettings from './AdminSettings';
import { LoginForm } from './LoginForm';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [isImmersive, setIsImmersive] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <LoginForm />
      </div>
    );
  }

  const renderDashboard = () => {
    if (currentView === 'settings' && profile?.role === 'admin') {
      return <AdminSettings />;
    }

    switch (profile?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'registrar':
        return <RegistrarDashboard onImmersiveChange={setIsImmersive} />;
      case 'consultant':
        return <ConsultantDashboard />;
      case 'meal_distributor':
        return <MealDistributorDashboard />;
      default:
        return <div className="p-8 text-center">Unrecognized role. Contact Admin.</div>;
    }
  };

  return (
    <>
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      <main className={`flex-1 w-full mx-auto transition-all duration-300 ${isImmersive ? 'p-0 max-w-full' : 'max-w-7xl p-4 md:p-8'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${profile?.role}-${currentView}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderDashboard()}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Shield, Activity, ClipboardList, Stethoscope, Utensils } from 'lucide-react';
import { Navbar } from './Navbar';
import AdminDashboard from './roles/AdminDashboard';
import RegistrarDashboard from './roles/RegistrarDashboard';
import ConsultantDashboard from './roles/ConsultantDashboard';
import MealDistributorDashboard from './roles/MealDistributorDashboard';
import AdminSettings from './AdminSettings';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Dashboard() {
  const { user, profile, loading, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">CareFlow PMS</h1>
          <p className="text-neutral-500 mb-8">Secure patient tracking for hospital workflows.</p>
          <Button onClick={login} size="lg" className="w-full rounded-2xl h-14 text-lg font-medium">
            Sign in with Google
          </Button>
        </motion.div>
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
        return <RegistrarDashboard />;
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
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

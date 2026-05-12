import { useMemo } from 'react';
import { Patient, UserRole } from '../types';
import { TRANSLATIONS } from '../constants/mp_data';
import { Users, Activity, CheckCircle2, Clock, PlusCircle } from 'lucide-react';

interface UseDashboardStatsOptions {
  patients: Patient[];
  role: UserRole;
  lang: 'en' | 'hi';
}

export function useDashboardStats({ patients, role, lang }: UseDashboardStatsOptions) {
  const t = TRANSLATIONS[lang];

  return useMemo(() => {
    const today = new Date().toDateString();
    
    const todayRegistrations = patients.filter(p => 
      p.created_at && new Date(p.created_at).toDateString() === today
    ).length;

    const pendingConsultations = patients.filter(p => p.status === 'pending_consultation').length;
    const pendingMeals = patients.filter(p => p.status === 'pending_meal').length;
    const completed = patients.filter(p => p.status === 'complete').length;

    switch (role) {
      case 'admin':
        return [
          { label: t.totalPatients, value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t.activeQueue, value: pendingConsultations + pendingMeals, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: t.completed, value: completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: t.efficiency, value: '94%', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' }
        ];

      case 'registrar':
        return [
          { label: t.totalPatients, value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t.todayNew, value: todayRegistrations, icon: PlusCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t.pendingConsult, value: pendingConsultations, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: t.completed, value: completed, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' }
        ];

      case 'consultant':
        return [
          { label: t.queueSize, value: pendingConsultations, icon: Activity, color: 'text-primary', bg: 'bg-primary/5' },
          { label: t.todayReviews, value: patients.filter(p => p.consultant_id && p.updated_at && new Date(p.updated_at).toDateString() === today).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ];

      case 'meal_distributor':
        return [
          { label: t.pendingMeals, value: pendingMeals, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: t.todayServed, value: patients.filter(p => p.meal_distributor_id && p.meal_served_at && new Date(p.meal_served_at).toDateString() === today).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ];

      default:
        return [];
    }
  }, [patients, role, t]);
}

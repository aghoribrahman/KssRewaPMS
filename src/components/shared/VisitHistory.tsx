import * as React from 'react';
import { Patient } from '../../types';
import { History } from 'lucide-react';
import { Badge } from '../ui/badge';
import { usePatientHistory } from '../../hooks/usePatientHistory';

interface VisitHistoryProps {
  patient: Patient;
}

export function VisitHistory({ patient }: VisitHistoryProps) {
  const { history, loading } = usePatientHistory(patient);

  if (loading) {
    return <div className="text-sm text-neutral-400 mt-8">Loading visit history...</div>;
  }

  if (history.length <= 1) {
    return null; // No previous visits
  }

  const totalMeals = history.filter(v => v.meal_served_at || v.nutrition_kit_distributed).length;

  return (
    <div className="mt-8 pt-6 border-t border-neutral-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <History className="w-4 h-4" />
          Visit History
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200">
            Total Visits: {history.length}
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
            Total Kits Provided: {totalMeals}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
        {history.map((visit, index) => {
          const isFirstVisit = index === history.length - 1;
          const visitNumber = history.length - index;
          const hasMeds = visit.medication_hydroxyurea || visit.medication_folic_acid;
          const hasKit = visit.meal_served_at || visit.nutrition_kit_distributed;
          
          return (
            <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-neutral-100 text-neutral-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-[10px] font-bold">{visitNumber}</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-neutral-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{isFirstVisit ? 'First Visit' : `Visit ${visitNumber}`}</span>
                    <span className="text-[10px] text-neutral-500">{new Date(visit.created_at).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase">{visit.status.replace('_', ' ')}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hasMeds && <Badge variant="secondary" className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0">💊 Meds Rx</Badge>}
                  {hasKit && <Badge variant="secondary" className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0">🍲 Kit Delivered</Badge>}
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 mb-3">
                  {visit.consultant_advice || (visit.symptoms?.length ? `Symptoms: ${visit.symptoms.join(', ')}` : 'No notes')}
                </p>

                <div className="text-[9px] text-neutral-400 font-medium flex flex-wrap gap-x-2 gap-y-1 pt-2 border-t border-neutral-50">
                  {visit.registrar_name && <span>Reg: {visit.registrar_name}</span>}
                  {visit.consultant_name && <span>• Dr: {visit.consultant_name}</span>}
                  {visit.meal_distributor_name && <span>• Meal: {visit.meal_distributor_name}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

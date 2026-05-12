import * as React from 'react';
import { Patient } from '../../types';
import { History, Stethoscope, Utensils, Image as ImageIcon, Cloud, CloudOff } from 'lucide-react';
import { Badge } from '../ui/badge';
import { usePatientHistory } from '../../hooks/usePatientHistory';

import { GlobalErrorBoundary } from './GlobalErrorBoundary';

interface VisitHistoryProps {
  patient: Patient;
}

export function VisitHistory({ patient }: VisitHistoryProps) {
  const { history, loading } = usePatientHistory(patient);
  const [activeImage, setActiveImage] = React.useState<string | null>(null);

  if (loading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="h-4 w-32 bg-neutral-100 rounded" />
        <div className="h-24 w-full bg-neutral-50 rounded-2xl" />
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  // Calculate total nutrition kits/meals provided across history
  const totalKits = history.filter(v => v.meal_served_at || v.nutrition_kit_distributed).length;

  return (
    <GlobalErrorBoundary>
      <div className="mt-6 pt-4 border-t border-neutral-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="w-4 h-4" />
            Visit Timeline
          </h3>
          <div className="flex gap-1.5">
            <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200 rounded-lg px-2 py-0.5 text-[10px]">
              Visits: {history.length}
            </Badge>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 rounded-lg px-2 py-0.5 text-[10px]">
              Kits: {totalKits}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
          {history.map((visit, index) => {
            const isFirstVisit = index === history.length - 1;
            const visitNumber = history.length - index;
            const isPending = visit.is_offline_pending;
            
            return (
              <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-neutral-100 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-105 ${isPending ? 'bg-amber-50 text-amber-500' : 'bg-white text-neutral-400'}`}>
                  {isPending ? <Cloud className="w-3 h-3" /> : <span className="text-[9px] font-black tracking-tighter">{visitNumber}</span>}
                </div>

                <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-lg hover:border-primary/10 ${isPending ? 'border-amber-100 bg-amber-50/10' : 'border-neutral-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">{isFirstVisit ? 'Initial Registration' : `Follow-up Visit ${visitNumber}`}</span>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-neutral-400">{new Date(visit.created_at || Date.now()).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                         {isPending && (
                           <Badge variant="outline" className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 border-amber-200 py-0 px-1.5 flex items-center gap-1">
                             <CloudOff className="w-2.5 h-2.5" /> Pending Sync
                           </Badge>
                         )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-neutral-50 border-neutral-200">
                      {(visit.status || 'unknown').replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                        <Stethoscope className="w-3 h-3" />
                        Clinical Advice
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100/50">
                        <p className="text-xs text-neutral-700 leading-relaxed font-medium italic">
                          {visit.consultant_advice || 'No clinical notes recorded for this visit.'}
                        </p>
                        {visit.consultant_image_url && (
                          <div 
                            className="mt-3 overflow-hidden rounded-xl border border-neutral-100 group/img cursor-pointer relative"
                            onClick={() => setActiveImage(visit.consultant_image_url || null)}
                          >
                            <img 
                              src={visit.consultant_image_url} 
                              alt="Consultation Report" 
                              className="w-full h-24 object-cover transition-transform group-hover/img:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Click to Expand
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${visit.meal_served_at || visit.nutrition_kit_distributed ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-50 text-neutral-400'}`}>
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest">Nutrition Kit</span>
                          <span className="text-[10px] font-bold text-neutral-400">
                            {visit.meal_served_at || visit.nutrition_kit_distributed ? 'Delivered' : 'Pending/Not Required'}
                          </span>
                        </div>
                      </div>
                      {visit.meal_image_url && (
                         <Badge variant="secondary" className="bg-emerald-100/50 text-emerald-700 text-[9px] font-black rounded-lg">
                           PHOTO CAPTURED
                         </Badge>
                      )}
                    </div>

                    {visit.meal_image_url && (
                      <div 
                        className="mt-2 overflow-hidden rounded-xl border border-neutral-100 group/meal cursor-pointer relative"
                        onClick={() => setActiveImage(visit.meal_image_url || null)}
                      >
                        <img 
                          src={visit.meal_image_url} 
                          alt="Meal Delivery" 
                          className="w-full h-24 object-cover transition-transform group-hover/meal:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/meal:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">Meal Evidence</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-neutral-50">
                      {visit.registrar_name && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center text-[8px] font-bold text-neutral-500">R</div>
                          <span className="text-[9px] font-bold text-neutral-400">{visit.registrar_name}</span>
                        </div>
                      )}
                      {visit.consultant_name && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">D</div>
                          <span className="text-[9px] font-bold text-neutral-400">{visit.consultant_name}</span>
                        </div>
                      )}
                      {visit.meal_distributor_name && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[8px] font-bold text-emerald-600">M</div>
                          <span className="text-[9px] font-bold text-neutral-400">{visit.meal_distributor_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeImage && (
          <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-150"
            onClick={() => setActiveImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <img 
                src={activeImage} 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                alt="Preview" 
              />
              <button 
                className="absolute top-0 right-0 m-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                onClick={() => setActiveImage(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </GlobalErrorBoundary>
  );
}

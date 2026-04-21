import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Patient } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, Users, CheckCircle2, TrendingUp, ChevronRight, Calendar, Clock, MapPin, User, FileText, Utensils, Stethoscope, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

import { TRANSLATIONS } from '../../constants/mp_data';
import { useAuth } from '../../hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const lang = profile?.preferredLanguage || 'hi';
  const t = TRANSLATIONS[lang];
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    const q = query(
      collection(db, 'patients'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(data);
      
      const total = data.length;
      const completed = data.filter(p => p.status === 'complete').length;
      const pending = total - completed;
      setStats({ total, pending, completed });
    });

    return unsubscribe;
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'pending_meal': return 'bg-blue-100 text-blue-700';
      case 'pending_consultation': return 'bg-orange-100 text-orange-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
            {TRANSLATIONS.en.systemOversight} / {TRANSLATIONS.hi.systemOversight}
          </h2>
          <p className="text-neutral-500">Madhya Pradesh Patient Management Oversight • Live Data Feed</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="rounded-full px-4 py-1.5 border-neutral-200 bg-white shadow-sm flex gap-2 items-center">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             Live Analytics
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: lang === 'en' ? 'Total Patients' : 'कुल मरीज', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: lang === 'en' ? 'Active Queue' : 'सक्रिय कतार', value: stats.pending, icon: Activity, color: 'text-orange-600', bg: 'bg orange-50' },
          { label: lang === 'en' ? 'Completed' : 'पूरा हुआ', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: lang === 'en' ? 'Efficiency' : 'दक्षता', value: '94%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40 overflow-hidden">
        <CardHeader className="p-8 border-b border-neutral-100 bg-neutral-50/50">
          <CardTitle className="text-xl">{t.patientData}</CardTitle>
          <CardDescription>Comprehensive history of all patient interactions across Madhya Pradesh districts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px] md:min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 pl-8">{t.fullName}</TableHead>
                <TableHead className="py-4">{t.district}</TableHead>
                <TableHead className="py-4">Status</TableHead>
                <TableHead className="py-4">Progress</TableHead>
                <TableHead className="py-4">Media</TableHead>
                <TableHead className="py-4 pr-8 text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <TableCell className="py-4 pl-8">
                    <div>
                      <p className="font-semibold text-neutral-900">{p.name}</p>
                      <p className="text-xs text-neutral-500">{new Date(p.createdAt?.toDate()).toLocaleDateString()}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="rounded-full font-medium border-neutral-200">
                      {p.district}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="secondary" className={`${getStatusColor(p.status)} rounded-full shadow-none border-none`}>
                      {p.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex gap-1">
                      <div className={`w-3 h-3 rounded-full ${p.registrarId ? 'bg-primary' : 'bg-neutral-200'}`} title="Registrar" />
                      <div className={`w-3 h-3 rounded-full ${p.consultantId ? 'bg-primary' : 'bg-neutral-200'}`} title="Consultant" />
                      <div className={`w-3 h-3 rounded-full ${p.mealDistributorId ? 'bg-primary' : 'bg-neutral-200'}`} title="Meal" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                     <div className="flex -space-x-2">
                       {p.registrarImageUrl && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-30 shadow-sm"><img src={p.registrarImageUrl} className="w-full h-full object-cover" /></div>}
                       {p.consultantImageUrl && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-20 shadow-sm"><img src={p.consultantImageUrl} className="w-full h-full object-cover" /></div>}
                       {p.mealImageUrl && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-10 shadow-sm"><img src={p.mealImageUrl} className="w-full h-full object-cover" /></div>}
                     </div>
                  </TableCell>
                  <TableCell className="py-4 pr-8 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full group-hover:bg-neutral-100 transition-colors"
                      onClick={() => setSelectedPatient(p)}
                    >
                      {t.viewDetails} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {patients.length === 0 && (
            <div className="p-20 text-center text-neutral-400">
               <Shield className="w-12 h-12 mx-auto mb-4 opacity-10" />
               <p>No records found in the system.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 border-none shadow-2xl rounded-3xl h-[90vh] md:h-[800px] overflow-hidden [&>button]:z-20">
          <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
            {/* Sidebar info */}
            <div className="w-full md:w-80 bg-neutral-900 text-white p-8 space-y-6 flex-shrink-0 flex flex-col overflow-y-auto min-w-0 pt-16 md:pt-12 relative scrollbar-thin scrollbar-white">
              <div>
                <DialogHeader className="mb-8">
                  <Badge className="w-fit mb-2 bg-primary/20 text-primary border-none">{selectedPatient?.status.replace('_', ' ')}</Badge>
                  <DialogTitle className="text-3xl font-bold text-white leading-tight break-words">{selectedPatient?.name}</DialogTitle>
                  <DialogDescription className="text-neutral-400 break-all">
                    Patient ID: {selectedPatient?.id.slice(0, 8)}...
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-neutral-300">
                    <User className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm">{selectedPatient?.age} Years Old</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    < MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm">{selectedPatient?.district} District</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm">Added: {selectedPatient?.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 mt-auto">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Madhya Pradesh Health Network</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs text-neutral-400 italic">Secure Medical Record</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white overflow-y-auto p-6 md:p-12 min-w-0 pt-16 md:pt-12 scrollbar-thin">
              <div className="space-y-10">
                {/* Step 1: Registration */}
                <section>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-neutral-900 break-words">1. {t.patientIntake}</h4>
                      <p className="text-xs text-neutral-500">Initial registration and triage</p>
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4 md:p-6 space-y-4 border border-neutral-100">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{t.reason}</p>
                      <p className="text-sm text-neutral-700 leading-relaxed font-medium break-words overflow-hidden">{selectedPatient?.reasonForVisit}</p>
                    </div>
                    {selectedPatient?.registrarImageUrl && (
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">ID Proof / Photo</p>
                        <div className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                          <img src={selectedPatient.registrarImageUrl} className="w-full h-auto max-h-64 object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Step 2: Consultation */}
                <section>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-neutral-900 break-words">2. {t.clinicalReview}</h4>
                      <p className="text-xs text-neutral-500">Doctor's diagnosis and medical advice</p>
                    </div>
                  </div>
                  {selectedPatient?.consultantAdvice ? (
                    <div className="bg-neutral-50 rounded-2xl p-4 md:p-6 space-y-4 border border-neutral-100 italic">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{t.medicalAdvice}</p>
                        <p className="text-sm text-neutral-700 leading-relaxed font-semibold break-words whitespace-pre-wrap">"{selectedPatient.consultantAdvice}"</p>
                      </div>
                      {selectedPatient.consultantImageUrl && (
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Prescription / Scan</p>
                          <div className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                            <img src={selectedPatient.consultantImageUrl} className="w-full h-auto max-h-64 object-contain" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-neutral-100 rounded-2xl text-center text-neutral-400 text-sm italic">
                      Consultation pending or not yet logged
                    </div>
                  )}
                </section>

                {/* Step 3: Meal */}
                <section>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <Utensils className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-neutral-900 break-words">3. {t.mealDistribution}</h4>
                      <p className="text-xs text-neutral-500">Nutritional support and meal delivery</p>
                    </div>
                  </div>
                  {selectedPatient?.mealDistributorId ? (
                    <div className="bg-neutral-50 rounded-2xl p-4 md:p-6 space-y-4 border border-neutral-100">
                      <div className="flex flex-wrap items-center gap-2 text-green-600 mb-2 font-bold text-xs uppercase tracking-tight italic">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="break-words font-bold">Delivered Successfully</span>
                      </div>
                      {selectedPatient.mealDistributorNotes && (
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Kitchen Notes</p>
                           <p className="text-sm text-neutral-700 break-words whitespace-pre-wrap">{selectedPatient.mealDistributorNotes}</p>
                        </div>
                      )}
                      {selectedPatient.mealImageUrl && (
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Delivery Proof</p>
                          <div className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                            <img src={selectedPatient.mealImageUrl} className="w-full h-auto max-h-64 object-contain" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-neutral-100 rounded-2xl text-center text-neutral-400 text-sm italic">
                      Meal distribution pending
                    </div>
                  )}
                </section>
              </div>
              
              <div className="mt-12 flex justify-end pb-4">
                <Button variant="outline" className="rounded-xl px-10 h-12 w-full sm:w-auto" onClick={() => setSelectedPatient(null)}>
                  Close Record
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

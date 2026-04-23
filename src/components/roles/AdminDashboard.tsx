import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientSummary } from '../PatientSummary';
import { CounsellingForm } from '../CounsellingForm';
import { usePatients } from '../../hooks/usePatients';
import { WifiOff } from 'lucide-react';
import { Pagination } from '../shared/Pagination';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { patients, loading, isOffline } = usePatients({ realtime: true });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const lang = profile?.preferred_language || 'hi';
  const t = TRANSLATIONS[lang];
  
  const stats = {
    total: patients.length,
    pending: patients.filter(p => p.status !== 'complete').length,
    completed: patients.filter(p => p.status === 'complete').length
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'pending_meal': return 'bg-blue-100 text-blue-700';
      case 'pending_consultation': return 'bg-orange-100 text-orange-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = patients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {TRANSLATIONS.en.systemOversight} / {TRANSLATIONS.hi.systemOversight}
          </h2>
          <p className="text-neutral-500">Madhya Pradesh Patient Management Oversight • Live Data Feed</p>
        </div>
        <div className="flex gap-2">
          {isOffline && (
            <Badge variant="outline" className="rounded-full px-4 py-1.5 border-rose-200 bg-rose-50 text-rose-600 shadow-sm flex gap-2 items-center font-bold">
              <WifiOff className="w-3.5 h-3.5" />
              OFFLINE MODE (Cached Data)
            </Badge>
          )}
          <Badge variant="outline" className="rounded-full px-4 py-1.5 border-neutral-200 bg-white shadow-sm flex gap-2 items-center font-bold">
            <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-green-500 animate-pulse'}`} />
            {isOffline ? 'Sync Paused' : 'Live Analytics'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: lang === 'en' ? 'Total Patients' : 'कुल मरीज', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: lang === 'en' ? 'Active Queue' : 'सक्रिय कतार', value: stats.pending, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
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
              {paginatedPatients.map((p) => (
                <TableRow key={p.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <TableCell className="py-4 pl-8">
                    <div>
                      <p className="font-semibold text-neutral-900">{p.name}</p>
                      <p className="text-xs text-neutral-500">{new Date(p.created_at).toLocaleDateString()}</p>
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
                      <div className={`w-3 h-3 rounded-full ${p.registrar_id ? 'bg-primary' : 'bg-neutral-200'}`} title="Registrar" />
                      <div className={`w-3 h-3 rounded-full ${p.consultant_id ? 'bg-primary' : 'bg-neutral-200'}`} title="Consultant" />
                      <div className={`w-3 h-3 rounded-full ${p.meal_distributor_id ? 'bg-primary' : 'bg-neutral-200'}`} title="Meal" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex -space-x-2">
                      {p.registrar_image_url && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-30 shadow-sm"><img src={p.registrar_image_url} className="w-full h-full object-cover" /></div>}
                      {p.consultant_image_url && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-20 shadow-sm"><img src={p.consultant_image_url} className="w-full h-full object-cover" /></div>}
                      {p.meal_image_url && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-10 shadow-sm"><img src={p.meal_image_url} className="w-full h-full object-cover" /></div>}
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

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={patients.length}
            itemsPerPage={itemsPerPage}
            className="px-6 border-t border-neutral-100 bg-neutral-50/30"
          />

          {patients.length === 0 && (
            <div className="p-20 text-center text-neutral-400">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p>No records found in the system.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden border-none shadow-2xl h-[90vh] flex flex-col gap-0">
          <div className="flex flex-col flex-1 h-full bg-white overflow-hidden">
            {/* Header */}
            <div className="bg-neutral-900 text-white p-6 flex shrink-0 flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">{selectedPatient?.name}</DialogTitle>
                <p className="text-neutral-400 text-sm">
                  {lang === 'en' ? "Full Administrative Record Audit" : "पूर्ण प्रशासनिक रिकॉर्ड ऑडिट"}
                </p>
              </div>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={() => setSelectedPatient(null)}>
                X
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0 bg-white">
              <div className="space-y-8 pb-12">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 mb-8 bg-neutral-100 p-1">
                    <TabsTrigger value="summary" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      {lang === 'en' ? "Quick Summary" : "त्वरित सारांश"}
                    </TabsTrigger>
                    <TabsTrigger value="form" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      {lang === 'en' ? "Full Record" : "पूरा रिकॉर्ड"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary">
                    <PatientSummary patient={selectedPatient as any} />

                    {/* Admin Specific: Flow Status */}
                    <div className="mt-8 pt-8 border-t border-neutral-100 space-y-6">
                      <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        System Flow Audit
                      </h3>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-2xl border ${selectedPatient?.registrar_id ? 'border-green-100 bg-green-50' : 'border-neutral-100 bg-neutral-50 opacity-50'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className={`w-4 h-4 ${selectedPatient?.registrar_id ? 'text-green-600' : 'text-neutral-400'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">Registration</span>
                          </div>
                          <p className="text-[10px] text-neutral-500">{selectedPatient?.registrar_id ? `Completed by ID: ${selectedPatient.registrar_id.slice(0, 6)}` : 'Incomplete'}</p>
                        </div>

                        <div className={`p-4 rounded-2xl border ${selectedPatient?.consultant_id ? 'border-green-100 bg-green-50' : 'border-neutral-100 bg-neutral-50 opacity-50'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className={`w-4 h-4 ${selectedPatient?.consultant_id ? 'text-green-600' : 'text-neutral-400'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">Consultation</span>
                          </div>
                          <p className="text-[10px] text-neutral-500">{selectedPatient?.consultant_id ? `Completed by ID: ${selectedPatient.consultant_id.slice(0, 6)}` : 'Incomplete'}</p>
                        </div>

                        <div className={`p-4 rounded-2xl border ${selectedPatient?.meal_distributor_id ? 'border-green-100 bg-green-50' : 'border-neutral-100 bg-neutral-50 opacity-50'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Utensils className={`w-4 h-4 ${selectedPatient?.meal_distributor_id ? 'text-green-600' : 'text-neutral-400'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">Distribution</span>
                          </div>
                          <p className="text-[10px] text-neutral-500">
                            {selectedPatient?.meal_distributor_id
                              ? `Served at ${selectedPatient.meal_served_at ? new Date(selectedPatient.meal_served_at).toLocaleTimeString() : 'N/A'}`
                              : 'Incomplete'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="form">
                    <CounsellingForm
                      data={selectedPatient || {}}
                      onChange={() => { }} // Read only for Admin
                      readOnly={true}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-100 flex shrink-0 flex-col sm:flex-row gap-3 bg-neutral-50 px-8">
              <Button variant="outline" className="flex-1 rounded-xl h-12 order-2 sm:order-1 font-semibold" onClick={() => setSelectedPatient(null)}>
                {lang === 'en' ? "Close Audit" : "ऑडिट बंद करें"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


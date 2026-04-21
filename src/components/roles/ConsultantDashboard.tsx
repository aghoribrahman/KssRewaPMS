import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, updateDoc, serverTimestamp, query, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '../ImageUpload';
import { toast } from 'sonner';
import { TRANSLATIONS } from '../../constants/mp_data';
import { Stethoscope, Clock, FileText, ArrowRight, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { CounsellingForm } from '../CounsellingForm';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ConsultantDashboard() {
  const { user, profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [submitting, setSubmitting] = useState(false);
  const lang = profile?.preferredLanguage || 'hi';
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (selectedPatient) {
      setFormData({ ...selectedPatient });
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (!profile) return;

    let q = query(
      collection(db, 'patients'),
      where('status', '==', 'pending_consultation')
    );

    // District-level RBAC filtering
    if (profile.role !== 'admin' && profile.assignedDistricts && profile.assignedDistricts.length > 0) {
      q = query(
        collection(db, 'patients'),
        where('status', '==', 'pending_consultation'),
        where('district', 'in', profile.assignedDistricts)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(data);
    });

    return unsubscribe;
  }, [profile]);

  const handleCompleteReview = async () => {
    if (!selectedPatient || !formData.consultantAdvice) {
      toast.error("Please provide clinical advice");
      return;
    }

    setSubmitting(true);
    try {
      // Create a clean payload with only allowed/relevant fields
      const { id, createdAt, registrarId, ...cleanData } = formData as any;
      
      await updateDoc(doc(db, 'patients', selectedPatient.id), {
        ...cleanData,
        status: 'pending_meal',
        consultantId: user?.uid,
        updatedAt: serverTimestamp(),
      });
      toast.success("Consultation complete. Patient moved to Meal Distribution.");
      setSelectedPatient(null);
      setFormData({});
    } catch (error) {
      console.error(error);
      toast.error("Failed to update record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
            {TRANSLATIONS.en.clinicalReview} / {TRANSLATIONS.hi.clinicalReview}
          </h2>
          <p className="text-neutral-500">Madhya Pradesh Regional Health Center • Clinical Oversight</p>
        </div>
        {profile?.role !== 'admin' && profile?.assignedDistricts && (
          <div className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl border border-primary/10">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-tight">Accessing Dist: {profile.assignedDistricts.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40">
            <CardHeader className="p-8 border-b border-neutral-100">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                {t.waitConsultation}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50/50">
                    <TableHead className="py-4 pl-8">{t.fullName}</TableHead>
                    <TableHead className="py-4">{t.district}</TableHead>
                    <TableHead className="py-4">{t.timeAdded}</TableHead>
                    <TableHead className="py-4 pr-8 text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((p) => (
                    <TableRow key={p.id} className="hover:bg-neutral-50/50 cursor-pointer" onClick={() => setSelectedPatient(p)}>
                      <TableCell className="py-4 pl-8">
                        <div>
                          <p className="font-semibold text-neutral-900">{p.name}</p>
                          <p className="text-xs text-neutral-500">{p.age}y • {p.contact}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="rounded-full font-normal">{p.district}</Badge>
                      </TableCell>
                      <TableCell className="py-4">
                         <p className="text-xs font-medium text-neutral-400">
                           {new Date(p.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </TableCell>
                      <TableCell className="py-4 pr-8 text-right">
                        <Button variant="outline" size="sm" className="rounded-full gap-2">
                          {lang === 'en' ? "Review" : "समीक्षा"} <ArrowRight className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {patients.length === 0 && (
                <div className="p-20 text-center text-neutral-400">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>All clear! No patients waiting in your assigned districts.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40 bg-primary/5 border border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-2xl">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Queue Size</p>
                  <p className="text-4xl font-bold text-primary">{patients.length}</p>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden border-none shadow-2xl h-[90vh]">
          <div className="flex flex-col h-full bg-white">
            <div className="bg-neutral-900 text-white p-6 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">{selectedPatient?.name}</DialogTitle>
                <p className="text-neutral-400 text-sm">
                  {lang === 'en' ? "Comprehensive Clinical Review" : "व्यापक नैदानिक समीक्षा"}
                </p>
              </div>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={() => setSelectedPatient(null)}>
                X
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6 md:p-8">
              <div className="space-y-8 pb-12">
                <CounsellingForm 
                  data={formData} 
                  onChange={setFormData}
                />
                
                <div className="space-y-4 pt-8 border-t border-neutral-100">
                   <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {t.medicalAdvice}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="advice" className="text-sm font-semibold">{lang === 'en' ? "Final Consultation Notes / Advice" : "अंतिम परामर्श नोट्स / सलाह"}</Label>
                      <Textarea 
                        id="advice" 
                        placeholder={lang === 'en' ? "Enter final advice..." : "अंतिम सलाह दर्ज करें..."} 
                        className="min-h-[120px] rounded-2xl resize-none focus:ring-primary/20"
                        value={formData.consultantAdvice || ''}
                        onChange={e => setFormData({...formData, consultantAdvice: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-3 bg-neutral-50 px-8">
              <Button variant="outline" className="flex-1 rounded-xl h-12 order-2 sm:order-1 font-semibold" onClick={() => setSelectedPatient(null)}>
                {lang === 'en' ? "Cancel" : "रद्द करें"}
              </Button>
              <Button className="flex-[2] rounded-xl h-12 order-1 sm:order-2 font-bold shadow-lg shadow-primary/20 bg-neutral-900 hover:bg-neutral-800 text-white" onClick={handleCompleteReview} disabled={submitting}>
                {submitting ? (lang === 'en' ? "Processing..." : "प्रक्रिया जारी...") : t.completeReview}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

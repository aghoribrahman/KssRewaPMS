import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientSummary } from '../PatientSummary';
import { CounsellingForm } from '../CounsellingForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePatients } from '../../hooks/usePatients';

export default function ConsultantDashboard() {
  const { user, profile } = useAuth();
  const { patients, loading } = usePatients({ status: 'pending_consultation', realtime: true });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [submitting, setSubmitting] = useState(false);
  const lang = profile?.preferred_language || 'hi';
  const t = TRANSLATIONS[lang];

  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = patients.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (selectedPatient) {
      setFormData({ ...selectedPatient });
    }
  }, [selectedPatient]);

  const handleCompleteReview = async () => {
    if (!selectedPatient || !formData.consultant_advice) {
      toast.error("Please provide clinical advice");
      return;
    }


    setSubmitting(true);
    try {
      const nextStatus = formData.meal_required ? 'pending_meal' : 'complete';

      
      const { error } = await supabase
        .from('patients')
        .update({
          ...formData,
          status: nextStatus,
          consultant_id: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPatient.id);

      if (error) throw error;
      
      const successMsg = nextStatus === 'pending_meal' 
        ? "Consultation complete. Patient moved to Meal Distribution."
        : "Consultation complete. Patient cycle finished (No meal box required).";
        
      toast.success(successMsg);
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
        {profile?.role !== 'admin' && profile?.assigned_districts && (
          <div className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl border border-primary/10">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-tight">Accessing Dist: {profile.assigned_districts.join(', ')}</span>
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
                  {paginatedPatients.map((p) => (
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
                           {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

              <div className="p-4 border-t border-neutral-100 bg-neutral-50/30 flex items-center justify-between px-8">
                <p className="text-xs text-neutral-500 font-medium tracking-tight">
                  {lang === 'en' ? 'Page' : 'पृष्ठ'} {currentPage} {lang === 'en' ? 'of' : 'का'} {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                    disabled={currentPage === 1}
                    className="rounded-xl h-8 px-4"
                  >
                    {lang === 'en' ? 'Prev' : 'पिछला'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="rounded-xl h-8 px-4"
                  >
                    {lang === 'en' ? 'Next' : 'अगला'}
                  </Button>
                </div>
              </div>

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
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden border-none shadow-2xl h-[90vh] flex flex-col gap-0">
          <div className="flex flex-col flex-1 h-full bg-white overflow-hidden">
            <div className="bg-neutral-900 text-white p-6 flex shrink-0 flex-row items-center justify-between">
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

            <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0 bg-white">
              <div className="space-y-8 pb-12">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 mb-8 bg-neutral-100 p-1">
                    <TabsTrigger value="summary" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      {lang === 'en' ? "Quick Summary" : "त्वरित सारांश"}
                    </TabsTrigger>
                    <TabsTrigger value="form" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      {lang === 'en' ? "Detailed Form" : "विस्तृत फॉर्म"}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary">
                    <PatientSummary patient={formData as any} />
                  </TabsContent>
                  
                  <TabsContent value="form">
                    <CounsellingForm 
                      data={formData} 
                      onChange={setFormData}
                    />
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-4 pt-8 border-t border-neutral-100">
                   <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {t.medicalAdvice}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="advice" className="text-sm font-semibold">{lang === 'en' ? "Final Consultation Notes / Advice" : "अंतिम परामर्श नोट्स / सलाह"}</Label>
                        <Textarea 
                          id="advice" 
                          placeholder={lang === 'en' ? "Enter final advice..." : "अंतिम सलाह दर्ज करें..."} 
                          className="min-h-[120px] rounded-2xl resize-none focus:ring-primary/20"
                          value={formData.consultant_advice || ''}
                          onChange={e => setFormData({...formData, consultant_advice: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">{lang === 'en' ? "Attach Reports/Photo" : "रिपोर्ट/फोटो संलग्न करें"}</Label>
                        <ImageUpload 
                          folder="consultation_reports" 
                          onUploadComplete={(url) => setFormData({...formData, consultant_image_url: url})}
                          label={lang === 'en' ? "Upload Report" : "रिपोर्ट अपलोड करें"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 flex shrink-0 flex-col sm:flex-row gap-3 bg-neutral-50 px-8">
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


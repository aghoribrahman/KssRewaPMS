import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, updateDoc, serverTimestamp, query, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '../ImageUpload';
import { toast } from 'sonner';
import { TRANSLATIONS } from '../../constants/mp_data';
import { Utensils, CheckCircle2, Clock, MapPin, User, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { CounsellingForm } from '../CounsellingForm';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MealDistributorDashboard() {
  const { user, profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [imageUrl, setImageUrl] = useState('');
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
      where('status', '==', 'pending_meal')
    );

    // District-level RBAC filtering
    if (profile.role !== 'admin' && profile.assignedDistricts && profile.assignedDistricts.length > 0) {
      q = query(
        collection(db, 'patients'),
        where('status', '==', 'pending_meal'),
        where('district', 'in', profile.assignedDistricts)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(data);
    });

    return unsubscribe;
  }, [profile]);

  const handleDeliver = async () => {
    if (!selectedPatient) return;

    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'patients', selectedPatient.id), {
        status: 'complete',
        mealImageUrl: imageUrl || null,
        mealDistributorNotes: formData.mealDistributorNotes || '',
        mealDistributorId: user?.uid,
        mealServedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
      toast.success(lang === 'en' ? "Meal delivered!" : "भोजन वितरित!");
      setSelectedPatient(null);
      setImageUrl('');
      setFormData({});
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm delivery");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
            {TRANSLATIONS.en.mealDistribution} / {TRANSLATIONS.hi.mealDistribution}
          </h2>
          <p className="text-neutral-500">Service delivery for MP Healthcare System patients.</p>
        </div>
        {profile?.role !== 'admin' && profile?.assignedDistricts && (
          <div className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl border border-primary/10">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-tight">Assigned Districts: {profile.assignedDistricts.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((p) => (
          <Card key={p.id} className="rounded-3xl border-none shadow-xl shadow-neutral-200/40 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{p.name}</h3>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3 h-3" />
                      {p.district}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary shadow-none hover:bg-primary/10 rounded-full px-3">
                    {p.status.replace('_', ' ')}
                  </Badge>
               </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
               <div className="p-4 bg-neutral-50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium text-neutral-600">Pending since: {new Date(p.updatedAt?.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 italic">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span>Age: {p.age}y</span>
                  </div>
               </div>

               <Button className="w-full rounded-xl h-12 gap-2" onClick={() => setSelectedPatient(p)}>
                 <Utensils className="w-4 h-4" />
                 {lang === 'en' ? "Confirm Delivery" : "वितरण की पुष्टि करें"}
               </Button>
            </CardContent>
          </Card>
        ))}
        
        {patients.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-neutral-200" />
            <p className="text-neutral-400 font-medium text-lg">No meals pending distribution in your districts.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden border-none shadow-2xl h-[90vh]">
          <div className="flex flex-col h-full bg-white">
            <div className="bg-neutral-900 text-white p-6 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">{selectedPatient?.name}</DialogTitle>
                <p className="text-neutral-400 text-sm">
                  {lang === 'en' ? "Verify & Distribute Nutrition Kit/Meal" : "सत्यापित करें और पोषण किट/भोजन वितरित करें"}
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
                  readOnly={true}
                />
                
                <div className="space-y-6 pt-8 border-t border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    {t.mealDistribution}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">{t.deliveredTray}</Label>
                      <ImageUpload 
                        folder="meal_deliveries" 
                        onUploadComplete={(url) => setImageUrl(url)}
                        label={t.deliveredTray}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">{lang === 'en' ? "Distribution Notes" : "वितरण नोट्स"}</Label>
                      <Textarea 
                        placeholder={lang === 'en' ? "e.g., Left with patient..." : "जैसे, मरीज के साथ छोड़ दिया..."}
                        className="w-full rounded-2xl border-neutral-200 p-4 text-sm focus:ring-primary focus:border-primary min-h-[150px]"
                        value={formData.mealDistributorNotes || ''}
                        onChange={e => setFormData({...formData, mealDistributorNotes: e.target.value})}
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
              <Button className="flex-[2] rounded-xl h-12 order-1 sm:order-2 font-bold shadow-lg shadow-primary/20 bg-neutral-900 hover:bg-neutral-800 text-white" onClick={handleDeliver} disabled={submitting}>
                {submitting ? (lang === 'en' ? "Processing..." : "प्रक्रिया जारी...") : (lang === 'en' ? "Confirm Delivery" : "वितरण की पुष्टि करें")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import * as React from 'react';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Utensils, CheckCircle2, Clock, MapPin, User, Search } from 'lucide-react';

import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { usePatientActions } from '../../hooks/usePatientActions';
import { ImageUpload } from '../ImageUpload';
import { useDashboardState } from '../../hooks/useDashboardState';
import { formatTime } from '../../lib/dateUtils';
import { StatusBadge } from '../shared/StatusBadge';
import { useDashboardHelper } from '../../hooks/useDashboardHelper';

export default function MealDistributorDashboard() {
  const { profile } = useAuth();
  const { patients, isOffline, isSyncing, pendingCount } = usePatients({ status: 'pending_meal', realtime: true });
  const { serveMeal } = usePatientActions();

  const {
    selectedPatient,
    setSelectedPatient,
    handleUpdatePatient,
    closeDialog,
    lang,
    t
  } = useDashboardHelper();

  const [mealNotes, setMealNotes] = React.useState('');
  const [mealImage, setMealImage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Reset review state when patient changes
  useEffect(() => {
    if (selectedPatient) {
      setMealNotes(selectedPatient.meal_distributor_notes || '');
      setMealImage(selectedPatient.meal_image_url || '');
    } else {
      setMealNotes('');
      setMealImage('');
    }
  }, [selectedPatient]);

  const stats = useDashboardStats({ patients, role: 'meal_distributor', lang });
  const { searchQuery, setSearchQuery, paginatedPatients, totalCount } = useDashboardState({ patients, itemsPerPage: 100 });

  const handleDeliver = async () => {
    if (!selectedPatient) return;

    if (!mealNotes.trim()) {
      toast.error(
        lang === 'en'
          ? "Please add delivery notes (e.g. 'Kit provided')"
          : "कृपया वितरण नोट्स जोड़ें (जैसे 'किट प्रदान की गई')"
      );
      return;
    }

    setSubmitting(true);
    try {
      serveMeal(selectedPatient, mealNotes, mealImage);
      toast.success(lang === 'en' ? "Delivery queued!" : "वितरण कतार में!");
      setSelectedPatient(null);
    } catch (error) {
      toast.error(lang === 'en' ? "Failed to confirm delivery" : "वितरण की पुष्टि करने में विफल");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardHeader
        title={t.mealDistribution}
        subtitle="Service delivery for Kiran Seva Sansthan patients."
        role="Meal Distributor"
        lang={lang}
        isOffline={isOffline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        icon={Utensils}
        actions={
          profile?.role !== 'admin' && profile?.assigned_districts && (
            <div className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl border border-primary/10">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-tight">{t.myDistricts}: {profile.assigned_districts.join(', ')}</span>
            </div>
          )
        }
      />

      <StatGrid stats={stats} />

      <div className="space-y-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder={lang === 'en' ? "Search patient..." : "मरीज खोजें..."}
            className="pl-10 rounded-xl h-12 border-neutral-200 bg-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPatients.map((p) => (
            <Card key={p.id} className="rounded-3xl border-none shadow-xl shadow-neutral-200/40 overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-white">
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
                  <StatusBadge status={p.status} />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="p-4 bg-neutral-50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium text-neutral-600">{t.timeAdded}: {formatTime(p.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 italic">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span>{t.age}: {p.age}y</span>
                  </div>
                </div>
                <Button className="w-full rounded-xl h-12 gap-2 font-bold" onClick={() => setSelectedPatient(p)}>
                  <Utensils className="w-4 h-4" />
                  {t.confirmDelivery}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalCount === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-neutral-200" />
            <p className="text-neutral-400 font-medium text-lg">
              {lang === 'en' ? "No meals pending distribution." : "कोई भोजन वितरण लंबित नहीं है।"}
            </p>
          </div>
        )}
      </div>

      <PatientDetailsDialog
        patient={selectedPatient}
        onClose={closeDialog}
        lang={lang}
        subtitle={t.mealDeliveryAudit}
        actionTabTitle={t.mealDistribution}
        onFormSubmit={handleUpdatePatient}
        actionContent={
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">{t.deliveredTray}</Label>
                <ImageUpload folder="meal_deliveries" onUploadComplete={setMealImage} label={t.deliveredTray} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">
                  {lang === 'en' ? "Notes" : "टिप्पणियाँ"}
                </Label>
                <Textarea
                  placeholder={lang === 'en' ? "Enter delivery notes..." : "वितरण नोट्स दर्ज करें..."}
                  className="rounded-2xl min-h-[120px] shadow-sm"
                  value={mealNotes}
                  onChange={e => setMealNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        }
        actions={
          <>
            <Button variant="premium" className="px-8" onClick={handleDeliver} disabled={submitting}>
              {submitting ? "Processing..." : t.confirmDelivery}
            </Button>
          </>
        }
      />
    </DashboardLayout>
  );
}


import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { TRANSLATIONS } from '../../constants/mp_data';
import { Stethoscope, ArrowRight, FileText, MapPin } from 'lucide-react';

import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { usePatientActions } from '../../hooks/usePatientActions';
import { Column } from '../shared/GenericTable';
import { ImageUpload } from '../ImageUpload';

export default function ConsultantDashboard() {
  const { profile } = useAuth();
  const { patients, isOffline, isSyncing, pendingCount } = usePatients({ status: 'pending_consultation', realtime: true });
  const { consultPatient } = usePatientActions();
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consultAdvice, setConsultAdvice] = useState('');
  const [consultImage, setConsultImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Reset review state when patient changes
  React.useEffect(() => {
    if (selectedPatient) {
      setConsultAdvice(selectedPatient.consultant_advice || '');
      setConsultImage(selectedPatient.consultant_image_url || '');
    } else {
      setConsultAdvice('');
      setConsultImage('');
    }
  }, [selectedPatient]);

  const lang = profile?.preferred_language || 'hi';
  const t = TRANSLATIONS[lang];

  const stats = useDashboardStats({ patients, role: 'consultant', lang });

  const handleCompleteReview = async () => {
    if (!selectedPatient || !consultAdvice) {
      toast.error("Please provide clinical advice");
      return;
    }

    setSubmitting(true);
    try {
      consultPatient(selectedPatient, consultAdvice, consultImage);
      toast.success("Review queued!");
      setSelectedPatient(null);
      setConsultAdvice('');
      setConsultImage('');
    } catch (error) {
      toast.error("Failed to update record");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Patient>[] = [
    {
      header: t.fullName,
      accessor: (p) => (
        <div>
          <p className="font-semibold text-neutral-900">{p.name}</p>
          <p className="text-xs text-neutral-500">{p.age}y • {p.contact}</p>
        </div>
      )
    },
    {
      header: t.district,
      accessor: (p) => (
        <Badge variant="outline" className="rounded-full font-normal">{p.district}</Badge>
      )
    },
    {
      header: t.timeAdded,
      accessor: (p) => (
        <p className="text-xs font-medium text-neutral-400">
          {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )
    },
    {
      header: t.actions,
      accessor: (p) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full gap-2"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPatient(p);
          }}
        >
          {lang === 'en' ? "Review" : "समीक्षा"} <ArrowRight className="w-3 h-3" />
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <DashboardHeader 
        title={lang === 'en' ? 'Clinical Review' : 'नैदानिक समीक्षा'}
        subtitle="Madhya Pradesh Regional Health Center • Clinical Oversight"
        role="Consultant"
        lang={lang}
        isOffline={isOffline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        icon={Stethoscope}
        actions={
          profile?.role !== 'admin' && profile?.assigned_districts && (
            <div className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl border border-primary/10">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Districts: {profile.assigned_districts.join(', ')}</span>
            </div>
          )
        }
      />

      <StatGrid stats={stats} />

      <PatientDirectory 
        patients={patients}
        columns={columns}
        onPatientSelect={setSelectedPatient}
        lang={lang}
        title={t.waitConsultation}
        description="Patients awaiting clinical evaluation."
      />

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        lang={lang}
        subtitle={lang === 'en' ? "Comprehensive Clinical Review" : "व्यापक नैदानिक समीक्षा"}
        actionTabTitle={lang === 'en' ? "Clinical Review" : "नैदानिक समीक्षा"}
        actionContent={
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t.medicalAdvice}
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{lang === 'en' ? "Final Consultation Notes" : "अंतिम परामर्श नोट्स"}</Label>
                <Textarea 
                  placeholder="Enter advice..." 
                  className="min-h-[150px] rounded-2xl resize-none shadow-sm"
                  value={consultAdvice}
                  onChange={e => setConsultAdvice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Attach Reports</Label>
                <ImageUpload 
                  folder="consultation_reports" 
                  onUploadComplete={setConsultImage}
                  label="Upload Report"
                />
              </div>
            </div>
          </div>
        }
        actions={
          <>
            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setSelectedPatient(null)}>
              {lang === 'en' ? "Cancel" : "रद्द करें"}
            </Button>
            <Button className="flex-[2] rounded-xl h-12 font-bold shadow-lg" onClick={handleCompleteReview} disabled={submitting}>
              {submitting ? "Processing..." : t.completeReview}
            </Button>
          </>
        }
      />
    </DashboardLayout>
  );
}

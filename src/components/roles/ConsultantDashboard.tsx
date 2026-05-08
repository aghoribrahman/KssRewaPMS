import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Stethoscope, FileText, MapPin } from 'lucide-react';

import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { usePatientActions } from '../../hooks/usePatientActions';
import { ImageUpload } from '../ImageUpload';
import { useTranslation } from '../../hooks/useTranslation';
import { getSharedPatientColumns } from '../shared/PatientColumns';

export default function ConsultantDashboard() {
  const { profile } = useAuth();
  const { lang, t } = useTranslation();
  const { patients, isOffline, isSyncing, pendingCount } = usePatients({ status: 'pending_consultation', realtime: true });
  const { consultPatient, updatePatientRecord } = usePatientActions();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consultAdvice, setConsultAdvice] = useState('');
  const [consultImage, setConsultImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset review state when patient changes
  useEffect(() => {
    if (selectedPatient) {
      setConsultAdvice(selectedPatient.consultant_advice || '');
      setConsultImage(selectedPatient.consultant_image_url || '');
    } else {
      setConsultAdvice('');
      setConsultImage('');
    }
  }, [selectedPatient]);

  const stats = useDashboardStats({ patients, role: 'consultant', lang });

  const handleCompleteReview = async () => {
    if (!selectedPatient) return;

    const adviceTrimmed = consultAdvice.trim();
    if (adviceTrimmed.length < 10) {
      toast.error(
        lang === 'en'
          ? "Please provide detailed clinical advice (min 10 chars)"
          : "कृपया विस्तृत नैदानिक सलाह प्रदान करें (कम से कम 10 वर्ण)"
      );
      return;
    }

    setSubmitting(true);
    try {
      consultPatient(selectedPatient, consultAdvice, consultImage);
      toast.success(lang === 'en' ? "Review queued!" : "समीक्षा कतार में!");
      setSelectedPatient(null);
    } catch (error) {
      toast.error(lang === 'en' ? "Failed to update record" : "रिकॉर्ड अपडेट करने में विफल");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePatient = async (data: any) => {
    if (!selectedPatient) return;

    try {
      updatePatientRecord(selectedPatient.id, data);
      toast.success(lang === 'en' ? "Patient record updated!" : "मरीज का रिकॉर्ड अपडेट किया गया!");
      // Update local state to reflect changes immediately
      setSelectedPatient(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      toast.error(lang === 'en' ? "Failed to update record" : "रिकॉर्ड अपडेट करने में विफल");
    }
  };

  const columns = useMemo(() =>
    getSharedPatientColumns(t, setSelectedPatient, lang),
    [t, lang]);

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
        description={lang === 'en' ? "Patients awaiting clinical evaluation." : "नैदानिक मूल्यांकन की प्रतीक्षा कर रहे मरीज।"}
      />

      <PatientDetailsDialog
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        lang={lang}
        readOnly={false}
        disabledFields={['name', 'contact', 'district', 'block', 'village', 'address', 'abha_id']}
        onFormSubmit={handleUpdatePatient}
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
                  placeholder={lang === 'en' ? "Enter advice..." : "सलाह दर्ज करें..."}
                  className="min-h-[150px] rounded-2xl resize-none shadow-sm"
                  value={consultAdvice}
                  onChange={e => setConsultAdvice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{lang === 'en' ? "Attach Reports" : "रिपोर्ट संलग्न करें"}</Label>
                <ImageUpload
                  folder="consultation_reports"
                  onUploadComplete={setConsultImage}
                  label={lang === 'en' ? "Upload Report" : "रिपोर्ट अपलोड करें"}
                />
              </div>
            </div>
          </div>
        }
        actions={
          <>
            <Button
              className="p-4 hover:scale-105 transition-all active:scale-95 hover:shadow-2xl hover:shadow-primary/30"
              onClick={handleCompleteReview}
              disabled={submitting}
            >
              {submitting ? "Processing..." : t.completeReview}
            </Button>
          </>
        }
      />
    </DashboardLayout>
  );
}

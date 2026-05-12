import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
import { getSharedPatientColumns } from '../shared/PatientColumns';
import { useDashboardHelper } from '../../hooks/useDashboardHelper';

export default function ConsultantDashboard() {
  const { profile } = useAuth();
  const { patients, isOffline, isSyncing, pendingCount } = usePatients({ status: 'pending_consultation', realtime: true });
  const validPatients = useMemo(() => patients.filter(p => p.master_patient_id && p.name), [patients]);
  const { consultPatient, rejectPatient, escalatePatient } = usePatientActions();

  const {
    selectedPatient,
    setSelectedPatient,
    handleUpdatePatient,
    closeDialog,
    lang,
    t
  } = useDashboardHelper();

  const [consultAdvice, setConsultAdvice] = React.useState('');
  const [consultImage, setConsultImage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

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

  const stats = useDashboardStats({ patients: validPatients, role: 'consultant', lang });

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

  const handleReturnToRegistrar = async () => {
    if (!selectedPatient) return;
    const adviceTrimmed = consultAdvice.trim();
    if (!adviceTrimmed) {
      toast.error(
        lang === 'en'
          ? "Please provide a rejection reason in the notes"
          : "कृपया नोट्स में अस्वीकृति का कारण प्रदान करें"
      );
      return;
    }
    setSubmitting(true);
    try {
      rejectPatient(selectedPatient, consultAdvice);
      toast.success(lang === 'en' ? "Returned to Registrar" : "रजिस्ट्रार को वापस कर दिया गया");
      setSelectedPatient(null);
    } catch (error) {
      toast.error(lang === 'en' ? "Failed to update record" : "रिकॉर्ड अपडेट करने में विफल");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedPatient) return;
    const adviceTrimmed = consultAdvice.trim();
    if (!adviceTrimmed) {
      toast.error(
        lang === 'en'
          ? "Please provide an escalation reason in the notes"
          : "कृपया नोट्स में एस्केलेशन का कारण प्रदान करें"
      );
      return;
    }
    setSubmitting(true);
    try {
      escalatePatient(selectedPatient, consultAdvice);
      toast.success(lang === 'en' ? "Case Escalated" : "मामला एस्केलेट किया गया");
      setSelectedPatient(null);
    } catch (error) {
      toast.error(lang === 'en' ? "Failed to update record" : "रिकॉर्ड अपडेट करने में विफल");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(() =>
    getSharedPatientColumns(t, setSelectedPatient, lang),
    [t, lang, setSelectedPatient]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title={t.clinicalReview}
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
              <span className="text-xs font-bold uppercase tracking-tight">{t.myDistricts}: {profile.assigned_districts.join(', ')}</span>
            </div>
          )
        }
      />

      <StatGrid stats={stats} />

      <PatientDirectory
        patients={validPatients}
        columns={columns}
        onPatientSelect={setSelectedPatient}
        lang={lang}
        title={t.waitConsultation}
        description={lang === 'en' ? "Patients awaiting clinical evaluation." : "नैदानिक मूल्यांकन की प्रतीक्षा कर रहे मरीज।"}
      />

      <PatientDetailsDialog
        patient={selectedPatient}
        onClose={closeDialog}
        lang={lang}
        readOnly={false}
        disabledFields={['name', 'contact', 'district', 'block', 'village', 'address', 'abha_id']}
        onFormSubmit={handleUpdatePatient}
        subtitle={t.clinicalReviewDetail}
        actionTabTitle={t.clinicalReview}
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
          <div className="flex flex-wrap items-center gap-2 w-full justify-end">
            <Button 
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold" 
              onClick={handleReturnToRegistrar} 
              disabled={submitting}
            >
              {lang === 'en' ? "Return to Registrar" : "रजिस्ट्रार को वापस करें"}
            </Button>
            <Button 
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 font-bold" 
              onClick={handleEscalate} 
              disabled={submitting}
            >
              {lang === 'en' ? "Escalate" : "एस्केलेट करें"}
            </Button>
            <Button 
              variant="premium"
              className="p-4 text-sm group" 
              onClick={handleCompleteReview} 
              disabled={submitting}
            >
              {submitting ? "Processing..." : t.completeReview}
            </Button>
          </div>
        }
      />
    </DashboardLayout>
  );
}


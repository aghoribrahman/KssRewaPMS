import * as React from 'react';
import { Patient } from '../../types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientSummary } from '../PatientSummary';
import { CounsellingForm } from '../CounsellingForm';
import { TRANSLATIONS } from '../../constants/mp_data';

interface PatientDetailsDialogProps {
  patient: Patient | null;
  onClose: () => void;
  lang: 'en' | 'hi';
  actions?: React.ReactNode; // Buttons for the footer
  actionContent?: React.ReactNode; // Extra form content for a dedicated tab
  actionTabTitle?: string;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
  disabledFields?: string[];
  onFormSubmit?: (data: any) => void;
}

export function PatientDetailsDialog({
  patient,
  onClose,
  lang,
  actions,
  actionContent,
  actionTabTitle,
  title,
  subtitle,
  readOnly = true,
  disabledFields = [],
  onFormSubmit,
}: PatientDetailsDialogProps) {
  const t = TRANSLATIONS[lang];

  return (
    <Dialog open={!!patient} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden border-none shadow-2xl h-[90vh] flex flex-col gap-0" showCloseButton={false}>
        <div className="flex flex-col flex-1 h-full bg-white overflow-hidden relative">
          {/* Custom Header */}
          <div className="bg-neutral-900 text-white p-6 flex shrink-0 flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{patient?.name || title}</DialogTitle>
              <p className="text-neutral-400 text-sm">
                {subtitle || (lang === 'en' ? "Patient Registration Record" : "मरीज पंजीकरण रिकॉर्ड")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-10 w-10"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-white">
            <Tabs defaultValue="summary" className="w-full flex-1 flex flex-col min-h-0">
              <div className="px-6 md:px-8 pt-6 bg-neutral-50/50 border-b border-neutral-100">
                <TabsList className="flex w-full gap-4 rounded-full h-auto bg-neutral-100/50 p-1.5 border-none justify-start w-fit">
                  <TabsTrigger value="summary" className="rounded-full data-active:bg-white data-active:text-primary data-active:shadow-sm bg-transparent transition-all font-bold px-6 py-2.5 text-sm">
                    {lang === 'en' ? "Quick Summary" : "त्वरित सारांश"}
                  </TabsTrigger>
                  <TabsTrigger value="form" className="rounded-full data-active:bg-white data-active:text-primary data-active:shadow-sm bg-transparent transition-all font-bold px-6 py-2.5 text-sm">
                    {lang === 'en' ? "Full Record" : "पूरा रिकॉर्ड"}
                  </TabsTrigger>
                  {actionContent && (
                    <TabsTrigger value="action" className="rounded-full data-active:bg-white data-active:text-primary data-active:shadow-sm bg-transparent transition-all font-bold px-6 py-2.5 text-sm">
                      {actionTabTitle || (lang === 'en' ? "Action" : "कार्रवाई")}
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8 pb-12">
                  <TabsContent value="summary" className="focus-visible:outline-none">
                    <PatientSummary patient={patient as any} />
                  </TabsContent>

                  <TabsContent value="form" className="focus-visible:outline-none">
                    <CounsellingForm
                      data={patient || {}}
                      readOnly={readOnly}
                      disabledFields={disabledFields}
                      onSubmit={onFormSubmit}
                    />
                  </TabsContent>

                  {actionContent && (
                    <TabsContent value="action" className="focus-visible:outline-none">
                      {actionContent}
                    </TabsContent>
                  )}
                </div>
              </div>
            </Tabs>
          </div>

          {actions && (
            <div className="p-8 flex flex-col sm:flex-row gap-3 bg-transparent px-8 absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
              <div className="flex flex-col sm:flex-row gap-3 w-full pointer-events-auto">
                {actions}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

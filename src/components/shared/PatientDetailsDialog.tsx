import * as React from 'react';
import { Patient } from '../../types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientSummary } from '../PatientSummary';
import { CounsellingForm } from '../CounsellingForm';
import { TRANSLATIONS } from '../../constants/mp_data';
import { DialogFooter } from './DialogFooter';

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
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden border-none shadow-none flex flex-col gap-0 rounded-none z-[100]" showCloseButton={false}>
        <div className="flex flex-col flex-1 h-full bg-white overflow-hidden relative">
          {/* Compressed Custom Header */}
          <div className="bg-neutral-900 text-white py-2 px-4 md:px-6 flex shrink-0 flex-row items-center justify-between border-b border-white/5">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 overflow-hidden">
              <DialogTitle className="text-base md:text-lg font-bold tracking-tight truncate">{patient?.name || title}</DialogTitle>
              <div className="hidden md:block h-3 w-px bg-white/20" />
              <p className="text-neutral-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate">
                {subtitle || (lang === 'en' ? "Patient Record" : "मरीज रिकॉर्ड")}
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
              <div className="px-4 md:px-8 py-1.5 bg-neutral-50/50 border-b border-neutral-100 flex items-center justify-between overflow-x-auto scrollbar-hide">
                <TabsList className="flex gap-1.5 md:gap-2 rounded-full h-auto bg-neutral-200/50 p-1 border-none justify-start w-fit flex-nowrap">
                  <TabsTrigger value="summary" className="rounded-full data-active:bg-white data-active:text-primary data-active:shadow-sm bg-transparent transition-all font-bold px-4 md:px-5 py-1.5 md:py-2 text-[10px] md:text-xs whitespace-nowrap uppercase tracking-wider">
                    {lang === 'en' ? "Summary" : "सारांश"}
                  </TabsTrigger>
                  <TabsTrigger value="form" className="rounded-full data-active:bg-white data-active:text-primary data-active:shadow-sm bg-transparent transition-all font-bold px-4 md:px-5 py-1.5 md:py-2 text-[10px] md:text-xs whitespace-nowrap uppercase tracking-wider">
                    {lang === 'en' ? "Details" : "विवरण"}
                  </TabsTrigger>
                  {actionContent && (
                    <TabsTrigger value="action" className="rounded-full data-active:bg-white data-active:text-primary data-active:shadow-sm bg-transparent transition-all font-bold px-4 md:px-5 py-1.5 md:py-2 text-[10px] md:text-xs whitespace-nowrap uppercase tracking-wider">
                      {actionTabTitle || (lang === 'en' ? "Action" : "कार्रवाई")}
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-neutral-50/30">
                <div className="max-w-7xl mx-auto space-y-3 md:space-y-4 pb-40 md:pb-24">
                  <TabsContent value="summary" className="focus-visible:outline-none mt-0">
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

          {actions && <DialogFooter>{actions}</DialogFooter>}
        </div>
      </DialogContent>
    </Dialog>
  );
}


import { PatientMaster } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { History, Check } from 'lucide-react';

interface AutoFillDiffProps {
  existingRecord: PatientMaster;
  lang: 'en' | 'hi';
  onAcceptAll: () => void;
  onDismiss: () => void;
}

export function AutoFillDiff({ existingRecord, lang, onAcceptAll, onDismiss }: AutoFillDiffProps) {
  const fields = [
    { key: 'name', label: lang === 'en' ? 'Name' : 'नाम', value: existingRecord.name },
    { key: 'age', label: lang === 'en' ? 'Age' : 'आयु', value: `${existingRecord.age} ${lang === 'en' ? 'years' : 'साल'}` },
    { key: 'gender', label: lang === 'en' ? 'Gender' : 'लिंग', value: existingRecord.gender },
    { key: 'district', label: lang === 'en' ? 'District' : 'जिला', value: existingRecord.district },
    { key: 'village', label: lang === 'en' ? 'Village' : 'गाँव', value: existingRecord.village || 'N/A' },
    { key: 'status', label: lang === 'en' ? 'Sickle Cell Status' : 'सिकल सेल स्थिति', value: existingRecord.sickle_cell_status },
  ];

  return (
    <div className="bg-blue-50/60 border border-blue-200/80 rounded-3xl p-4 md:p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950">
              {lang === 'en' ? "Returning Patient Detected" : "पुराना मरीज मिला"}
            </h4>
            <p className="text-[11px] text-blue-700">
              {lang === 'en' ? "Master record found matching identity fields." : "पहचान विवरण से मेल खाता मास्टर रिकॉर्ड मिला।"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 font-black text-[10px]">
          {lang === 'en' ? "Historical Data" : "ऐतिहासिक डेटा"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/60 p-3 rounded-2xl border border-blue-100/50">
        {fields.map(f => (
          <div key={f.key} className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
              {f.label}
            </span>
            <span className="text-xs font-bold text-neutral-800 block truncate">
              {f.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onDismiss}
          className="text-xs font-bold text-neutral-500 hover:text-neutral-900"
        >
          {lang === 'en' ? "Keep Current Entries" : "वर्तमान प्रविष्टियाँ रखें"}
        </Button>
        <Button 
          size="sm"
          onClick={onAcceptAll}
          className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 gap-1.5 px-4"
        >
          <Check className="w-3.5 h-3.5" />
          {lang === 'en' ? "Load Master Record" : "मास्टर रिकॉर्ड लोड करें"}
        </Button>
      </div>
    </div>
  );
}

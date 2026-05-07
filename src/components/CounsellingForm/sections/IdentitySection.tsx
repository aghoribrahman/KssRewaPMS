import * as React from 'react';
import { Patient } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '../../ImageUpload';
import { MADHYA_PRADESH_DISTRICTS, TRANSLATIONS } from '../../../constants/mp_data';
import { User, Info } from 'lucide-react';

interface SectionProps {
  data: Partial<Patient>;
  onChange: (field: keyof Patient, value: any) => void;
  lang: 'en' | 'hi';
  readOnly?: boolean;
}

const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

export function IdentitySection({ data, onChange, lang, readOnly }: SectionProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest px-4">
        <User className="w-4 h-4" /> 1. {t.fullName} & {t.contact}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">{lang === 'en' ? 'Patient Photograph' : 'मरीज की फोटो'}</Label>
          <ImageUpload 
            folder="patients" 
            onUploadComplete={(url) => onChange('registrar_image_url', url)}
            label={lang === 'en' ? 'Capture Photo' : 'फोटो लें'}
          />
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
              <Info className="w-3 h-3" /> Quick Guidance
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">
              Ensure the patient's face is clearly visible. This photo helps in future identification.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
              <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">{t.basicInfo}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="patient-name" className="text-xs font-black uppercase tracking-widest text-neutral-400">{t.fullName} <RequiredBadge /></Label>
                <Input 
                  id="patient-name"
                  value={data.name || ''} 
                  onChange={(e) => onChange('name', e.target.value)} 
                  disabled={readOnly}
                  placeholder="e.g. Rahul Kumar"
                  className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="patient-age" className="text-xs font-black uppercase tracking-widest text-neutral-400">{t.age} <RequiredBadge /></Label>
                  <Input 
                    id="patient-age"
                    type="number"
                    value={data.age || ''} 
                    onChange={(e) => onChange('age', parseInt(e.target.value))} 
                    disabled={readOnly}
                    placeholder="Years"
                    className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Gender</Label>
                  <Select value={data.gender || ''} onValueChange={(val) => onChange('gender', val)} disabled={readOnly}>
                    <SelectTrigger className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-neutral-100">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Mobile Number <RequiredBadge /></Label>
                <Input 
                  value={data.contact || ''} 
                  onChange={(e) => onChange('contact', e.target.value)} 
                  disabled={readOnly}
                  placeholder="10-digit number"
                  maxLength={10}
                  className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">ABHA ID / Aadhaar</Label>
                <Input 
                  value={data.abha_id || ''} 
                  onChange={(e) => onChange('abha_id', e.target.value)} 
                  disabled={readOnly}
                  placeholder="Identification Number"
                  className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
              <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Location Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">District <RequiredBadge /></Label>
                  <Select value={data.district || ''} onValueChange={(val) => onChange('district', val)} disabled={readOnly}>
                    <SelectTrigger className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-neutral-100">
                      {MADHYA_PRADESH_DISTRICTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Block / Tehsil</Label>
                  <Input 
                    value={data.block || ''} 
                    onChange={(e) => onChange('block', e.target.value)} 
                    disabled={readOnly}
                    placeholder="e.g. Rewa"
                    className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Village</Label>
                  <Input 
                    value={data.village || ''} 
                    onChange={(e) => onChange('village', e.target.value)} 
                    disabled={readOnly}
                    placeholder="Village name"
                    className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Postal Address</Label>
                  <Input 
                    value={data.address || ''} 
                    onChange={(e) => onChange('address', e.target.value)} 
                    disabled={readOnly}
                    placeholder="House no, Street"
                    className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '../../ImageUpload';
import { MADHYA_PRADESH_DISTRICTS, TRANSLATIONS } from '../../../constants/mp_data';
import { User, Info } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { PatientFormData } from '../../../lib/schemas';

interface SectionProps {
  lang: 'en' | 'hi';
  readOnly?: boolean;
}

const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

export function IdentitySection({ lang, readOnly }: SectionProps) {
  const t = TRANSLATIONS[lang];
  const { register, control, formState: { errors } } = useFormContext<PatientFormData>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest px-4">
        <User className="w-4 h-4" /> 1. {t.fullName} & {t.contact}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">{lang === 'en' ? 'Patient Photograph' : 'मरीज की फोटो'}</Label>
          <Controller
            name="registrar_image_url"
            control={control}
            render={({ field }) => (
              <ImageUpload 
                folder="patients" 
                onUploadComplete={field.onChange}
                label={lang === 'en' ? 'Capture Photo' : 'फोटो लें'}
                readOnly={readOnly}
              />
            )}
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
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-neutral-400">{t.fullName} <RequiredBadge /></Label>
                <Input 
                  id="name"
                  {...register('name')}
                  disabled={readOnly}
                  placeholder="e.g. Rahul Kumar"
                  className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-neutral-400">{t.age} <RequiredBadge /></Label>
                  <Input 
                    id="age"
                    type="number"
                    {...register('age')}
                    disabled={readOnly}
                    placeholder="Years"
                    className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.age ? 'border-red-500' : ''}`}
                  />
                  {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Gender <RequiredBadge /></Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                        <SelectTrigger className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.gender ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-neutral-100">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Mobile Number <RequiredBadge /></Label>
                <Input 
                  {...register('contact')}
                  disabled={readOnly}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.contact ? 'border-red-500' : ''}`}
                />
                {errors.contact && <p className="text-xs text-red-500">{errors.contact.message}</p>}
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">ABHA ID / Aadhaar</Label>
                <Input 
                  {...register('abha_id')}
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
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                        <SelectTrigger className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.district ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-neutral-100">
                          {MADHYA_PRADESH_DISTRICTS.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.district && <p className="text-xs text-red-500">{errors.district.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Block / Tehsil <RequiredBadge /></Label>
                  <Input 
                    {...register('block')}
                    disabled={readOnly}
                    placeholder="e.g. Rewa"
                    className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.block ? 'border-red-500' : ''}`}
                  />
                  {errors.block && <p className="text-xs text-red-500">{errors.block.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Village <RequiredBadge /></Label>
                  <Input 
                    {...register('village')}
                    disabled={readOnly}
                    placeholder="Village name"
                    className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.village ? 'border-red-500' : ''}`}
                  />
                  {errors.village && <p className="text-xs text-red-500">{errors.village.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Postal Address <RequiredBadge /></Label>
                  <Input 
                    {...register('address')}
                    disabled={readOnly}
                    placeholder="House no, Street"
                    className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.address ? 'border-red-500' : ''}`}
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

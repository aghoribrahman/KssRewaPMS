import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '../../ImageUpload';
import { MADHYA_PRADESH_DISTRICTS, TRANSLATIONS } from '../../../constants/mp_data';
import { User, Info, MapPin } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { PatientFormData } from '../../../lib/schemas';

interface SectionProps {
  lang: 'en' | 'hi';
  readOnly?: boolean;
  disabledFields?: any[];
  hiddenFields?: any[];
}

const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

export function IdentitySection({ lang, readOnly, disabledFields = [] }: SectionProps) {
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
          <Card className="rounded-2xl border-none shadow-lg shadow-neutral-200/40 overflow-hidden bg-white">
            <div className="h-1.5 bg-primary w-full" />
            <CardContent className="p-4 space-y-4 md:space-y-5">
              <div className="flex items-center gap-2.5 mb-1 md:mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-neutral-900 tracking-tight">{lang === 'en' ? "Basic Identity" : "बुनियादी पहचान"}</h3>
                  <p className="text-[10px] md:text-[11px] text-neutral-500">{lang === 'en' ? "Personal details and identification" : "व्यक्तिगत विवरण और पहचान"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Full Name <RequiredBadge /></Label>
                  <Input 
                    {...register('name')} 
                    disabled={readOnly || disabledFields.includes('name')}
                    placeholder="e.g. Rahul Sharma" 
                    className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.name.message as string}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Contact Number <RequiredBadge /></Label>
                  <Input 
                    {...register('contact')} 
                    disabled={readOnly || disabledFields.includes('contact')}
                    placeholder="10-digit mobile number" 
                    className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.contact ? 'border-red-500' : ''}`}
                  />
                  {errors.contact && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.contact.message as string}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Age <RequiredBadge /></Label>
                    <Input 
                      type="number" 
                      {...register('age', { valueAsNumber: true })} 
                      disabled={readOnly}
                      placeholder="Years" 
                      className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.age ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Gender <RequiredBadge /></Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                          <SelectTrigger className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.gender ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">ABHA ID</Label>
                    <Input 
                      {...register('abha_id')}
                      disabled={readOnly || disabledFields.includes('abha_id')}
                      placeholder="ABHA Number"
                      className="rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Aadhaar Number</Label>
                    <Input 
                      {...register('aadhar_number')}
                      disabled={readOnly || disabledFields.includes('aadhar_number')}
                      placeholder="12-digit Aadhaar"
                      className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.aadhar_number ? 'border-red-500' : ''}`}
                    />
                    {errors.aadhar_number && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.aadhar_number.message as string}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-neutral-50">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-neutral-900 tracking-tight">{lang === 'en' ? "Location Details" : "स्थान का विवरण"}</h3>
                  <p className="text-[10px] md:text-[11px] text-neutral-500">{lang === 'en' ? "Address and district mapping" : "पता और जिला मानचित्रण"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">District <RequiredBadge /></Label>
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={readOnly || disabledFields.includes('district')}>
                        <SelectTrigger className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.district ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {MADHYA_PRADESH_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Block / Tehsil <RequiredBadge /></Label>
                  <Input 
                    {...register('block')}
                    disabled={readOnly || disabledFields.includes('block')}
                    placeholder="e.g. Rewa"
                    className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.block ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Village <RequiredBadge /></Label>
                  <Input 
                    {...register('village')}
                    disabled={readOnly || disabledFields.includes('village')}
                    placeholder="Village name"
                    className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.village ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Postal Address <RequiredBadge /></Label>
                  <Input 
                    {...register('address')}
                    disabled={readOnly || disabledFields.includes('address')}
                    placeholder="House no, Street"
                    className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.address ? 'border-red-500' : ''}`}
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

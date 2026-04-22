import * as React from 'react';
import { Patient, SickleCellStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from './ImageUpload';
import { MADHYA_PRADESH_DISTRICTS } from '../constants/mp_data';
import { Button } from '@/components/ui/button';
import { User, Activity, ClipboardCheck, Info, FileText, MapPin } from 'lucide-react';

interface CounsellingFormProps {
  data: Partial<Patient>;
  onChange: (data: Partial<Patient>) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  readOnly?: boolean;
}

export function CounsellingForm({ 
  data, 
  onChange, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Confirm Registration',
  cancelLabel = 'Cancel',
  readOnly = false 
}: CounsellingFormProps) {
  const handleChange = (field: keyof Patient, value: any) => {
    if (readOnly) return;
    onChange({ ...data, [field]: value });
  };

  const handleCheckboxChange = (field: 'symptoms' | 'counselling_topics' | 'referral', value: string, checked: boolean) => {
    if (readOnly) return;
    const current = (data[field] as string[]) || [];
    if (checked) {
      onChange({ ...data, [field]: [...current, value] });
    } else {
      onChange({ ...data, [field]: current.filter((item) => item !== value) });
    }
  };

  const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

  return (
    <div className="space-y-12 w-full pb-12">
      {/* 1. IDENTITY & CONTACT */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest px-4">
          <User className="w-4 h-4" /> 1. Identity & Contact
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Patient Photograph</Label>
              <ImageUpload 
                folder="patients" 
                onUploadComplete={(url) => handleChange('registrar_image_url', url)}
                label="Capture Photo"
              />
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Info className="w-3 h-3" /> Quick Guidance
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Ensure the patient's face is clearly visible. This photo helps in future identification at the hospital.
                </p>
              </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
              <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
                <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Full Name <RequiredBadge /></Label>
                  <Input 
                    value={data.name || ''} 
                    onChange={(e) => handleChange('name', e.target.value)} 
                    disabled={readOnly}
                    placeholder="e.g. Rahul Kumar"
                    className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Age <RequiredBadge /></Label>
                    <Input 
                      type="number"
                      value={data.age || ''} 
                      onChange={(e) => handleChange('age', parseInt(e.target.value))} 
                      disabled={readOnly}
                      placeholder="Years"
                      className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Gender</Label>
                    <Select 
                      value={data.gender || ''} 
                      onValueChange={(val) => handleChange('gender', val)}
                      disabled={readOnly}
                    >
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
                    onChange={(e) => handleChange('contact', e.target.value)} 
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
                    onChange={(e) => handleChange('abha_id', e.target.value)} 
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
                    <Select 
                      value={data.district || ''} 
                      onValueChange={(val) => handleChange('district', val)}
                      disabled={readOnly}
                    >
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
                      onChange={(e) => handleChange('block', e.target.value)} 
                      disabled={readOnly}
                      placeholder="e.g. Rewa"
                      className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Village</Label>
                    <Input 
                      value={data.village || ''} 
                      onChange={(e) => handleChange('village', e.target.value)} 
                      disabled={readOnly}
                      placeholder="Village name"
                      className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Postal Address</Label>
                    <Input 
                      value={data.address || ''} 
                      onChange={(e) => handleChange('address', e.target.value)} 
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

      {/* 2. MEDICAL DATA */}
      <div className="space-y-6 pt-6 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest px-4">
          <Activity className="w-4 h-4" /> 2. Medical Data
        </div>
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
              <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Clinical Diagnosis</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Sickle Cell Status <RequiredBadge /></Label>
                <RadioGroup 
                  value={data.sickle_cell_status || ''} 
                  onValueChange={(val) => handleChange('sickle_cell_status', val as SickleCellStatus)}
                  disabled={readOnly}
                  className="flex flex-wrap gap-6"
                >
                  {['SS', 'AS', 'AA'].map(status => (
                    <div key={status} className="flex items-center space-x-3 p-4 px-6 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-all cursor-pointer">
                      <RadioGroupItem value={status} id={status} className="w-5 h-5 border-2 border-primary" />
                      <Label htmlFor={status} className="font-black text-lg cursor-pointer text-neutral-800">{status}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-neutral-100">
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Pre-existing Diagnosis?</Label>
                  <RadioGroup 
                    value={data.pre_existing_diagnosis ? 'yes' : 'no'} 
                    onValueChange={(val) => handleChange('pre_existing_diagnosis', val === 'yes')}
                    disabled={readOnly}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="diag-yes" className="w-5 h-5" />
                      <Label htmlFor="diag-yes" className="font-bold text-neutral-700">Yes, already diagnosed</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="diag-no" className="w-5 h-5" />
                      <Label htmlFor="diag-no" className="font-bold text-neutral-700">No, first time</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Date of Diagnosis (if known)</Label>
                  <Input 
                    type="date"
                    value={data.date_of_diagnosis || ''} 
                    onChange={(e) => handleChange('date_of_diagnosis', e.target.value)} 
                    disabled={readOnly || !data.pre_existing_diagnosis}
                    className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
              <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Symptoms & History</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Current Physical Symptoms</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    'Bone / Joint Pain',
                    'Recurring Fever',
                    'Difficulty Breathing',
                    'Yellowish Eyes/Skin',
                    'Fatigue / Weakness'
                  ].map((symptom) => (
                    <div key={symptom} className={`flex items-center space-x-4 p-5 rounded-2xl transition-all duration-300 border-2 ${
                      data.symptoms?.includes(symptom) 
                      ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' 
                      : 'bg-neutral-50 border-transparent hover:border-neutral-200'
                    }`}>
                      <Checkbox 
                        id={symptom} 
                        checked={!!(data.symptoms?.includes(symptom))}
                        onCheckedChange={(checked) => handleCheckboxChange('symptoms', symptom, !!checked)}
                        disabled={readOnly}
                        className="w-5 h-5 rounded-md"
                      />
                      <Label htmlFor={symptom} className="cursor-pointer text-sm font-bold text-neutral-800">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-neutral-100">
                <div className="space-y-4">
                   <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Previous Hospitalizations?</Label>
                   <RadioGroup 
                    value={data.previous_hospitalizations ? 'yes' : 'no'} 
                    onValueChange={(val) => handleChange('previous_hospitalizations', val === 'yes')}
                    disabled={readOnly}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="hosp-yes" className="w-5 h-5" />
                      <Label htmlFor="hosp-yes" className="font-bold text-neutral-700">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="hosp-no" className="w-5 h-5" />
                      <Label htmlFor="hosp-no" className="font-bold text-neutral-700">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Blood Transfusions (approx count)</Label>
                  <Input 
                    type="number"
                    value={data.blood_transfusions_count || 0} 
                    onChange={(e) => handleChange('blood_transfusions_count', parseInt(e.target.value))} 
                    disabled={readOnly}
                    className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. SUPPORT & FEEDBACK */}
      <div className="space-y-6 pt-6 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest px-4">
          <ClipboardCheck className="w-4 h-4" /> 3. Support & Feedback
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
              <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Counselling & Kits</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="space-y-6">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Topics Discussed</Label>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {[
                    'Basic information on SCD',
                    'Symptom identification',
                    'Importance of Diet',
                    'Regular check-ups',
                    'Medication regularity',
                    'Nutrition Kit instructions'
                  ].map((topic) => (
                    <div key={topic} className={`flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                      data.counselling_topics?.includes(topic) ? 'bg-primary/5' : 'hover:bg-neutral-50'
                    }`}>
                      <Checkbox 
                        id={topic} 
                        checked={!!(data.counselling_topics?.includes(topic))}
                        onCheckedChange={(checked) => handleCheckboxChange('counselling_topics', topic, !!checked)}
                        disabled={readOnly}
                        className="w-5 h-5 rounded-md"
                      />
                      <Label htmlFor={topic} className="text-sm font-bold text-neutral-700 cursor-pointer">{topic}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-100 flex items-center justify-between">
                 <div className="space-y-1">
                    <Label className="text-base font-black text-neutral-900">Meal Box Required?</Label>
                    <p className="text-xs text-neutral-500 font-medium">Add patient to the distribution queue</p>
                 </div>
                 <Checkbox 
                    id="meal-req" 
                    checked={!!data.meal_required}
                    onCheckedChange={(checked) => handleChange('meal_required', !!checked)}
                    disabled={readOnly}
                    className="w-8 h-8 rounded-xl border-2"
                  />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
              <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Feedback & Concerns</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Specific Concerns or Questions</Label>
                <Textarea 
                  value={data.specific_concerns || ''} 
                  onChange={(e) => handleChange('specific_concerns', e.target.value)} 
                  disabled={readOnly}
                  placeholder="Enter any questions patient had..."
                  className="rounded-2xl min-h-[160px] border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium p-6 resize-none"
                />
              </div>
              <div className="flex items-center space-x-4 p-6 bg-primary/5 border border-primary/10 rounded-[2rem]">
                <Checkbox 
                  id="feed-confirm" 
                  checked={!!data.feedback_confirmation}
                  onCheckedChange={(checked) => handleChange('feedback_confirmation', !!checked)}
                  disabled={readOnly}
                  className="w-6 h-6 rounded-lg"
                />
                <Label htmlFor="feed-confirm" className="text-sm font-bold text-primary leading-snug cursor-pointer">
                  Patient/Guardian confirms they understood all medical and dietary instructions provided.
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. ACTIONS */}
      {!readOnly && (onSubmit || onCancel) && (
        <div className="flex justify-end gap-3 pt-12 border-t border-neutral-100">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="rounded-xl h-12 px-8 text-sm font-bold border-neutral-200 hover:bg-neutral-50"
            >
              {cancelLabel}
            </Button>
          )}
          {onSubmit && (
            <Button 
              onClick={onSubmit} 
              className="rounded-xl h-12 px-10 text-sm font-bold shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}


import * as React from 'react';
import { Patient, SickleCellStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MADHYA_PRADESH_DISTRICTS } from '../constants/mp_data';

interface CounsellingFormProps {
  data: Partial<Patient>;
  onChange: (data: Partial<Patient>) => void;
  readOnly?: boolean;
}

export function CounsellingForm({ data, onChange, readOnly = false }: CounsellingFormProps) {
  const handleChange = (field: keyof Patient, value: any) => {
    if (readOnly) return;
    onChange({ ...data, [field]: value });
  };

  const handleCheckboxChange = (field: 'symptoms' | 'counsellingTopics' | 'referral', value: string, checked: boolean) => {
    if (readOnly) return;
    const current = (data[field] as string[]) || [];
    if (checked) {
      onChange({ ...data, [field]: [...current, value] });
    } else {
      onChange({ ...data, [field]: current.filter((item) => item !== value) });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. General Information */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">1. General Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Patient Name</Label>
            <Input 
              value={data.name || ''} 
              onChange={(e) => handleChange('name', e.target.value)} 
              disabled={readOnly}
              placeholder="Full Name"
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input 
                type="number"
                value={data.age || ''} 
                onChange={(e) => handleChange('age', parseInt(e.target.value))} 
                disabled={readOnly}
                placeholder="Years"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select 
                value={data.gender || ''} 
                onValueChange={(val) => handleChange('gender', val)}
                disabled={readOnly}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input 
              value={data.contact || ''} 
              onChange={(e) => handleChange('contact', e.target.value)} 
              disabled={readOnly}
              placeholder="+91-0000000000"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Identification Number (ABHA ID / Aadhaar)</Label>
            <Input 
              value={data.abhaId || data.aadharNumber || ''} 
              onChange={(e) => handleChange('abhaId', e.target.value)} 
              disabled={readOnly}
              placeholder="ABHA ID or Aadhaar"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>
            <Textarea 
              value={data.address || ''} 
              onChange={(e) => handleChange('address', e.target.value)} 
              disabled={readOnly}
              placeholder="Current Residence"
              className="rounded-xl resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <div className="space-y-2">
              <Label>District</Label>
              <Select 
                value={data.district || ''} 
                onValueChange={(val) => handleChange('district', val)}
                disabled={readOnly}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  {MADHYA_PRADESH_DISTRICTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Block</Label>
              <Input 
                value={data.block || ''} 
                onChange={(e) => handleChange('block', e.target.value)} 
                disabled={readOnly}
                placeholder="Block"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Village</Label>
              <Input 
                value={data.village || ''} 
                onChange={(e) => handleChange('village', e.target.value)} 
                disabled={readOnly}
                placeholder="Village"
                className="rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Medical Information */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">2. Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label>Sickle Cell Status</Label>
            <RadioGroup 
              value={data.sickleCellStatus || ''} 
              onValueChange={(val) => handleChange('sickleCellStatus', val as SickleCellStatus)}
              disabled={readOnly}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SS" id="ss" />
                <Label htmlFor="ss">SS (Positive)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AS" id="as" />
                <Label htmlFor="as">AS (Trait)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AA" id="aa" />
                <Label htmlFor="aa">AA (Negative)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
            <div className="space-y-3">
              <Label>Pre-existing Diagnosis?</Label>
              <RadioGroup 
                value={data.preExistingDiagnosis ? 'yes' : 'no'} 
                onValueChange={(val) => handleChange('preExistingDiagnosis', val === 'yes')}
                disabled={readOnly}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="diag-yes" />
                  <Label htmlFor="diag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="diag-no" />
                  <Label htmlFor="diag-no">No</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Date of Diagnosis (if Yes)</Label>
              <Input 
                type="date"
                value={data.dateOfDiagnosis || ''} 
                onChange={(e) => handleChange('dateOfDiagnosis', e.target.value)} 
                disabled={readOnly || !data.preExistingDiagnosis}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label>Previous Reports Attached?</Label>
              <RadioGroup 
                value={data.reportsAttached ? 'yes' : 'no'} 
                onValueChange={(val) => handleChange('reportsAttached', val === 'yes')}
                disabled={readOnly}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="reports-yes" />
                  <Label htmlFor="reports-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="reports-no" />
                  <Label htmlFor="reports-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Medical History */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">3. Medical History</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Onset of First Symptoms</Label>
            <Input 
              type="date"
              value={data.firstSymptomOnset || ''} 
              onChange={(e) => handleChange('firstSymptomOnset', e.target.value)} 
              disabled={readOnly}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-3">
            <Label>Previous Hospitalizations?</Label>
            <RadioGroup 
              value={data.previousHospitalizations ? 'yes' : 'no'} 
              onValueChange={(val) => handleChange('previousHospitalizations', val === 'yes')}
              disabled={readOnly}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="hosp-yes" />
                <Label htmlFor="hosp-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="hosp-no" />
                <Label htmlFor="hosp-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Number of Blood Transfusions</Label>
            <Input 
              type="number"
              value={data.bloodTransfusionsCount || 0} 
              onChange={(e) => handleChange('bloodTransfusionsCount', parseInt(e.target.value))} 
              disabled={readOnly}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Other Health Issues</Label>
            <Input 
              value={data.otherHealthIssues || ''} 
              onChange={(e) => handleChange('otherHealthIssues', e.target.value)} 
              disabled={readOnly}
              placeholder="e.g. Asthma, Diabetes"
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Present Symptoms */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">4. Present Symptoms</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Bone / Joint Pain',
              'Recurring Fever',
              'Difficulty Breathing',
              'Yellowish Discoloration of Eyes/Skin',
              'Fatigue / Weakness'
            ].map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox 
                  id={symptom} 
                  checked={!!(data.symptoms?.includes(symptom))}
                  onCheckedChange={(checked) => handleCheckboxChange('symptoms', symptom, !!checked)}
                  disabled={readOnly}
                />
                <Label htmlFor={symptom}>{symptom}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <Label>Other Symptoms</Label>
            <Input 
              value={data.otherSymptoms || ''} 
              onChange={(e) => handleChange('otherSymptoms', e.target.value)} 
              disabled={readOnly}
              placeholder="Describe if any"
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Current Medication & Treatment */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">5. Current Medication & Treatment</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hydroxyurea" 
                  checked={!!data.medicationHydroxyurea}
                  onCheckedChange={(checked) => handleChange('medicationHydroxyurea', !!checked)}
                  disabled={readOnly}
                />
                <Label htmlFor="hydroxyurea">Hydroxyurea</Label>
              </div>
              <Input 
                placeholder="Dosage" 
                value={data.dosageHydroxyurea || ''}
                onChange={(e) => handleChange('dosageHydroxyurea', e.target.value)}
                disabled={readOnly || !data.medicationHydroxyurea}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="folicacid" 
                  checked={!!data.medicationFolicAcid}
                  onCheckedChange={(checked) => handleChange('medicationFolicAcid', !!checked)}
                  disabled={readOnly}
                />
                <Label htmlFor="folicacid">Folic Acid</Label>
              </div>
              <Input 
                placeholder="Dosage" 
                value={data.dosageFolicAcid || ''}
                onChange={(e) => handleChange('dosageFolicAcid', e.target.value)}
                disabled={readOnly || !data.medicationFolicAcid}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Other Medications</Label>
            <Input 
              value={data.otherMedications || ''} 
              onChange={(e) => handleChange('otherMedications', e.target.value)} 
              disabled={readOnly}
              className="rounded-xl"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2 border-t border-neutral-100 mt-4">
            <Checkbox 
              id="regular-meds" 
              checked={!!data.medicationRegularity}
              onCheckedChange={(checked) => handleChange('medicationRegularity', !!checked)}
              disabled={readOnly}
            />
            <Label htmlFor="regular-meds">Are you taking medications regularly?</Label>
          </div>
        </CardContent>
      </Card>

      {/* 6. Diet & Lifestyle */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">6. Diet & Lifestyle</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label>Dietary Habit</Label>
            <RadioGroup 
              value={data.dietaryHabit || ''} 
              onValueChange={(val) => handleChange('dietaryHabit', val)}
              disabled={readOnly}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Balanced" id="bal" />
                <Label htmlFor="bal">Balanced</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Unbalanced" id="unbal" />
                <Label htmlFor="unbal">Unbalanced</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Daily Water Intake (Liters)</Label>
            <Input 
              value={data.dailyWaterIntake || ''} 
              onChange={(e) => handleChange('dailyWaterIntake', e.target.value)} 
              disabled={readOnly}
              placeholder="e.g. 3 Liters"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-3">
            <Label>Physical Activity / Exercise</Label>
            <RadioGroup 
              value={data.physicalActivity || ''} 
              onValueChange={(val) => handleChange('physicalActivity', val)}
              disabled={readOnly}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Regular" id="act-reg" />
                <Label htmlFor="act-reg">Regular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="None" id="act-none" />
                <Label htmlFor="act-none">None</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* 7. Counselling Topics */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">7. Counselling Topics Discussed</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Basic information on SCD',
              'Symptom identification & management',
              'Importance of Diet & Nutrition',
              'Pre-marital / Genetic Counselling',
              'Regular check-ups & Blood tests',
              'Importance of Medication (SCD specific)',
              'Vaccination (Pneumococcal / Influenza)',
              'Guidance on Hospital Care during crisis',
              'Information about the provided Nutrition Kit'
            ].map((topic) => (
              <div key={topic} className="flex items-center space-x-2">
                <Checkbox 
                  id={topic} 
                  checked={!!(data.counsellingTopics?.includes(topic))}
                  onCheckedChange={(checked) => handleCheckboxChange('counsellingTopics', topic, !!checked)}
                  disabled={readOnly}
                />
                <Label htmlFor={topic}>{topic}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 8. Nutrition Kit */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">8. Nutrition Kit Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Kit Distributed?</Label>
            <RadioGroup 
              value={data.nutritionKitDistributed ? 'yes' : 'no'} 
              onValueChange={(val) => handleChange('nutritionKitDistributed', val === 'yes')}
              disabled={readOnly}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="kit-yes" />
                <Label htmlFor="kit-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="kit-no" />
                <Label htmlFor="kit-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Date of Distribution</Label>
            <Input 
              type="date"
              value={data.nutritionKitDate || ''} 
              onChange={(e) => handleChange('nutritionKitDate', e.target.value)} 
              disabled={readOnly || !data.nutritionKitDistributed}
              className="rounded-xl"
            />
          </div>
          <div className="flex items-center space-x-2 md:col-span-2 pt-4 border-t border-neutral-100">
            <Checkbox 
              id="meal-req" 
              checked={!!data.mealRequired}
              onCheckedChange={(checked) => handleChange('mealRequired', !!checked)}
              disabled={readOnly}
            />
            <Label htmlFor="meal-req" className="font-bold text-primary">Meal Box Required for this Visit?</Label>
          </div>
          <div className="flex items-center space-x-2 md:col-span-2">
            <Checkbox 
              id="kit-guide" 
              checked={!!data.nutritionKitInstructionsProvided}
              onCheckedChange={(checked) => handleChange('nutritionKitInstructionsProvided', !!checked)}
              disabled={readOnly}
            />
            <Label htmlFor="kit-guide">Instructions on Use of Kit Contents Provided?</Label>
          </div>
        </CardContent>
      </Card>

      {/* 9. Referral */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">9. Referral (if Required)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-6">
            {[
              'Laboratory / Pathological Tests',
              'Hospital Admission (Crisis Management)',
              'Specialist Consultation'
            ].map((ref) => (
              <div key={ref} className="flex items-center space-x-2">
                <Checkbox 
                  id={ref} 
                  checked={!!(data.referral?.includes(ref))}
                  onCheckedChange={(checked) => handleCheckboxChange('referral', ref, !!checked)}
                  disabled={readOnly}
                />
                <Label htmlFor={ref}>{ref}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 10. Feedback */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">10. Feedback & Understanding</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="feed-confirm" 
              checked={!!data.feedbackConfirmation}
              onCheckedChange={(checked) => handleChange('feedbackConfirmation', !!checked)}
              disabled={readOnly}
            />
            <Label htmlFor="feed-confirm">I (Patient/Guardian) have understood the information and instructions provided during the session.</Label>
          </div>
          <div className="space-y-2">
            <Label>Specific Concerns or Questions</Label>
            <Textarea 
              value={data.specificConcerns || ''} 
              onChange={(e) => handleChange('specificConcerns', e.target.value)} 
              disabled={readOnly}
              className="rounded-xl resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* 11. Counsellor Details */}
      <Card className="rounded-2xl shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-bold text-neutral-800">11. Counsellor Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Name of Counsellor</Label>
            <Input 
              value={data.counsellorName || ''} 
              onChange={(e) => handleChange('counsellorName', e.target.value)} 
              disabled={readOnly}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input 
              value={data.counsellorDesignation || ''} 
              onChange={(e) => handleChange('counsellorDesignation', e.target.value)} 
              disabled={readOnly}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Organization (Default: Kiran Sewa Sansthan)</Label>
            <Input 
              value={data.counsellorOrganization || 'Kiran Sewa Sansthan'} 
              onChange={(e) => handleChange('counsellorOrganization', e.target.value)} 
              disabled={readOnly}
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import * as React from 'react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Key } from 'lucide-react';
import { UserRole } from '../../types';
import { DistrictSelector } from '../shared/DistrictSelector';

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'registrar' as UserRole,
    districts: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.displayName) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName,
            role: formData.role,
            assigned_districts: formData.districts,
          }
        }
      });

      if (error) throw error;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user?.id,
          email: formData.email,
          display_name: formData.displayName,
          role: formData.role,
          assigned_districts: formData.districts,
          preferred_language: 'en'
        });

      if (profileError) {
        // If profile exists, update it
        await supabase
          .from('profiles')
          .update({
            display_name: formData.displayName,
            role: formData.role,
            assigned_districts: formData.districts,
          })
          .eq('id', data.user?.id);
      }

      toast.success(`User ${formData.displayName} created! Password: ${formData.password}`);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDistrict = (district: string) => {
    setFormData(prev => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter(d => d !== district)
        : [...prev.districts, district]
    }));
  };

  return (
    <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40 overflow-hidden mb-8">
      <CardHeader className="bg-neutral-900 text-white p-8">
        <CardTitle className="text-2xl flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          New Staff Provisioning
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Credentials created here allow secure login. 
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleAddUser} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input 
                id="displayName" 
                placeholder="e.g. Dr. Ramesh Kumar" 
                className="rounded-xl h-12"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="staff@mphealth.gov.in" 
                className="rounded-xl h-12"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Login Password</Label>
              <div className="flex gap-2">
                <Input 
                  id="password" 
                  type="text" 
                  placeholder="Minimum 8 characters" 
                  className="rounded-xl h-12 flex-1"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <Button type="button" onClick={generatePassword} variant="outline" className="h-12 rounded-xl px-3 border-dashed">
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>System Role</Label>
              <Select value={formData.role} onValueChange={(val: UserRole) => setFormData({...formData, role: val})}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registrar">Registrar (Intake)</SelectItem>
                  <SelectItem value="consultant">Consultant (Clinical)</SelectItem>
                  <SelectItem value="meal_distributor">Meal Distributor (Kitchen)</SelectItem>
                  <SelectItem value="admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned District Reach</Label>
              <DistrictSelector 
                selectedDistricts={formData.districts}
                onToggle={toggleDistrict}
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-14 rounded-2xl">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-[2] h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                {submitting ? "Processing..." : "Create Account"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

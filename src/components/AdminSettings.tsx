import { useState, useEffect } from 'react';
import * as React from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Settings, Shield, MapPin, Key, Trash2, User as UserIcon, Check } from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { MADHYA_PRADESH_DISTRICTS } from '../constants/mp_data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { buttonVariants } from './ui/button';

export default function AdminSettings() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'registrar' as UserRole,
    districts: [] as string[]
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('profiles-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

    try {
      // Note: In Supabase, signUp will create the user. 
      // If we are already logged in as admin, this might sign us out depending on config.
      // A better way is using an Edge Function, but for this migration we'll try signUp.
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

      // The profile will be created via database trigger or we can manually insert if needed.
      // Assuming a trigger handles profile creation from auth.users.
      // If not, we manually insert:
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
        console.error("Profile creation error:", profileError);
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

      toast.success(`User ${formData.displayName} created successfully! Password: ${formData.password}`);
      setIsAdding(false);
      setFormData({
        email: '',
        password: '',
        displayName: '',
        role: 'registrar',
        districts: []
      });
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create user");
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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            User Management
          </h2>
          <p className="text-neutral-500">Add staff, assign roles, and manage access control.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <UserPlus className="w-4 h-4" />
          {isAdding ? "Cancel" : "Add New Staff"}
        </Button>
      </div>

      {isAdding && (
        <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40 overflow-hidden">
          <CardHeader className="bg-neutral-900 text-white p-8">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              New Staff Provisioning
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Credentials created here allow secure login. 
              <span className="block mt-2 text-primary/80 font-medium">
                Note: Ensure "Email/Password" is ENABLED in your Supabase Auth settings.
              </span>
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
                  <Popover>
                    <PopoverTrigger className={buttonVariants({ variant: 'outline', className: "w-full h-12 rounded-xl justify-between px-4 border" })}>
                      <span className="text-neutral-500 font-normal">
                        {formData.districts.length === 0 
                          ? "Selecting Districts..." 
                          : `${formData.districts.length} Districts Selected`}
                      </span>
                      <MapPin className="w-4 h-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-neutral-100" align="start">
                       <div className="p-3 border-b bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                         Madhya Pradesh Districts
                       </div>
                       <div className="max-h-[300px] overflow-y-auto p-2">
                         {MADHYA_PRADESH_DISTRICTS.map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleDistrict(d)}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-neutral-50 font-medium"
                            >
                              {d}
                              {formData.districts.includes(d) && <Check className="w-4 h-4 text-primary" />}
                            </button>
                         ))}
                       </div>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.districts.slice(0, 5).map(d => (
                      <Badge key={d} variant="secondary" className="rounded-full font-normal bg-neutral-100">{d}</Badge>
                    ))}
                    {formData.districts.length > 5 && <Badge variant="secondary" className="rounded-full font-normal">+{formData.districts.length - 5} more</Badge>}
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                    Create Staff Account
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40">
        <CardHeader className="p-8 border-b border-neutral-100">
          <CardTitle className="text-xl">Authenticated Personnel</CardTitle>
          <CardDescription>Reviewing current access levels across the health network.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/50">
                  <TableHead className="pl-8 py-4">User</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead>District Coverage</TableHead>
                  <TableHead className="pr-8 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-neutral-50/50 group">
                    <TableCell className="pl-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                          <UserIcon className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 leading-none mb-1">{u.display_name}</p>
                          <p className="text-xs text-neutral-500">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-full border-none font-bold text-[10px] uppercase tracking-wider py-1 px-3 bg-primary/10 text-primary shadow-none">
                        {u.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {u.assigned_districts?.length === 0 ? (
                           <span className="text-[10px] text-neutral-400 italic">Statewide Access</span>
                        ) : (
                          u.assigned_districts?.slice(0, 2).map(d => (
                            <Badge key={d} variant="outline" className="rounded-full font-normal border-neutral-200 text-[10px]">{d}</Badge>
                          ))
                        )}
                        {u.assigned_districts && u.assigned_districts.length > 2 && (
                          <Badge variant="outline" className="rounded-full font-normal border-neutral-200 text-[10px]">+{u.assigned_districts.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <div className="flex items-center justify-end gap-2 text-green-500 font-bold text-[10px] uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Active
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {loading && (
            <div className="p-20 text-center text-neutral-400">
              <p>Fetching user directory...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


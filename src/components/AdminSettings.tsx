import { useState, useEffect } from 'react';
import * as React from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
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

// Function to get a separate Firebase app for user creation (to avoid logging out admin)
function getSecondaryAuth() {
  let secondaryApp: FirebaseApp;
  try {
    secondaryApp = getApp('SecondaryApp');
  } catch (e) {
    secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
  }
  return getAuth(secondaryApp);
}

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

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(data);
      setLoading(false);
    });
    return unsubscribe;
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

    const secondaryAuth = getSecondaryAuth();
    
    try {
      // 1. Create the user in Firebase Auth using the secondary app
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );
      
      const newUser = userCredential.user;

      // 2. Update their display name in Auth
      await updateProfile(newUser, { displayName: formData.displayName });

      // 3. Create their profile in Firestore
      const userProfile: UserProfile = {
        uid: newUser.uid,
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        assignedDistricts: formData.districts,
        preferredLanguage: 'en'
      };

      await setDoc(doc(db, 'users', newUser.uid), userProfile);

      // 4. Sign out from secondary app to cleanup
      await signOut(secondaryAuth);

      toast.success(`User ${formData.displayName} created successfully! Password: ${formData.password}`);
      setIsAdding(false);
      setFormData({
        email: '',
        password: '',
        displayName: '',
        role: 'registrar',
        districts: []
      });
    } catch (error: any) {
      console.error(error);
      let message = "Failed to create user";
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Staff accounts must have unique emails.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Invalid email address format.";
      } else if (error.code === 'auth/weak-password') {
        message = "The password is too weak. Please use at least 8 characters.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Email/Password sign-in is not enabled in Firebase Console. Please enable it under Auth > Providers.";
      }
      toast.error(message, { duration: 6000 });
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
                Note: Ensure "Email/Password" is ENABLED in your Firebase Auth Providers.
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
                  <TableRow key={u.uid} className="hover:bg-neutral-50/50 group">
                    <TableCell className="pl-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                          <UserIcon className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 leading-none mb-1">{u.displayName}</p>
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
                        {u.assignedDistricts?.length === 0 ? (
                           <span className="text-[10px] text-neutral-400 italic">Statewide Access</span>
                        ) : (
                          u.assignedDistricts?.slice(0, 2).map(d => (
                            <Badge key={d} variant="outline" className="rounded-full font-normal border-neutral-200 text-[10px]">{d}</Badge>
                          ))
                        )}
                        {u.assignedDistricts && u.assignedDistricts.length > 2 && (
                          <Badge variant="outline" className="rounded-full font-normal border-neutral-200 text-[10px]">+{u.assignedDistricts.length - 2}</Badge>
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

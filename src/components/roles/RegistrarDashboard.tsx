import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '../ImageUpload';
import { toast } from 'sonner';
import { MADHYA_PRADESH_DISTRICTS, TRANSLATIONS } from '../../constants/mp_data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, UserPlus, Clock, ClipboardList, MapPin } from 'lucide-react';

import { CounsellingForm } from '../CounsellingForm';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function RegistrarDashboard() {
  const { user, profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const lang = profile?.preferredLanguage || 'hi';
  const t = TRANSLATIONS[lang];

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    contact: '',
    district: profile?.assignedDistricts?.[0] || '',
    status: 'pending_consultation',
    gender: 'male',
    address: '',
    block: '',
    village: '',
    sickleCellStatus: 'AS',
    preExistingDiagnosis: false,
    reportsAttached: false,
    symptoms: [],
    medicationHydroxyurea: false,
    medicationFolicAcid: false,
    counsellingTopics: [],
    nutritionKitDistributed: false,
    mealRequired: true,
    referral: [],
  });

  useEffect(() => {
    if (!profile) return;

    let q = query(
      collection(db, 'patients'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    // District-level RBAC filtering
    if (profile.role !== 'admin' && profile.assignedDistricts && profile.assignedDistricts.length > 0) {
      q = query(
        collection(db, 'patients'),
        where('district', 'in', profile.assignedDistricts),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(data);
    });

    return unsubscribe;
  }, [profile]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.contact.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.district) {
      toast.error(lang === 'en' ? "Please fill name and district" : "कृपया नाम और जिला भरें");
      return;
    }

    try {
      await addDoc(collection(db, 'patients'), {
        ...formData,
        status: 'pending_consultation',
        registrarId: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success(lang === 'en' ? "Patient registered!" : "मरीज पंजीकृत!");
      setIsRegistering(false);
      setFormData({
        name: '',
        age: 0,
        contact: '',
        district: profile?.assignedDistricts?.[0] || '',
        status: 'pending_consultation',
        gender: 'male',
        address: '',
        block: '',
        village: '',
        sickleCellStatus: 'AS',
        preExistingDiagnosis: false,
        reportsAttached: false,
        symptoms: [],
        medicationHydroxyurea: false,
        medicationFolicAcid: false,
        counsellingTopics: [],
        nutritionKitDistributed: false,
        mealRequired: true,
        referral: [],
      });
    } catch (error) {
      console.error(error);
      toast.error(lang === 'en' ? "Failed to register" : "पंजीकरण विफल रहा");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
            {TRANSLATIONS.en.patientIntake} / {TRANSLATIONS.hi.patientIntake}
          </h2>
          <p className="text-neutral-500">Register new patients for Madhya Pradesh Healthcare System.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsRegistering(!isRegistering)} className="rounded-2xl gap-2 shadow-lg shadow-primary/20 h-10 px-6">
            <PlusCircle className="w-4 h-4" />
            {isRegistering ? (lang === 'en' ? "Back" : "वापस") : (lang === 'en' ? "New Registration" : "नया पंजीकरण")}
          </Button>
        </div>
      </div>

      {isRegistering ? (
        <div className="space-y-6">
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            <CounsellingForm 
              data={formData} 
              onChange={setFormData} 
            />
          </ScrollArea>
          <div className="flex justify-end gap-4 pb-8 max-w-4xl mx-auto px-4">
            <Button variant="outline" onClick={() => setIsRegistering(false)} className="rounded-xl h-12 px-8">
              Cancel
            </Button>
            <Button onClick={handleRegister} className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/30">
              <MapPin className="w-5 h-5 mr-2" />
              {t.confirmRegistration}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40">
          <CardHeader className="p-8 border-b border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">
                {lang === 'en' ? "Recent Registrations" : "हाल के पंजीकरण"}
              </CardTitle>
              {profile?.role !== 'admin' && profile?.assignedDistricts && (
                <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 rounded-full px-3 py-0.5 text-[10px] font-bold">
                  District: {profile.assignedDistricts.join(', ')}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input 
                  placeholder={lang === 'en' ? "Search by name or contact..." : "नाम या संपर्क से खोजें..."}
                  className="pl-10 rounded-2xl border-neutral-200 focus:ring-primary/20 h-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-neutral-50/50 hover:bg-neutral-50/50">
                  <TableHead className="py-4 pl-8">{t.fullName}</TableHead>
                  <TableHead className="py-4">{t.district}</TableHead>
                  <TableHead className="py-4">{t.status}</TableHead>
                  <TableHead className="py-4">{t.timeAdded}</TableHead>
                  <TableHead className="py-4 pr-8 text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((p) => (
                  <TableRow key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    <TableCell className="py-4 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
                           {p.registrarImageUrl ? (
                             <img src={p.registrarImageUrl} className="w-full h-full object-cover" />
                           ) : (
                             <UserPlus className="w-5 h-5 text-neutral-300" />
                           )}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{p.name}</p>
                          <p className="text-xs text-neutral-500">{p.age} years • {p.contact}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <Badge variant="outline" className="rounded-full font-normal border-neutral-200">
                         {p.district}
                       </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 rounded-full px-3 py-1 border-none font-medium">
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(p.createdAt?.toDate()).toLocaleDateString()} {new Date(p.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-8 text-right">
                       <Button variant="ghost" size="sm" className="rounded-full">{t.viewDetails}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-4 border-t border-neutral-100 bg-neutral-50/30 flex items-center justify-between px-8">
               <p className="text-xs text-neutral-500 font-medium tracking-tight">
                {lang === 'en' ? 'Page' : 'पृष्ठ'} {currentPage} {lang === 'en' ? 'of' : 'का'} {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl h-8 px-4"
                >
                  {lang === 'en' ? 'Prev' : 'पिछला'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="rounded-xl h-8 px-4"
                >
                  {lang === 'en' ? 'Next' : 'अगला'}
                </Button>
              </div>
            </div>

            {filteredPatients.length === 0 && (
              <div className="p-20 text-center text-neutral-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{searchQuery ? (lang === 'en' ? "No results found for your search." : "आपकी खोज के लिए कोई परिणाम नहीं मिला।") : (lang === 'en' ? "No patients registered yet today." : "आज अभी तक कोई मरीज पंजीकृत नहीं हुआ है।")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

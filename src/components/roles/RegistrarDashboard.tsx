import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
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
import { PlusCircle, Search, UserPlus, Clock, ClipboardList, MapPin, Users, Activity, CheckCircle, TrendingUp, ArrowLeft } from 'lucide-react';

import { CounsellingForm } from '../CounsellingForm';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RegistrarDashboardProps {
  onImmersiveChange?: (immersive: boolean) => void;
}

export default function RegistrarDashboard({ onImmersiveChange }: RegistrarDashboardProps) {
  const { user, profile } = useAuth();
  const { patients, loading } = usePatients({ limit: 50, realtime: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const lang = profile?.preferred_language || 'hi';
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (onImmersiveChange) {
      onImmersiveChange(isRegistering);
    }
  }, [isRegistering, onImmersiveChange]);

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    contact: '',
    district: profile?.assigned_districts?.[0] || '',
    status: 'pending_consultation',
    gender: 'male',
    address: '',
    block: '',
    village: '',
    sickle_cell_status: 'AS',
    pre_existing_diagnosis: false,
    reports_attached: false,
    symptoms: [],
    medication_hydroxyurea: false,
    medication_folic_acid: false,
    counselling_topics: [],
    nutrition_kit_distributed: false,
    meal_required: true,
    referral: [],
  });

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contact.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const todayRegistrations = patients.filter(p => {
    const today = new Date();
    const patientDate = new Date(p.created_at);
    return patientDate.toDateString() === today.toDateString();
  }).length;

  const pendingConsultations = patients.filter(p => p.status === 'pending_consultation').length;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === 'en' ? 'Good Morning' : 'शुभ प्रभात';
    if (hour < 17) return lang === 'en' ? 'Good Afternoon' : 'शुभ दोपहर';
    return lang === 'en' ? 'Good Evening' : 'शुभ संध्या';
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name || !formData.district || !formData.age || !formData.contact || !formData.sickle_cell_status) {
      toast.error(lang === 'en' ? "Please fill all required fields (marked with *)" : "कृपया सभी आवश्यक फ़ील्ड भरें (* से चिह्नित)");
      return;
    }

    if (formData.contact && !/^\d{10}$/.test(formData.contact)) {
      toast.error(lang === 'en' ? "Invalid contact number. Must be 10 digits." : "अमान्य संपर्क नंबर। 10 अंक होना चाहिए।");
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .insert([{
          ...formData,
          status: 'pending_consultation',
          registrar_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast.success(lang === 'en' ? "Patient registered!" : "मरीज पंजीकृत!");
      setIsRegistering(false);
      setFormData({
        name: '',
        age: 0,
        contact: '',
        district: profile?.assigned_districts?.[0] || '',
        status: 'pending_consultation',
        gender: 'male',
        address: '',
        block: '',
        village: '',
        sickle_cell_status: 'AS',
        pre_existing_diagnosis: false,
        reports_attached: false,
        symptoms: [],
        medication_hydroxyurea: false,
        medication_folic_acid: false,
        counselling_topics: [],
        nutrition_kit_distributed: false,
        meal_required: true,
        referral: [],
      });

    } catch (error) {
      console.error(error);
      toast.error(lang === 'en' ? "Failed to register" : "पंजीकरण विफल रहा");
    }
  };

  return (
    <div className={`${!isRegistering ? 'space-y-8' : ''} pb-12`}>
      {/* Header Section */}
      {!isRegistering && (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-[0.2em]">
              <Activity className="w-4 h-4" />
              {profile?.role} {lang === 'en' ? 'Dashboard' : 'डैशबोर्ड'}
            </div>
            <h2 className="font-black text-neutral-900 tracking-tight leading-tight">
              {getTimeGreeting()}, {profile?.display_name || (lang === 'en' ? 'Registrar' : 'पंजीकार')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsRegistering(!isRegistering)}
              className={`rounded-2xl gap-3 h-12 px-6 text-sm font-bold transition-all duration-300 shadow-2xl ${isRegistering
                ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                : 'bg-primary text-white hover:scale-105 shadow-primary/30'
                }`}
            >
              {isRegistering ? (
                <>
                  <Search className="w-5 h-5" />
                  {lang === 'en' ? "View Registrations" : "पंजीकरण देखें"}
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  {lang === 'en' ? "New Patient Registration" : "नया मरीज पंजीकरण"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {!isRegistering && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] premium-shadow border border-neutral-100 flex items-start justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-wider">{lang === 'en' ? "Total Patients" : "कुल मरीज"}</p>
                <h3 className="text-xl font-black text-neutral-900 mt-1">{patients.length}</h3>
              </div>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] premium-shadow border border-neutral-100 flex items-start justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-wider">{lang === 'en' ? "Today's New" : "आज के नए"}</p>
                <h3 className="text-xl font-black text-neutral-900 mt-1">{todayRegistrations}</h3>
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl text-xs font-bold">+12%</div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] premium-shadow border border-neutral-100 flex items-start justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-wider">{lang === 'en' ? "Pending Consult" : "परामर्श लंबित"}</p>
                <h3 className="text-xl font-black text-neutral-900 mt-1">{pendingConsultations}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] premium-shadow border border-neutral-100 flex items-start justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-wider">{lang === 'en' ? "Completed" : "पूर्ण"}</p>
                <h3 className="text-xl font-black text-neutral-900 mt-1">
                  {patients.filter(p => p.status === 'complete').length}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRegistering ? (
        <div className="animate-in fade-in duration-500 space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setIsRegistering(false)}
            className="group rounded-xl hover:bg-neutral-100 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-neutral-400 group-hover:text-neutral-900 group-hover:-translate-x-1 transition-all" />
            <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900 uppercase tracking-widest">
              {lang === 'en' ? 'Back to Directory' : 'निर्देशिका पर वापस जाएं'}
            </span>
          </Button>
          <CounsellingForm
            data={formData}
            onChange={setFormData}
            onSubmit={handleRegister}
            onCancel={() => setIsRegistering(false)}
            submitLabel={t.confirmRegistration}
            cancelLabel={lang === 'en' ? 'Cancel' : 'रद्द करें'}
          />
        </div>
      ) : (
        <Card className="rounded-[2.5rem] border-none premium-shadow overflow-hidden bg-white/50 backdrop-blur-md">
          <CardHeader className="p-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-lg font-black text-neutral-900">
                {lang === 'en' ? "Patient Directory" : "मरीज निर्देशिका"}
              </CardTitle>
              <CardDescription className="text-neutral-500 text-xs font-medium">
                {lang === 'en' ? "Manage and track recently registered patients." : "हाल ही में पंजीकृत मरीजों का प्रबंधन करें।"}
              </CardDescription>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={lang === 'en' ? "Search patient name or contact..." : "मरीज का नाम या संपर्क खोजें..."}
                  className="pl-12 pr-4 rounded-2xl border-neutral-100 bg-neutral-100/50 focus:bg-white focus:ring-4 focus:ring-primary/10 h-12 text-sm font-medium transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="py-6 pl-8 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">{t.fullName}</TableHead>
                    <TableHead className="py-6 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">{t.district}</TableHead>
                    <TableHead className="py-6 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">{t.status}</TableHead>
                    <TableHead className="py-6 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">{t.timeAdded}</TableHead>
                    <TableHead className="py-6 pr-8 text-right text-neutral-400 font-bold uppercase tracking-wider text-[10px]">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map((p) => (
                    <TableRow key={p.id} className="group border-none hover:bg-white transition-all duration-300 rounded-3xl">
                      <TableCell className="py-5 pl-8 rounded-l-[2rem]">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-neutral-100 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                              {p.registrar_image_url ? (
                                <img src={p.registrar_image_url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                                  <span className="text-xl font-black text-neutral-400">{p.name.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center">
                              <div className={`w-2 h-2 rounded-full ${p.status === 'complete' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 text-sm group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-xs text-neutral-500 font-medium flex items-center gap-2">
                              {p.age} years • <span className="text-neutral-400">{p.contact}</span>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge variant="outline" className="rounded-xl font-bold bg-neutral-50 border-neutral-100 text-neutral-600 px-3 py-1.5">
                          <MapPin className="w-3 h-3 mr-1.5 opacity-50" />
                          {p.district}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge
                          className={`rounded-xl px-4 py-2 border-none font-bold text-xs uppercase tracking-wider ${p.status === 'pending_consultation' ? 'bg-orange-100 text-orange-600' :
                            p.status === 'pending_meal' ? 'bg-blue-100 text-blue-600' :
                              'bg-emerald-100 text-emerald-600'
                            }`}
                        >
                          {p.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-900 font-bold">
                            <Clock className="w-4 h-4 text-neutral-400" />
                            {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest pl-5">
                            {new Date(p.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 pr-8 text-right rounded-r-[2rem]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl font-bold text-xs hover:bg-primary/5 hover:text-primary transition-colors group-hover:px-6"
                        >
                          {t.viewDetails}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPatients.length === 0 && (
              <div className="p-32 text-center">
                <div className="w-24 h-24 bg-neutral-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-neutral-300" />
                </div>
                <h4 className="text-xl font-bold text-neutral-900 mb-2">
                  {searchQuery ? (lang === 'en' ? "No patients found" : "कोई मरीज नहीं मिला") : (lang === 'en' ? "No registrations yet" : "अभी तक कोई पंजीकरण नहीं")}
                </h4>
                <p className="text-neutral-500 font-medium max-w-xs mx-auto">
                  {searchQuery
                    ? (lang === 'en' ? `We couldn't find any results for "${searchQuery}"` : `हमें "${searchQuery}" के लिए कोई परिणाम नहीं मिला`)
                    : (lang === 'en' ? "Start registering new patients to see them in this directory." : "मरीजों को इस निर्देशिका में देखने के लिए पंजीकरण शुरू करें।")
                  }
                </p>
              </div>
            )}

            {filteredPatients.length > itemsPerPage && (
              <div className="mt-8 p-4 glass-morphism rounded-3xl flex items-center justify-between">
                <p className="text-xs text-neutral-500 font-bold">
                  {lang === 'en' ? 'Showing' : 'दिखा रहा है'} <span className="text-neutral-900">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPatients.length)}</span> {lang === 'en' ? 'of' : 'का'} <span className="text-neutral-900">{filteredPatients.length}</span>
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-2xl h-10 px-4 text-xs font-bold border-neutral-200"
                  >
                    {lang === 'en' ? 'Previous' : 'पिछला'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="rounded-2xl h-10 px-4 text-xs font-bold border-neutral-200"
                  >
                    {lang === 'en' ? 'Next' : 'अगला'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


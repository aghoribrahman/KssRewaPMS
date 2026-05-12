import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Activity, Search, Map as MapIcon, Check, Languages, Cloud, RefreshCw, Menu, X } from 'lucide-react';
import { useSyncStatus } from '../store/useStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '../types';
import { MADHYA_PRADESH_DISTRICTS } from '../constants/mp_data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { Settings, LayoutDashboard } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';

interface NavbarProps {
  currentView: 'dashboard' | 'settings';
  onViewChange: (view: 'dashboard' | 'settings') => void;
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { profile, signOut, updateDistricts, updateLanguage, setSessionRole, actualRole } = useAuth();
  const { isSyncing, pendingCount, failedCount } = useSyncStatus();
  const { lang, t } = useTranslation();
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDistrict = (district: string) => {
    const current = profile?.assigned_districts || [];
    const next = current.includes(district)
      ? current.filter(d => d !== district)
      : [...current, district];
    updateDistricts(next);
  };

  const selectAllDistricts = () => {
    updateDistricts([...MADHYA_PRADESH_DISTRICTS]);
  };

  const clearAllDistricts = () => {
    updateDistricts([]);
  };

  const filteredDistricts = MADHYA_PRADESH_DISTRICTS.filter(d => 
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const toggleLanguage = () => {
    const next = lang === 'hi' ? 'en' : 'hi';
    updateLanguage(next);
  };

  const handleNavClick = (view: 'dashboard' | 'settings') => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };


  return (
    <nav className="h-20 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold tracking-tight text-neutral-900 leading-none mb-1 text-sm md:text-base">Kiran Seva Sansthan</h1>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-none">Patient Management System</p>
            </div>
          </div>

          {/* Admin Navigation (Desktop) */}
          {profile?.role === 'admin' && (
            <div className="hidden md:flex items-center bg-neutral-100 p-1 rounded-2xl">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'dashboard' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t.dashboard.toUpperCase()}
              </button>
              <button
                onClick={() => onViewChange('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'settings' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                {t.settings.toUpperCase()}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="rounded-full gap-2 text-neutral-600 hover:bg-neutral-100 font-medium px-2 sm:px-4 h-10"
          >
            <Languages className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </Button>

          {/* District Selector (Desktop/Tablet) */}
          <div className="hidden sm:block">
            <Popover open={isDistrictOpen} onOpenChange={(open) => {
              setIsDistrictOpen(open);
              if (!open) setDistrictSearch('');
            }}>
              <PopoverTrigger className={buttonVariants({ variant: 'outline', size: 'sm', className: "rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5 h-10 px-4" })}>
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.myDistricts}</span>
                <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-5 justify-center rounded-full bg-primary/10 text-primary border-none text-[10px]">
                  {profile?.assigned_districts?.length || 0}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 rounded-2xl shadow-2xl border-neutral-100 overflow-hidden" align="end">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                  <h4 className="font-bold text-sm mb-1">{t.assignDistricts}</h4>
                  <p className="text-[10px] text-neutral-500 mb-3">{t.onlyDataFromThese}</p>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input 
                      type="text"
                      placeholder="Search district..."
                      className="w-full bg-white border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-neutral-50/50 border-b border-neutral-100">
                  <button onClick={selectAllDistricts} className="text-[10px] font-bold text-primary hover:underline">Select All</button>
                  <button onClick={clearAllDistricts} className="text-[10px] font-bold text-neutral-500 hover:underline">Clear All</button>
                </div>

                <div className="max-h-[300px] overflow-y-auto p-2">
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map(district => {
                      const isSelected = profile?.assigned_districts?.includes(district);
                      return (
                        <button
                          key={district}
                          onClick={() => toggleDistrict(district)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all font-medium mb-0.5 ${
                            isSelected 
                              ? 'bg-primary/5 text-primary' 
                              : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          {district}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs text-neutral-400 italic">No districts found</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Sync Status Badge */}
          {pendingCount > 0 && (
            <Badge variant="outline" className={`rounded-full px-2 sm:px-3 py-1 flex gap-2 items-center border-none ${failedCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
              {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hidden xs:inline">
                {failedCount > 0 ? `${failedCount} Errors` : `Sync ${pendingCount}`}
              </span>
            </Badge>
          )}

          <div className="h-8 w-[1px] bg-neutral-200 mx-1 hidden lg:block"></div>

          {actualRole === 'admin' && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full h-10">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">{t.role}:</span>
              <Select 
                value={profile?.role} 
                onValueChange={(val) => setSessionRole(val as UserRole)}
              >
                <SelectTrigger className="h-8 border-none bg-transparent shadow-none w-[160px] focus:ring-0 font-bold text-xs uppercase tracking-tight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="registrar">Registrar</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="meal_distributor">Meal Distributor</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-bold text-neutral-900 leading-none mb-1">{profile?.display_name || profile?.email?.split('@')[0]}</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">{profile?.role?.replace('_', ' ')}</span>
            </div>
            
            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-full h-10 w-10 hover:bg-neutral-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="icon" className="hidden md:flex rounded-full h-10 w-10 hover:bg-neutral-100" onClick={signOut}>
              <LogOut className="w-5 h-5 text-neutral-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-neutral-200 shadow-xl z-40 animate-in slide-in-from-top-4 duration-150">
          <div className="p-4 space-y-4">
            {profile?.role === 'admin' && (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={currentView === 'dashboard' ? 'default' : 'outline'}
                  className="rounded-xl font-bold text-xs gap-2"
                  onClick={() => handleNavClick('dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t.dashboard}
                </Button>
                <Button 
                  variant={currentView === 'settings' ? 'default' : 'outline'}
                  className="rounded-xl font-bold text-xs gap-2"
                  onClick={() => handleNavClick('settings')}
                >
                  <Settings className="w-4 h-4" />
                  {t.settings}
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {actualRole === 'admin' && (
                <div className="p-3 bg-neutral-50 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.role}</p>
                  <Select 
                    value={profile?.role} 
                    onValueChange={(val) => {
                      setSessionRole(val as UserRole);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <SelectTrigger className="h-10 border-neutral-200 bg-white shadow-sm w-full font-bold text-xs uppercase tracking-tight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="registrar">Registrar</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="meal_distributor">Meal Distributor</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="p-3 bg-neutral-50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.myDistricts}</p>
                  <div className="flex gap-2">
                    <button onClick={selectAllDistricts} className="text-[9px] font-bold text-primary underline">All</button>
                    <button onClick={clearAllDistricts} className="text-[9px] font-bold text-neutral-500 underline">None</button>
                    <Badge className="bg-primary text-white border-none text-[10px] h-5 px-1.5">{profile?.assigned_districts?.length || 0}</Badge>
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input 
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-white border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-[11px] focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2">
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map(district => (
                      <button
                        key={district}
                        onClick={() => toggleDistrict(district)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors font-medium ${
                          profile?.assigned_districts?.includes(district) 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-white text-neutral-600 hover:bg-neutral-100 shadow-sm border border-neutral-100'
                        }`}
                      >
                        {district}
                        {profile?.assigned_districts?.includes(district) && <Check className="w-3 h-3" />}
                      </button>
                    ))
                  ) : (
                    <p className="text-[10px] text-center text-neutral-400 italic py-4">No results</p>
                  )}
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full justify-between h-12 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold"
                onClick={signOut}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  Logout
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

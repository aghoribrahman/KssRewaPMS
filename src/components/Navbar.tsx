import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Activity, User as UserIcon, Shield, Search, Map as MapIcon, Check, Languages } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '../types';
import { MADHYA_PRADESH_DISTRICTS } from '../constants/mp_data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { Settings, LayoutDashboard } from 'lucide-react';
import { buttonVariants } from './ui/button';

interface NavbarProps {
  currentView: 'dashboard' | 'settings';
  onViewChange: (view: 'dashboard' | 'settings') => void;
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { profile, signOut, updateRole, updateDistricts, updateLanguage } = useAuth();
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);

  const toggleDistrict = (district: string) => {
    const current = profile?.assigned_districts || [];
    const next = current.includes(district)
      ? current.filter(d => d !== district)
      : [...current, district];
    updateDistricts(next);
  };

  const toggleLanguage = () => {
    const next = profile?.preferred_language === 'hi' ? 'en' : 'hi';
    updateLanguage(next);
  };


  return (
    <nav className="h-20 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer" onClick={() => onViewChange('dashboard')}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold tracking-tight text-neutral-900 leading-none mb-1">CareFlow MP</h1>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-none">Madhya Pradesh PMS</p>
            </div>
          </div>

          {/* Admin Navigation */}
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
                DASHBOARD
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
                SETTINGS
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="rounded-full gap-2 text-neutral-600 hover:bg-neutral-100 font-medium px-4 h-10"
          >
            <Languages className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{profile?.preferred_language === 'hi' ? 'English' : 'हिंदी'}</span>
          </Button>

          {/* District Selector for Non-Admins to test RBAC */}
          {profile?.role !== 'admin' && (
            <Popover open={isDistrictOpen} onOpenChange={setIsDistrictOpen}>
              <PopoverTrigger className={buttonVariants({ variant: 'outline', size: 'sm', className: "rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5 h-10 px-4" })}>
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Districts</span>
                <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-5 justify-center rounded-full bg-primary/10 text-primary border-none text-[10px]">
                  {profile?.assigned_districts?.length || 0}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 rounded-2xl shadow-2xl border-neutral-100" align="end">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50 rounded-t-2xl">
                  <h4 className="font-bold text-sm">Assign Districts</h4>
                  <p className="text-[10px] text-neutral-500">Only data from these districts will be visible to you.</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {MADHYA_PRADESH_DISTRICTS.map(district => (
                    <button
                      key={district}
                      onClick={() => toggleDistrict(district)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-neutral-50 transition-colors font-medium text-neutral-700"
                    >
                      {district}
                      {profile?.assigned_districts?.includes(district) && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <div className="h-8 w-[1px] bg-neutral-200 mx-1 hidden sm:block"></div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full h-10">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Role:</span>
            <Select 
              value={profile?.role} 
              onValueChange={(val) => updateRole(val as UserRole)}
            >
              <SelectTrigger className="h-8 border-none bg-transparent shadow-none w-[160px] focus:ring-0 font-bold text-xs uppercase tracking-tight">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="registrar">Registrar</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="meal_distributor">Meal Distributor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-bold text-neutral-900 leading-none mb-1">{profile?.display_name || profile?.email?.split('@')[0]}</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">{profile?.role?.replace('_', ' ')}</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-neutral-100" onClick={signOut}>
              <LogOut className="w-5 h-5 text-neutral-500" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

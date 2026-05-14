import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Activity, Map as MapIcon, Cloud, RefreshCw, Menu } from 'lucide-react';
import { useSyncStatus } from '../store/useStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '../types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { Settings, LayoutDashboard } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageToggle } from './shared/LanguageToggle';
import { DistrictList } from './shared/DistrictList';
import { MobileMenu } from './shared/MobileMenu';
import { MADHYA_PRADESH_DISTRICTS } from '../constants/mp_data';

interface NavbarProps {
  currentView: 'dashboard' | 'settings';
  onViewChange: (view: 'dashboard' | 'settings') => void;
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { profile, signOut, updateDistricts, setSessionRole, actualRole } = useAuth();
  const { isSyncing, pendingCount, failedCount } = useSyncStatus();
  const { t } = useTranslation();
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
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

  return (
    <nav className="h-20 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <div 
            className="flex items-center gap-2 lg:gap-3 cursor-pointer group" 
            onClick={() => onViewChange('dashboard')}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 active:scale-95">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="hidden xs:block">
              <h1 className="font-bold tracking-tight text-neutral-900 leading-none mb-1 text-sm md:text-base">
                Kss Rewa
              </h1>
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                PMS Portal
              </p>
            </div>
          </div>

          {/* Admin Navigation (Desktop) */}
          {profile?.role === 'admin' && (
            <div className="hidden md:flex items-center bg-neutral-100/50 p-1 rounded-2xl border border-neutral-200/50">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'dashboard' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden lg:inline">{t.dashboard.toUpperCase()}</span>
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
                <span className="hidden lg:inline">{t.settings.toUpperCase()}</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle (Desktop/Tablet) */}
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>

          {/* District Selector (Desktop/Tablet) */}
          <div className="hidden md:block">
            <Popover open={isDistrictOpen} onOpenChange={setIsDistrictOpen}>
              <PopoverTrigger className={buttonVariants({ variant: 'outline', size: 'sm', className: "rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5 h-10 px-4" })}>
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{t.myDistricts}</span>
                <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-5 justify-center rounded-full bg-primary/10 text-primary border-none text-[10px]">
                  {profile?.assigned_districts?.length || 0}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 rounded-2xl shadow-2xl border-neutral-100 overflow-hidden" align="end">
                <DistrictList 
                  selectedDistricts={profile?.assigned_districts || []}
                  onToggle={toggleDistrict}
                  onSelectAll={selectAllDistricts}
                  onClearAll={clearAllDistricts}
                  t={t}
                  className="max-h-[450px]"
                />
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

          {/* Role Switcher (Desktop) */}
          {actualRole === 'admin' && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full h-10">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">{t.role}:</span>
              <Select 
                value={profile?.role || undefined} 
                onValueChange={(val) => setSessionRole(val as UserRole)}
              >
                <SelectTrigger className="h-8 border-none bg-transparent shadow-none w-[140px] focus:ring-0 font-bold text-xs uppercase tracking-tight">
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

          {/* User Info (Desktop) */}
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-neutral-900 leading-none mb-1">
              {profile?.display_name || profile?.email?.split('@')[0]}
            </span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">
              {profile?.role?.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Logout (Desktop) */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex rounded-full h-10 w-10 hover:bg-neutral-100" 
              onClick={signOut}
            >
              <LogOut className="w-5 h-5 text-neutral-500" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-full h-10 w-10 hover:bg-neutral-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        profile={profile}
        t={t}
        currentView={currentView}
        onViewChange={onViewChange}
        onSignOut={signOut}
        onUpdateDistricts={updateDistricts}
        onSetRole={setSessionRole}
        actualRole={actualRole}
      />
    </nav>
  );
}

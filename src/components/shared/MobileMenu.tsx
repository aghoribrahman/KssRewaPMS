import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, LayoutDashboard, Settings, UserCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserRole } from '../../types';
import { DistrictList } from './DistrictList';
import { LanguageToggle } from './LanguageToggle';
import { MADHYA_PRADESH_DISTRICTS } from '../../constants/mp_data';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  t: any;
  currentView: 'dashboard' | 'settings';
  onViewChange: (view: 'dashboard' | 'settings') => void;
  onSignOut: () => void;
  onUpdateDistricts: (districts: string[]) => void;
  onSetRole: (role: UserRole) => void;
  actualRole?: string | null;
}

export function MobileMenu({
  isOpen,
  onClose,
  profile,
  t,
  currentView,
  onViewChange,
  onSignOut,
  onUpdateDistricts,
  onSetRole,
  actualRole
}: MobileMenuProps) {
  
  const toggleDistrict = (district: string) => {
    const current = profile?.assigned_districts || [];
    const next = current.includes(district)
      ? current.filter((d: string) => d !== district)
      : [...current, district];
    onUpdateDistricts(next);
  };

  const handleNavClick = (view: 'dashboard' | 'settings') => {
    onViewChange(view);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[101] md:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 leading-none">
                    {profile?.display_name || profile?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                    {profile?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                
                {/* Admin Navigation */}
                {profile?.role === 'admin' && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">{t.navigation || 'Navigation'}</p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant={currentView === 'dashboard' ? 'default' : 'outline'}
                        className="justify-start rounded-xl font-bold text-xs gap-3 h-12"
                        onClick={() => handleNavClick('dashboard')}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t.dashboard}
                      </Button>
                      <Button 
                        variant={currentView === 'settings' ? 'default' : 'outline'}
                        className="justify-start rounded-xl font-bold text-xs gap-3 h-12"
                        onClick={() => handleNavClick('settings')}
                      >
                        <Settings className="w-4 h-4" />
                        {t.settings}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Role Switcher */}
                {actualRole === 'admin' && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">{t.role}</p>
                    <div className="p-1 bg-neutral-50 rounded-xl border border-neutral-100">
                      <Select 
                        value={profile?.role || undefined} 
                        onValueChange={(val) => {
                          onSetRole(val as UserRole);
                        }}
                      >
                        <SelectTrigger className="h-10 border-none bg-transparent shadow-none w-full font-bold text-xs uppercase tracking-tight">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="registrar">Registrar</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                          <SelectItem value="meal_distributor">Meal Distributor</SelectItem>
                          <SelectItem value="visitor">Visitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* District Management */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.myDistricts}</p>
                    <Badge className="bg-primary text-white border-none text-[10px] h-5 px-1.5 rounded-full">
                      {profile?.assigned_districts?.length || 0}
                    </Badge>
                  </div>
                  <div className="border border-neutral-100 rounded-2xl overflow-hidden h-[350px]">
                    <DistrictList 
                      selectedDistricts={profile?.assigned_districts || []}
                      onToggle={toggleDistrict}
                      onSelectAll={() => onUpdateDistricts([...MADHYA_PRADESH_DISTRICTS])}
                      onClearAll={() => onUpdateDistricts([])}
                      t={t}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-neutral-500">Language</span>
                <LanguageToggle showLabel={true} className="bg-white border shadow-sm" />
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold gap-3"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
              >
                <LogOut className="w-5 h-5" />
                {t.logout || 'Logout'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

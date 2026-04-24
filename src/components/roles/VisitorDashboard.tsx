import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Patient } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, Activity, Utensils, CheckCircle2, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { PatientSummary } from '../PatientSummary';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { usePatients } from '../../hooks/usePatients';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../shared/Pagination';
import { MapPin } from 'lucide-react';

export default function VisitorDashboard() {
  const { profile } = useAuth();
  const { patients, loading } = usePatients({ realtime: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.abha_id?.includes(searchQuery) ||
    p.contact.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: patients.length,
    pending_consultation: patients.filter(p => p.status === 'pending_consultation').length,
    pending_meal: patients.filter(p => p.status === 'pending_meal').length,
    complete: patients.filter(p => p.status === 'complete').length
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">System Observer Dashboard</h2>
          <p className="text-neutral-500">Read-only access to real-time patient metrics and directory.</p>
        </div>
        {profile?.assigned_districts && profile.assigned_districts.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 self-start md:self-center">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-tight">Scope: {profile.assigned_districts.join(', ')}</span>
          </div>
        )}
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={stats.total} icon={<Users className="w-5 h-5" />} color="bg-blue-500" />
        <StatCard title="Pending Consultation" value={stats.pending_consultation} icon={<Activity className="w-5 h-5" />} color="bg-amber-500" />
        <StatCard title="Pending Meal" value={stats.pending_meal} icon={<Utensils className="w-5 h-5" />} color="bg-rose-500" />
        <StatCard title="Total Complete" value={stats.complete} icon={<CheckCircle2 className="w-5 h-5" />} color="bg-emerald-500" />
      </div>

      {/* Directory Section */}
      <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40 overflow-hidden">
        <CardHeader className="p-8 border-b border-neutral-100 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Patient Directory (Read-Only)
            </CardTitle>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input 
                placeholder="Search by Name, ABHA ID or Contact..." 
                className="pl-10 rounded-xl h-10 border-neutral-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-neutral-500 font-medium">Loading records...</div>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-neutral-900 h-14 pl-8">Patient Name</TableHead>
                  <TableHead className="font-bold text-neutral-900">ABHA ID / Contact</TableHead>
                  <TableHead className="font-bold text-neutral-900">District</TableHead>
                  <TableHead className="font-bold text-neutral-900">Status</TableHead>
                  <TableHead className="font-bold text-neutral-900 pr-8 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((p) => (
                  <TableRow key={p.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <TableCell className="font-bold text-neutral-900 h-20 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 uppercase">
                          {p.name.charAt(0)}
                        </div>
                        {p.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-600 font-medium font-mono text-xs">
                      <div>{p.abha_id ? p.abha_id.replace(/(.{2}).+(.{2})/, '$1XXXXXXXX$2') : 'NO ABHA ID'}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{p.contact.replace(/(\d{2})\d+(\d{2})/, '$1XXXXXX$2')}</div>
                    </TableCell>
                    <TableCell className="text-neutral-600 font-medium uppercase tracking-wider text-[10px]">{p.district}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest ${
                        p.status === 'complete' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        p.status === 'pending_meal' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Dialog>
                        <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-all">
                          <Eye className="w-3.5 h-3.5" />
                          VIEW
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden border-none shadow-2xl h-[90vh] flex flex-col gap-0">
                          <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0 bg-white">
                            <PatientSummary patient={p} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <div className="border-t border-neutral-100 px-6">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredPatients.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40 p-6 group hover:shadow-2xl transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black text-neutral-900 tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}

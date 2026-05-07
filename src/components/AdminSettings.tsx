import { useState, useEffect } from 'react';
import * as React from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Settings } from 'lucide-react';
import { UserProfile } from '../types';
import { UserTable } from './admin/UserTable';
import { AddUserForm } from './admin/AddUserForm';

export default function AdminSettings() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
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
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
            <UserPlus className="w-4 h-4" />
            Add New Staff
          </Button>
        )}
      </div>

      {isAdding && (
        <AddUserForm 
          onSuccess={() => {
            setIsAdding(false);
            fetchUsers();
          }} 
          onCancel={() => setIsAdding(false)} 
        />
      )}

      <Card className="rounded-3xl border-none shadow-xl shadow-neutral-200/40">
        <CardHeader className="p-8 border-b border-neutral-100">
          <CardTitle className="text-xl">Authenticated Personnel</CardTitle>
          <CardDescription>Reviewing current access levels across the health network.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable users={users} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}

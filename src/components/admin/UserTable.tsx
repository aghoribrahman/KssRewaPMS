
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon } from 'lucide-react';
import { UserProfile } from '../../types';

interface UserTableProps {
  users: UserProfile[];
  loading: boolean;
}

export function UserTable({ users, loading }: UserTableProps) {
  return (
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
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Active
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {loading && (
        <div className="p-20 text-center text-neutral-400">
          <p>Fetching user directory...</p>
        </div>
      )}
    </div>
  );
}


import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend?: string;
}

interface StatGridProps {
  stats: StatItem[];
}

export function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="rounded-2xl border-none premium-shadow bg-white overflow-hidden h-full">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">{stat.label}</p>
            <p className="text-xl font-black text-neutral-900 leading-tight">{stat.value}</p>
            {stat.trend && (
              <p className={`text-[9px] font-bold ${stat.bg} ${stat.color} px-1.5 py-0.5 rounded-full w-fit mt-0.5`}>
                {stat.trend}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}

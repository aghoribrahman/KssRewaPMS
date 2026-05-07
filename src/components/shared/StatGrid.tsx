import * as React from 'react';
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
      <Card className="rounded-[2rem] border-none premium-shadow bg-white overflow-hidden h-full">
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">{stat.label}</p>
            <p className="text-2xl font-black text-neutral-900 leading-tight">{stat.value}</p>
            {stat.trend && (
              <p className={`text-[10px] font-bold ${stat.bg} ${stat.color} px-2 py-0.5 rounded-full w-fit mt-1`}>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}

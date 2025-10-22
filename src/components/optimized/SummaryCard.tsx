"use client";

import { memo } from 'react';
import { Icon } from '@heroicons/react/24/outline';

interface SummaryCardProps {
  label: string;
  value: string;
  icon: Icon;
  accent: {
    bg: string;
    text: string;
    border: string;
  };
}

const SummaryCard = memo(function SummaryCard({ 
  label, 
  value, 
  icon: Icon, 
  accent 
}: SummaryCardProps) {
  return (
    <div className={`surface-card flex items-center gap-4 p-6 ${accent.bg} ${accent.border}`}>
      <div className={`rounded-[12px] p-3 ${accent.bg}`}>
        <Icon className={`h-6 w-6 ${accent.text}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
        <p className={`text-2xl font-bold ${accent.text}`}>{value}</p>
      </div>
    </div>
  );
});

export default SummaryCard;

'use client';
import type { Status } from '@/lib/types';

interface Props {
  status: Status;
}

const config: Record<Status, { label: string; className: string }> = {
  green: {
    label: '정상 진행',
    className: 'bg-status-green/10 text-status-green',
  },
  red: {
    label: '이슈 발생',
    className: 'bg-status-red/10 text-status-red',
  },
  gray: {
    label: '진행 전',
    className: 'bg-status-gray/20 text-secondary',
  },
};

export default function StatusBadge({ status }: Props) {
  const { label, className } = config[status];
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${className}`}
    >
      {label}
    </span>
  );
}

'use client';
import type { Status } from '@/lib/types';

interface Props {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };

const colorMap: Record<Status, string> = {
  green: 'bg-status-green traffic-green',
  yellow: 'bg-status-yellow',
  red: 'bg-status-red traffic-red',
  gray: 'bg-status-gray',
};

const labelMap: Record<Status, string> = {
  green: '완료',
  yellow: '진행 중',
  red: '이슈',
  gray: '미시작',
};

export default function TrafficLight({ status, size = 'md' }: Props) {
  return (
    <span
      className={`inline-block rounded-full ${sizeMap[size]} ${colorMap[status]} flex-shrink-0`}
      title={labelMap[status]}
    />
  );
}

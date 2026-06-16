'use client';
import { useRouter } from 'next/navigation';
import type { Lead, Stage } from '@/lib/types';
import { computeLeadStatus, computeStageStatus } from '@/lib/types';
import TrafficLight from './TrafficLight';

interface Props {
  lead: Lead;
  stages: Stage[];
}

export default function LeadCard({ lead, stages }: Props) {
  const router = useRouter();
  const overallStatus = computeLeadStatus(stages);

  const greenCount  = stages.filter((s) => computeStageStatus(s.items ?? []) === 'green').length;
  const yellowCount = stages.filter((s) => computeStageStatus(s.items ?? []) === 'yellow').length;
  const redCount    = stages.filter((s) => computeStageStatus(s.items ?? []) === 'red').length;

  const progress = stages.length > 0 ? Math.round((greenCount / stages.length) * 100) : 0;

  const formattedDate = new Date(lead.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => router.push(`/leads/${lead.id}`)}
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md cursor-pointer hover:shadow-card active:scale-[0.98] transition-all duration-150"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-sm">
        <div className="flex items-center gap-2 min-w-0">
          <TrafficLight status={overallStatus} size="md" />
          <h3 className="text-headline-sm font-semibold text-primary truncate">{lead.company_name}</h3>
        </div>
        <span className="text-label-sm text-secondary flex-shrink-0 ml-2">{formattedDate}</span>
      </div>

      {/* Item */}
      <p className="text-body-md text-on-surface mb-xs">{lead.item_name}</p>
      {lead.current_packaging && (
        <p className="text-label-sm text-secondary truncate mb-sm">{lead.current_packaging}</p>
      )}

      {/* Progress */}
      <div className="mt-sm">
        <div className="flex justify-between items-center mb-xs">
          <span className="text-label-md text-secondary uppercase tracking-widest">진행률</span>
          <span className="text-label-md text-primary tabular-nums">{progress}%</span>
        </div>
        <div className="h-1 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-status-green rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage Summary */}
      <div className="flex items-center gap-sm mt-sm flex-wrap">
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-status-green" />
          <span className="text-label-sm text-secondary tabular-nums">{greenCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-status-yellow" />
          <span className="text-label-sm text-secondary tabular-nums">{yellowCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-status-red" />
          <span className="text-label-sm text-secondary tabular-nums">{redCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-status-gray" />
          <span className="text-label-sm text-secondary tabular-nums">
            {stages.length - greenCount - yellowCount - redCount}
          </span>
        </div>
        <span className="ml-auto text-label-sm text-secondary">{stages.length}개 단계 →</span>
      </div>
    </div>
  );
}

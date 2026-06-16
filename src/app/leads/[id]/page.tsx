'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLead, getStagesWithItems, deleteLead } from '@/lib/db';
import type { Lead, Stage, Status } from '@/lib/types';
import { computeLeadStatus, computeStageStatus } from '@/lib/types';
import StageCard from '@/components/StageCard';

const dotColor: Record<Status, string> = {
  green: 'bg-status-green',
  red: 'bg-status-red',
  gray: 'bg-status-gray',
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    const [leadData, stagesData] = await Promise.all([getLead(id), getStagesWithItems(id)]);
    setLead(leadData);
    setStages(stagesData);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDelete() {
    if (!confirm('이 리드를 삭제하시겠습니까?')) return;
    setDeleting(true);
    try { await deleteLead(id); router.push('/'); }
    catch { setDeleting(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-secondary animate-spin" style={{ fontSize: 36 }}>progress_activity</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-body-md text-secondary">리드를 찾을 수 없습니다.</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-primary text-on-primary rounded text-body-md">
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  const overallStatus = computeLeadStatus(stages);
  const greenCount = stages.filter((s) => computeStageStatus(s.items ?? []) === 'green').length;
  const redCount = stages.filter((s) => computeStageStatus(s.items ?? []) === 'red').length;
  const progress = stages.length > 0 ? Math.round((greenCount / stages.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-container-mobile py-sm bg-background border-b border-outline-variant">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-headline-sm font-semibold text-primary truncate">{lead.company_name}</h1>
          <p className="text-label-sm text-secondary truncate">{lead.item_name}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-error-container/30 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>delete_outline</span>
        </button>
      </header>

      <main className="px-container-mobile mt-md space-y-md">

        {/* ── 상단 가로 신호등 바 ── */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          {/* 전체 상태 행 */}
          <div className="flex items-center gap-3 px-md py-sm border-b border-outline-variant/30">
            <span className={`w-4 h-4 rounded-full flex-shrink-0 ${dotColor[overallStatus]} ${overallStatus === 'green' ? 'traffic-green' : overallStatus === 'red' ? 'traffic-red' : ''}`} />
            <span className="flex-1 text-body-md font-semibold text-primary">
              {overallStatus === 'green' ? '전체 정상 진행' : overallStatus === 'red' ? '이슈 발생 — 확인 필요' : '진행 전 단계 있음'}
            </span>
            <span className="text-label-sm text-secondary tabular-nums">{greenCount}/{stages.length} 완료</span>
          </div>

          {/* 진행률 바 */}
          <div className="h-1 bg-surface-container">
            <div className={`h-full transition-all duration-700 ${dotColor[overallStatus]}`} style={{ width: `${progress}%` }} />
          </div>

          {/* 8단계 가로 1열 신호등 */}
          <div className="flex overflow-x-auto no-scrollbar">
            {stages.map((stage, idx) => {
              const st = computeStageStatus(stage.items ?? []);
              const isLast = idx === stages.length - 1;
              return (
                <div
                  key={stage.id}
                  className={`flex flex-col items-center justify-center gap-1 py-sm flex-1 min-w-[70px] ${!isLast ? 'border-r border-outline-variant/30' : ''}`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${dotColor[st]}`} />
                  <span className="text-[10px] font-semibold text-on-surface text-center leading-tight px-1 whitespace-nowrap">
                    {stage.name}
                  </span>
                  <span className="text-[9px] text-secondary tabular-nums">
                    {stage.items?.filter(i => i.status === 'green').length ?? 0}/{stage.items?.length ?? 0}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 요약 수치 */}
          <div className="flex items-center gap-md px-md py-xs border-t border-outline-variant/30">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-green" />
              <span className="text-label-sm text-secondary">완료 {greenCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-red" />
              <span className="text-label-sm text-secondary">이슈 {redCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-gray" />
              <span className="text-label-sm text-secondary">미시작 {stages.length - greenCount - redCount}</span>
            </div>
            {lead.current_packaging && (
              <span className="ml-auto text-label-sm text-secondary truncate max-w-[120px]">{lead.current_packaging}</span>
            )}
          </div>
        </section>

        {/* ── 단계 카드 그리드 (2×4) ── */}
        <section>
          <div className="flex items-center justify-between mb-sm">
            <h3 className="text-headline-sm font-semibold text-primary">단계별 진행현황</h3>
            <div className="flex items-center gap-md text-label-sm text-secondary">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-green" />신호등 클릭으로 상태 변경</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-sm">
            {stages.map((stage) => (
              <StageCard key={stage.id} stage={stage} onUpdated={loadData} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

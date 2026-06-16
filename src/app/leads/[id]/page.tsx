'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLead, getStagesWithItems, deleteLead } from '@/lib/db';
import type { Lead, Stage, Status } from '@/lib/types';
import { computeLeadStatus, computeStageStatus } from '@/lib/types';
import StageSection from '@/components/StageSection';

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete() {
    if (!confirm('이 리드를 삭제하시겠습니까? 모든 스테이지 데이터가 삭제됩니다.')) return;
    setDeleting(true);
    try {
      await deleteLead(id);
      router.push('/');
    } catch {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary animate-spin" style={{ fontSize: 36 }}>
            progress_activity
          </span>
          <p className="text-body-md text-secondary">불러오는 중...</p>
        </div>
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
  const progress = stages.length > 0 ? Math.round((greenCount / stages.length) * 100) : 0;

  const overallBg: Record<Status, string> = {
    green: 'bg-status-green',
    red: 'bg-status-red',
    gray: 'bg-status-gray',
  };
  const overallLabel: Record<Status, string> = {
    green: '전체 정상 진행',
    red: '이슈 발생 — 확인 필요',
    gray: '진행 전 단계 있음',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-container-mobile py-sm bg-background border-b border-outline-variant">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <h1 className="flex-1 text-headline-md font-semibold text-primary truncate">{lead.company_name}</h1>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-error-container/30 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>delete_outline</span>
        </button>
      </header>

      <main className="px-container-mobile mt-lg space-y-md">

        {/* ── 상단 신호등 요약 패널 ── */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          {/* 전체 상태 바 */}
          <div className={`flex items-center gap-3 px-md py-sm ${overallBg[overallStatus]}/10`}>
            <span
              className={`w-4 h-4 rounded-full flex-shrink-0 ${overallBg[overallStatus]} ${
                overallStatus === 'green' ? 'traffic-green' : overallStatus === 'red' ? 'traffic-red' : ''
              }`}
            />
            <div className="flex-1">
              <p className="text-headline-sm font-semibold text-primary">{lead.company_name}</p>
              <p className="text-label-sm text-secondary">{lead.item_name}</p>
            </div>
            <span className="text-label-md text-secondary tabular-nums">{greenCount}/{stages.length}</span>
          </div>

          {/* 진행률 바 */}
          <div className="h-1.5 bg-surface-container">
            <div
              className={`h-full transition-all duration-700 ${overallBg[overallStatus]}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 8개 단계 신호등 그리드 */}
          <div className="grid grid-cols-4 divide-x divide-y divide-outline-variant/30">
            {stages.map((stage) => {
              const st = computeStageStatus(stage.items ?? []);
              const dot: Record<Status, string> = {
                green: 'bg-status-green',
                red: 'bg-status-red',
                gray: 'bg-status-gray',
              };
              const itemCount = stage.items?.length ?? 0;
              const doneCount = stage.items?.filter((i) => i.status === 'green').length ?? 0;

              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    const el = document.getElementById(`stage-${stage.id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex flex-col items-center justify-center gap-1 py-sm px-xs hover:bg-surface-container-low transition-colors"
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${dot[st]}`} />
                  <span className="text-[10px] font-semibold text-on-surface text-center leading-tight">
                    {stage.name}
                  </span>
                  <span className="text-[9px] text-secondary tabular-nums">
                    {doneCount}/{itemCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 기본 정보 */}
          <div className="px-md py-sm border-t border-outline-variant/30 flex flex-wrap gap-md">
            {lead.current_packaging && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 14 }}>inventory_2</span>
                <span className="text-label-sm text-secondary">{lead.current_packaging}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 14 }}>calendar_today</span>
              <span className="text-label-sm text-secondary">
                {new Date(lead.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="ml-auto">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                overallStatus === 'green' ? 'bg-status-green/10 text-status-green' :
                overallStatus === 'red' ? 'bg-status-red/10 text-status-red' :
                'bg-status-gray/20 text-secondary'
              }`}>
                {overallLabel[overallStatus]}
              </span>
            </div>
          </div>
        </section>

        {/* ── 단계별 상세 섹션 ── */}
        <section>
          <h3 className="text-headline-sm font-semibold text-primary mb-sm">단계별 진행현황</h3>
          <div className="space-y-sm">
            {stages.map((stage) => (
              <div key={stage.id} id={`stage-${stage.id}`}>
                <StageSection stage={stage} onUpdated={loadData} />
              </div>
            ))}
          </div>
        </section>

        {/* 범례 */}
        <section className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-md">
          <div className="flex gap-lg flex-wrap">
            <LegendRow color="bg-status-green" label="초록 — 완료" />
            <LegendRow color="bg-status-red" label="빨강 — 이슈" />
            <LegendRow color="bg-status-gray" label="회색 — 미시작" />
          </div>
          <p className="mt-xs text-label-sm text-secondary">* 소항목 아이콘 클릭 → 상태 순환 변경</p>
        </section>
      </main>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-label-sm text-secondary">{label}</span>
    </div>
  );
}

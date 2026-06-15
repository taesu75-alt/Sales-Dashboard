'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLead, getStagesWithItems, deleteLead } from '@/lib/db';
import type { Lead, Stage } from '@/lib/types';
import { computeLeadStatus, computeStageStatus } from '@/lib/types';
import StageSection from '@/components/StageSection';
import TrafficLight from '@/components/TrafficLight';

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
          <span
            className="material-symbols-outlined text-secondary animate-spin"
            style={{ fontSize: 36 }}
          >
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
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 48 }}>
          search_off
        </span>
        <p className="text-body-md text-secondary">리드를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-on-primary rounded text-body-md hover:bg-primary/90 transition-colors"
        >
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  const overallStatus = computeLeadStatus(stages);
  const greenCount = stages.filter((s) => computeStageStatus(s.items ?? []) === 'green').length;
  const progress = stages.length > 0 ? Math.round((greenCount / stages.length) * 100) : 0;

  const formattedDate = new Date(lead.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusLabel: Record<string, string> = {
    green: '모든 단계 정상 진행 중',
    red: '이슈 발생 — 확인 필요',
    gray: '진행 전 단계 존재',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-container-mobile py-sm bg-background border-b border-outline-variant">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>
            arrow_back
          </span>
        </button>
        <h1 className="flex-1 text-headline-md font-semibold text-primary truncate">
          {lead.company_name}
        </h1>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-error-container/30 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
            delete_outline
          </span>
        </button>
      </header>

      <main className="px-container-mobile mt-lg space-y-md">
        {/* Lead Info Card */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          <div className="flex items-start justify-between mb-md">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  overallStatus === 'green'
                    ? 'bg-status-green/10'
                    : overallStatus === 'red'
                    ? 'bg-status-red/10'
                    : 'bg-status-gray/10'
                }`}
              >
                <TrafficLight status={overallStatus} size="lg" />
              </div>
              <div>
                <h2 className="text-headline-md font-semibold text-primary">{lead.company_name}</h2>
                <p className="text-label-sm text-secondary">{statusLabel[overallStatus]}</p>
              </div>
            </div>
          </div>

          <div className="space-y-sm">
            <InfoRow icon="category" label="아이템" value={lead.item_name} />
            {lead.current_packaging && (
              <InfoRow icon="inventory_2" label="기존 포장재" value={lead.current_packaging} />
            )}
            <InfoRow icon="calendar_today" label="등록일" value={formattedDate} />
          </div>

          {/* Progress */}
          <div className="mt-md">
            <div className="flex justify-between items-center mb-xs">
              <span className="text-label-md text-secondary uppercase tracking-widest">
                전체 진행률
              </span>
              <span className="text-label-md text-primary tabular-nums font-semibold">
                {greenCount} / {stages.length} 단계 완료 ({progress}%)
              </span>
            </div>
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  overallStatus === 'red' ? 'bg-status-red' : 'bg-status-green'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Stage Sections */}
        <section>
          <h3 className="text-headline-sm font-semibold text-primary mb-sm">단계별 진행현황</h3>
          <div className="space-y-sm">
            {stages.map((stage) => (
              <StageSection key={stage.id} stage={stage} onUpdated={loadData} />
            ))}
          </div>
        </section>

        {/* Status Legend */}
        <section className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-md">
          <h4 className="text-label-md text-secondary uppercase tracking-widest mb-sm">상태 범례</h4>
          <div className="space-y-xs">
            <LegendRow color="bg-status-green" label="초록" desc="완료 / 정상 진행" />
            <LegendRow color="bg-status-red" label="빨강" desc="이슈 발생 — 즉시 조치 필요" />
            <LegendRow color="bg-status-gray" label="회색" desc="미시작 / 진행 전" />
          </div>
          <p className="mt-sm text-label-sm text-secondary">
            * 아이콘을 클릭하면 상태가 순환 변경됩니다 (회색 → 초록 → 빨강 → 회색)
          </p>
        </section>
      </main>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontSize: 16, marginTop: 2 }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-label-md text-secondary uppercase tracking-widest">{label}: </span>
        <span className="text-body-md text-on-surface">{value}</span>
      </div>
    </div>
  );
}

function LegendRow({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-3 h-3 rounded-full ${color}`} />
      <span className="text-label-md text-secondary font-semibold">{label}</span>
      <span className="text-label-sm text-secondary">— {desc}</span>
    </div>
  );
}

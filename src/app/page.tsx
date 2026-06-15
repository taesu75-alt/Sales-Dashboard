'use client';
import { useEffect, useState, useCallback } from 'react';
import { getLeads, getStagesWithItems, deleteLead } from '@/lib/db';
import type { Lead, Stage } from '@/lib/types';
import { computeLeadStatus } from '@/lib/types';
import LeadCard from '@/components/LeadCard';
import AddLeadModal from '@/components/AddLeadModal';
import TrafficLight from '@/components/TrafficLight';

type LeadWithStages = Lead & { stages: Stage[] };

export default function DashboardPage() {
  const [leads, setLeads] = useState<LeadWithStages[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'green' | 'red' | 'gray'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rawLeads = await getLeads();
      const withStages = await Promise.all(
        rawLeads.map(async (lead) => {
          const stages = await getStagesWithItems(lead.id);
          return { ...lead, stages };
        })
      );
      setLeads(withStages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLeads =
    filter === 'all'
      ? leads
      : leads.filter((l) => computeLeadStatus(l.stages) === filter);

  const greenCount = leads.filter((l) => computeLeadStatus(l.stages) === 'green').length;
  const redCount = leads.filter((l) => computeLeadStatus(l.stages) === 'red').length;
  const grayCount = leads.filter((l) => computeLeadStatus(l.stages) === 'gray').length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-container-mobile py-sm bg-background border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>
            inventory_2
          </span>
          <h1 className="text-headline-md font-extrabold text-primary tracking-tight">
            Pipeline Dashboard
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded text-label-md font-semibold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          리드 등록
        </button>
      </header>

      <main className="px-container-mobile">
        {/* Metrics Summary */}
        <section className="mt-lg">
          <div className="flex gap-sm overflow-x-auto no-scrollbar pb-2">
            <MetricCard label="전체 리드" value={leads.length} icon="groups" color="text-primary" />
            <MetricCard label="정상 진행" value={greenCount} icon="check_circle" color="text-status-green" />
            <MetricCard label="이슈 발생" value={redCount} icon="error" color="text-status-red" />
            <MetricCard label="진행 전" value={grayCount} icon="hourglass_empty" color="text-status-gray" />
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="mt-md">
          <div className="flex gap-sm overflow-x-auto no-scrollbar">
            {(['all', 'green', 'red', 'gray'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md transition-colors flex-shrink-0 ${
                  filter === f
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-secondary hover:bg-surface-container-high'
                }`}
              >
                {f !== 'all' && <TrafficLight status={f} size="sm" />}
                {f === 'all' ? '전체' : f === 'green' ? '정상 진행' : f === 'red' ? '이슈 발생' : '진행 전'}
                <span className="tabular-nums">
                  ({f === 'all' ? leads.length : f === 'green' ? greenCount : f === 'red' ? redCount : grayCount})
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Lead List */}
        <section className="mt-md space-y-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-secondary animate-spin" style={{ fontSize: 32 }}>
                progress_activity
              </span>
              <p className="text-body-md text-secondary">리드를 불러오는 중...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 48 }}>
                inbox
              </span>
              <p className="text-body-md text-secondary">
                {filter === 'all' ? '등록된 리드가 없습니다.' : '해당하는 리드가 없습니다.'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 px-4 py-2 bg-primary text-on-primary rounded text-body-md font-semibold hover:bg-primary/90 transition-colors"
                >
                  첫 번째 리드 등록
                </button>
              )}
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} stages={lead.stages} />
            ))
          )}
        </section>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-gutter w-14 h-14 bg-primary text-on-primary rounded-full shadow-card flex items-center justify-center hover:bg-primary/90 active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>add</span>
      </button>

      {/* Modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="flex-shrink-0 w-36 bg-surface-container-lowest border border-outline-variant p-md rounded-xl">
      <p className="text-label-md text-secondary uppercase tracking-widest">{label}</p>
      <h2 className={`text-headline-md mt-xs tabular-nums ${color}`}>{value}</h2>
      <div className="flex items-center gap-1 mt-xs">
        <span className={`material-symbols-outlined ${color}`} style={{ fontSize: 14 }}>
          {icon}
        </span>
      </div>
    </div>
  );
}

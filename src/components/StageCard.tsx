'use client';
import { useState } from 'react';
import type { Stage, StageItem, Status } from '@/lib/types';
import { computeStageStatus } from '@/lib/types';
import { addStageItem, updateStageItem, deleteStageItem } from '@/lib/db';
import { STATUS_HEX, STATUS_LABEL, STATUS_BG_ALPHA, STATUS_BORDER } from '@/lib/statusColors';

interface Props {
  stage: Stage;
  onUpdated: () => void;
}

const statusCycle: Record<Status, Status> = {
  gray: 'green', green: 'yellow', yellow: 'red', red: 'gray',
};

export default function StageCard({ stage, onUpdated }: Props) {
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [loading, setLoading] = useState(false);

  const items = stage.items ?? [];
  const stageStatus = computeStageStatus(items);
  const doneCount = items.filter((i) => i.status === 'green').length;

  async function handleAddItem() {
    if (!newItemName.trim()) return;
    setLoading(true);
    try {
      await addStageItem(stage.id, newItemName.trim());
      setNewItemName('');
      setAddingItem(false);
      onUpdated();
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusCycle(item: StageItem) {
    await updateStageItem(item.id, { status: statusCycle[item.status] });
    onUpdated();
  }

  async function handleDeleteItem(id: string) {
    await deleteStageItem(id);
    onUpdated();
  }

  async function handleSaveNotes(item: StageItem) {
    await updateStageItem(item.id, { notes: notesValue });
    setEditingNotes(null);
    onUpdated();
  }

  return (
    <div
      className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-200"
      style={{ border: `2px solid ${STATUS_BORDER[stageStatus]}` }}
    >
      {/* 카드 헤더 */}
      <div
        className="flex items-center justify-between px-sm py-xs"
        style={{ backgroundColor: STATUS_BG_ALPHA[stageStatus] }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: STATUS_HEX[stageStatus] }}
          />
          <span className="text-[13px] font-semibold text-primary truncate">{stage.name}</span>
        </div>
        <span className="text-[10px] text-secondary tabular-nums flex-shrink-0 ml-1">
          {doneCount}/{items.length}
        </span>
      </div>

      {/* 소항목 목록 */}
      <div className="flex-1 divide-y divide-outline-variant/20">
        {items.length === 0 && (
          <p className="px-sm py-sm text-label-sm text-secondary text-center">항목 없음</p>
        )}
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-center gap-1.5 px-sm py-xs group">
              {/* 신호등 버튼 */}
              <button
                onClick={() => handleStatusCycle(item)}
                className="flex-shrink-0 hover:scale-110 transition-transform"
                title={`현재: ${STATUS_LABEL[item.status]} → 클릭하여 변경`}
              >
                <span
                  className="w-3 h-3 rounded-full block"
                  style={{ backgroundColor: STATUS_HEX[item.status] }}
                />
              </button>

              <span className="flex-1 text-[12px] text-on-surface leading-tight">{item.name}</span>

              <button
                onClick={() => {
                  if (editingNotes === item.id) { setEditingNotes(null); }
                  else { setEditingNotes(item.id); setNotesValue(item.notes ?? ''); }
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                title="메모"
              >
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 13 }}>
                  {item.notes ? 'description' : 'add_notes'}
                </span>
              </button>

              {!item.is_default && (
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 13 }}>close</span>
                </button>
              )}
            </div>

            {item.notes && editingNotes !== item.id && (
              <p className="px-sm pb-xs text-[10px] text-secondary italic pl-6 leading-tight">{item.notes}</p>
            )}

            {editingNotes === item.id && (
              <div className="px-sm pb-sm">
                <textarea
                  autoFocus
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="세부사항 입력..."
                  rows={2}
                  className="w-full text-[12px] text-on-surface bg-surface-container-low border border-outline-variant rounded px-2 py-1.5 focus:outline-none focus:border-primary resize-none"
                />
                <div className="flex gap-sm mt-xs">
                  <button onClick={() => setEditingNotes(null)} className="text-[11px] text-secondary">취소</button>
                  <button onClick={() => handleSaveNotes(item)} className="text-[11px] text-primary font-semibold">저장</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 소항목 추가 */}
      <div className="border-t border-outline-variant/20 px-sm py-xs">
        {addingItem ? (
          <div className="flex flex-col gap-xs">
            <input
              autoFocus
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
                if (e.key === 'Escape') { setAddingItem(false); setNewItemName(''); }
              }}
              placeholder="항목명 입력..."
              className="w-full text-[12px] border border-outline-variant rounded px-2 py-1 focus:outline-none focus:border-primary bg-surface-container-lowest"
            />
            <div className="flex gap-xs">
              <button onClick={handleAddItem} disabled={loading || !newItemName.trim()}
                className="flex-1 py-0.5 bg-primary text-on-primary text-[11px] rounded disabled:opacity-50">추가</button>
              <button onClick={() => { setAddingItem(false); setNewItemName(''); }}
                className="flex-1 py-0.5 text-[11px] text-secondary border border-outline-variant rounded">취소</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingItem(true)}
            className="flex items-center gap-0.5 text-[11px] text-secondary hover:text-primary transition-colors w-full">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
            소항목 추가
          </button>
        )}
      </div>
    </div>
  );
}

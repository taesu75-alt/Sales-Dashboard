'use client';
import { useState } from 'react';
import type { Stage, StageItem, Status } from '@/lib/types';
import { computeStageStatus } from '@/lib/types';
import { addStageItem, updateStageItem, deleteStageItem } from '@/lib/db';
import TrafficLight from './TrafficLight';
import StatusBadge from './StatusBadge';

interface Props {
  stage: Stage;
  onUpdated: () => void;
}

const statusCycle: Record<Status, Status> = {
  gray: 'green',
  green: 'red',
  red: 'gray',
};

const statusIcon: Record<Status, string> = {
  green: 'check_circle',
  red: 'error',
  gray: 'radio_button_unchecked',
};

const statusIconColor: Record<Status, string> = {
  green: 'text-status-green',
  red: 'text-status-red',
  gray: 'text-status-gray',
};

export default function StageSection({ stage, onUpdated }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [loading, setLoading] = useState(false);

  const items = stage.items ?? [];
  const stageStatus = computeStageStatus(items);

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

  async function handleDeleteItem(item: StageItem) {
    if (!confirm(`"${item.name}" 항목을 삭제하시겠습니까?`)) return;
    await deleteStageItem(item.id);
    onUpdated();
  }

  async function handleSaveNotes(item: StageItem) {
    await updateStageItem(item.id, { notes: notesValue });
    setEditingNotes(null);
    onUpdated();
  }

  return (
    <div
      className={`bg-surface-container-lowest border rounded-xl overflow-hidden transition-all duration-150 ${
        stageStatus === 'red' ? 'border-l-4 border-l-status-red border-outline-variant' : 'border-outline-variant'
      }`}
    >
      {/* Stage Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center p-md text-left hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrafficLight status={stageStatus} size="sm" />
          <div>
            <h4 className="text-headline-sm font-semibold text-primary">{stage.name}</h4>
            {stage.name_en && (
              <p className="text-label-sm text-secondary">{stage.name_en}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={stageStatus} />
          <span
            className="material-symbols-outlined text-secondary transition-transform duration-200"
            style={{
              fontSize: 20,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Stage Items */}
      {expanded && (
        <div className="border-t border-outline-variant/30">
          <div className="divide-y divide-outline-variant/20">
            {items.map((item) => (
              <div key={item.id} className="px-md py-xs">
                {/* Item Row */}
                <div className="flex items-center gap-2 py-xs">
                  <button
                    onClick={() => handleStatusCycle(item)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                    title="클릭하여 상태 변경"
                  >
                    <span
                      className={`material-symbols-outlined ${statusIconColor[item.status]}`}
                      style={{
                        fontSize: 22,
                        fontVariationSettings: `'FILL' 1`,
                      }}
                    >
                      {statusIcon[item.status]}
                    </span>
                  </button>

                  <span className="flex-1 text-body-md text-on-surface">{item.name}</span>

                  {/* Notes toggle */}
                  <button
                    onClick={() => {
                      if (editingNotes === item.id) {
                        setEditingNotes(null);
                      } else {
                        setEditingNotes(item.id);
                        setNotesValue(item.notes ?? '');
                      }
                    }}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container transition-colors"
                    title="세부사항 입력"
                  >
                    <span
                      className={`material-symbols-outlined text-secondary`}
                      style={{ fontSize: 16 }}
                    >
                      {item.notes ? 'description' : 'add_notes'}
                    </span>
                  </button>

                  {/* Delete (non-default items only) */}
                  {!item.is_default && (
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-error-container/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>
                        delete_outline
                      </span>
                    </button>
                  )}
                </div>

                {/* Notes Input */}
                {editingNotes === item.id && (
                  <div className="pl-7 pb-sm">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="세부사항을 입력하세요..."
                      rows={2}
                      className="w-full text-body-md text-on-surface bg-surface-container-low border border-outline-variant rounded px-3 py-2 focus:outline-none focus:border-primary resize-none transition-colors"
                    />
                    <div className="flex gap-sm mt-xs">
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="text-label-md text-secondary hover:text-primary transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleSaveNotes(item)}
                        className="text-label-md text-primary font-semibold hover:underline transition-colors"
                      >
                        저장
                      </button>
                    </div>
                    {item.notes && (
                      <p className="mt-xs text-label-sm text-secondary bg-surface-container rounded px-2 py-1">
                        현재: {item.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes Display */}
                {editingNotes !== item.id && item.notes && (
                  <p className="pl-7 pb-xs text-label-sm text-secondary italic">{item.notes}</p>
                )}
              </div>
            ))}
          </div>

          {/* Add Item */}
          <div className="px-md py-sm border-t border-outline-variant/20">
            {addingItem ? (
              <div className="flex items-center gap-sm">
                <input
                  autoFocus
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem();
                    if (e.key === 'Escape') { setAddingItem(false); setNewItemName(''); }
                  }}
                  placeholder="새 항목명 입력 후 Enter"
                  className="flex-1 text-body-md border border-outline-variant rounded px-3 py-1.5 focus:outline-none focus:border-primary bg-surface-container-lowest"
                />
                <button
                  onClick={handleAddItem}
                  disabled={loading || !newItemName.trim()}
                  className="px-3 py-1.5 bg-primary text-on-primary text-label-md rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => { setAddingItem(false); setNewItemName(''); }}
                  className="px-3 py-1.5 text-label-md text-secondary hover:text-primary transition-colors"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingItem(true)}
                className="flex items-center gap-1 text-label-md text-secondary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                소항목 추가
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

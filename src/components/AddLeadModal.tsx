'use client';
import { useState } from 'react';
import { createLead } from '@/lib/db';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddLeadModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    company_name: '',
    item_name: '',
    current_packaging: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim() || !form.item_name.trim()) {
      setError('고객사와 아이템은 필수입니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createLead({
        company_name: form.company_name.trim(),
        item_name: form.item_name.trim(),
        current_packaging: form.current_packaging.trim() || undefined,
      });
      onCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setError(`오류: ${msg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[4px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-surface-container-lowest rounded-t-xl sm:rounded-xl border border-outline-variant p-md shadow-card">
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-headline-sm font-semibold text-primary">영업 리드 등록</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md">
          <div>
            <label className="block text-label-md text-secondary uppercase tracking-widest mb-xs">
              고객사 *
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              placeholder="예: (주)삼성전자"
              className="w-full border border-outline-variant rounded px-3 py-2 text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-label-md text-secondary uppercase tracking-widest mb-xs">
              아이템 *
            </label>
            <input
              type="text"
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              placeholder="예: 냉동 간편식 파우치"
              className="w-full border border-outline-variant rounded px-3 py-2 text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-label-md text-secondary uppercase tracking-widest mb-xs">
              기존 포장재 구성
            </label>
            <textarea
              value={form.current_packaging}
              onChange={(e) => setForm({ ...form, current_packaging: e.target.value })}
              placeholder="예: PE 단층 / 3겹 구성 / 파우치 250g"
              rows={3}
              className="w-full border border-outline-variant rounded px-3 py-2 text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-[12px] text-error bg-error-container/50 rounded px-3 py-2">{error}</p>
          )}

          <div className="flex gap-sm pt-xs">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded border border-outline-variant text-body-md text-primary bg-white hover:bg-surface-container-low transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded bg-primary text-on-primary text-body-md font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? '등록 중...' : '리드 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

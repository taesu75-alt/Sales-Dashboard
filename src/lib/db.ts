import { supabase } from './supabase';
import type { Lead, Stage, StageItem, Status } from './types';
import { DEFAULT_STAGES } from './types';

// ── Leads ──────────────────────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function createLead(params: {
  company_name: string;
  item_name: string;
  current_packaging?: string;
}): Promise<Lead> {
  const { data: lead, error } = await supabase.from('leads').insert(params).select().single();
  if (error) throw error;

  // 기본 스테이지 + 소항목 생성
  for (let i = 0; i < DEFAULT_STAGES.length; i++) {
    const tpl = DEFAULT_STAGES[i];
    const { data: stage, error: stageErr } = await supabase
      .from('stages')
      .insert({ lead_id: lead.id, name: tpl.name, name_en: tpl.name_en, order_index: i + 1 })
      .select()
      .single();
    if (stageErr) throw stageErr;

    if (tpl.items.length > 0) {
      const items = tpl.items.map((name) => ({
        stage_id: stage.id,
        name,
        status: 'gray' as Status,
        is_default: true,
      }));
      const { error: itemsErr } = await supabase.from('stage_items').insert(items);
      if (itemsErr) throw itemsErr;
    }
  }

  return lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

// ── Stages ─────────────────────────────────────────────────────────────────

export async function getStagesWithItems(leadId: string): Promise<Stage[]> {
  const { data: stages, error } = await supabase
    .from('stages')
    .select('*, items:stage_items(*)')
    .eq('lead_id', leadId)
    .order('order_index');
  if (error) throw error;
  return (stages ?? []) as Stage[];
}

// ── Stage Items ────────────────────────────────────────────────────────────

export async function addStageItem(stageId: string, name: string): Promise<StageItem> {
  const { data, error } = await supabase
    .from('stage_items')
    .insert({ stage_id: stageId, name, status: 'gray' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStageItem(
  id: string,
  updates: Partial<Pick<StageItem, 'status' | 'notes' | 'name'>>
): Promise<StageItem> {
  const { data, error } = await supabase
    .from('stage_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStageItem(id: string): Promise<void> {
  const { error } = await supabase.from('stage_items').delete().eq('id', id);
  if (error) throw error;
}

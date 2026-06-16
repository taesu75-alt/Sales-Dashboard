export type Status = 'green' | 'yellow' | 'red' | 'gray';

export interface StageItem {
  id: string;
  stage_id: string;
  name: string;
  status: Status;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: string;
  lead_id: string;
  name: string;
  name_en: string | null;
  order_index: number;
  created_at: string;
  items?: StageItem[];
}

export interface Lead {
  id: string;
  company_name: string;
  item_name: string;
  current_packaging: string | null;
  created_at: string;
  updated_at: string;
  stages?: Stage[];
}

// 빨강 > 노랑 > 회색 > 초록 우선순위
export function computeStageStatus(items: StageItem[]): Status {
  if (items.length === 0) return 'gray';
  if (items.some((i) => i.status === 'red')) return 'red';
  if (items.some((i) => i.status === 'yellow')) return 'yellow';
  if (items.some((i) => i.status === 'gray')) return 'gray';
  return 'green';
}

export function computeLeadStatus(stages: Stage[]): Status {
  const allItems = stages.flatMap((s) => s.items ?? []);
  return computeStageStatus(allItems);
}

export const DEFAULT_STAGES: { name: string; name_en: string; items: string[] }[] = [
  {
    name: '포장개발',
    name_en: 'Packaging R&D',
    items: ['포장재 타입 (자동롤/파우치 타입)', '포장재 설계 확정', '품질 (보존성)'],
  },
  {
    name: '공장',
    name_en: 'Factory Processing',
    items: ['라인 테스트', '라인 적합성'],
  },
  {
    name: '영업',
    name_en: 'Sales Dept',
    items: ['영업 조건 협의', '견적서 발송'],
  },
  {
    name: '마케팅',
    name_en: 'Marketing',
    items: ['마케팅 전략 수립', '홍보 자료 준비'],
  },
  {
    name: '디자인',
    name_en: 'Design Studio',
    items: ['인쇄방식', '인쇄 적합성'],
  },
  {
    name: '구매',
    name_en: 'Procurement',
    items: ['단가협의 (Price Negotiation)'],
  },
  {
    name: '경영진 승인',
    name_en: 'Executive Approval',
    items: ['최종 승인'],
  },
  {
    name: '외부고객 협의',
    name_en: 'External Client Review',
    items: ['고객사 최종 검토', '계약 체결'],
  },
];

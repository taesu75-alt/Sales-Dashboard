import type { Status } from './types';

export const STATUS_HEX: Record<Status, string> = {
  green:  '#22C55E',
  yellow: '#EAB308',
  red:    '#EF4444',
  gray:   '#94A3B8',
};

export const STATUS_LABEL: Record<Status, string> = {
  green:  '완료',
  yellow: '진행 중',
  red:    '이슈',
  gray:   '미시작',
};

export const STATUS_BG_ALPHA: Record<Status, string> = {
  green:  'rgba(34,197,94,0.08)',
  yellow: 'rgba(234,179,8,0.08)',
  red:    'rgba(239,68,68,0.08)',
  gray:   'rgba(148,163,184,0.08)',
};

export const STATUS_BORDER: Record<Status, string> = {
  green:  'rgba(34,197,94,0.4)',
  yellow: 'rgba(234,179,8,0.5)',
  red:    'rgba(239,68,68,0.6)',
  gray:   '#c6c6cd',
};

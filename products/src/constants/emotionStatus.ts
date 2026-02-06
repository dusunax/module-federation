// 감정 상태 상수 및 메타데이터
export const EMOTION_STATUS = {
  NOTICING: 'noticing',
  HELD: 'held',
  BEING_UNDERSTOOD: 'being_understood',
  REMEMBERED: 'remembered',
} as const;

export type EmotionStatusType = (typeof EMOTION_STATUS)[keyof typeof EMOTION_STATUS];

interface StatusConfig {
  color: string;
  label?: string;
  icon?: string | null;
  order: number;
}

export interface StatusStyle {
  color: string;
  label: string;
  icon: string | null;
}

// 상태별 메타데이터
export const EMOTION_STATUS_CONFIG: Record<EmotionStatusType, StatusConfig> = {
  [EMOTION_STATUS.NOTICING]: {
    color: 'rgba(255, 248, 212, 0.7)',
    order: 1,
  },
  [EMOTION_STATUS.HELD]: {
    color: '#A3B087',
    order: 2,
  },
  [EMOTION_STATUS.BEING_UNDERSTOOD]: {
    color: 'rgba(163, 176, 135, 0.9)',
    label: '기억하는 중',
    order: 3,
  },
  [EMOTION_STATUS.REMEMBERED]: {
    color: '#FFF8D4',
    label: '기억됨',
    order: 4,
  },
};

// 유효한 상태 값인지 검증
export const isValidStatus = (status: string): status is EmotionStatusType => {
  return Object.values(EMOTION_STATUS).includes(status as EmotionStatusType);
};

// 상태별 스타일 가져오기
export const getStatusConfig = (status: string): StatusStyle => {
  const cfg = EMOTION_STATUS_CONFIG[status as EmotionStatusType] || EMOTION_STATUS_CONFIG[EMOTION_STATUS.NOTICING];
  return {
    color: cfg.color,
    label: cfg.label || '',
    icon: cfg.icon || null,
  };
};

// 모든 상태 목록 가져오기 (순서대로)
export const getAllStatuses = (): EmotionStatusType[] => {
  return (Object.values(EMOTION_STATUS) as EmotionStatusType[]).sort((a, b) => {
    return EMOTION_STATUS_CONFIG[a].order - EMOTION_STATUS_CONFIG[b].order;
  });
};

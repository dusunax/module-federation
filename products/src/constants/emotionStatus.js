// 감정 상태 상수 및 메타데이터
export const EMOTION_STATUS = {
  NOTICING: 'noticing',
  HELD: 'held',
  BEING_UNDERSTOOD: 'being_understood',
  REMEMBERED: 'remembered',
};

// 상태별 메타데이터
export const EMOTION_STATUS_CONFIG = {
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
export const isValidStatus = (status) => {
  return Object.values(EMOTION_STATUS).includes(status);
};

// 상태별 스타일 가져오기
export const getStatusConfig = (status) => {
  const cfg = EMOTION_STATUS_CONFIG[status] || EMOTION_STATUS_CONFIG[EMOTION_STATUS.NOTICING];
  return {
    color: cfg.color,
    label: cfg.label || '',
    icon: cfg.icon || null,
  };
};

// 모든 상태 목록 가져오기 (순서대로)
export const getAllStatuses = () => {
  return Object.values(EMOTION_STATUS).sort((a, b) => {
    return EMOTION_STATUS_CONFIG[a].order - EMOTION_STATUS_CONFIG[b].order;
  });
};

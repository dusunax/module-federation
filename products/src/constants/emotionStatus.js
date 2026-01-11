// 감정 상태 상수 및 메타데이터
export const EMOTION_STATUS = {
  NOTICING: "noticing",
  HELD: "held",
  BEING_UNDERSTOOD: "being_understood",
  REMEMBERED: "remembered",
};

// 상태별 메타데이터
export const EMOTION_STATUS_CONFIG = {
  [EMOTION_STATUS.NOTICING]: {
    color: "rgba(255, 248, 212, 0.7)",
    icon: "1️⃣",
    label: "보이는 중이에요",
    order: 1,
  },
  [EMOTION_STATUS.HELD]: {
    color: "#A3B087",
    icon: "2️⃣",
    label: "잠시 붙잡아 두었어요",
    order: 2,
  },
  [EMOTION_STATUS.BEING_UNDERSTOOD]: {
    color: "rgba(163, 176, 135, 0.9)",
    icon: "3️⃣",
    label: "이해되는 중이에요",
    order: 3,
  },
  [EMOTION_STATUS.REMEMBERED]: {
    color: "#FFF8D4",
    icon: "4️⃣",
    label: "기억으로 남았어요",
    order: 4,
  },
};

// 유효한 상태 값인지 검증
export const isValidStatus = (status) => {
  return Object.values(EMOTION_STATUS).includes(status);
};

// 상태별 스타일 가져오기
export const getStatusConfig = (status) => {
  return (
    EMOTION_STATUS_CONFIG[status] ||
    EMOTION_STATUS_CONFIG[EMOTION_STATUS.NOTICING]
  );
};

// 모든 상태 목록 가져오기 (순서대로)
export const getAllStatuses = () => {
  return Object.values(EMOTION_STATUS).sort((a, b) => {
    return EMOTION_STATUS_CONFIG[a].order - EMOTION_STATUS_CONFIG[b].order;
  });
};

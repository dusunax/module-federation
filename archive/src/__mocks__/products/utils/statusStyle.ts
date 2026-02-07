export const EMOTION_STATUS = {
  REMEMBERED: 'REMEMBERED',
};

export function getStatusConfig(_status: string) {
  return {
    label: '기억됨',
    color: 'rgba(255, 248, 212, 0.7)',
    icon: '◎',
  };
}

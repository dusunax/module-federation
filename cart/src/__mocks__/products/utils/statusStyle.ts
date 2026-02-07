export const EMOTION_STATUS = {
  HELD: 'HELD',
  NOTICING: 'NOTICING',
};

export function getStatusConfig(_status: string) {
  return {
    label: '보관 중',
    color: 'rgba(255, 248, 212, 0.7)',
    icon: '◎',
  };
}

import { describe, expect, it } from 'vitest';
import { EMOTION_STATUS, getAllStatuses, getStatusConfig, isValidStatus } from '../constants';

describe('emotion status helpers', () => {
  it('설정된 순서로 상태를 반환한다', () => {
    const statuses = getAllStatuses();
    expect(statuses).toEqual([
      EMOTION_STATUS.NOTICING,
      EMOTION_STATUS.HELD,
      EMOTION_STATUS.BEING_UNDERSTOOD,
      EMOTION_STATUS.REMEMBERED,
    ]);
  });

  it('알려진 상태와 알 수 없는 상태를 검증한다', () => {
    expect(isValidStatus(EMOTION_STATUS.HELD)).toBe(true);
    expect(isValidStatus('unknown')).toBe(false);
  });

  it('알 수 없는 상태는 기본 설정으로 처리한다', () => {
    const fallback = getStatusConfig('unknown');
    const noticing = getStatusConfig(EMOTION_STATUS.NOTICING);
    expect(fallback).toEqual(noticing);
  });
});

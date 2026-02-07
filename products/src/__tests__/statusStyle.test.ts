import { describe, expect, it } from 'vitest';
import { EMOTION_STATUS, getAllStatuses, getStatusConfig, isValidStatus } from '../constants';

describe('emotion status helpers', () => {
  it('returns statuses in configured order', () => {
    const statuses = getAllStatuses();
    expect(statuses).toEqual([
      EMOTION_STATUS.NOTICING,
      EMOTION_STATUS.HELD,
      EMOTION_STATUS.BEING_UNDERSTOOD,
      EMOTION_STATUS.REMEMBERED,
    ]);
  });

  it('validates known and unknown statuses', () => {
    expect(isValidStatus(EMOTION_STATUS.HELD)).toBe(true);
    expect(isValidStatus('unknown')).toBe(false);
  });

  it('falls back to noticing config for unknown status', () => {
    const fallback = getStatusConfig('unknown');
    const noticing = getStatusConfig(EMOTION_STATUS.NOTICING);
    expect(fallback).toEqual(noticing);
  });
});

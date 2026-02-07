import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConditionHintPopup from '../components/ConditionHintPopup';
import { CurrentConditions, VisibilityCondition } from '../utils/conditions';

describe('ConditionHintPopup', () => {
  it('항상 그룹을 표시하고 활성/비활성 그룹을 정렬한다', () => {
    const emotions: Array<{ emoji?: string; visibility?: VisibilityCondition }> = [
      { emoji: '😄', visibility: { time: [], day: [], weather: [], season: [], event: [] } },
      { emoji: '🌙', visibility: { time: ['night'], day: [], weather: [], season: [], event: [] } },
      { emoji: '☀️', visibility: { time: ['day'], day: [], weather: [], season: [], event: [] } },
    ];
    const conditions: CurrentConditions = {
      time: 'day',
      day: 'monday',
      dayExtras: ['weekday'],
      weather: 'clear',
      season: 'spring',
      events: [],
    };

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={conditions}
        isOpen
        onClose={() => {}}
      />
    );

    const popup = screen.getByLabelText('condition-hint-popup');
    const labels = within(popup).getAllByText(/:$/).map((el) => el.textContent);
    expect(labels).toEqual(['항상:', '낮:', '밤:']);

    const nightRow = screen.getByText('밤:').closest('div');
    expect(nightRow).toBeTruthy();
    expect(within(nightRow as HTMLElement).getByText('-')).toBeInTheDocument();

    const dayRow = screen.getByText('낮:').closest('div');
    expect(dayRow).toBeTruthy();
    expect(within(dayRow as HTMLElement).queryByText('-')).toBeNull();
    expect(within(dayRow as HTMLElement).getByText('☀️')).toBeInTheDocument();
  });
});

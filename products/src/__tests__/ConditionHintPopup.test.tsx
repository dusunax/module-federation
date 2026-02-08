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
    expect(within(popup).getByText('단일 조건')).toBeInTheDocument();

    const nightLabel = screen.getByText('밤:');
    const nightRow = nightLabel.closest('div')?.parentElement;
    expect(nightRow).toBeTruthy();
    expect(within(nightRow as HTMLElement).getByText('-')).toBeInTheDocument();

    const dayLabel = screen.getByText('낮:');
    const dayRow = dayLabel.closest('div')?.parentElement;
    expect(dayRow).toBeTruthy();
    expect(within(dayRow as HTMLElement).queryByText('-')).toBeNull();
    expect(within(dayRow as HTMLElement).getByText('☀️')).toBeInTheDocument();
  });

  it('여러 조건을 조합한 항목을 표시한다', () => {
    const emotions: Array<{ emoji?: string; visibility?: VisibilityCondition }> = [
      { emoji: '❄️', visibility: { time: [], day: ['weekend'], weather: ['clear'], season: ['winter'], event: [] } },
    ];
    const conditions: CurrentConditions = {
      time: 'day',
      day: 'saturday',
      dayExtras: ['weekend'],
      weather: 'clear',
      season: 'winter',
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
    expect(labels).toEqual(['주말 · 맑음 · 겨울:']);
    expect(within(popup).getByText('복합 조건')).toBeInTheDocument();

    const comboLabel = screen.getByText('주말 · 맑음 · 겨울:');
    const comboRow = comboLabel.closest('div')?.parentElement;
    expect(comboRow).toBeTruthy();
    expect(within(comboRow as HTMLElement).getByText('❄️')).toBeInTheDocument();
  });

  it('항상 그룹을 단일 조건 섹션에 포함한다', () => {
    const emotions: Array<{ emoji?: string; visibility?: VisibilityCondition }> = [
      { emoji: '🙂', visibility: { time: [], day: [], weather: [], season: [], event: [] } },
      { emoji: '🌙', visibility: { time: ['night'], day: [], weather: [], season: [], event: [] } },
    ];
    const conditions: CurrentConditions = {
      time: 'night',
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
    const singleHeader = within(popup).getByText('단일 조건');
    const alwaysLabel = within(popup).getByText('항상:');
    expect(singleHeader.compareDocumentPosition(alwaysLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

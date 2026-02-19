import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import ConditionHintPopup from '../components/ConditionHintPopup';
import { CurrentConditions } from '../utils/conditions';

const baseConditions: CurrentConditions = {
  time: 'day',
  day: 'monday',
  dayExtras: ['weekday'],
  weather: 'clear',
  season: 'spring',
  events: [],
};

describe('ConditionHintPopup', () => {
  it('기본 탭은 현재 조건이며, 활성 조건만 표시한다', () => {
    const emotions = [
      { emoji: '😄', published: true, visibility: { time: [], day: [], weather: [], season: [], event: [] } },
      { emoji: '🌙', published: true, visibility: { time: ['night'] as const, day: [], weather: [], season: [], event: [] } },
      { emoji: '☀️', published: true, visibility: { time: ['day'] as const, day: [], weather: [], season: [], event: [] } },
    ];

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={baseConditions}
        isOpen
        onClose={() => {}}
      />
    );

    const currentTab = screen.getByLabelText('current-conditions-tab');
    expect(within(currentTab).getByText(/항상/)).toBeInTheDocument();
    expect(within(currentTab).getByText('☀️')).toBeInTheDocument();

    const labels = within(currentTab).getAllByText(/:$/).map((el) => el.textContent);
    expect(labels).toContain('항상:');
    expect(labels).toContain('낮:');
    expect(labels).not.toContain('밤:');
  });

  it('전체 조건 탭으로 전환하면 비활성 조건도 표시된다', async () => {
    const user = userEvent.setup();
    const emotions = [
      { emoji: '😄', published: true, visibility: { time: [], day: [], weather: [], season: [], event: [] } },
      { emoji: '🌙', published: true, visibility: { time: ['night'] as const, day: [], weather: [], season: [], event: [] } },
      { emoji: '☀️', published: true, visibility: { time: ['day'] as const, day: [], weather: [], season: [], event: [] } },
    ];

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={baseConditions}
        isOpen
        onClose={() => {}}
      />
    );

    await user.click(screen.getByLabelText('tab-all'));

    const allTab = screen.getByLabelText('all-conditions-tab');
    expect(within(allTab).getByText(/단일 조건/)).toBeInTheDocument();
    expect(within(allTab).getByText(/항상/)).toBeInTheDocument();
  });

  it('전체 조건 탭에서 비활성화 섹션을 토글할 수 있다', async () => {
    const user = userEvent.setup();
    const emotions = [
      { emoji: '☀️', published: true, visibility: { time: ['day'] as const, day: [], weather: [], season: [], event: [] } },
      { emoji: '🌙', published: true, visibility: { time: ['night'] as const, day: [], weather: [], season: [], event: [] } },
    ];

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={baseConditions}
        isOpen
        onClose={() => {}}
      />
    );

    await user.click(screen.getByLabelText('tab-all'));

    const allTab = screen.getByLabelText('all-conditions-tab');
    expect(within(allTab).queryByText('밤:')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('toggle-비활성화'));
    expect(within(allTab).getByText('밤:')).toBeInTheDocument();
  });

  it('복합 조건을 전체 조건 탭에서 별도 섹션으로 표시한다', async () => {
    const user = userEvent.setup();
    const emotions = [
      { emoji: '❄️', published: true, visibility: { time: [], day: ['weekend'] as const, weather: ['clear'] as const, season: ['winter'] as const, event: [] } },
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

    await user.click(screen.getByLabelText('tab-all'));

    const allTab = screen.getByLabelText('all-conditions-tab');
    expect(within(allTab).getByText(/복합 조건/)).toBeInTheDocument();
    expect(within(allTab).getByText('주말 · 맑음 · 겨울:')).toBeInTheDocument();
  });

  it('이벤트 조건을 기념일 섹션으로 분리하여 날짜 범위를 표시한다', async () => {
    const user = userEvent.setup();
    const emotions = [
      { emoji: '🎄', published: true, visibility: { time: [], day: [], weather: [], season: [], event: ['christmas'] } },
      { emoji: '🎃', published: true, visibility: { time: [], day: [], weather: [], season: [], event: ['halloween'] } },
    ];
    const conditions: CurrentConditions = {
      time: 'day',
      day: 'monday',
      dayExtras: ['weekday'],
      weather: 'clear',
      season: 'winter',
      events: ['christmas'],
    };

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={conditions}
        isOpen
        onClose={() => {}}
      />
    );

    await user.click(screen.getByLabelText('tab-all'));

    const allTab = screen.getByLabelText('all-conditions-tab');
    expect(within(allTab).getByText(/기념일/)).toBeInTheDocument();
    expect(within(allTab).getByText(/12\/24 ~ 12\/26/)).toBeInTheDocument();
  });

  it('현재 조건 탭에서 활성 기념일을 강조한다', () => {
    const emotions = [
      { emoji: '🎄', published: true, visibility: { time: [], day: [], weather: [], season: [], event: ['christmas'] } },
    ];
    const conditions: CurrentConditions = {
      time: 'day',
      day: 'monday',
      dayExtras: ['weekday'],
      weather: 'clear',
      season: 'winter',
      events: ['christmas'],
    };

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={conditions}
        isOpen
        onClose={() => {}}
      />
    );

    const currentTab = screen.getByLabelText('current-conditions-tab');
    expect(within(currentTab).getByText('기념일')).toBeInTheDocument();
  });

  it('전체 조건 탭에서는 활성 기념일을 별도 강조하지 않는다', async () => {
    const user = userEvent.setup();
    const emotions = [
      { emoji: '🎄', published: true, visibility: { time: [], day: [], weather: [], season: [], event: ['christmas'] } },
    ];
    const conditions: CurrentConditions = {
      time: 'day',
      day: 'monday',
      dayExtras: ['weekday'],
      weather: 'clear',
      season: 'winter',
      events: ['christmas'],
    };

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={conditions}
        isOpen
        onClose={() => {}}
      />
    );

    await user.click(screen.getByLabelText('tab-all'));

    const allTab = screen.getByLabelText('all-conditions-tab');
    expect(within(allTab).queryByText('활성')).not.toBeInTheDocument();
  });

  it('단일 조건을 카테고리별로 그룹핑하여 서브헤더를 표시한다', async () => {
    const user = userEvent.setup();
    const emotions = [
      { emoji: '☀️', published: true, visibility: { time: ['day'] as const, day: [], weather: [], season: [], event: [] } },
      { emoji: '🌸', published: true, visibility: { time: [], day: [], weather: [], season: ['spring'] as const, event: [] } },
      { emoji: '🌧️', published: true, visibility: { time: [], day: [], weather: ['clear'] as const, season: [], event: [] } },
    ];

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={baseConditions}
        isOpen
        onClose={() => {}}
      />
    );

    const currentTab = screen.getByLabelText('current-conditions-tab');
    expect(within(currentTab).getByText('시간')).toBeInTheDocument();
    expect(within(currentTab).getByText('계절')).toBeInTheDocument();
    expect(within(currentTab).getByText('날씨')).toBeInTheDocument();
  });

  it('현재 조건 탭에서 활성 조건이 없으면 항상 그룹만 표시한다', () => {
    const emotions = [
      { emoji: '😄', published: true, visibility: { time: [], day: [], weather: [], season: [], event: [] } },
      { emoji: '🌙', published: true, visibility: { time: ['night'] as const, day: [], weather: [], season: [], event: [] } },
    ];
    const conditions: CurrentConditions = {
      ...baseConditions,
      time: 'day',
    };

    render(
      <ConditionHintPopup
        emotions={emotions}
        conditions={conditions}
        isOpen
        onClose={() => {}}
      />
    );

    const currentTab = screen.getByLabelText('current-conditions-tab');
    expect(within(currentTab).getByText(/항상/)).toBeInTheDocument();
    const labels = within(currentTab).getAllByText(/:$/).map((el) => el.textContent);
    expect(labels).toEqual(['항상:']);
  });
});

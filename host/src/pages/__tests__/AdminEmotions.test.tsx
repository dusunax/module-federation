import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdminEmotions from '../AdminEmotions';
import { getAllEmotions } from '../../__mocks__/auth/services/emotionService';
import type { Emotion } from 'auth/services/emotionService';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const MOCK_EMOTIONS: Emotion[] = [
  {
    id: 1,
    name: '기쁨',
    emoji: '😊',
    rarity: 'common',
    energyCost: 1,
    category: 'joy',
    description: '기쁜 감정',
    story: '기쁨의 이야기',
    published: true,
    image: null,
    visibility: {
      time: ['day'],
      day: ['monday', 'weekday'],
      weather: ['clear'],
      season: ['spring'],
      event: ['newyear'],
    },
    rarityOrder: 1,
    createdAt: { seconds: 1620000000 },
  },
  {
    id: 2,
    name: '슬픔',
    emoji: '😢',
    rarity: 'rare',
    energyCost: 2,
    category: 'sadness',
    description: '슬픈 감정',
    story: '슬픔의 이야기',
    published: false,
    image: null,
    visibility: {
      time: [],
      day: [],
      weather: [],
      season: [],
      event: [],
    },
    rarityOrder: 2,
    createdAt: { seconds: 1620000000 },
  },
];

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderAdminEmotions() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminEmotions />
    </QueryClientProvider>,
  );
}

describe('AdminEmotions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllEmotions.mockResolvedValue(MOCK_EMOTIONS);
  });

  it('감정 목록 테이블을 렌더링한다', async () => {
    renderAdminEmotions();

    await waitFor(() => {
      expect(screen.getByText('joy')).toBeInTheDocument();
    });

    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('sadness')).toBeInTheDocument();
    expect(screen.getByText('😢')).toBeInTheDocument();
    expect(screen.getByText('감정 관리')).toBeInTheDocument();
    expect(screen.getByText('day · monday/weekday · clear · spring · newyear')).toBeInTheDocument();
  });

  it('추가 버튼 클릭 시 모달이 열리고, 취소 시 닫힌다', async () => {
    renderAdminEmotions();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('joy')).toBeInTheDocument();
    });

    await user.click(screen.getByText('추가'));
    expect(screen.getByText('감정 추가')).toBeInTheDocument();

    await user.click(screen.getByText('취소'));
    await waitFor(() => {
      expect(screen.queryByText('감정 추가')).not.toBeInTheDocument();
    });
  });

  it('필수 필드 누락 시 에러 toast를 표시한다', async () => {
    renderAdminEmotions();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('joy')).toBeInTheDocument();
    });

    await user.click(screen.getByText('추가'));
    await user.click(screen.getByText('저장'));

    expect(toast.error).toHaveBeenCalledWith('이름, 이모지, 카테고리는 필수입니다.');
  });

  it('수정 모달에서 기존 데이터를 표시한다', async () => {
    renderAdminEmotions();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('joy')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('수정');
    await user.click(editButtons[0]);

    expect(screen.getByText('감정 수정')).toBeInTheDocument();
    expect(screen.getByDisplayValue('😊')).toBeInTheDocument();
    const categorySelect = screen.getByLabelText('카테고리 *') as HTMLSelectElement;
    expect(categorySelect.value).toBe('joy');
    const timeSelect = screen.getByLabelText('노출 시간') as HTMLSelectElement;
    const daySelect = screen.getByLabelText('노출 요일') as HTMLSelectElement;
    const weatherSelect = screen.getByLabelText('노출 날씨') as HTMLSelectElement;
    const seasonSelect = screen.getByLabelText('노출 계절') as HTMLSelectElement;
    const eventSelect = screen.getByLabelText('노출 이벤트') as HTMLSelectElement;

    expect(timeSelect.value).toBe('day');
    expect(daySelect.value).toBe('monday');
    expect(weatherSelect.value).toBe('clear');
    expect(seasonSelect.value).toBe('spring');
    expect(eventSelect.value).toBe('newyear');
  });
});

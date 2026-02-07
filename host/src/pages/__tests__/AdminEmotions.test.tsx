import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdminEmotions from '../AdminEmotions';
import { getAllEmotions, createEmotion, updateEmotion } from '../../__mocks__/auth/services/emotionService';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const MOCK_EMOTIONS = [
  {
    id: 1,
    name: '기쁨',
    emoji: '😊',
    rarity: 'common',
    category: '긍정',
    description: '기쁜 감정',
    story: '기쁨의 이야기',
    effects: ['힐링', '에너지 회복'],
    published: true,
    image: null,
  },
  {
    id: 2,
    name: '슬픔',
    emoji: '😢',
    rarity: 'rare',
    category: '부정',
    description: '슬픈 감정',
    story: '슬픔의 이야기',
    effects: ['공감'],
    published: false,
    image: null,
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
      expect(screen.getByText('기쁨')).toBeInTheDocument();
    });

    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('슬픔')).toBeInTheDocument();
    expect(screen.getByText('😢')).toBeInTheDocument();
    expect(screen.getByText('감정 관리')).toBeInTheDocument();
  });

  it('추가 버튼 클릭 시 모달이 열리고, 취소 시 닫힌다', async () => {
    renderAdminEmotions();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('기쁨')).toBeInTheDocument();
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
      expect(screen.getByText('기쁨')).toBeInTheDocument();
    });

    await user.click(screen.getByText('추가'));
    await user.click(screen.getByText('저장'));

    expect(toast.error).toHaveBeenCalledWith('이름, 이모지, 카테고리는 필수입니다.');
  });

  it('수정 모달에서 기존 데이터를 표시한다', async () => {
    renderAdminEmotions();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('기쁨')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('수정');
    await user.click(editButtons[0]);

    expect(screen.getByText('감정 수정')).toBeInTheDocument();
    expect(screen.getByDisplayValue('기쁨')).toBeInTheDocument();
    expect(screen.getByDisplayValue('😊')).toBeInTheDocument();
    expect(screen.getByDisplayValue('긍정')).toBeInTheDocument();
    expect(screen.getByDisplayValue('힐링, 에너지 회복')).toBeInTheDocument();
  });
});

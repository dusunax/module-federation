import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllEmotions, createEmotion, updateEmotion } from 'auth/services/emotionService';
import { toast } from 'sonner';

interface Emotion {
  id: number;
  name: string;
  emoji: string;
  rarity: string;
  category: string;
  description: string;
  story: string;
  effects: string[];
  published: boolean;
  image: string | null;
}

interface FormData {
  id: string;
  name: string;
  emoji: string;
  rarity: string;
  category: string;
  description: string;
  story: string;
  effects: string;
  published: boolean;
}

const INITIAL_FORM: FormData = {
  id: '',
  name: '',
  emoji: '',
  rarity: 'common',
  category: '',
  description: '',
  story: '',
  effects: '',
  published: false,
};

const RARITY_OPTIONS = ['common', 'rare', 'epic'];

function EmotionModal({
  isEdit,
  form,
  onChange,
  onTogglePublished,
  onClose,
  onSave,
  saving,
}: {
  isEdit: boolean;
  form: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onTogglePublished: () => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/50">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-[var(--color-border-green)] bg-[var(--color-overlay-95)] p-6 backdrop-blur-sm">
        <h2 className="text-base font-light tracking-wide text-[var(--color-text-primary)]">
          {isEdit ? '감정 수정' : '감정 추가'}
        </h2>

        <div className="flex flex-col gap-3">
          {!isEdit && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-light text-[var(--color-text-muted)]">ID</span>
              <input
                type="number"
                value={form.id}
                onChange={(e) => onChange('id', e.target.value)}
                className="rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-3 py-2 text-sm font-light text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-green)]"
              />
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-light text-[var(--color-text-muted)]">이름</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                className="rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-3 py-2 text-sm font-light text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-green)]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-light text-[var(--color-text-muted)]">이모지</span>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => onChange('emoji', e.target.value)}
                className="rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-3 py-2 text-sm font-light text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-green)]"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-light text-[var(--color-text-muted)]">희귀도</span>
              <select
                value={form.rarity}
                onChange={(e) => onChange('rarity', e.target.value)}
                className="rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-3 py-2 text-sm font-light text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-green)]"
              >
                {RARITY_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-light text-[var(--color-text-muted)]">카테고리</span>
              <input
                type="text"
                value={form.category}
                onChange={(e) => onChange('category', e.target.value)}
                className="rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-3 py-2 text-sm font-light text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-green)]"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-light text-[var(--color-text-muted)]">설명</span>
            <textarea
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              rows={2}
              className="resize-none rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-3 py-2 text-sm font-light text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-green)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-light text-[var(--color-text-muted)]">스토리</span>
            <textarea
              value={form.story}
              onChange={(e) => onChange('story', e.target.value)}
              rows={2}
              className="resize-none rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-3 py-2 text-sm font-light text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-green)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-light text-[var(--color-text-muted)]">
              효과 (콤마로 구분)
            </span>
            <input
              type="text"
              value={form.effects}
              onChange={(e) => onChange('effects', e.target.value)}
              placeholder="효과1, 효과2, 효과3"
              className="rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-3 py-2 text-sm font-light text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-green)]"
            />
          </label>

          <label className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePublished}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ${
                form.published
                  ? 'border-[var(--color-border-green-medium)] bg-[var(--color-green-overlay-5)]'
                  : 'border-[var(--color-border-primary)] bg-[var(--color-overlay-3)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-[var(--color-text-primary)] transition-transform duration-200 ${
                  form.published ? 'translate-x-[22px]' : 'translate-x-[3px]'
                }`}
              />
            </button>
            <span className="text-xs font-light text-[var(--color-text-muted)]">퍼블리싱</span>
          </label>

        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-5)] px-4 py-2 text-[13px] font-light text-[var(--color-text-primary)] transition-all duration-200 hover:bg-[var(--color-overlay-7)]"
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="cursor-pointer rounded border border-[var(--color-border-green-medium)] bg-[var(--color-green-overlay-3)] px-4 py-2 text-[13px] font-light text-[var(--color-text-primary)] transition-all duration-200 hover:bg-[var(--color-green-overlay-5)] disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminEmotions() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const { data: emotions = [], isLoading } = useQuery<Emotion[]>({
    queryKey: ['admin-emotions'],
    queryFn: () => getAllEmotions(undefined, { includeAll: true }),
  });

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openAddModal = useCallback(() => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((emotion: Emotion) => {
    setEditingId(emotion.id);
    setForm({
      id: String(emotion.id),
      name: emotion.name,
      emoji: emotion.emoji,
      rarity: emotion.rarity,
      category: emotion.category,
      description: emotion.description,
      story: emotion.story,
      effects: emotion.effects.join(', '),
      published: emotion.published ?? false,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  }, []);

  const handleTogglePublished = useCallback(() => {
    setForm((prev) => ({ ...prev, published: !prev.published }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name || !form.emoji || !form.category) {
      toast.error('이름, 이모지, 카테고리는 필수입니다.');
      return;
    }

    const effects = form.effects
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const emotionData = {
      id: Number(form.id),
      name: form.name,
      emoji: form.emoji,
      rarity: form.rarity,
      category: form.category,
      description: form.description,
      story: form.story,
      effects,
      published: form.published,
      image: null,
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateEmotion(editingId, emotionData);
        toast.success('감정이 수정되었습니다.');
      } else {
        if (!form.id) {
          toast.error('ID는 필수입니다.');
          setSaving(false);
          return;
        }
        await createEmotion(emotionData);
        toast.success('감정이 추가되었습니다.');
      }
      await queryClient.invalidateQueries({ queryKey: ['admin-emotions'] });
      closeModal();
    } catch (error) {
      console.error('Emotion save error:', error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [form, editingId, queryClient, closeModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent-green)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-light tracking-wide text-[var(--color-text-primary)]">
          감정 관리
        </h1>
        <button
          onClick={openAddModal}
          className="cursor-pointer rounded border border-[var(--color-border-green-medium)] bg-[var(--color-green-overlay-3)] px-4 py-2 text-xs font-light text-[var(--color-text-primary)] transition-all duration-300 hover:bg-[var(--color-green-overlay-5)]"
        >
          추가
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border-primary)]">
        <table className="w-full text-left text-sm font-light">
          <thead>
            <tr className="border-b border-[var(--color-border-primary)] bg-[var(--color-overlay-2)]">
              <th className="px-4 py-3 text-xs font-light tracking-wider text-[var(--color-text-muted)]">ID</th>
              <th className="px-4 py-3 text-xs font-light tracking-wider text-[var(--color-text-muted)]">이모지</th>
              <th className="px-4 py-3 text-xs font-light tracking-wider text-[var(--color-text-muted)]">이름</th>
              <th className="px-4 py-3 text-xs font-light tracking-wider text-[var(--color-text-muted)]">희귀도</th>
              <th className="px-4 py-3 text-xs font-light tracking-wider text-[var(--color-text-muted)]">카테고리</th>
              <th className="px-4 py-3 text-xs font-light tracking-wider text-[var(--color-text-muted)]">퍼블리싱</th>
              <th className="px-4 py-3 text-xs font-light tracking-wider text-[var(--color-text-muted)]" />
            </tr>
          </thead>
          <tbody>
            {emotions.map((emotion) => (
              <tr
                key={emotion.id}
                className="border-b border-[var(--color-border-faded)] transition-colors hover:bg-[var(--color-overlay-1)]"
              >
                <td className="px-4 py-3 text-[var(--color-text-faded)]">{emotion.id}</td>
                <td className="px-4 py-3">{emotion.emoji}</td>
                <td className="px-4 py-3 text-[var(--color-text-primary)]">{emotion.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{emotion.rarity}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{emotion.category}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block h-2 w-2 rounded-full ${emotion.published ? 'bg-[var(--color-accent-green)]' : 'bg-[var(--color-overlay-5)]'}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEditModal(emotion)}
                    className="cursor-pointer rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-3)] px-3 py-1 text-xs font-light text-[var(--color-text-primary)] transition-all duration-200 hover:border-[var(--color-accent-green)] hover:bg-[var(--color-overlay-4)]"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
            {emotions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-faded)]">
                  등록된 감정이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <EmotionModal
          isEdit={editingId !== null}
          form={form}
          onChange={handleChange}
          onTogglePublished={handleTogglePublished}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}

export default AdminEmotions;

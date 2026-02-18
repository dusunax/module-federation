import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllEmotions, createEmotion, updateEmotion } from 'auth/services/emotionService';
import { toast } from 'sonner';
import type { Emotion as RemoteEmotion } from 'auth/services/emotionService';
import AdminSkeleton from '@shared/components/skeletons/AdminSkeleton';

type Emotion = RemoteEmotion;
type VisibilityCondition = Emotion['visibility'];

interface FormData {
  nameKo: string;
  nameEn: string;
  emoji: string;
  intensity: 'low' | 'middle' | 'high';
  category: string;
  descriptionKo: string;
  descriptionEn: string;
  published: boolean;
  visibilityTime: string;
  visibilityDay: string;
  visibilityWeather: string;
  visibilitySeason: string;
  visibilityEvent: string;
}

const INITIAL_FORM: FormData = {
  nameKo: '',
  nameEn: '',
  emoji: '',
  intensity: 'low',
  category: '',
  descriptionKo: '',
  descriptionEn: '',
  published: false,
  visibilityTime: '',
  visibilityDay: '',
  visibilityWeather: '',
  visibilitySeason: '',
  visibilityEvent: '',
};

const INTENSITY_OPTIONS = ['low', 'middle', 'high'];
// 상태 값은 더 이상 사용하지 않음.
const CATEGORY_OPTIONS = [
  { value: 'joy', label: '기쁨' },
  { value: 'sadness', label: '슬픔' },
  { value: 'anger', label: '분노' },
  { value: 'fear', label: '두려움' },
  { value: 'disgust', label: '혐오' },
  { value: 'surprise', label: '놀람' },
  { value: 'trust', label: '신뢰' },
  { value: 'anticipation', label: '기대' },
];
const COMPOSITE_OPTIONS = [
  { value: 'love', label: '사랑' },
  { value: 'obsession', label: '집착' },
  { value: 'anxiety', label: '불안' },
  { value: 'jealousy', label: '질투' },
  { value: 'disappointment', label: '실망' },
  { value: 'contempt', label: '경멸' },
  { value: 'discouragement', label: '낙담' },
  { value: 'guilt', label: '죄책감' },
  { value: 'hope', label: '희망' },
  { value: 'submission', label: '복종' },
  { value: 'awe', label: '경외' },
  { value: 'disapproval', label: '비난' },
  { value: 'remorse', label: '회한' },
  { value: 'aggressiveness', label: '공격성' },
  { value: 'optimism', label: '낙관' },
];
const CATEGORY_LABELS = new Map([
  ...CATEGORY_OPTIONS.map((option) => [option.value, option.label] as const),
  ...COMPOSITE_OPTIONS.map((option) => [option.value, option.label] as const),
]);
const TIME_OPTIONS: Array<VisibilityCondition['time'][number]> = ['day', 'night'];
const DAY_OPTIONS: Array<VisibilityCondition['day'][number]> = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'weekday',
  'weekend',
];
const WEATHER_OPTIONS: Array<VisibilityCondition['weather'][number]> = ['clear', 'cloudy', 'rain', 'snow', 'storm'];
const SEASON_OPTIONS: Array<VisibilityCondition['season'][number]> = ['spring', 'summer', 'autumn', 'winter'];
const EVENT_OPTIONS: string[] = ['newyear', 'valentines', 'whiteday', 'halloween', 'christmas', 'chuseok'];

function EmotionModal({
  isEdit,
  form,
  onChange,
  onTogglePublished,
  onClose,
  onSave,
  saving,
  isFormValid,
}: {
  isEdit: boolean;
  form: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onTogglePublished: () => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  isFormValid: boolean;
}) {
  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center bg-black/50">
      <div className="flex w-full max-w-2xl max-h-[85vh] flex-col gap-4 overflow-y-auto rounded-lg border border-(--color-border-green) bg-(--color-overlay-95) p-6 backdrop-blur-sm">
        <h2 className="text-base font-normal tracking-wide text-(--color-text-primary)">
          {isEdit ? '감정 수정' : '감정 추가'}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">이름 (한국어) *</span>
            <input
              type="text"
              value={form.nameKo}
              onChange={(e) => onChange('nameKo', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">이름 (영어) *</span>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => onChange('nameEn', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">이모지 *</span>
            <input
              type="text"
              value={form.emoji}
              onChange={(e) => onChange('emoji', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">강도 *</span>
            <select
              value={form.intensity}
              onChange={(e) => onChange('intensity', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            >
              {INTENSITY_OPTIONS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">카테고리 *</span>
            <select
              value={form.category}
              onChange={(e) => onChange('category', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            >
              <option value="">선택 안함</option>
              <optgroup label="기본 감정">
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.value})
                  </option>
                ))}
              </optgroup>
              <optgroup label="복합 감정">
                {COMPOSITE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.value})
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-normal text-(--color-text-muted)">설명 (한국어) *</span>
            <textarea
              value={form.descriptionKo}
              onChange={(e) => onChange('descriptionKo', e.target.value)}
              rows={2}
              className="resize-none rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-normal text-(--color-text-muted)">설명 (영어) *</span>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => onChange('descriptionEn', e.target.value)}
              rows={2}
              className="resize-none rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">노출 시간</span>
            <select
              value={form.visibilityTime}
              onChange={(e) => onChange('visibilityTime', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            >
              <option value="">항상</option>
              {TIME_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">노출 요일</span>
            <select
              value={form.visibilityDay}
              onChange={(e) => onChange('visibilityDay', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            >
              <option value="">항상</option>
              {DAY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">노출 날씨</span>
            <select
              value={form.visibilityWeather}
              onChange={(e) => onChange('visibilityWeather', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            >
              <option value="">항상</option>
              {WEATHER_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-normal text-(--color-text-muted)">노출 계절</span>
            <select
              value={form.visibilitySeason}
              onChange={(e) => onChange('visibilitySeason', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            >
              <option value="">항상</option>
              {SEASON_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-normal text-(--color-text-muted)">노출 이벤트</span>
            <select
              value={form.visibilityEvent}
              onChange={(e) => onChange('visibilityEvent', e.target.value)}
              className="rounded border border-(--color-border-primary) bg-(--color-overlay-2) px-3 py-2 text-sm font-normal text-(--color-text-primary) outline-none focus:border-(--color-accent-green)"
            >
              <option value="">선택 안함</option>
              {EVENT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 md:col-span-2">
            <button
              type="button"
              onClick={onTogglePublished}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ${
                form.published
                  ? 'border-(--color-border-green-medium) bg-(--color-green-overlay-5)'
                  : 'border-(--color-border-primary) bg-(--color-overlay-3)'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-(--color-text-primary) transition-transform duration-200 ${
                  form.published ? 'translate-x-5.5' : 'translate-x-0.75'
                }`}
              />
            </button>
            <span className="text-xs font-normal text-(--color-text-muted)">퍼블리싱</span>
          </label>

        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer rounded border border-(--color-border-primary) bg-(--color-overlay-5) px-4 py-2 text-[13px] font-normal text-(--color-text-primary) transition-all duration-200 hover:bg-(--color-overlay-7)"
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={saving || !isFormValid}
            className="cursor-pointer rounded border border-(--color-border-green-medium) bg-(--color-green-overlay-3) px-4 py-2 text-[13px] font-normal text-(--color-text-primary) transition-all duration-200 hover:bg-(--color-green-overlay-5) disabled:cursor-not-allowed disabled:opacity-50"
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
  const isFormValid = Boolean(
    form.nameKo.trim() &&
    form.nameEn.trim() &&
    form.emoji.trim() &&
    form.category.trim() &&
    form.intensity.trim() &&
    form.descriptionKo.trim() &&
    form.descriptionEn.trim(),
  );


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
  nameKo: emotion.name.ko,
  nameEn: emotion.name.en,
      emoji: emotion.emoji,
      intensity: emotion.intensity,
      category: emotion.category,
  descriptionKo: emotion.description.ko,
  descriptionEn: emotion.description.en,
      published: emotion.published ?? false,
      visibilityTime: emotion.visibility?.time?.[0] ?? '',
      visibilityDay: emotion.visibility?.day?.[0] ?? '',
      visibilityWeather: emotion.visibility?.weather?.[0] ?? '',
      visibilitySeason: emotion.visibility?.season?.[0] ?? '',
      visibilityEvent: emotion.visibility?.event?.[0] ?? '',
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
    if (!form.nameKo || !form.nameEn || !form.emoji || !form.category || !form.intensity || !form.descriptionKo || !form.descriptionEn) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    const visibility: VisibilityCondition = {
      time: form.visibilityTime ? [form.visibilityTime as VisibilityCondition['time'][number]] : [],
      day: form.visibilityDay ? [form.visibilityDay as VisibilityCondition['day'][number]] : [],
      weather: form.visibilityWeather ? [form.visibilityWeather as VisibilityCondition['weather'][number]] : [],
      season: form.visibilitySeason ? [form.visibilitySeason as VisibilityCondition['season'][number]] : [],
      event: form.visibilityEvent ? [form.visibilityEvent] : [],
    };

    const nextId = editingId ?? Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const baseEmotionData = {
      id: editingId ?? nextId,
      name: { ko: form.nameKo, en: form.nameEn },
      emoji: form.emoji,
      intensity: form.intensity,
      category: form.category,
      description: { ko: form.descriptionKo, en: form.descriptionEn },
      published: form.published,
      image: null,
      visibility,
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateEmotion(editingId, baseEmotionData as Partial<Omit<RemoteEmotion, 'energyCost'>>);
        toast.success('감정이 수정되었습니다.');
      } else {
        const newEmotionPayload = {
          ...baseEmotionData,
          // provide server-side-only fields client-side so the typed API accepts it
          intensityOrder: INTENSITY_OPTIONS.indexOf(form.intensity),
          // lightweight createdAt compatible shape for local use (server will overwrite)
          createdAt: ({ toDate: () => new Date() } as unknown) as RemoteEmotion['createdAt'],
        };
  await createEmotion(newEmotionPayload);
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
  }, [form, editingId, emotions, queryClient, closeModal]);

  if (isLoading) {
    return <AdminSkeleton />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
  <h1 className="text-lg font-normal tracking-wide text-(--color-text-primary)">
          감정 관리
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="cursor-pointer rounded border border-(--color-border-green-medium) bg-(--color-green-overlay-3) px-4 py-2 text-xs font-normal text-(--color-text-primary) transition-all duration-300 hover:bg-(--color-green-overlay-5)"
          >
            추가
          </button>
        </div>
      </div>

  <div className="overflow-x-auto rounded-lg border border-(--color-border-primary)">
        <table className="w-full text-left text-sm font-normal">
          <thead>
            <tr className="border-b border-(--color-border-primary) bg-(--color-overlay-2)">
              <th className="px-4 py-3 text-xs font-normal tracking-wider text-(--color-text-muted)">ID</th>
              <th className="px-4 py-3 text-xs font-normal tracking-wider text-(--color-text-muted)">이모지</th>
              <th className="px-4 py-3 text-xs font-normal tracking-wider text-(--color-text-muted)">이름</th>
              <th className="px-4 py-3 text-xs font-normal tracking-wider text-(--color-text-muted)">강도</th>
              <th className="px-4 py-3 text-xs font-normal tracking-wider text-(--color-text-muted)">카테고리</th>
              <th className="px-4 py-3 text-xs font-normal tracking-wider text-(--color-text-muted)">노출 조건</th>
              <th className="px-4 py-3 text-xs font-normal tracking-wider text-(--color-text-muted)">퍼블리싱</th>
              <th className="px-4 py-3 text-xs font-normal tracking-wider text-(--color-text-muted)" />
            </tr>
          </thead>
          <tbody>
            {emotions.map((emotion) => (
              <tr
                key={emotion.id}
                className="border-b border-(--color-border-faded) transition-colors hover:bg-(--color-overlay-1)"
              >
                <td className="px-4 py-3 text-(--color-text-faded)">{emotion.id}</td>
                <td className="px-4 py-3">{emotion.emoji}</td>
                <td className="px-4 py-3 text-(--color-text-primary)">{emotion.name.ko}</td>
                <td className="px-4 py-3 text-(--color-text-secondary)">{emotion.intensity}</td>
                <td className="px-4 py-3 text-(--color-text-secondary)">
                  {CATEGORY_LABELS.has(emotion.category)
                    ? `${CATEGORY_LABELS.get(emotion.category)} (${emotion.category})`
                    : emotion.category}
                </td>
                <td className="px-4 py-3 text-(--color-text-secondary)">
                  {[
                    emotion.visibility?.time?.join('/'),
                    emotion.visibility?.day?.join('/'),
                    emotion.visibility?.weather?.join('/'),
                    emotion.visibility?.season?.join('/'),
                    emotion.visibility?.event?.join('/'),
                  ]
                    .filter(Boolean)
                    .join(' · ') || '항상'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block h-2 w-2 rounded-full ${emotion.published ? 'bg-(--color-accent-green)' : 'bg-(--color-overlay-5)'}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEditModal(emotion)}
                    className="cursor-pointer rounded border border-(--color-border-primary) bg-(--color-overlay-3) px-3 py-1 text-xs font-normal text-(--color-text-primary) transition-all duration-200 hover:border-(--color-accent-green) hover:bg-(--color-overlay-4)"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
            {emotions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-(--color-text-faded)">
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
          isFormValid={isFormValid}
        />
      )}
    </div>
  );
}

export default AdminEmotions;

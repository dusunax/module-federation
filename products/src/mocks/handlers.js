import { http, HttpResponse } from 'msw';
import { emotions } from './data';

export const handlers = [
  // 전체 감정 카드 목록 조회
  http.get('/api/emotions', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    let filteredEmotions = emotions;

    // 검색어가 있으면 필터링
    if (search) {
      filteredEmotions = emotions.filter(
        (emotion) =>
          emotion.name.toLowerCase().includes(search.toLowerCase()) ||
          emotion.category.toLowerCase().includes(search.toLowerCase()) ||
          emotion.description.toLowerCase().includes(search.toLowerCase()) ||
          emotion.story.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json(filteredEmotions);
  }),

  // 특정 감정 카드 상세 조회
  http.get('/api/emotions/:id', ({ params }) => {
    const { id } = params;
    const emotion = emotions.find((e) => e.id === Number(id));

    if (!emotion) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(emotion);
  }),
];

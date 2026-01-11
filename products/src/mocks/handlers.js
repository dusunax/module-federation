import { http, HttpResponse } from 'msw';
import { plants } from './data';

export const handlers = [
  // 전체 상품 목록 조회
  http.get('/api/plants', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    let filteredPlants = plants;

    // 검색어가 있으면 필터링
    if (search) {
      filteredPlants = plants.filter(plant =>
        plant.name.toLowerCase().includes(search.toLowerCase()) ||
        plant.category.toLowerCase().includes(search.toLowerCase()) ||
        plant.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json(filteredPlants);
  }),

  // 특정 상품 상세 조회
  http.get('/api/plants/:id', ({ params }) => {
    const { id } = params;
    const plant = plants.find(p => p.id === Number(id));

    if (!plant) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(plant);
  }),
];

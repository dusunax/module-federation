import '@testing-library/jest-dom';
import { server } from '../mocks/server';

// MSW 서버 시작
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

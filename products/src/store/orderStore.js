import { create } from 'zustand';
import { useCartStore } from './cartStore';

// 기억/주문 상태를 관리하는 Zustand store
// Module Federation을 통해 모든 앱에서 동일한 store 인스턴스를 공유합니다
export const useOrderStore = create((set, get) => ({
  // 기억 내역 (완료된 기억들)
  orders: [],

  // 기억 진행 상태
  isRemembering: false, // 기억 중인지 여부
  progress: 0, // 프로그레스바 (0-100)
  orderStatuses: {}, // 각 아이템의 기억 상태 관리
  rememberingItemIds: [], // 현재 기억 중인 아이템 ID 목록
  rememberingStartTime: null, // 기억 시작 시간

  // 기억 완료 (장바구니 내용을 기억 내역에 추가)
  completeOrder: () => {
    const cartState = useCartStore.getState();
    const cartItems = Object.values(cartState.items);

    if (cartItems.length === 0) {
      return null;
    }

    // 총 가격과 수량 계산
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // 새 기억 생성
    const newOrder = {
      id: Date.now(), // 간단한 ID 생성
      items: cartItems,
      totalPrice,
      totalItems,
      orderDate: new Date().toISOString(),
      status: 'completed',
    };

    // 기억 추가 및 장바구니 비우기
    set((state) => ({
      orders: [newOrder, ...state.orders], // 최신 기억이 앞에 오도록
    }));
    cartState.clearCart();

    return newOrder;
  },

  // 특정 아이템만 기억 완료 (rememberingItemIds에 있는 아이템만)
  completeRememberingItems: () => {
    const state = get();
    const { rememberingItemIds } = state;
    const cartState = useCartStore.getState();
    const { items } = cartState;

    if (rememberingItemIds.length === 0) {
      return null;
    }

    // rememberingItemIds에 해당하는 아이템만 필터링
    const rememberingItems = rememberingItemIds
      .map((id) => items[id])
      .filter((item) => item !== undefined);

    if (rememberingItems.length === 0) {
      return null;
    }

    // 기억할 아이템들의 총 가격과 수량 계산
    const totalPrice = rememberingItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    const totalItems = rememberingItems.reduce((total, item) => total + item.quantity, 0);

    // 새 기억 생성
    const newOrder = {
      id: Date.now(),
      items: rememberingItems,
      totalPrice,
      totalItems,
      orderDate: new Date().toISOString(),
      status: 'completed',
    };

    // 기억된 아이템을 장바구니에서 제거
    rememberingItemIds.forEach((id) => {
      cartState.removeFromCart(id);
    });

    // 기억 추가
    set({
      orders: [newOrder, ...state.orders],
    });

    return newOrder;
  },

  // 특정 기억 조회
  getOrder: (orderId) => {
    const state = get();
    return state.orders.find((order) => order.id === orderId);
  },

  // 기억 삭제
  removeOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
    }));
  },

  // 기억 시작
  startRemembering: () => {
    const cartState = useCartStore.getState();
    // 현재 장바구니의 모든 itemId 저장
    const currentItemIds = Object.keys(cartState.items).map(Number);

    set({
      isRemembering: true,
      progress: 0,
      orderStatuses: {},
      rememberingItemIds: currentItemIds, // 현재 장바구니의 모든 itemId 저장
      rememberingStartTime: Date.now(), // 기억 시작 시간 저장
    });
  },

  // 프로그레스 업데이트
  updateProgress: (newProgress) => {
    set({ progress: Math.min(Math.max(newProgress, 0), 100) });
  },

  // 아이템 상태 업데이트
  updateOrderStatus: (productId, status) => {
    set((state) => ({
      orderStatuses: {
        ...state.orderStatuses,
        [productId]: status,
      },
    }));
  },

  // 모든 아이템 상태 업데이트
  updateAllOrderStatuses: (statuses) => {
    set({ orderStatuses: statuses });
  },

  // 기억 완료 및 초기화
  completeRemembering: () => {
    set({
      isRemembering: false,
      progress: 0,
      orderStatuses: {},
      rememberingItemIds: [],
      rememberingStartTime: null,
    });
  },

  // 기억 상태 초기화
  resetRemembering: () => {
    set({
      isRemembering: false,
      progress: 0,
      orderStatuses: {},
      rememberingItemIds: [],
      rememberingStartTime: null,
    });
  },
}));

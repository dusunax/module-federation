import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';
import { useCartStore } from './cartStore';

export type Order = import('@shared/types/api').Order;

interface ItemProgress {
  progress: number;
  startTime: number;
  energyCost: number;
}

interface OrderState {
  orders: Order[];
  itemProgress: Record<number, ItemProgress>;
  orderStatuses: Record<number, string>;
  completeOrder: () => Order | null;
  completeRememberingItems: () => Order | null;
  getOrder: (orderId: string | number) => Order | undefined;
  removeOrder: (orderId: string | number) => void;
  startRemembering: (itemIds?: number[]) => void;
  updateItemProgress: (itemId: number, progress: number) => void;
  cancelItemRemembering: (itemId: number) => ItemProgress | null;
  completeItemRemembering: (itemId: number) => Order | null;
  updateProgress: (newProgress: number) => void;
  updateOrderStatus: (productId: number, status: string) => void;
  updateAllOrderStatuses: (statuses: Record<number, string>) => void;
  completeRemembering: () => void;
  resetRemembering: () => void;
  cancelRemembering: () => number;
  getIsRemembering: () => boolean;
  getRememberingItemIds: () => number[];
  getTotalEnergyCost: () => number;
}

// 기억/주문 상태를 관리하는 Zustand store
// Module Federation을 통해 모든 앱에서 동일한 store 인스턴스를 공유합니다
export const useOrderStore = create<OrderState>((set, get) => ({
  // 기억 내역 (완료된 기억들)
  orders: [],

  // 기억 진행 상태 - 개별 아이템별 프로그레스
  // { [itemId]: { progress: number, startTime: number, energyCost: number } }
  itemProgress: {},
  orderStatuses: {}, // 각 아이템의 기억 상태 관리

  // 기억 완료 (장바구니 내용을 기억 내역에 추가)
  completeOrder: () => {
    const cartState = useCartStore.getState();
    const cartItems = Object.values(cartState.items);

    if (cartItems.length === 0) {
      return null;
    }

    // 총 에너지와 수량 계산 (가격은 더 이상 사용하지 않음)
    const totalEnergy = cartItems.reduce(
      (total, item) => total + (item.product.energyCost || 1) * item.quantity,
      0
    );
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // 새 기억 생성
    const newOrder = {
      id: String(Date.now()), // 간단한 ID 생성 (string)
      items: cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        addedAt: Timestamp.fromMillis(item.addedAt ?? Date.now()),
        eventCount: { combine: item.eventCount?.combine ?? 1 },
      })),
      totalEnergy,
      totalItems,
      orderDate: Timestamp.now(),
      status: 'completed',
    };

    // 기억 추가 및 장바구니 비우기
    set((state) => ({
      orders: [newOrder, ...state.orders], // 최신 기억이 앞에 오도록
    }));
    cartState.clearCart();

    return newOrder;
  },

  // 특정 아이템만 기억 완료 (itemProgress에 있는 아이템만) - 하위 호환용
  completeRememberingItems: () => {
    const state = get();
    const rememberingItemIds = Object.keys(state.itemProgress).map(Number);
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

    // 기억할 아이템들의 총 에너지와 수량 계산
    const totalEnergy = rememberingItems.reduce(
      (total, item) => total + (item.product.energyCost || 1) * item.quantity,
      0
    );
    const totalItems = rememberingItems.reduce((total, item) => total + item.quantity, 0);

    // 새 기억 생성
    const newOrder = {
  id: String(Date.now()),
      items: rememberingItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        addedAt: Timestamp.fromMillis(item.addedAt ?? Date.now()),
        eventCount: { combine: item.eventCount?.combine ?? 1 },
      })),
      totalEnergy,
      totalItems,
      orderDate: Timestamp.now(),
      status: 'completed',
    };

    // 기억된 아이템을 장바구니에서 제거
    rememberingItemIds.forEach((id) => {
      cartState.removeFromCart(id);
    });

    // 기억 추가 및 itemProgress 초기화
    set({
      orders: [newOrder, ...state.orders],
      itemProgress: {},
    });

    return newOrder;
  },

  // 특정 기억 조회
  getOrder: (orderId) => {
    const state = get();
    return state.orders.find((order) => String(order.id) === String(orderId));
  },

  // 기억 삭제
  removeOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter((order) => String(order.id) !== String(orderId)),
    }));
  },

  // 기억 시작 - 개별 아이템 프로그레스 초기화 (에너지 차감은 호출하는 쪽에서 처리)
  startRemembering: (itemIds) => {
    const cartState = useCartStore.getState();

    // itemIds가 없으면 현재 장바구니의 모든 아이템
    const targetItemIds = itemIds || Object.keys(cartState.items).map(Number);
    const startTime = Date.now();

    // 각 아이템의 energyCost 계산 및 itemProgress 초기화
    const newItemProgress = {};

    targetItemIds.forEach((itemId) => {
      const item = cartState.items[itemId];
      if (item) {
        const energyCost = (item.product.energyCost || 1) * item.quantity;
        newItemProgress[itemId] = {
          progress: 0,
          startTime,
          energyCost,
        };
      }
    });

    set((state) => ({
      itemProgress: { ...state.itemProgress, ...newItemProgress },
      orderStatuses: {},
    }));
  },

  // 개별 아이템 프로그레스 업데이트
  updateItemProgress: (itemId, progress) => {
    set((state) => {
      const item = state.itemProgress[itemId];
      if (!item) return state;

      return {
        itemProgress: {
          ...state.itemProgress,
          [itemId]: {
            ...item,
            progress: Math.min(Math.max(progress, 0), 100),
          },
        },
      };
    });
  },

  // 개별 아이템 기억 취소 (에너지 회복은 호출하는 쪽에서 처리)
  cancelItemRemembering: (itemId) => {
    const state = get();
    const itemData = state.itemProgress[itemId];

    if (!itemData) return null;

    // itemProgress에서 해당 아이템 제거
    set((state) => {
      const { [itemId]: removed, ...rest } = state.itemProgress;
      return { itemProgress: rest };
    });

    return itemData; // energyCost 반환하여 호출하는 쪽에서 에너지 회복 가능
  },

  // 개별 아이템 기억 완료 - 장바구니에서 제거, 기억 내역에 추가
  completeItemRemembering: (itemId) => {
    const state = get();
    const cartState = useCartStore.getState();
    const item = cartState.items[itemId];

    if (!item) return null;

    // 새 기억 생성 (단일 아이템)
    const newOrder = {
      id: String(Date.now()),
      items: [
        {
          ...item,
          eventCount: { combine: item.eventCount?.combine ?? 1 },
          addedAt: Timestamp.fromMillis(item.addedAt ?? Date.now()),
        },
      ],
      totalEnergy: (item.product.energyCost || 1) * item.quantity,
      totalItems: item.quantity,
      orderDate: Timestamp.now(),
      status: 'completed',
    };

    // 장바구니에서 제거
    cartState.removeFromCart(itemId);

    // itemProgress에서 제거 및 기억 내역에 추가
    set((state) => {
      const { [itemId]: removed, ...rest } = state.itemProgress;
      return {
        itemProgress: rest,
        orders: [newOrder, ...state.orders],
      };
    });

    return newOrder;
  },

  // 전체 프로그레스 업데이트 (하위 호환성)
  updateProgress: (newProgress) => {
    // 모든 아이템에 동일한 프로그레스 적용 (하위 호환용)
    set((state) => {
      const updatedProgress = {};
      Object.keys(state.itemProgress).forEach((itemId) => {
        updatedProgress[itemId] = {
          ...state.itemProgress[itemId],
          progress: Math.min(Math.max(newProgress, 0), 100),
        };
      });
      return { itemProgress: updatedProgress };
    });
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
      itemProgress: {},
      orderStatuses: {},
    });
  },

  // 기억 상태 초기화
  resetRemembering: () => {
    set({
      itemProgress: {},
      orderStatuses: {},
    });
  },

  // 전체 기억 취소 (에너지 회복은 호출하는 쪽에서 처리)
  cancelRemembering: () => {
    const state = get();
    const totalEnergyCost = Object.values(state.itemProgress).reduce(
      (total, item) => total + item.energyCost,
      0
    );

    set({
      itemProgress: {},
      orderStatuses: {},
    });

    return totalEnergyCost; // 호출하는 쪽에서 에너지 회복 가능
  },

  // 헬퍼: 기억 중인지 여부
  getIsRemembering: () => {
    const state = get();
    return Object.keys(state.itemProgress).length > 0;
  },

  // 헬퍼: 기억 중인 아이템 ID 목록
  getRememberingItemIds: () => {
    const state = get();
    return Object.keys(state.itemProgress).map(Number);
  },

  // 헬퍼: 총 에너지 비용 계산
  getTotalEnergyCost: () => {
    const state = get();
    return Object.values(state.itemProgress).reduce((total, item) => total + item.energyCost, 0);
  },
}));

import { doc, setDoc, collection, query, orderBy, onSnapshot, deleteDoc, limit, getDocs, getDoc, updateDoc, Unsubscribe, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Order } from '@shared/types/api';

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }

  if (value && typeof value === 'object' && (value as object).constructor === Object) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, stripUndefined(v)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

function toTimestamp(value: unknown): Timestamp {
  if (value instanceof Timestamp) return value;
  if (typeof value === 'number') return Timestamp.fromMillis(value);
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return Timestamp.fromMillis(parsed);
  }
  if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
    const maybe = value as { toDate?: () => Date };
    if (typeof maybe.toDate === 'function') return Timestamp.fromMillis(maybe.toDate().getTime());
  }
  if (value && typeof value === 'object' && 'seconds' in (value as Record<string, unknown>)) {
    const seconds = (value as { seconds?: number }).seconds;
    if (typeof seconds === 'number') return Timestamp.fromMillis(seconds * 1000);
  }
  return Timestamp.fromMillis(Date.now());
}

function normalizeOrder(raw: Order): Order {
  const defaultVisibility = {
    time: [],
    day: [],
    weather: [],
    season: [],
    event: [],
  };

  const ensureProduct = (product: Order['items'][number]['product'] | undefined) => {
    if (product) return product;
    return {
      id: 0,
      name: '',
      emoji: '',
      intensity: 'low',
      category: '',
      description: '',
      story: '',
      published: false,
      image: null,
      energyCost: 0,
      intensityOrder: 0,
      createdAt: toTimestamp(Date.now()),
      visibility: defaultVisibility,
    };
  };

  const items = (raw.items || []).map((item) => ({
    product: ensureProduct(item.product),
    quantity: item.quantity ?? 0,
    eventCount: {
      combine:
        typeof item.eventCount === 'number'
          ? item.eventCount
          : item.eventCount?.combine ?? 0,
    },
    addedAt: toTimestamp(item.addedAt),
  }));

  return {
    id: raw.id,
    orderDate: toTimestamp(raw.orderDate),
    items,
    totalEnergy: raw.totalEnergy ?? 0,
    totalItems: raw.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0),
    status: raw.status ?? 'completed',
  };
}

export async function saveUserOrder(userId: string, order: Order): Promise<void> {
  if (!userId) throw new Error('UserId is required to save order');

  const orderRef = doc(db, 'users', userId, 'orders', String(order.id));
  const normalized = normalizeOrder(order);
  await setDoc(orderRef, normalized);
}

export function subscribeToUserOrders(userId: string, onUpdate: (orders: Order[]) => void): Unsubscribe {
  if (!userId) return () => {};

  const q = query(collection(db, 'users', userId, 'orders'), orderBy('orderDate', 'desc'));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        orders.push(normalizeOrder({ ...data, id: docSnap.id } as Order));
      });
      onUpdate(orders);
    },
    (error) => {
      console.error('subscribeToUserOrders error:', error);
      onUpdate([]);
    }
  );

  return unsubscribe;
}

export async function deleteUserOrder(userId: string, orderId: string | number): Promise<void> {
  if (!userId) throw new Error('UserId is required to delete order');
  if (!orderId) throw new Error('orderId is required');

  const orderRef = doc(db, 'users', userId, 'orders', String(orderId));
  await deleteDoc(orderRef);
}

export async function getRecentOrders(userId: string, count = 20): Promise<Order[]> {
  if (!userId) return [];

  const q = query(
    collection(db, 'users', userId, 'orders'),
    orderBy('orderDate', 'desc'),
    limit(count)
  );

  const snapshot = await getDocs(q);
  const orders: Order[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    orders.push(normalizeOrder({ ...data, id: docSnap.id } as Order));
  });
  return orders;
}

export async function getAllUserOrders(userId: string): Promise<Order[]> {
  if (!userId) return [];
  const q = query(
    collection(db, 'users', userId, 'orders'),
    orderBy('orderDate', 'desc'),
  );
  const snapshot = await getDocs(q);
  const orders: Order[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    orders.push(normalizeOrder({ ...data, id: docSnap.id } as Order));
  });
  return orders;
}

export async function getUserOrderById(userId: string, orderId: string | number): Promise<Order | null> {
  if (!userId) return null;
  if (!orderId) return null;

  const orderRef = doc(db, 'users', userId, 'orders', String(orderId));
  const snapshot = await getDoc(orderRef);
  if (!snapshot.exists()) return null;
  return normalizeOrder({ ...snapshot.data(), id: snapshot.id } as Order);
}

export async function updateOrderItemEventCount(
  userId: string,
  orderId: string | number,
  itemId: number,
  eventCount: { combine: number },
): Promise<void> {
  if (!userId) throw new Error('UserId is required to update order item');
  if (!orderId) throw new Error('orderId is required');

  const orderRef = doc(db, 'users', userId, 'orders', String(orderId));
  const snapshot = await getDoc(orderRef);
  if (!snapshot.exists()) throw new Error('Order not found');

  const data = snapshot.data() as Order;
  const items = (data.items || []).map((item) => {
    const matchesId = item.product?.id === itemId;
    const next = matchesId ? { ...item, eventCount } : item;
    return { ...next, addedAt: toTimestamp(next.addedAt) };
  });

  await updateDoc(orderRef, { items });
}

export async function updateOrderItemFields(
  userId: string,
  orderId: string | number,
  itemId: number,
  fields: {
    eventCount?: { combine: number };
    productIntensity?: 'low' | 'middle' | 'high';
    removeProductRarity?: boolean;
  },
): Promise<void> {
  if (!userId) throw new Error('UserId is required to update order item');
  if (!orderId) throw new Error('orderId is required');

  const orderRef = doc(db, 'users', userId, 'orders', String(orderId));
  const snapshot = await getDoc(orderRef);
  if (!snapshot.exists()) throw new Error('Order not found');

  const data = snapshot.data() as Order;
  const items = (data.items || []).map((item) => {
    const matchesId = item.product?.id === itemId;
    if (!matchesId) {
      return { ...item, addedAt: toTimestamp(item.addedAt) };
    }

    const nextProduct = item.product
      ? {
          ...item.product,
          ...(fields.productIntensity ? { intensity: fields.productIntensity } : {}),
        }
      : item.product;

    if (nextProduct && fields.removeProductRarity) {
      const { rarity, ...rest } = nextProduct;
      return {
        ...item,
        ...(fields.eventCount ? { eventCount: fields.eventCount } : {}),
        product: rest,
        addedAt: toTimestamp(item.addedAt),
      };
    }

    return {
      ...item,
      ...(fields.eventCount ? { eventCount: fields.eventCount } : {}),
      ...(nextProduct ? { product: nextProduct } : {}),
      addedAt: toTimestamp(item.addedAt),
    };
  });

  await updateDoc(orderRef, { items });
}

export default {
  saveUserOrder,
  subscribeToUserOrders,
  deleteUserOrder,
  getRecentOrders,
  getUserOrderById,
  getAllUserOrders,
  updateOrderItemEventCount,
  updateOrderItemFields,
};

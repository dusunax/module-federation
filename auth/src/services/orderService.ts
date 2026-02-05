import { doc, setDoc, collection, query, orderBy, onSnapshot, deleteDoc, limit, getDocs, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';

export interface Order {
  id: string;
  orderDate: string;
  items?: Array<{
    product?: {
      id?: number;
      name?: string;
      emoji?: string;
      category?: string;
      energyCost?: number;
    };
    quantity?: number;
  }>;
  totalEnergy?: number;
  totalItems?: number;
  status?: string;
}

export async function saveUserOrder(userId: string, order: Order): Promise<void> {
  if (!userId) throw new Error('UserId is required to save order');

  const orderRef = doc(db, 'users', userId, 'orders', String(order.id));
  await setDoc(orderRef, order);
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
        orders.push({ ...data, id: docSnap.id } as Order);
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
    orders.push({ ...data, id: docSnap.id } as Order);
  });
  return orders;
}

export default { saveUserOrder, subscribeToUserOrders, deleteUserOrder, getRecentOrders };

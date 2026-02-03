import { doc, setDoc, collection, query, orderBy, onSnapshot, deleteDoc, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function saveUserOrder(userId, order) {
  if (!userId) throw new Error('UserId is required to save order');

  const orderRef = doc(db, 'users', userId, 'orders', String(order.id));
  await setDoc(orderRef, order);
}

export function subscribeToUserOrders(userId, onUpdate) {
  if (!userId) return () => {};

  const q = query(collection(db, 'users', userId, 'orders'), orderBy('orderDate', 'desc'));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        orders.push({ ...data, id: docSnap.id });
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

export async function deleteUserOrder(userId, orderId) {
  if (!userId) throw new Error('UserId is required to delete order');
  if (!orderId) throw new Error('orderId is required');

  const orderRef = doc(db, 'users', userId, 'orders', String(orderId));
  await deleteDoc(orderRef);
}

export async function getRecentOrders(userId, count = 20) {
  if (!userId) return [];

  const q = query(
    collection(db, 'users', userId, 'orders'),
    orderBy('orderDate', 'desc'),
    limit(count)
  );

  const snapshot = await getDocs(q);
  const orders = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    orders.push({ ...data, id: docSnap.id });
  });
  return orders;
}

export default { saveUserOrder, subscribeToUserOrders, deleteUserOrder, getRecentOrders };

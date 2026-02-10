import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { DailyUsage } from '@shared/types/api';

function dateKeyFromTimestamp(value: Timestamp): string {
  return value.toDate().toISOString().split('T')[0];
}

function timestampFromDateKey(dateKey: string): Timestamp {
  return Timestamp.fromDate(new Date(`${dateKey}T00:00:00Z`));
}

export async function getDailyUsage(userId: string, days = 30): Promise<DailyUsage[]> {
  if (!userId) return [];

  const colRef = collection(db, 'users', userId, 'usage');
  const q = query(colRef, orderBy('date', 'desc'), limit(days));

  const snap = await getDocs(q);
  const items: DailyUsage[] = [];
  snap.forEach((doc) => {
    const data = doc.data();
    const dateValue = data.date;
    const dateKey =
      typeof dateValue === 'string'
        ? dateValue
        : dateValue instanceof Timestamp
          ? dateKeyFromTimestamp(dateValue)
          : doc.id;
    const dateTs = dateValue instanceof Timestamp ? dateValue : timestampFromDateKey(dateKey);
    items.push({
      date: dateTs,
      used: data.used || 0,
      count: data.count || 0,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : dateTs,
    });
  });

  // return ascending by date for charting
  return items.reverse();
}

export default { getDailyUsage };

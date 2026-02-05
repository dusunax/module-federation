import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface DailyUsage {
  date: string;
  displayDate: string;
  used: number;
  count: number;
}

function utcDateToKstDateStr(utcDateStr: string): string {
  // utcDateStr is 'YYYY-MM-DD' representing UTC date at 00:00:00Z
  const d = new Date(`${utcDateStr}T00:00:00Z`);
  // add 9 hours for KST
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

export async function getDailyUsage(userId: string, days = 30): Promise<DailyUsage[]> {
  if (!userId) return [];

  const colRef = collection(db, 'users', userId, 'usage');
  const q = query(colRef, orderBy('date', 'desc'), limit(days));

  const snap = await getDocs(q);
  const items: DailyUsage[] = [];
  snap.forEach((doc) => {
    const data = doc.data();
    const utcDate = data.date || doc.id;
    items.push({
      date: utcDate,
      displayDate: utcDate ? utcDateToKstDateStr(utcDate) : utcDate,
      used: data.used || 0,
      count: data.count || 0,
    });
  });

  // return ascending by date for charting
  return items.reverse();
}

export default { getDailyUsage };

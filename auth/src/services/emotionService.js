import { collection, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

let rarityConfigCache = null;

export async function getRarityConfig() {
  if (rarityConfigCache) return rarityConfigCache;
  const docSnap = await getDoc(doc(db, 'config', 'rarity'));
  rarityConfigCache = docSnap.data();
  return rarityConfigCache;
}

function withRarityInfo(emotion, config) {
  const rarity = config[emotion.rarity];
  return {
    ...emotion,
    energyCost: rarity.energyCost,
    rarityOrder: rarity.order,
  };
}

export async function getAllEmotions(searchTerm) {
  const [snapshot, config] = await Promise.all([
    getDocs(query(collection(db, 'emotions'), orderBy('id', 'asc'))),
    getRarityConfig(),
  ]);

  let results = [];
  snapshot.forEach((docSnap) => {
    results.push(withRarityInfo(docSnap.data(), config));
  });

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    results = results.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.story.toLowerCase().includes(term),
    );
  }

  return results;
}

export async function getEmotionById(id) {
  const [docSnap, config] = await Promise.all([
    getDoc(doc(db, 'emotions', String(id))),
    getRarityConfig(),
  ]);
  if (!docSnap.exists()) return null;
  return withRarityInfo(docSnap.data(), config);
}


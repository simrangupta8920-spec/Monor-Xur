import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Shuffle, CheckCircle2, Sparkles, RotateCcw, 
  Eye, EyeOff, Trophy, Volume2, Image as ImageIcon, 
  Upload, Plus, Check, Heart, HelpCircle, Lightbulb, Play,
  Clock, Brain, Sliders, Timer, TrendingUp, TrendingDown, Hand
} from 'lucide-react';
import { Memory, DDAMetric } from '../../types';
import { soundController } from '../../utils/audio';
import { analyzePuzzleDifficulty, PuzzleAIAnalysisResult, PUZZLE_DESIGNATED_TIMES } from '../../services/aiDifficultyService';
import { DifficultyToast, DifficultyToastProps } from '../common/DifficultyToast';
import { useLanguage } from '../../context/LanguageContext';
import { SpeakButton } from '../common/SpeakButton';

interface PuzzleGameProps {
  memories: Memory[];
  onBack: () => void;
  onLogDDAMetric?: (metric: DDAMetric) => void;
  playerName?: string;
  initialMode?: 'personalized' | 'default';
  onModeChange?: (mode: 'personalized' | 'default') => void;
}

interface DefaultPuzzleItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  accent: string;
  titleAs?: string;
  titleHi?: string;
  categoryAs?: string;
  categoryHi?: string;
  descriptionAs?: string;
  descriptionHi?: string;
}

export type GridDimension = 2 | 3 | 4;

export function getPieceGeometry(pieceIdx: number, gridSize: GridDimension) {
  const row = Math.floor(pieceIdx / gridSize);
  const col = pieceIdx % gridSize;
  const bgPosX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;

  let label = `R${row + 1} C${col + 1}`;
  if (gridSize === 2) {
    if (pieceIdx === 0) label = 'Top Left';
    else if (pieceIdx === 1) label = 'Top Right';
    else if (pieceIdx === 2) label = 'Bottom Left';
    else if (pieceIdx === 3) label = 'Bottom Right';
  } else if (gridSize === 3) {
    const rowNames = ['Top', 'Mid', 'Bottom'];
    const colNames = ['Left', 'Center', 'Right'];
    label = `${rowNames[row]} ${colNames[col]}`;
  }

  return {
    row,
    col,
    bgPos: `${bgPosX}% ${bgPosY}%`,
    bgSize: `${gridSize * 100}% ${gridSize * 100}%`,
    label,
  };
}

export const GRID_LABELS: Record<GridDimension, { name: string; pieces: number; tag: string; designatedTime: number; degradeThreshold: number }> = {
  2: { name: 'Easy (2×2)', pieces: 4, tag: 'Easy', designatedTime: 25, degradeThreshold: 50 },
  3: { name: 'Medium (3×3)', pieces: 9, tag: 'Medium', designatedTime: 45, degradeThreshold: 70 },
  4: { name: 'Tough (4×4)', pieces: 16, tag: 'Tough', designatedTime: 120, degradeThreshold: 145 },
};

interface PuzzleAutoShiftBanner {
  show: boolean;
  reason: string;
  encouragement: string;
  fromGrid: GridDimension;
  toGrid: GridDimension;
  timeTaken: number;
  averageTime: number;
  action: 'EASE_DIFFICULTY' | 'INCREASE_DIFFICULTY' | 'MAINTAIN';
  modelSource: string;
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const DEFAULT_PUZZLES: DefaultPuzzleItem[] = [
  {
    id: 'def-mango',
    title: 'Juicy Ripe Mango',
    titleAs: 'পকা আম',
    titleHi: 'पका हुआ रसीला आम',
    category: 'Everyday Fruit',
    categoryAs: 'গ্রীষ্মকালীন ফল',
    categoryHi: 'स्वादिष्ट फल',
    image: '/images/puzzles/def-mango-1.jpg',
    description: 'Fresh golden Alphonso mango, sweet and ripe with green leaves under the warm sunshine.',
    descriptionAs: 'ৰসাল সোণালী পকা আম, মিঠা সুবাস আৰু গৰম ৰ’দৰ পোহৰত সজীৱ সেউজীয়া পাত।',
    descriptionHi: 'ताज़ा रसीला पका हुआ आम, मीठी सुगंध और सुनहरी धूप में चमकते हरे पत्ते।',
    accent: '#FDF0D5',
  },
  {
    id: 'def-mango-2',
    title: 'Sweet Sliced Mango',
    titleAs: 'মিঠা আমৰ টুকুৰা',
    titleHi: 'मीठे आम के टुकड़े',
    category: 'Everyday Fruit',
    categoryAs: 'গ্রীষ্মকালীন ফল',
    categoryHi: 'स्वादिष्ट फल',
    image: '/images/puzzles/def-mango-2.jpg',
    description: 'Freshly cut sweet mango slices and succulent golden cubes, aromatic and honey-sweet.',
    descriptionAs: 'সোণালী ৰঙৰ মিঠা আমৰ টুকুৰা, সুস্বাদু আৰু মৌৰ দৰে মিঠা সোৱাদ।',
    descriptionHi: 'ताज़ा कटे हुए सुनहरे आम के मीठे टुकड़े, सुगंधित और रसीले।',
    accent: '#FCF4E4',
  },
  {
    id: 'def-mango-3',
    title: 'Mango Orchard Harvest',
    titleAs: 'আমৰ বাৰীৰ আম',
    titleHi: 'आम का बगीचा',
    category: 'Everyday Fruit',
    categoryAs: 'গ্রীষ্মকালীন ফল',
    categoryHi: 'स्वादिष्ट फल',
    image: '/images/puzzles/def-mango-3.jpg',
    description: 'Clusters of golden sun-ripened mangoes swaying peacefully on orchard branches in morning breeze.',
    descriptionAs: 'পুৱাৰ বতাহত আম বাৰীৰ গছত ওলমি থকা থোপা-থোপে সোণালী পকা আম।',
    descriptionHi: 'सुबह की हवा में बगीचे की डालियों पर झूलते हुए सुनहरे पके आमों के गुच्छे।',
    accent: '#FBF2D8',
  },
  {
    id: 'def-dish-khar',
    title: 'Khar',
    titleAs: 'খাৰ (Khar)',
    titleHi: 'खार (Khar)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-1-khar.jpg',
    description: 'Signature Assamese alkaline dish prepared with raw papaya, pulses, and traditional banana peel filtrate.',
    descriptionAs: 'অমিতা আৰু কলখাৰেৰে তৈয়াৰী অসমৰ পৰম্পৰাগত সুস্বাদু খাৰ, হজমৰ বাবে উপকাৰী।',
    descriptionHi: 'कच्चे पपीते और पारंपरिक केले के खार से बना असम का प्रसिद्ध पाचक व्यंजन।',
    accent: '#EAF1E8',
  },
  {
    id: 'def-dish-masor-tenga',
    title: 'Masor Tenga',
    titleAs: 'মাছৰ টেঙা (Masor Tenga)',
    titleHi: 'माछोर टेंगा (Masor Tenga)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-2-masor-tenga.jpg',
    description: 'Classic light and sour fish curry with tomatoes, fragrant Assam lemon, and fresh coriander leaves.',
    descriptionAs: 'সুস্বাদু সতেজ মাছ, বিলাহী আৰু নেমুৰ ৰসেৰে তৈয়াৰী মন জুৰোৱা টেঙা আঞ্জা।',
    descriptionHi: 'टमाटर, ताज़ा नींबू और धनिया से बनी असमिया हल्की खट्टी मछली की तरी।',
    accent: '#FDECE8',
  },
  {
    id: 'def-dish-ou-tenga',
    title: 'Ou Tenga',
    titleAs: 'ঔ টেঙা (Ou Tenga)',
    titleHi: 'औ टेंगा (Ou Tenga)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-3-ou-tenga.jpg',
    description: 'Tangy aromatic curry stew cooked with elephant apple (Ou Tenga), a treasured indigenous sour delicacy.',
    descriptionAs: 'ঔ টেঙাৰে তৈয়াৰী সুস্বাদু আৰু পুষ্টিকৰ পৰম্পৰাগত টেঙা আঞ্জা।',
    descriptionHi: 'हाथी सेब (औ टेंगा) से बनी सुगंधित और पाचक खट्टी करी।',
    accent: '#FBF4DB',
  },
  {
    id: 'def-dish-kharoli',
    title: 'Kharoli',
    titleAs: 'খাৰলি (Kharoli)',
    titleHi: 'खारोली (Kharoli)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-4-kharoli.jpg',
    description: 'Aromatic fermented mustard paste seasoned with pungent mustard oil and fiery chili, rolled into small balls.',
    descriptionAs: 'খাঁটি মিঠাতেল আৰু সৰিয়হ বটি তৈয়াৰ কৰা তিঁতা-জ্বলা সুবাসযুক্ত ঐতিহ্যবাহী খাৰলি।',
    descriptionHi: 'सरसों के पेस्ट और शुद्ध सरसों तेल से बनी पारंपरिक तीखी-चटपटी खारोली।',
    accent: '#FDF0D5',
  },
  {
    id: 'def-dish-til-pitha',
    title: 'Til Pitha',
    titleAs: 'তিল পিঠা (Til Pitha)',
    titleHi: 'तिल पीठा (Til Pitha)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-5-til-pitha.jpg',
    description: 'Crispy cylindrical roasted sticky rice rolls filled with sweet roasted sesame seeds and jaggery.',
    descriptionAs: 'বৰা চাউলৰ গুড়িৰে টাৱাত পুৰি ক’লা তিল আৰু গুড়ৰ সোৱাদ দিয়া বিহুৰ প্ৰধান পিঠা।',
    descriptionHi: 'काले तिल और गुड़ की मीठी भरावन वाले भुने हुए कुरकुरे असमिया चावल के रोल।',
    accent: '#F5EFE6',
  },
  {
    id: 'def-dish-narikolor-pitha',
    title: 'Narikolor Pitha',
    titleAs: 'নাৰিকলৰ পিঠা (Narikolor Pitha)',
    titleHi: 'नारिकोलर पीठा (Narikolor Pitha)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-6-narikolor-pitha.jpg',
    description: 'Delicate white rice flour rolls stuffed with fragrant sweet grated coconut and cardamom.',
    descriptionAs: 'সোৱাদযুক্ত মিঠা কোৰা নাৰিকলৰ পুৰ দি সজোৱা বৰা চাউলৰ কোমল নাৰিকলৰ পিঠা।',
    descriptionHi: 'ताज़े कसे हुए नारियल और इलायची की मीठी भरावन वाला नरम पीठा।',
    accent: '#FAF6F0',
  },
  {
    id: 'def-dish-ghila-pitha',
    title: 'Ghila Pitha',
    titleAs: 'ঘিলা পিঠা (Ghila Pitha)',
    titleHi: 'घीला पीठा (Ghila Pitha)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-7-ghila-pitha.jpg',
    description: 'Crisp outside and chewy inside, golden deep-fried sweet sticky rice cakes sweetened with jaggery.',
    descriptionAs: 'মিঠৈ বা গুড়েৰে তৈয়াৰী সোণালীকৈ ভজা সুস্বাদু আৰু পুষ্টিকৰ ঘিলা পিঠা।',
    descriptionHi: 'गुड़ और चावल के आटे से बनी सुनहरी तली हुई स्वादिष्ट असमिया गोल टिकिया।',
    accent: '#F7E7CE',
  },
  {
    id: 'def-dish-tekeli-pitha',
    title: 'Tekeli Pitha',
    titleAs: 'টেকেলী পিঠা (Tekeli Pitha)',
    titleHi: 'टेकेली पीठा (Tekeli Pitha)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-8-tekeli-pitha.jpg',
    description: 'Soft steamed rice cake cooked over the steam of an earthen pitcher (tekeli) with coconut and jaggery.',
    descriptionAs: 'মাটিৰ টেকেলীৰ মুখত ভাপত দি বনোৱা সুগন্ধি নাৰিকল আৰু গুড়যুক্ত টেকেলী পিঠা।',
    descriptionHi: 'मिट्टी की मटकी की भाप पर पकाया गया नरम, सुगंधित नारियल व गुड़ का पीठा।',
    accent: '#F5EBDD',
  },
  {
    id: 'def-dish-pitha-guri',
    title: 'Pitha Guri',
    titleAs: 'পিঠা গুৰি (Pitha Guri)',
    titleHi: 'पीठा गुड़ी (Pitha Guri)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-9-pitha-guri.jpg',
    description: 'Silky, fragrant freshly pounded Bora rice flour, the timeless heart of Assamese home baking.',
    descriptionAs: 'ঢেঁকী বা উখলিত খুন্দা সুবাসিত জহা আৰু বৰা চাউলৰ মিহি পিঠা গুৰি।',
    descriptionHi: 'पारंपरिक ओखली में कुटा हुआ सुगंधित और शुद्ध असमिया चावल का आटा।',
    accent: '#FDFBF7',
  },
  {
    id: 'def-dish-paro-mangxo',
    title: 'Paro Mangxo',
    titleAs: 'পাৰো মাংস (Paro Mangxo)',
    titleHi: 'पारो मांग्खो (Paro Mangxo)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-10-paro-mangxo.jpg',
    description: 'Traditional slow-cooked tender pigeon meat curry infused with black pepper and banana blossoms (koldil).',
    descriptionAs: 'ক’লা জালুক আৰু কলডিলেৰে ৰন্ধা অসমৰ বিখ্যাত পৰম্পৰাগত পাৰো মাংসৰ আঞ্জা।',
    descriptionHi: 'काली मिर्च और केले के फूल (कोलडिल) के साथ पकाई गई पारंपरिक तीखी तरी।',
    accent: '#F0DEC8',
  },
  {
    id: 'def-dish-hah-mankho',
    title: 'Hah Mankho',
    titleAs: 'হাঁহৰ মাংস (Hah Mankho)',
    titleHi: 'हांह मांग्खो (Hah Mankho)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-11-hah-mankho.jpg',
    description: 'Grand festive duck meat curry braised with tender winter ash gourd (kumura) and crushed spices.',
    descriptionAs: 'কুঁহিয়াৰ, জালুক আৰু পকা কোমোৰাৰে ৰন্ধা মাঘ বিহুৰ ঐতিহ্যবাহী সুস্বাদু হাঁহৰ মাংস।',
    descriptionHi: 'सफेद पेठे (कुमुरा) और काली मिर्च के साथ बना माघ बिहू का मशहूर बत्तख का मांस।',
    accent: '#EED9C4',
  },
  {
    id: 'def-dish-aloo-pitika',
    title: 'Aloo Pitika',
    titleAs: 'আলু পিটিকা (Aloo Pitika)',
    titleHi: 'आलू पीतिका (Aloo Pitika)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-12-aloo-pitika.jpg',
    description: 'Beloved Assamese soul food of boiled potatoes mashed with pure pungent mustard oil, raw onions and green chilies.',
    descriptionAs: 'খাঁটি সৰিয়হৰ তেল, পিঁয়াজ আৰু কেঁচা জলকীয়াৰে সানি তৈয়াৰ কৰা সকলোৰে প্ৰিয় আলু পিটিকা।',
    descriptionHi: 'कच्चे सरसों के तेल, बारीक कटे प्याज और हरी मिर्च के साथ मसला हुआ सादा आलू।',
    accent: '#FAF1D6',
  },
  {
    id: 'def-dish-bengena-pitika',
    title: 'Bengena Pitika',
    titleAs: 'বেঙেনা পিটিকা (Bengena Pitika)',
    titleHi: 'बैंगन पीतिका (Bengena Pitika)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-13-bengena-pitika.jpg',
    description: 'Fire-roasted smoky eggplant mashed by hand with raw mustard oil, chopped onions, and crushed garlic.',
    descriptionAs: 'জুইত পুৰি সুগন্ধি সৰিয়হৰ তেল আৰু পিঁয়াজেৰে সুস্বাদুকৈ পিটিকি লোৱা পোৰা বেঙেনা পিটিকা।',
    descriptionHi: 'आग पर भुना हुआ बैंगन, शुद्ध सरसों तेल और लहसुन-प्याज के साथ मसला हुआ भर्ता।',
    accent: '#F3E8DC',
  },
  {
    id: 'def-dish-mati-mahor-dali',
    title: 'Mati Mahor Dali',
    titleAs: 'মাটি মাহৰ ডালি (Mati Mahor Dali)',
    titleHi: 'माटी माहर दाल (Mati Mahor Dali)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-14-mati-mahor-dali.jpg',
    description: 'Nourishing black gram lentil soup slow-simmered with ginger and tempered with whole red chili and mustard oil.',
    descriptionAs: 'আদা আৰু শুকান জলকীয়াৰ ফোৰণেৰে খাঁটি মিঠাতেলত ৰন্ধা গাঢ় আৰু পুষ্টিকৰ মাটি মাহৰ ডালি।',
    descriptionHi: 'अदरक और सूखी लाल मिर्च के तड़के वाली पौष्टिक पारंपरिक उड़द (काली) दाल।',
    accent: '#FBF0D8',
  },
  {
    id: 'def-dish-kaskol',
    title: 'Kaskol',
    titleAs: 'কাচকোল (Kaskol)',
    titleHi: 'काचकोल (Kaskol)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-15-kaskol.jpg',
    description: 'Healthy green raw plantain dry sauté or mash cooked with turmeric, green chilies, and soothing spices.',
    descriptionAs: 'ঔষধি গুণেৰে ভৰপূৰ কেঁচা কাচকোলৰ পুষ্টিকৰ ভাজি বা পিটিকা, পেটৰ বাবে অতি উত্তম।',
    descriptionHi: 'औषधीय गुणों से भरपूर कच्चे केले की सादी, सुपाच्य और पौष्टिक सूखी भुजिया।',
    accent: '#EEF3E6',
  },
  {
    id: 'def-dish-kosu-loti',
    title: 'Kosu Loti',
    titleAs: 'কচু লতি (Kosu Loti)',
    titleHi: 'कोचू लोती (Kosu Loti)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-16-kosu-loti.jpg',
    description: 'Tender green taro stolons sautéed with garlic, green chilies, and a squeeze of fresh lemon juice.',
    descriptionAs: 'নহৰু আৰু টেঙা নেমুৰ ৰস দি ৰন্ধা সুস্বাদু কোমল কচু শাকৰ লতি ভাজি।',
    descriptionHi: 'अरबी की कोमल डंठल, लहसुन और हरी मिर्च के साथ तली हुई स्वादिष्ट सब्जी।',
    accent: '#E6EFE4',
  },
  {
    id: 'def-dish-lai-xaak',
    title: 'Lai Xaak',
    titleAs: 'লাই শাক (Lai Xaak)',
    titleHi: 'लाई शाक (Lai Xaak)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-17-lai-xaak.jpg',
    description: 'Fresh peppery mustard greens quickly stir-fried with crushed garlic cloves and golden mustard oil.',
    descriptionAs: 'বাৰীৰ সতেজ লাই শাক, নহৰু আৰু মিঠাতেলৰ ফোৰণ দি ভজা অসমৰ অতি তৃপ্তিকৰ শাক।',
    descriptionHi: 'बारीक कटे लहसुन और सरसों तेल में छौंका हुआ ताज़ा असमिया राई का साग।',
    accent: '#E5EDE3',
  },
  {
    id: 'def-dish-mati-kothalor-tenga',
    title: 'Mati Kothalor Tenga',
    titleAs: 'মাটি কঁঠালৰ টেঙা (Mati Kothalor Tenga)',
    titleHi: 'कटहल की खट्टी तरी (Mati Kothalor Tenga)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-18-mati-kothalor-tenga.jpg',
    description: 'Tender baby green jackfruit chunks cooked into a comforting tangy yellow curry broth with herbs.',
    descriptionAs: 'কোমল কেঁহু কঁঠালেৰে ৰন্ধা সোৱাদভৰা আৰু তৃপ্তিদায়ক টেঙা আঞ্জা।',
    descriptionHi: 'कोमल कच्चे कटहल के टुकड़ों से बनी पाचक और सुगंधित खट्टी रसेदार सब्जी।',
    accent: '#FAF2D7',
  },
  {
    id: 'def-dish-pitha',
    title: 'Assamese Pitha Platter',
    titleAs: 'অসমীয়া পিঠা (Pitha Platter)',
    titleHi: 'असमिया पीठा थाली (Pitha Platter)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-19-pitha.jpg',
    description: 'Festive ceremonial platter of Assamese Bihu treats including til pitha, ghila pitha, and sweet coconut laru.',
    descriptionAs: 'মাঘ বিহুৰ সোৱাদভৰা তিল পিঠা, ঘিলা পিঠা আৰু নাৰিকলৰ লাড়ুৰে সজোৱা পৰম্পৰাগত কাঁহী।',
    descriptionHi: 'तिल पीठा, घीला पीठा और नारियल के लड्डू से सजी बिहू की पारंपरिक मीठी थाली।',
    accent: '#F8EFE4',
  },
  {
    id: 'def-dish-payox',
    title: 'Payox',
    titleAs: 'পায়স (Payox)',
    titleHi: 'पायस / खीर (Payox)',
    category: 'Traditional Delicacy',
    categoryAs: 'ঐতিহ্যবাহী অসমীয়া ব্যঞ্জন',
    categoryHi: 'पारंपरिक असमिया व्यंजन',
    image: '/images/puzzles/dish-20-payox.jpg',
    description: 'Rich and creamy Joha rice pudding slow-cooked in sweetened cow milk, garnished with almonds and raisins.',
    descriptionAs: 'সুগন্ধি জহা চাউল, খাঁটি গাখীৰ আৰু কাজু-কিচমিচেৰে ৰন্ধা অসমৰ প্ৰিয় মিঠা পায়স।',
    descriptionHi: 'सुगंधित जोहा चावल, गाढ़े दूध, मेवे और इलायची से बनी स्वादिष्ट पारंपरिक खीर।',
    accent: '#FBF5ED',
  },
];

// 4 quadrants for the 2x2 puzzle grid
// 0: Top-Left, 1: Top-Right, 2: Bottom-Left, 3: Bottom-Right
const PIECE_COORDINATES: Record<number, { bgPos: string; label: string; row: number; col: number }> = {
  0: { bgPos: '0% 0%', label: 'Top Left', row: 0, col: 0 },
  1: { bgPos: '100% 0%', label: 'Top Right', row: 0, col: 1 },
  2: { bgPos: '0% 100%', label: 'Bottom Left', row: 1, col: 0 },
  3: { bgPos: '100% 100%', label: 'Bottom Right', row: 1, col: 1 },
};

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ 
  memories, 
  onBack, 
  onLogDDAMetric, 
  playerName = 'Player',
  initialMode,
  onModeChange
}) => {
  const { t, tx, language, isHindi } = useLanguage();

  // Available personalized memories (filter for photo memories with valid image)
  const photoMemories = useMemo(() => {
    return memories.filter(
      (m) => (!m.mediaType || m.mediaType === 'photo') && m.image && m.image.trim().length > 0
    );
  }, [memories]);

  // Check if caregiver has uploaded pictures/memories
  const hasCaregiverUploadedMemories = photoMemories.length > 0;

  // Initialize mode from Play tab selection (initialMode) or fallback based on caregiver upload state
  const [mode, setModeState] = useState<'personalized' | 'default'>(() => {
    if (initialMode) {
      if (initialMode === 'personalized' && !hasCaregiverUploadedMemories) {
        return 'default';
      }
      return initialMode;
    }
    return hasCaregiverUploadedMemories ? 'personalized' : 'default';
  });

  const setMode = (newMode: 'personalized' | 'default') => {
    setModeState(newMode);
    onModeChange?.(newMode);
  };

  // Sync if initialMode changes externally from Play tab
  useEffect(() => {
    if (initialMode) {
      if (initialMode === 'personalized' && !hasCaregiverUploadedMemories) {
        setModeState('default');
      } else {
        setModeState(initialMode);
      }
    }
  }, [initialMode, hasCaregiverUploadedMemories]);

  // Default puzzles list with support for dynamically added custom images
  const [defaultPuzzles, setDefaultPuzzles] = useState<DefaultPuzzleItem[]>(DEFAULT_PUZZLES);

  // Selected image object
  const [selectedPersonalizedId, setSelectedPersonalizedId] = useState<string>(
    photoMemories[0]?.id || ''
  );
  const [selectedDefaultId, setSelectedDefaultId] = useState<string>(DEFAULT_PUZZLES[0].id);
  const [defaultFilter, setDefaultFilter] = useState<'all' | 'mango' | 'dish'>('all');

  const filteredDefaultPuzzles = useMemo(() => {
    if (defaultFilter === 'mango') {
      return defaultPuzzles.filter((p) => p.id.startsWith('def-mango'));
    }
    if (defaultFilter === 'dish') {
      return defaultPuzzles.filter((p) => p.id.startsWith('def-dish'));
    }
    return defaultPuzzles;
  }, [defaultPuzzles, defaultFilter]);

  // Keep mode in sync if all memories are removed
  useEffect(() => {
    if (!hasCaregiverUploadedMemories && mode === 'personalized') {
      setMode('default');
    }
  }, [hasCaregiverUploadedMemories, mode]);

  // Keep selectedPersonalizedId valid
  useEffect(() => {
    if (photoMemories.length > 0) {
      if (!selectedPersonalizedId || !photoMemories.some((m) => m.id === selectedPersonalizedId)) {
        setSelectedPersonalizedId(photoMemories[0].id);
      }
    } else {
      setSelectedPersonalizedId('');
    }
  }, [photoMemories, selectedPersonalizedId]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      soundController.stopSpeaking();
    };
  }, []);

  // Derive current puzzle image and meta
  const currentPuzzle = useMemo(() => {
    if (mode === 'personalized') {
      const found = photoMemories.find((m) => m.id === selectedPersonalizedId) || photoMemories[0];
      if (found) {
        return {
          title: found.title,
          subtitle: found.person || found.category,
          image: found.image,
          description: found.description,
        };
      }
    }
    const foundDefault = defaultPuzzles.find((p) => p.id === selectedDefaultId) || defaultPuzzles[0];
    const displayTitle = language === 'as' && foundDefault.titleAs
      ? foundDefault.titleAs
      : language === 'hi' && foundDefault.titleHi
      ? foundDefault.titleHi
      : foundDefault.title;
    const displayCategory = language === 'as' && foundDefault.categoryAs
      ? foundDefault.categoryAs
      : language === 'hi' && foundDefault.categoryHi
      ? foundDefault.categoryHi
      : foundDefault.category;
    const displayDescription = language === 'as' && foundDefault.descriptionAs
      ? foundDefault.descriptionAs
      : language === 'hi' && foundDefault.descriptionHi
      ? foundDefault.descriptionHi
      : foundDefault.description;
    return {
      title: displayTitle,
      subtitle: displayCategory,
      image: foundDefault.image,
      description: displayDescription,
    };
  }, [mode, selectedPersonalizedId, selectedDefaultId, photoMemories, defaultPuzzles, language]);

  // Grid size: 2 = 2x2 (4 pieces), 3 = 3x3 (9 pieces), 4 = 4x4 (16 pieces)
  const [gridSize, setGridSize] = useState<GridDimension>(2);
  const totalPieces = gridSize * gridSize;

  // Designated average time based on user requirements:
  // Easy (2×2): 25 seconds, Medium (3×3): 45 seconds (40-45s), Tough (4×4): 120 seconds
  const designatedTime = PUZZLE_DESIGNATED_TIMES[gridSize] || 25;
  // Degrade threshold: > designated time + 25 seconds (e.g. > 50s on Easy, > 70s on Medium, > 145s on Tough)
  const degradeThreshold = designatedTime + 25;

  // Track consecutive successful quick solves at current level (upgrades at 3 consecutive solves)
  const [consecutiveSolves, setConsecutiveSolves] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('monor_puzzle_consecutive_solves');
      return stored ? Math.max(0, Number(stored) || 0) : 0;
    } catch {
      return 0;
    }
  });

  // Auto-adjustment configuration and history tracking
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState<boolean>(true);
  const [completionHistory, setCompletionHistory] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('monor_puzzle_completion_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [25]; // Baseline initial average (25s on Easy)
  });

  // Calculate previous average completion time (seconds)
  const previousAverageSeconds = useMemo(() => {
    if (completionHistory.length === 0) return designatedTime;
    const sum = completionHistory.reduce((acc, t) => acc + t, 0);
    return Math.max(10, Math.round(sum / completionHistory.length));
  }, [completionHistory, designatedTime]);

  // Live timer state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Auto-adjustment notification banner state
  const [autoAdjustBanner, setAutoAdjustBanner] = useState<PuzzleAutoShiftBanner | null>(null);
  
  // Subtle difficulty adjustment notification toast state
  const [difficultyToast, setDifficultyToast] = useState<DifficultyToastProps | null>(null);

interface PendingLevelUpgradeData {
  fromGrid: GridDimension;
  toGrid: GridDimension;
  encouragement: string;
  reason?: string;
}

  // Pending Level Upgrade (queued from AI analysis to apply when clicking Next Picture)
  const [pendingLevelUpgrade, setPendingLevelUpgrade] = useState<PendingLevelUpgradeData | null>(null);
  const pendingLevelUpgradeRef = useRef<PendingLevelUpgradeData | null>(null);

  // 10-second peaceful pause timer upon completing puzzle
  const [pauseSecondsLeft, setPauseSecondsLeft] = useState<number>(10);

  // AI Cognitive Model & Telemetry State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [latestAIResult, setLatestAIResult] = useState<PuzzleAIAnalysisResult | null>(null);
  const [showAIInfoModal, setShowAIInfoModal] = useState<boolean>(false);
  const isShiftPendingRef = useRef<boolean>(false);
  const roundNumberRef = useRef<number>(1);

  // Puzzle State:
  // Board has totalPieces slots. Each slot holds a piece index (0..totalPieces-1) or null.
  const [boardSlots, setBoardSlots] = useState<(number | null)[]>(() =>
    Array.from({ length: 4 }, () => null)
  );
  // Tray holds available unplaced pieces (numbers 0..totalPieces-1)
  const [trayPieces, setTrayPieces] = useState<number[]>([1, 3, 0, 2]);

  // Selection state: tapping a piece from tray or board to place or swap
  const [selectedSource, setSelectedSource] = useState<
    { type: 'tray'; pieceIndex: number } | { type: 'board'; slotIndex: number } | null
  >(null);

  // Assistance toggles
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(true);
  const [showNumberHints, setShowNumberHints] = useState<boolean>(true);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);

  // Custom Image input states for Default Mode
  const [isAddingCustomImage, setIsAddingCustomImage] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customImageTitle, setCustomImageTitle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metrics & Completion
  const [moves, setMoves] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [hasLoggedMetric, setHasLoggedMetric] = useState<boolean>(false);

  // Victory narration state
  const [narrationText, setNarrationText] = useState<string>('');
  const [isSpeakingNarration, setIsSpeakingNarration] = useState<boolean>(false);

  // Automatically tell the player how to play whenever the game comes to Easy Mode (2x2)
  const prevGridSizeRef = useRef<GridDimension | null>(null);

  useEffect(() => {
    if (gridSize === 2 && !isComplete) {
      const isFirstLoad = prevGridSizeRef.current === null;
      const isTransitionToEasy = prevGridSizeRef.current !== null && prevGridSizeRef.current !== 2;

      if (isFirstLoad || isTransitionToEasy) {
        const speechTimer = setTimeout(() => {
          soundController.speakBilingual(
            isTransitionToEasy
              ? 'We have adjusted to Easy Mode with 4 pieces. Tap a piece in the tray below to pick it up, then tap where you want to place it on the board. Take your time, no rush.'
              : 'Welcome to Easy Mode with 4 pieces. Tap a piece in the tray below to pick it up, then tap where you want to place it on the board. Enjoy!',
            isTransitionToEasy
              ? 'हमने 4 टुकड़ों के सरल मोड में बदल दिया है। नीचे ट्रे से किसी टुकड़े पर टैप करें, फिर बोर्ड पर रखें। आराम से खेलें।'
              : '4 टुकड़ों वाला सरल मोड तैयार है। नीचे ट्रे से किसी टुकड़े पर टैप करें, फिर बोर्ड पर रखें। आराम से खेलें।',
            undefined,
            isTransitionToEasy
              ? 'আমি ৪টা টুকুৰাৰ সৈতে সহজ মোডলৈ সলনি কৰিছোঁ। তলৰ ট্ৰে’ৰ পৰা এটা টুকুৰা তুলি ব’ৰ্ডত বহুৱাওক। কোনো খৰখেদা নকৰিব।'
              : '৪টা টুকুৰাৰ সৈতে সহজ মোড সাজু। তলৰ ট্ৰে’ৰ পৰা এটা টুকুৰা তুলি ব’ৰ্ডত বহুৱাওক। কোনো খৰখেদা নকৰিব।'
          );
        }, 600);

        prevGridSizeRef.current = gridSize;
        return () => clearTimeout(speechTimer);
      }
    }
    prevGridSizeRef.current = gridSize;
  }, [gridSize, isComplete]);

  // Speech helper with visual speaking indicator
  const speakVictoryStory = useCallback((textToSpeak: string) => {
    if (!textToSpeak) return;
    setIsSpeakingNarration(true);
    soundController.speak(textToSpeak, () => {
      setIsSpeakingNarration(false);
    }, language);
  }, [language]);

  // Shuffle pieces helper
  const shufflePieces = useCallback((size: GridDimension) => {
    const total = size * size;
    const arr = Array.from({ length: total }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure not already in perfect solved order
    const isAlreadySolved = arr.every((val, idx) => val === idx);
    if (isAlreadySolved && arr.length > 1) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    return arr;
  }, []);

  // AI Puzzle Difficulty Analysis Handler (mirrors Card Match AI Engine)
  const handleAIPuzzleAnalysis = useCallback(
    async (
      timeTakenSeconds: number,
      currentMoves: number,
      trigger: 'round_complete' | 'in_game_struggle',
      consecutiveCount?: number
    ) => {
      if (!autoAdjustEnabled || isShiftPendingRef.current) return;
      isShiftPendingRef.current = true;
      setIsAnalyzingAI(true);

      const baselineAvg = previousAverageSeconds;
      const designatedAvg = PUZZLE_DESIGNATED_TIMES[gridSize] || 25;
      const streakToEvaluate = consecutiveCount !== undefined ? consecutiveCount : consecutiveSolves;
      const recentHistory = [...completionHistory, timeTakenSeconds].slice(-10);

      try {
        const correctCount = boardSlots.filter((p, i) => p === i).length;
        const aiResult = await analyzePuzzleDifficulty({
          playerName: playerName || 'Player',
          currentGrid: gridSize,
          timeTaken: timeTakenSeconds,
          previousAverageSeconds: baselineAvg,
          designatedAverageSeconds: designatedAvg,
          consecutiveSolves: streakToEvaluate,
          recentTimes: recentHistory,
          moves: currentMoves,
          piecesPlaced: trigger === 'round_complete' ? totalPieces : correctCount,
          totalPieces: totalPieces,
          triggerEvent: trigger,
        });

        setLatestAIResult(aiResult);

        // If AI recommends shifting difficulty up or down by 1 step
        if (aiResult.triggerAutoShift && aiResult.recommendedGrid !== gridSize) {
          const fromG = gridSize;
          const targetG = aiResult.recommendedGrid;

          // Sound cues: soothing chime for easing, triumphant chime for stepping up
          if (aiResult.action === 'EASE_DIFFICULTY') {
            soundController.playChime(396, 0.7);
          } else if (aiResult.action === 'INCREASE_DIFFICULTY') {
            soundController.playChime(660, 0.6);
          }

          // Reset streak on level change
          setConsecutiveSolves(0);
          try {
            localStorage.setItem('monor_puzzle_consecutive_solves', '0');
          } catch {
            // Ignore
          }

          // Log AI intervention metric for Caregiver & ASHA telemetry
          if (onLogDDAMetric) {
            onLogDDAMetric({
              timestamp: Date.now(),
              roundNumber: roundNumberRef.current++,
              difficultyLevel: fromG === 2 ? 1 : fromG === 3 ? 2 : 3,
              latencyMs: timeTakenSeconds * 1000,
              mistakes: Math.max(0, currentMoves - totalPieces),
              moves: currentMoves,
              hintsUsed: showGhostGuide ? 1 : 0,
              adaptiveAction: aiResult.action === 'EASE_DIFFICULTY' ? 'eased' : 'increased',
              aiReasoning: aiResult.reasoning,
              aiModel: aiResult.modelSource,
              fatigueRisk: aiResult.fatigueRisk,
              gameType: 'puzzle',
              gameTitle: 'Photo Puzzle',
            });
          }

          // If in-game struggle, reconfigure grid immediately so the player can complete with ease
          if (trigger === 'in_game_struggle') {
            setGridSize(targetG);
            const newTotal = targetG * targetG;
            const shuffled = shufflePieces(targetG);
            setBoardSlots(Array.from({ length: newTotal }, () => null));
            setTrayPieces(shuffled);
            setSelectedSource(null);
            setIsComplete(false);
            setMoves(0);
            setStartTime(Date.now());
            setElapsedSeconds(0);
            setHasLoggedMetric(false);
            if (targetG === 2) {
              setAutoAdjustBanner({
                show: true,
                action: 'EASE_DIFFICULTY',
                fromGrid: fromG,
                toGrid: targetG,
                encouragement: tx(
                  'We adjusted to Easy Mode (4 pieces). Here is how to play: Tap a piece below to pick it up, then tap a space on the board.',
                  'हमने 4 टुकड़ों के सरल मोड में बदल दिया है। नीचे ट्रे से टुकड़ा चुनें और बोर्ड पर खाली जगह पर रखें।',
                  'আমি ৪টা টুকুৰাৰ সৈতে সহজ মোডলৈ সলনি কৰিছোঁ। তলৰ ট্ৰে’ৰ পৰা টুকুৰা তুলি ব’ৰ্ডত বহুৱাওক।'
                ),
                reason: aiResult.reasoning || '',
                timeTaken: timeTakenSeconds,
                averageTime: baselineAvg,
                modelSource: aiResult.modelSource,
              });
            } else {
              soundController.speak(aiResult.encouragement);
            }
          } else {
            // Round complete: Queue level upgrade for when user clicks "Next Picture"!
            // No notification banner or toast pops up so the player can admire the completed solution peacefully.
            const upgradeData: PendingLevelUpgradeData = {
              fromGrid: fromG,
              toGrid: targetG,
              encouragement: aiResult.encouragement || tx(
                "You are doing very great! Wonderful job solving with ease and joy. Let's try this exciting new challenge together!",
                "आप बहुत बढ़िया काम कर रहे हैं! शाबाश! आइए मिलकर यह नई चुनौती आजमाते हैं!",
                "আপুনি বৰ ভাল কাম কৰিছে! শাবাছ! আহক আমি একেলগে এই নতুন প্ৰত্যাহ্বানটো চেষ্টা কৰোঁ!"
              ),
              reason: aiResult.reasoning,
            };
            pendingLevelUpgradeRef.current = upgradeData;
            setPendingLevelUpgrade(upgradeData);
            setAutoAdjustBanner(null);
            setDifficultyToast(null);
          }
        } else {
          // Difficulty maintained
          if (onLogDDAMetric && trigger === 'round_complete') {
            onLogDDAMetric({
              timestamp: Date.now(),
              roundNumber: roundNumberRef.current++,
              difficultyLevel: gridSize === 2 ? 1 : gridSize === 3 ? 2 : 3,
              latencyMs: timeTakenSeconds * 1000,
              mistakes: Math.max(0, currentMoves - totalPieces),
              moves: currentMoves,
              hintsUsed: showGhostGuide ? 1 : 0,
              adaptiveAction: 'maintained',
              aiReasoning: aiResult.reasoning,
              aiModel: aiResult.modelSource,
              fatigueRisk: aiResult.fatigueRisk,
              gameType: 'puzzle',
              gameTitle: 'Photo Puzzle',
            });
          }
        }
      } catch (err) {
        console.error('AI puzzle difficulty evaluation error:', err);
      } finally {
        setIsAnalyzingAI(false);
        isShiftPendingRef.current = false;
      }
    },
    [
      autoAdjustEnabled,
      previousAverageSeconds,
      completionHistory,
      gridSize,
      consecutiveSolves,
      totalPieces,
      boardSlots,
      onLogDDAMetric,
      showGhostGuide,
      shufflePieces,
    ]
  );

  // Manual select grid size
  const handleSelectGridSize = (newSize: GridDimension) => {
    soundController.playClick();
    setGridSize(newSize);
    pendingLevelUpgradeRef.current = null;
    setPendingLevelUpgrade(null);
    setConsecutiveSolves(0);
    try {
      localStorage.setItem('monor_puzzle_consecutive_solves', '0');
    } catch {
      // Ignore
    }
    const newTotal = newSize * newSize;
    const shuffled = shufflePieces(newSize);
    setBoardSlots(Array.from({ length: newTotal }, () => null));
    setTrayPieces(shuffled);
    setSelectedSource(null);
    setIsComplete(false);
    setNarrationText('');
    setMoves(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setHasLoggedMetric(false);
    setAutoAdjustBanner(null);
    setDifficultyToast(null);
    setPauseSecondsLeft(10);

    // Audio guidance announcement for Easy Mode
    if (newSize === 2) {
      soundController.speakBilingual(
        'Easy Mode selected with 4 pieces. Tap a piece in the tray below to pick it up, then tap a spot on the board to place it.',
        'सरल मोड चुना गया। नीचे ट्रे में से किसी टुकड़े पर टैप करें, फिर बोर्ड पर खाली जगह पर रखें।',
        undefined,
        'সহজ মোড বাছনি কৰা হ’ল। তলৰ ট্ৰে’ৰ পৰা এটা টুকুৰা বাছি লৈ ব’ৰ্ডৰ খালী স্থানত বহুৱাওক।'
      );
    }
  };

  // Simulation test helper for Caregivers / Testers
  const simulateAIDifficultyTest = async (type: 'slower' | 'faster') => {
    soundController.playClick();
    setIsAnalyzingAI(true);
    // If 'slower': simulate taking > designated time + 25s (e.g. 75s on Medium, or 150s on Tough)
    // If 'faster': simulate solving easily at <= designated time with 3 consecutive solves
    const testBaseline = designatedTime;
    const testTime = type === 'slower' ? degradeThreshold + 5 : Math.max(10, designatedTime - 5);
    const testConsecutive = type === 'faster' ? 3 : 0;

    try {
      const aiResult = await analyzePuzzleDifficulty({
        playerName: playerName || 'Player',
        currentGrid: gridSize,
        timeTaken: testTime,
        previousAverageSeconds: testBaseline,
        designatedAverageSeconds: testBaseline,
        consecutiveSolves: testConsecutive,
        recentTimes: type === 'slower' ? [testBaseline, testTime] : [testBaseline, testTime, testTime],
        moves: totalPieces + 2,
        piecesPlaced: totalPieces,
        totalPieces: totalPieces,
        triggerEvent: 'round_complete',
      });

      setLatestAIResult(aiResult);

      if (aiResult.triggerAutoShift && aiResult.recommendedGrid !== gridSize) {
        const targetG = aiResult.recommendedGrid;
        if (aiResult.action === 'EASE_DIFFICULTY') {
          soundController.playChime(396, 0.7);
        } else {
          soundController.playChime(660, 0.6);
        }

        // 1. Give whole solution (all pieces assembled in board)
        setBoardSlots(Array.from({ length: totalPieces }, (_, i) => i));
        setTrayPieces([]);
        setSelectedSource(null);
        setIsComplete(true);
        setPauseSecondsLeft(10);
        triggerCelebratoryParticles();

        // 2. Speak whole picture description + victory affirmation
        const rawDescription = (currentPuzzle.description || currentPuzzle.title).trim();
        const formattedDesc = rawDescription.endsWith('.') || rawDescription.endsWith('।') ? rawDescription : `${rawDescription}.`;
        const victoryAffirmation = tx('Great work! Good job!', 'बहुत बढ़िया काम! शाबाश!', 'বৰ ভাল কাম! শাবাছ!');
        const victorySpeech = `${formattedDesc} ${victoryAffirmation}`;
        setNarrationText(victorySpeech);
        speakVictoryStory(victorySpeech);

        // 3. Queue level upgrade for when Next Picture is clicked (no notification)
        const upgradeData: PendingLevelUpgradeData = {
          fromGrid: gridSize,
          toGrid: targetG,
          encouragement: aiResult.encouragement || tx(
            "You are doing very great! Wonderful job solving with ease and joy. Let's try this exciting new challenge together!",
            "आप बहुत बढ़िया काम कर रहे हैं! शाबाश! आइए मिलकर यह नई चुनौती आजमाते हैं!",
            "আপুনি বৰ ভাল কাম কৰিছে! শাবাছ! আহক আমি একেলগে এই নতুন প্ৰত্যাহ্বানটো চেষ্টা কৰোঁ!"
          ),
          reason: aiResult.reasoning,
        };
        pendingLevelUpgradeRef.current = upgradeData;
        setPendingLevelUpgrade(upgradeData);
        setAutoAdjustBanner(null);
        setDifficultyToast(null);
      }
    } catch (e) {
      console.error('Simulation test error:', e);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // 10-second peaceful pause countdown when puzzle is completed
  useEffect(() => {
    if (!isComplete || pauseSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setPauseSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isComplete, pauseSecondsLeft]);

  // Handle moving to next picture with upgraded level (no notification popup)
  const handleNextPicture = useCallback(() => {
    soundController.playClick();
    soundController.stopSpeaking();
    setIsSpeakingNarration(false);
    setAutoAdjustBanner(null);
    setDifficultyToast(null);

    // Apply pending level upgrade if AI recommended one
    let nextGridSize = gridSize;
    const pending = pendingLevelUpgradeRef.current;
    if (pending) {
      nextGridSize = pending.toGrid;
      pendingLevelUpgradeRef.current = null;
      setPendingLevelUpgrade(null);
      setGridSize(nextGridSize);
      setConsecutiveSolves(0);
      try {
        localStorage.setItem('monor_puzzle_consecutive_solves', '0');
      } catch {
        // Ignore storage error
      }

      // Show the level shift block with encouragement message right before the piece tray!
      const isEasing = pending.toGrid < pending.fromGrid;
      setAutoAdjustBanner({
        show: true,
        action: isEasing ? 'EASE_DIFFICULTY' : 'INCREASE_DIFFICULTY',
        fromGrid: pending.fromGrid,
        toGrid: pending.toGrid,
        encouragement: pending.encouragement,
        reason: pending.reason || '',
        timeTaken: 0,
        averageTime: 0,
        modelSource: 'gemini-3.8-flash',
      });
      if (isEasing) {
        soundController.playChime(396, 0.7);
      } else {
        soundController.playChime(660, 0.6);
      }
      soundController.speak(pending.encouragement);
    } else {
      setAutoAdjustBanner(null);
    }
    setDifficultyToast(null);

    // Advance to next image
    if (mode === 'personalized' && photoMemories.length > 0) {
      const currIdx = photoMemories.findIndex((m) => m.id === selectedPersonalizedId);
      const nextIdx = (currIdx + 1) % photoMemories.length;
      setSelectedPersonalizedId(photoMemories[nextIdx].id);
    } else if (defaultPuzzles.length > 0) {
      const currIdx = defaultPuzzles.findIndex((p) => p.id === selectedDefaultId);
      const nextIdx = (currIdx + 1) % defaultPuzzles.length;
      setSelectedDefaultId(defaultPuzzles[nextIdx].id);
    }

    // Reset board and timer
    const newTotal = nextGridSize * nextGridSize;
    const shuffled = shufflePieces(nextGridSize);
    setBoardSlots(Array.from({ length: newTotal }, () => null));
    setTrayPieces(shuffled);
    setSelectedSource(null);
    setIsComplete(false);
    setNarrationText('');
    setMoves(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setHasLoggedMetric(false);
    setPauseSecondsLeft(10);
  }, [
    gridSize,
    mode,
    photoMemories,
    selectedPersonalizedId,
    defaultPuzzles,
    selectedDefaultId,
    shufflePieces,
  ]);

  // Reset / Scramble game for the active image
  const handleScramble = () => {
    soundController.stopSpeaking();
    setIsSpeakingNarration(false);
    soundController.playClick();
    const shuffled = shufflePieces(gridSize);
    setBoardSlots(Array.from({ length: totalPieces }, () => null));
    setTrayPieces(shuffled);
    setSelectedSource(null);
    setIsComplete(false);
    setNarrationText('');
    setMoves(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setHasLoggedMetric(false);
    setPauseSecondsLeft(10);
  };

  // Auto-Assemble / Solve / Put It Back
  const handlePutItBack = () => {
    soundController.playSuccess();
    setBoardSlots(Array.from({ length: totalPieces }, (_, i) => i));
    setTrayPieces([]);
    setSelectedSource(null);
    setIsComplete(true);
    triggerVictory(moves + 1);
  };

  // On mount or when image or grid size changes, initialize scrambled
  useEffect(() => {
    soundController.stopSpeaking();
    setIsSpeakingNarration(false);
    const shuffled = shufflePieces(gridSize);
    setBoardSlots(Array.from({ length: totalPieces }, () => null));
    setTrayPieces(shuffled);
    setSelectedSource(null);
    setIsComplete(false);
    setNarrationText('');
    setMoves(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setHasLoggedMetric(false);
    setPauseSecondsLeft(10);
  }, [currentPuzzle.image, gridSize, shufflePieces, totalPieces]);

  // Live timer & in-round auto-adjustment check
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;

        // In-round auto-adjustment:
        // Degrade rule: If taking 25 seconds MORE than the designated average time:
        // - Medium (3×3, designated 45s): degrades at > 70s (45s + 25s) to Easy (2×2)
        // - Tough (4×4, designated 120s): degrades at > 145s (120s + 25s) to Medium (3×3)
        if (
          autoAdjustEnabled &&
          gridSize > 2 &&
          !isShiftPendingRef.current &&
          next > degradeThreshold
        ) {
          const correctCount = boardSlots.filter((p, i) => p === i).length;
          if (correctCount < totalPieces) {
            handleAIPuzzleAnalysis(next, moves, 'in_game_struggle', 0);
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isComplete,
    autoAdjustEnabled,
    gridSize,
    degradeThreshold,
    boardSlots,
    totalPieces,
    moves,
    handleAIPuzzleAnalysis,
  ]);

  // Check victory condition whenever boardSlots change
  useEffect(() => {
    const isSolved = 
      boardSlots.length === totalPieces &&
      boardSlots.every((val, idx) => val === idx);

    if (isSolved && !isComplete) {
      setIsComplete(true);
      triggerVictory(moves);
    }
  }, [boardSlots, isComplete, moves, totalPieces]);

  // Multi-cannon celebratory particle and confetti engine
  const triggerCelebratoryParticles = useCallback(() => {
    try {
      const festivalColors = [
        '#5B825B', // Sage Green
        '#E8B25C', // Warm Gold
        '#C46A66', // Rose Pink
        '#7A9CA4', // Dusty Teal
        '#FFD700', // Bright Golden
        '#FF7043', // Vibrant Marigold
        '#66BB6A', // Fresh Leaf Green
      ];

      // 1. Immediate center cannon explosion
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.55, x: 0.5 },
        colors: festivalColors,
        startVelocity: 36,
        scalar: 1.15,
        ticks: 200,
      });

      // 2. Left side cannon after 160ms (angled inward)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.08, y: 0.65 },
          colors: festivalColors,
          startVelocity: 42,
          ticks: 220,
        });
      }, 160);

      // 3. Right side cannon after 320ms (angled inward)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.92, y: 0.65 },
          colors: festivalColors,
          startVelocity: 42,
          ticks: 220,
        });
      }, 320);

      // 4. Gentle floating golden sparkle shower after 520ms
      setTimeout(() => {
        confetti({
          particleCount: 45,
          spread: 110,
          origin: { y: 0.3, x: 0.5 },
          colors: ['#FFD700', '#FFA500', '#FFFFFF', '#E8B25C'],
          gravity: 0.65,
          scalar: 1.3,
          ticks: 260,
          startVelocity: 24,
        });
      }, 520);

      // 5. Final celebratory burst after 800ms
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.5, x: 0.5 },
          colors: ['#5B825B', '#E8B25C', '#FFD700'],
          startVelocity: 30,
          scalar: 1.0,
        });
      }, 800);
    } catch {
      // Confetti fallback
    }
  }, []);

  const triggerVictory = (currentMoves: number) => {
    // Ensure the whole solution is assembled completely
    setBoardSlots(Array.from({ length: totalPieces }, (_, i) => i));
    setTrayPieces([]);
    setSelectedSource(null);
    setIsComplete(true);
    setPauseSecondsLeft(10);

    // Launch celebratory confetti & particle sequence
    triggerCelebratoryParticles();

    // Melodic fanfare
    soundController.playSuccess();

    // Track time taken
    const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    // Evaluate consecutive quick solve streak (upgrade requires 3 consecutive solves within designated time)
    const isEasySolve = timeTakenSeconds <= designatedTime + 5;
    const isOvertimeDegrade = timeTakenSeconds > degradeThreshold;

    let updatedConsecutive = consecutiveSolves;
    if (isEasySolve) {
      updatedConsecutive = consecutiveSolves + 1;
    } else if (isOvertimeDegrade) {
      updatedConsecutive = 0;
    } else {
      updatedConsecutive = 0;
    }

    setConsecutiveSolves(updatedConsecutive);
    try {
      localStorage.setItem('monor_puzzle_consecutive_solves', String(updatedConsecutive));
    } catch {
      // Ignore storage error
    }

    const newHistory = [...completionHistory, timeTakenSeconds].slice(-10);
    setCompletionHistory(newHistory);
    try {
      localStorage.setItem('monor_puzzle_completion_history', JSON.stringify(newHistory));
    } catch {
      // Ignore storage error
    }

    // Trigger AI Model difficulty analysis (evaluates pace vs average to degrade or advance difficulty by 1 step)
    handleAIPuzzleAnalysis(timeTakenSeconds, currentMoves, 'round_complete', updatedConsecutive);

    // RULE:
    // After solving the puzzle successfully in personalized mode, the picture will be completed.
    // The voice will first tell the picture description (whatever uploaded in the memory part, what that picture is about),
    // and then "great work" or "good job" will come.
    const rawDescription = (currentPuzzle.description || currentPuzzle.title).trim();
    const formattedDesc = rawDescription.endsWith('.') || rawDescription.endsWith('।') ? rawDescription : `${rawDescription}.`;
    const victoryAffirmation = tx('Great work! Good job!', 'बहुत बढ़िया काम! शाबाश!', 'বৰ ভাল কাম! শাবাছ!');
    const victorySpeech = `${formattedDesc} ${victoryAffirmation}`;
    setNarrationText(victorySpeech);

    // Speak picture description first, then "Great work! Good job!"
    setTimeout(() => {
      speakVictoryStory(victorySpeech);
    }, 550);
  };

  // Interactions: Selecting / placing pieces
  const handleTrayPieceClick = (pieceIndex: number) => {
    soundController.playClick();
    if (selectedSource && selectedSource.type === 'tray' && selectedSource.pieceIndex === pieceIndex) {
      // Unselect
      setSelectedSource(null);
    } else {
      setSelectedSource({ type: 'tray', pieceIndex });
    }
  };

  const handleBoardSlotClick = (targetSlot: number) => {
    soundController.playClick();

    // Case 1: A tray piece is selected
    if (selectedSource && selectedSource.type === 'tray') {
      const pieceToPlace = selectedSource.pieceIndex;
      const currentPieceInSlot = boardSlots[targetSlot];

      const newSlots = [...boardSlots];
      newSlots[targetSlot] = pieceToPlace;

      let newTray = trayPieces.filter((p) => p !== pieceToPlace);
      if (currentPieceInSlot !== null) {
        newTray.push(currentPieceInSlot);
      }

      setBoardSlots(newSlots);
      setTrayPieces(newTray);
      setSelectedSource(null);
      setMoves((m) => m + 1);

      // Audio feedback if correct
      if (pieceToPlace === targetSlot) {
        soundController.playChime(580, 0.3);
      }
      return;
    }

    // Case 2: A board slot is selected
    if (selectedSource && selectedSource.type === 'board') {
      const sourceSlot = selectedSource.slotIndex;
      if (sourceSlot === targetSlot) {
        // Unselect
        setSelectedSource(null);
        return;
      }

      // Swap the pieces between sourceSlot and targetSlot
      const newSlots = [...boardSlots];
      const temp = newSlots[targetSlot];
      newSlots[targetSlot] = newSlots[sourceSlot];
      newSlots[sourceSlot] = temp;

      setBoardSlots(newSlots);
      setSelectedSource(null);
      setMoves((m) => m + 1);

      if (newSlots[targetSlot] === targetSlot) {
        soundController.playChime(580, 0.3);
      }
      return;
    }

    // Case 3: No source is selected yet, but user clicked an occupied slot
    if (boardSlots[targetSlot] !== null) {
      setSelectedSource({ type: 'board', slotIndex: targetSlot });
    }
  };

  // Remove piece from board back to tray
  const handleReturnToTray = (slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const piece = boardSlots[slotIndex];
    if (piece === null) return;
    soundController.playClick();

    const newSlots = [...boardSlots];
    newSlots[slotIndex] = null;
    setBoardSlots(newSlots);
    setTrayPieces((prev) => [...prev, piece]);
    if (selectedSource && selectedSource.type === 'board' && selectedSource.slotIndex === slotIndex) {
      setSelectedSource(null);
    }
  };

  // HTML5 Drag and Drop Handlers for Desktop & Tablets
  const handleDragStart = (e: React.DragEvent, pieceIndex: number, from: 'tray' | 'board', slotIndex?: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ pieceIndex, from, slotIndex }));
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const pieceToPlace = Number(data.pieceIndex);
      const from = data.from;

      if (from === 'tray') {
        const currentInSlot = boardSlots[targetSlot];
        const newSlots = [...boardSlots];
        newSlots[targetSlot] = pieceToPlace;
        let newTray = trayPieces.filter((p) => p !== pieceToPlace);
        if (currentInSlot !== null) {
          newTray.push(currentInSlot);
        }
        setBoardSlots(newSlots);
        setTrayPieces(newTray);
        setMoves((m) => m + 1);
        if (pieceToPlace === targetSlot) soundController.playChime(580, 0.3);
      } else if (from === 'board') {
        const sourceSlot = Number(data.slotIndex);
        if (sourceSlot === targetSlot) return;
        const newSlots = [...boardSlots];
        const temp = newSlots[targetSlot];
        newSlots[targetSlot] = newSlots[sourceSlot];
        newSlots[sourceSlot] = temp;
        setBoardSlots(newSlots);
        setMoves((m) => m + 1);
        if (newSlots[targetSlot] === targetSlot) soundController.playChime(580, 0.3);
      }
      setSelectedSource(null);
    } catch {
      // Ignore parsing error
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Add Custom Image handler (via file upload or URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        const newId = `custom-${Date.now()}`;
        const newPuzzle: DefaultPuzzleItem = {
          id: newId,
          title: customImageTitle.trim() || 'Custom Uploaded Photo',
          category: 'Uploaded Photo',
          image: result,
          description: 'A special photo chosen for your 4-piece jigsaw puzzle adventure.',
          accent: '#EAF1E8',
        };
        setDefaultPuzzles((prev) => [newPuzzle, ...prev]);
        setSelectedDefaultId(newId);
        setIsAddingCustomImage(false);
        setCustomImageUrl('');
        setCustomImageTitle('');
        soundController.playSuccess();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrlImage = () => {
    if (!customImageUrl.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newPuzzle: DefaultPuzzleItem = {
      id: newId,
      title: customImageTitle.trim() || 'Custom Added Image',
      category: 'Added Image',
      image: customImageUrl.trim(),
      description: 'Your chosen custom image, sliced into a joyful 4-piece puzzle.',
      accent: '#FDF0D5',
    };
    setDefaultPuzzles((prev) => [newPuzzle, ...prev]);
    setSelectedDefaultId(newId);
    setIsAddingCustomImage(false);
    setCustomImageUrl('');
    setCustomImageTitle('');
    soundController.playSuccess();
  };

  return (
    <div className="p-4 pb-28 max-w-2xl mx-auto space-y-4 animate-fadeIn relative">
      {/* Subtle AI Difficulty Adjustment Toast Notification */}
      {difficultyToast && (
        <DifficultyToast
          {...difficultyToast}
          onDismiss={() => setDifficultyToast(null)}
        />
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundController.playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] font-extrabold text-sm hover:bg-[#F8F6F0] active:scale-95 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundController.playClick();
              setShowReferenceModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#5A6E5D] font-extrabold text-xs hover:bg-[#F8F6F0] active:scale-95 shadow-xs"
            title={tx('Peek at the full picture', 'पूरी तस्वीर देखें', 'সম্পূৰ্ণ ছবিখন চাওক')}
          >
            <Eye className="w-4 h-4 text-[#5B825B]" />
            <span className="hidden sm:inline">{tx('Peek Photo', 'तस्वीर देखें', 'ছবি চাওক')}</span>
          </button>
          
          <button
            onClick={() => {
              soundController.playClick();
              soundController.speakBilingual(
                `${currentPuzzle.title}. ${currentPuzzle.description}`,
                `${currentPuzzle.title}। ${currentPuzzle.description}`,
                undefined,
                `${currentPuzzle.title}। ${currentPuzzle.description}`
              );
            }}
            className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#5B825B] hover:bg-[#F8F6F0] active:scale-95 shadow-xs"
            title={tx('Read story aloud', 'कहानी सुनें', 'কাহিনী শুনক')}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Header & Controls: Header, Modes & Puzzle Size */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDF0D5] text-[#332610] text-xs font-black uppercase tracking-wider">
                {tx('Photo Puzzle', 'फ़ोटो पहेली', 'ছবিৰ ধাঁধা')}
              </span>
              <span className="text-xs font-bold text-[#5B825B] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {totalPieces} {tx('Pieces', 'टुकड़े', 'টুকুৰা')} ({gridSize}×{gridSize})
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">
              {tx('Puzzle: Put It Back', 'तस्वीर जोड़ें', 'ছবি জোৰা লগাওক')}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#EAF1E8] border border-[#5B825B]/30 text-xs font-black text-[#5B825B]">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{tx('No rush • Take your time', 'अपनी गति से खेलें', 'ধীৰে-সুস্থে খেলক • কোনো খৰখেদা নাই')}</span>
            </span>
            <SpeakButton
              textEn="Photo puzzle. Tap any piece to select it, then tap an empty slot on the board to place it. Enjoy putting the picture together peacefully."
              textHi="चित्र पहेली। किसी भी टुकड़े पर टैप करें, फिर खाली जगह पर रखकर तस्वीर पूरी करें। आराम से खेलें।"
              textAs="ছবিৰ ধাঁধা। যিকোনো টুকুৰা বাছনি কৰিবলৈ টিপক, তাৰ পিছত ব’ৰ্ডৰ খালী স্থানত ৰাখক। শান্তভাৱে ছবিখন সম্পূৰ্ণ কৰক।"
              size="sm"
            />
          </div>
        </div>

        {/* 2 Modes Tabs: Default Mode vs Personalized Photo */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8F6F0] p-1.5 rounded-2xl border border-[#EAE6DF]">
          <button
            onClick={() => {
              soundController.playClick();
              setMode('default');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'default'
                ? 'bg-[#5B825B] text-white shadow-xs'
                : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{tx('Default Mode', 'डिफ़ॉल्ट मोड', 'ডিফল্ট মোড')}</span>
          </button>

          <button
            onClick={() => {
              soundController.playClick();
              if (hasCaregiverUploadedMemories) {
                setMode('personalized');
              } else {
                soundController.speakBilingual(
                  'No personal photos uploaded yet. You can upload memories in Family Caregiver Mode or play Default Mode with Mango and other treasures!',
                  'अभी कोई व्यक्तिगत फोटो अपलोड नहीं हुई है। आप मैंगो और अन्य सुंदर तस्वीरों के साथ डिफ़ॉल्ट मोड खेल सकते हैं!',
                  undefined,
                  'এতিয়ালৈ কোনো ব্যক্তিগত ফটো আপলোড কৰা হোৱা নাই। আপুনি আম আৰু আন ধুনীয়া ছবিৰ সৈতে খেলিব পাৰে!'
                );
                setMode('default');
              }
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'personalized'
                ? 'bg-[#5B825B] text-white shadow-xs'
                : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
            }`}
          >
            <Heart className={`w-4 h-4 ${mode === 'personalized' ? 'fill-current' : ''}`} />
            <span>
              {tx('Personalized Photo', 'पारिवारिक फ़ोटो', 'পৰিয়ালৰ ফটো')} {hasCaregiverUploadedMemories ? `(${photoMemories.length})` : `(0 ${tx('Photos', 'तस्वीरें', 'ছবি')})`}
            </span>
          </button>
        </div>

        {/* Simple, peaceful Grid Size Selector */}
        <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#EAE6DF] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D3A2F] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#5B825B]" />
              {tx('Puzzle Size:', 'पहेली का आकार:', 'ধাঁধাৰ আকাৰ:')}
            </span>
            <div className="inline-flex rounded-xl bg-white p-1 border border-[#E0DCD3] shadow-2xs">
              {([2, 3, 4] as GridDimension[]).map((size) => (
                <button
                  key={size}
                  onClick={() => handleSelectGridSize(size)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    gridSize === size
                      ? 'bg-[#5B825B] text-white shadow-xs'
                      : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
                  }`}
                >
                  {GRID_LABELS[size].name}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-bold text-[#5B825B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
            <span>{tx('Piece together with joy', 'शांति से टुकड़े जोड़ें', 'শান্তভাৱে টুকুৰা জোৰা দিয়ক')}</span>
          </span>
        </div>
      </div>

      {/* Auto-Adjustment Notification Banner */}
      {autoAdjustBanner?.show && (
        <div
          id="level-advanced-banner"
          className={`rounded-2xl p-3.5 sm:p-4 border shadow-xs animate-scaleUp flex items-start justify-between gap-3 ${
            autoAdjustBanner.action === 'EASE_DIFFICULTY'
              ? 'bg-[#FDF6E9] border-[#E8B25C]/50'
              : 'bg-[#EAF1E8] border-[#5B825B]/40'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
                autoAdjustBanner.action === 'EASE_DIFFICULTY' ? 'bg-[#E8B25C]' : 'bg-[#5B825B]'
              }`}
            >
              {autoAdjustBanner.action === 'EASE_DIFFICULTY' ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-200 fill-current" />
              )}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-[#2D3A2F] leading-tight flex items-center flex-wrap gap-1.5">
                <span>
                  {autoAdjustBanner.action === 'EASE_DIFFICULTY'
                    ? `${tx('Level Eased', 'आसान स्तर', 'সহজ স্তৰ')}:`
                    : `${tx('You have advanced one level!', 'आप एक स्तर आगे बढ़ गए हैं!', 'আপুনি এটা স্তৰ আগবাঢ়িছে!')}`}
                </span>
                <span className="text-xs font-bold text-[#5B825B] bg-[#5B825B]/15 px-2 py-0.5 rounded-full">
                  {GRID_LABELS[autoAdjustBanner.fromGrid]?.name} ➔ {GRID_LABELS[autoAdjustBanner.toGrid]?.name}
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-[#445846] leading-relaxed font-medium">
                {autoAdjustBanner.encouragement}
              </p>
            </div>
          </div>

          <button
            id="dismiss-level-banner-btn"
            onClick={() => setAutoAdjustBanner(null)}
            className="text-xs font-bold text-[#5A6E5D] hover:text-[#2D3A2F] px-2.5 py-1 rounded-lg hover:bg-black/5 shrink-0 cursor-pointer"
          >
            {tx('Dismiss', 'हटाएं', 'বাতিল কৰক')}
          </button>
        </div>
      )}

      {/* Piece Tray (Waiting Unplaced Pieces) - Positioned ABOVE Assembly Board */}
      {!isComplete && (
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D3A2F]">
              {tx('Piece Tray', 'टुकड़े', 'টুকুৰা বাছনি')} ({trayPieces.length} of {totalPieces} {tx('available', 'उपलब्ध', 'উপলব্ধ')})
            </span>
            {gridSize === 2 ? (
              <span
                className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-2xs ${
                  selectedSource?.type === 'tray'
                    ? 'bg-[#EAF1E8] text-[#5B825B] border border-[#5B825B]/40 animate-pulse'
                    : 'bg-[#FDF0D5] text-[#8C4E0B] border border-[#E8B25C]/50'
                }`}
              >
                {selectedSource?.type === 'tray' ? (
                  <>
                    <Hand className="w-3.5 h-3.5 text-[#5B825B]" />
                    <span>{tx('Step 2: Now tap an empty slot on board below!', 'चरण 2: अब नीचे बोर्ड में किसी खाली जगह पर टैप करें!', 'পদক্ষেপ ২: এতিয়া তলৰ ব’ৰ্ডৰ খালী স্থানত টিপক!')}</span>
                  </>
                ) : (
                  <>
                    <Hand className="w-3.5 h-3.5 text-[#8C4E0B]" />
                    <span>{tx('Step 1: Tap a piece below to pick it up', 'चरण 1: उठाने के लिए किसी टुकड़े पर टैप करें', 'পদক্ষেপ ১: তুলিবলৈ যিকোনো টুকুৰাত টিপক')}</span>
                  </>
                )}
              </span>
            ) : (
              <span className="text-[11px] text-[#5A6E5D]">
                {tx('Tap piece, then tap slot on board below', 'टुकड़े पर टैप करें, फिर नीचे बोर्ड में रखें', 'টুকুৰা বাছনি কৰি তলৰ ব’ৰ্ডত ৰাখক')}
              </span>
            )}
          </div>
          {trayPieces.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#EAF1E8] text-[#5B825B] text-center text-xs font-black">
              {tx(
                `All ${totalPieces} pieces are placed on the board! Check if they are in the right position.`,
                `सभी ${totalPieces} टुकड़े बोर्ड पर रख दिए गए हैं! देखें कि क्या वे सही जगह पर हैं।`,
                `সকলো ${totalPieces} টুকুৰা ব’ৰ্ডত ৰখা হৈছে! সঠিক স্থানত আছেনে চাওক।`
              )}
            </div>
          ) : (
            <div
              className={`grid gap-2.5 ${
                gridSize === 2
                  ? 'grid-cols-4'
                  : gridSize === 3
                  ? 'grid-cols-3 sm:grid-cols-5'
                  : 'grid-cols-4 sm:grid-cols-8'
              }`}
            >
              {trayPieces.map((pieceIdx) => {
                const isSelected = selectedSource?.type === 'tray' && selectedSource.pieceIndex === pieceIdx;
                const geom = getPieceGeometry(pieceIdx, gridSize);

                return (
                  <button
                    key={pieceIdx}
                    onClick={() => handleTrayPieceClick(pieceIdx)}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, pieceIdx, 'tray')}
                    className={`aspect-square rounded-2xl overflow-hidden relative border-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isSelected
                        ? 'border-[#5B825B] ring-4 ring-[#5B825B]/40 scale-105 shadow-md'
                        : 'border-[#E0DCD3] hover:border-[#5B825B]/60'
                    }`}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${currentPuzzle.image})`,
                        backgroundSize: geom.bgSize,
                        backgroundPosition: geom.bgPos,
                      }}
                    />
                    {showNumberHints && (
                      <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-black flex items-center justify-center backdrop-blur-xs">
                        {pieceIdx + 1}
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#5B825B]/15 border-2 border-[#5B825B] rounded-2xl flex items-center justify-center">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#5B825B] text-white text-[9px] font-black">
                          {tx('Selected', 'चुना गया', 'বাছনি কৰা হৈছে')}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Current Active Picture Header */}
      <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#5B825B]/30 shrink-0">
            <img
              src={currentPuzzle.image}
              alt={currentPuzzle.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-black text-[#2D3A2F] leading-tight">{currentPuzzle.title}</h3>
              {isComplete && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF1E8] text-[#5B825B] text-[11px] font-extrabold">
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A6E5D] line-clamp-1">{currentPuzzle.description}</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundController.playClick();
            setShowGhostGuide(!showGhostGuide);
          }}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            showGhostGuide
              ? 'bg-[#EAF1E8] border-[#5B825B]/30 text-[#5B825B]'
              : 'bg-white border-[#E0DCD3] text-[#5A6E5D]'
          }`}
          title="Toggle ghost image outline underneath"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ghost Guide</span>
        </button>
      </div>

      {/* The Dynamic Puzzle Assembly Board */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#5A6E5D]">
            Assembly Board ({totalPieces} Slots · {gridSize}×{gridSize})
          </span>
          <span className="text-xs text-[#5A6E5D]">
            {isComplete ? '🎉 Complete!' : tx('Tap piece in tray above, then tap slot', 'ऊपर से टुकड़ा चुनकर यहाँ रखें', 'ওপৰৰ ট্ৰে’ৰ পৰা টুকুৰা আনি ইয়াত ৰাখক')}
          </span>
        </div>

        {/* Board Frame */}
        <div className={`relative mx-auto w-full ${gridSize === 4 ? 'max-w-[390px]' : 'max-w-[350px]'} aspect-square rounded-3xl overflow-hidden border-4 border-[#2D3A2F]/15 bg-[#F8F6F0] shadow-inner p-1.5`}>
          {/* Ghost Guide Underneath (faint reference guide) */}
          {showGhostGuide && !isComplete && (
            <div
              className="absolute inset-1.5 rounded-2xl pointer-events-none opacity-25"
              style={{
                backgroundImage: `url(${currentPuzzle.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}

          {/* If Complete, display unified seamless picture with celebratory particle accents */}
          {isComplete ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl ring-4 ring-[#E8B25C] animate-scaleUp">
              <img
                src={currentPuzzle.image}
                alt={currentPuzzle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Celebratory badge overlay */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8B25C] text-[#332610] text-xs font-black shadow-md animate-bounce">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Solved!</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <div className="flex items-center gap-1.5 text-[#E8B25C] font-black text-xs uppercase tracking-wider">
                    <Trophy className="w-4 h-4 fill-current" /> Picture Reassembled!
                  </div>
                  <h4 className="text-lg font-black drop-shadow-sm">{currentPuzzle.title}</h4>
                </div>
              </div>
            </div>
          ) : (
            /* Dynamic Grid of slots */
            <div
              className={`grid gap-1.5 w-full h-full relative z-10 ${
                gridSize === 2
                  ? 'grid-cols-2 grid-rows-2'
                  : gridSize === 3
                  ? 'grid-cols-3 grid-rows-3'
                  : 'grid-cols-4 grid-rows-4'
              }`}
            >
              {Array.from({ length: totalPieces }, (_, i) => i).map((slotIdx) => {
                const pieceIdx = boardSlots[slotIdx];
                const isOccupied = pieceIdx !== null;
                const isSelected = selectedSource?.type === 'board' && selectedSource.slotIndex === slotIdx;
                const isCorrect = pieceIdx === slotIdx;
                const slotGeom = getPieceGeometry(slotIdx, gridSize);
                const pieceGeom = pieceIdx !== null ? getPieceGeometry(pieceIdx, gridSize) : null;

                const isEasyModeTarget = gridSize === 2 && !isOccupied && selectedSource?.type === 'tray';

                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleBoardSlotClick(slotIdx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnSlot(e, slotIdx)}
                    className={`relative rounded-2xl overflow-hidden flex items-center justify-center transition-all cursor-pointer select-none ${
                      isOccupied
                        ? 'border-2 border-white shadow-xs'
                        : isEasyModeTarget
                        ? 'border-2 border-dashed border-[#5B825B] bg-[#EAF1E8]/90 ring-4 ring-[#5B825B]/40 animate-pulse shadow-md'
                        : 'border-2 border-dashed border-[#C5BFB2] bg-white/40 hover:bg-white/70'
                    } ${
                      isSelected
                        ? 'ring-4 ring-[#E8B25C] shadow-md scale-98'
                        : ''
                    }`}
                  >
                    {isOccupied && pieceGeom ? (
                      <div
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, pieceIdx, 'board', slotIdx)}
                        className="w-full h-full relative group"
                        style={{
                          backgroundImage: `url(${currentPuzzle.image})`,
                          backgroundSize: pieceGeom.bgSize,
                          backgroundPosition: pieceGeom.bgPos,
                        }}
                      >
                        {/* Number hint */}
                        {showNumberHints && (
                          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-black flex items-center justify-center backdrop-blur-xs">
                            {pieceIdx + 1}
                          </div>
                        )}

                        {/* Correct indicator */}
                        {isCorrect && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Return to tray button */}
                        <button
                          onClick={(e) => handleReturnToTray(slotIdx, e)}
                          className="absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-black/65 hover:bg-black text-[9px] text-white font-bold backdrop-blur-xs opacity-80 hover:opacity-100 transition-all cursor-pointer"
                          title="Remove from slot"
                        >
                          Remove
                        </button>
                      </div>
                    ) : isEasyModeTarget ? (
                      <div className="text-center p-1 text-[#5B825B] flex flex-col items-center justify-center animate-fadeIn">
                        <Hand className="w-5 h-5 text-[#5B825B] animate-bounce mb-0.5" />
                        <span className="text-[11px] font-black bg-white px-2 py-0.5 rounded-md shadow-2xs text-[#2D3A2F]">
                          {tx('Tap here', 'यहाँ रखें', 'ইয়াত ৰাখক')}
                        </span>
                        <span className="text-[9px] font-bold text-[#5B825B] mt-0.5">
                          {slotGeom.label}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-1 text-[#8A8070]">
                        <div className="w-6 h-6 mx-auto rounded-full bg-white/70 flex items-center justify-center text-[11px] font-black text-[#5A6E5D] mb-0.5">
                          {slotIdx + 1}
                        </div>
                        <span className="text-[9px] font-bold block leading-tight truncate">
                          {slotGeom.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls: Scramble & Put It Back */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleScramble}
            className="py-3 px-4 rounded-2xl bg-[#F8F6F0] hover:bg-[#EFECE3] border border-[#E0DCD3] text-[#2D3A2F] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-[#E8B25C]" />
            <span>Scramble Puzzle</span>
          </button>

          <button
            onClick={handlePutItBack}
            className="py-3 px-4 rounded-2xl bg-[#5B825B] hover:bg-[#4a6d4a] text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current text-[#E8B25C]" />
            <span>Put It Back (Solve)</span>
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {isComplete && (
        <div className="bg-gradient-to-br from-[#EAF1E8] to-[#DCEAD2] rounded-3xl p-6 border border-[#5B825B]/30 shadow-xs space-y-4 animate-scaleUp text-center">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#5B825B] text-white flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8 fill-current text-[#E8B25C]" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#5B825B]">
              Splendid Accomplishment!
            </span>
            <h3 className="text-2xl font-black text-[#2D3A2F] mt-1">
              You Solved the {currentPuzzle.title}!
            </h3>
            <p className="text-sm text-[#2D3A2F]/80 mt-1 max-w-md mx-auto">
              All {totalPieces} pieces fit together into a beautiful memory. Your mind is sharp, observant, and joyful.
            </p>
          </div>

          {/* Picture Story Voice Narration Box */}
          {narrationText && (
            <div className="bg-white/95 rounded-2xl p-4 border border-[#5B825B]/25 shadow-xs text-left space-y-2 max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#5B825B] flex items-center gap-1.5">
                  <Volume2 className={`w-4 h-4 ${isSpeakingNarration ? 'animate-pulse text-[#E8B25C]' : ''}`} />
                  <span>{mode === 'personalized' ? 'Memory Story Voice' : 'Picture Story Voice'}</span>
                </span>
                <button
                  onClick={() => {
                    soundController.playClick();
                    speakVictoryStory(narrationText);
                  }}
                  className="text-xs font-black text-[#5B825B] hover:text-[#4a6d4a] flex items-center gap-1.5 bg-[#EAF1E8] px-3 py-1.5 rounded-xl active:scale-95 transition-all shadow-2xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeakingNarration ? 'Speaking...' : 'Listen Again'}</span>
                </button>
              </div>
              <p className="text-sm font-medium text-[#2D3A2F] leading-relaxed italic bg-[#F8F6F0] p-3 rounded-xl border border-[#EAE6DF]">
                "{narrationText}"
              </p>
            </div>
          )}

          {/* 10-Second Pause Badge */}
          <div className="flex items-center justify-center pt-1 pb-0.5">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border transition-all ${
              pauseSecondsLeft > 0 
                ? 'bg-[#EAF1E8] text-[#3B5A3E] border-[#5B825B]/30' 
                : 'bg-[#F8F6F0] text-[#5A6E5D] border-[#E0DCD3]'
            }`}>
              <Clock className="w-3.5 h-3.5 text-[#5B825B]" />
              <span>
                {pauseSecondsLeft > 0
                  ? tx(`Pause & admire: ${pauseSecondsLeft}s`, `विश्राम व सुंदर याद: ${pauseSecondsLeft} से.`, `উপভোগ কৰক: ${pauseSecondsLeft} ছে.`)
                  : tx('Pause complete · Ready for Next Picture', 'विश्राम पूर्ण · अगली तस्वीर के लिए तैयार', 'উপভোগ সম্পূৰ্ণ · পৰৱৰ্তী ছবিৰ বাবে প্ৰস্তুত')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => {
                soundController.playClick();
                triggerCelebratoryParticles();
              }}
              className="py-3 px-4 rounded-2xl bg-[#FDF0D5] border border-[#E8B25C]/50 text-[#332610] font-black text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#fae6b8] active:scale-95 shadow-xs transition-all cursor-pointer"
              title="Launch celebratory confetti shower"
            >
              <Sparkles className="w-4 h-4 text-[#E8B25C] fill-current" />
              <span>Celebrate Again 🎉</span>
            </button>

            <button
              onClick={handleScramble}
              className="py-3 px-4 rounded-2xl bg-white border border-[#5B825B]/30 text-[#2D3A2F] font-black text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#F8F6F0] active:scale-95 shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#5B825B]" />
              <span>Scramble Again</span>
            </button>

            <button
              onClick={handleNextPicture}
              className="py-3 px-5 rounded-2xl bg-[#5B825B] text-white font-black text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#4a6d4a] active:scale-95 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>
                {pauseSecondsLeft > 0
                  ? `${tx('Next Picture', 'अगली तस्वीर', 'পৰৱৰ্তী ছবি')} (${pauseSecondsLeft}s)`
                  : tx('Next Picture', 'अगली तस्वीर', 'পৰৱৰ্তী ছবি')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Images & Treasures Gallery ("All the things on the last") */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4">
        {mode === 'personalized' ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wide">
                {tx('Caregiver Uploaded Memories', 'पारिवारिक यादें', 'পৰিয়ালৰ স্মৃতি')} ({photoMemories.length})
              </span>
              <span className="text-[11px] text-[#5A6E5D]">
                {tx('Tap to choose photo', 'फ़ोटो चुनने के लिए टैप करें', 'ফটো বাছনি কৰিবলৈ টিপক')}
              </span>
            </div>

            {photoMemories.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-dashed border-[#D5D0C5] text-center text-xs text-[#5A6E5D]">
                {tx(
                  'No memories uploaded yet. You can upload memories in Family Caregiver Mode or play Default Mode with Mango and other treasures!',
                  'अभी कोई व्यक्तिगत फोटो अपलोड नहीं हुई है। आप मैंगो और अन्य सुंदर तस्वीरों के साथ डिफ़ॉल्ट मोड खेल सकते हैं!',
                  'এতিয়ালৈ কোনো ব্যক্তিগত ফটো আপলোড কৰা হোৱা নাই। আপুনি আম আৰু আন ধুনীয়া ছবিৰ সৈতে খেলিব পাৰে!'
                )}
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1">
                {photoMemories.map((mem) => {
                  const isSelected = selectedPersonalizedId === mem.id;
                  return (
                    <button
                      key={mem.id}
                      onClick={() => {
                        soundController.playClick();
                        setSelectedPersonalizedId(mem.id);
                      }}
                      className={`shrink-0 w-28 rounded-2xl p-2 text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#5B825B] bg-[#EAF1E8] ring-2 ring-[#5B825B]/40 shadow-xs scale-102'
                          : 'border-[#E0DCD3] bg-white hover:border-[#5B825B]/50'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-1.5 relative">
                        <img
                          src={mem.image}
                          alt={mem.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#2D3A2F] truncate">{mem.title}</p>
                      <p className="text-[10px] text-[#5A6E5D] truncate">{mem.person || mem.category}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wide">
                {tx('Default Everyday Items & Treasures', 'दैनिक वस्तुएं व सुंदर यादें', 'দৈনন্দিন বস্তু আৰু আপুৰুগীয়া সম্পদ')}
              </span>
              <button
                onClick={() => {
                  soundController.playClick();
                  setIsAddingCustomImage(!isAddingCustomImage);
                }}
                className="text-[11px] font-extrabold text-[#5B825B] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tx('Add Any Image', 'अपनी फोटो जोड़ें', 'নিজৰ ফটো যোগ কৰক')}</span>
              </button>
            </div>

            {/* Custom Image Creator Accordion */}
            {isAddingCustomImage && (
              <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider">
                    {tx('Add Your Own Image to Default Mode', 'डिफ़ॉल्ट मोड में अपनी फोटो जोड़ें', 'ডিফল্ট মোডত নিজৰ ফটো যোগ কৰক')}
                  </h4>
                  <button
                    onClick={() => setIsAddingCustomImage(false)}
                    className="text-xs text-[#5A6E5D] hover:text-[#2D3A2F] cursor-pointer"
                  >
                    {tx('Cancel', 'रद्द करें', 'বাতিল কৰক')}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Image Title (e.g. Sweet Mango, Garden)"
                    value={customImageTitle}
                    onChange={(e) => setCustomImageTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#D5D0C5] text-xs focus:outline-hidden focus:border-[#5B825B]"
                  />
                  <input
                    type="url"
                    placeholder="Paste image web URL..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#D5D0C5] text-xs focus:outline-hidden focus:border-[#5B825B]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D5D0C5] text-xs font-bold text-[#2D3A2F] flex items-center gap-1.5 hover:bg-[#F8F6F0] cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#5B825B]" />
                    <span>{tx('Upload from Device', 'डिवाइस से अपलोड करें', 'ডিভাইচৰ পৰা আপলোড কৰক')}</span>
                  </button>

                  {customImageUrl && (
                    <button
                      onClick={handleAddUrlImage}
                      className="px-4 py-2 rounded-xl bg-[#5B825B] text-white text-xs font-extrabold hover:bg-[#4a6d4a] cursor-pointer"
                    >
                      {tx('Use URL', 'URL उपयोग करें', 'URL ব্যৱহাৰ কৰক')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              <button
                onClick={() => {
                  soundController.playClick();
                  setDefaultFilter('all');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  defaultFilter === 'all'
                    ? 'bg-[#5B825B] text-white shadow-2xs'
                    : 'bg-white text-[#5A6E5D] border border-[#E0DCD3] hover:border-[#5B825B]/60'
                }`}
              >
                {tx(`All (${defaultPuzzles.length})`, `सभी (${defaultPuzzles.length})`, `সকলো (${defaultPuzzles.length})`)}
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setDefaultFilter('mango');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  defaultFilter === 'mango'
                    ? 'bg-[#5B825B] text-white shadow-2xs'
                    : 'bg-white text-[#5A6E5D] border border-[#E0DCD3] hover:border-[#5B825B]/60'
                }`}
              >
                <span>🥭</span>
                <span>{tx('Mangoes (3)', 'आम (3)', 'আম (৩)')}</span>
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setDefaultFilter('dish');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  defaultFilter === 'dish'
                    ? 'bg-[#5B825B] text-white shadow-2xs'
                    : 'bg-white text-[#5A6E5D] border border-[#E0DCD3] hover:border-[#5B825B]/60'
                }`}
              >
                <span>🍲</span>
                <span>{tx('Assamese Dishes (20)', 'असमिया व्यंजन (20)', 'অসমীয়া খাদ্য (২০)')}</span>
              </button>
            </div>

            {/* Presets row */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1">
              {filteredDefaultPuzzles.map((item) => {
                const isSelected = selectedDefaultId === item.id;
                const displayTitle = language === 'as' && item.titleAs
                  ? item.titleAs
                  : language === 'hi' && item.titleHi
                  ? item.titleHi
                  : item.title;
                const displayCategory = language === 'as' && item.categoryAs
                  ? item.categoryAs
                  : language === 'hi' && item.categoryHi
                  ? item.categoryHi
                  : item.category;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundController.playClick();
                      setSelectedDefaultId(item.id);
                    }}
                    className={`shrink-0 w-28 rounded-2xl p-2 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#5B825B] bg-[#EAF1E8] ring-2 ring-[#5B825B]/40 shadow-xs scale-102'
                        : 'border-[#E0DCD3] bg-white hover:border-[#5B825B]/50'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-1.5 relative">
                      <img
                        src={item.image}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#2D3A2F] truncate">{displayTitle}</p>
                    <p className="text-[10px] text-[#5A6E5D] truncate">{displayCategory}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reference Modal: Peek at full picture */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-[#E0DCD3] shadow-2xl animate-scaleUp">
            <div className="p-4 border-b border-[#EAE6DF] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#5B825B] tracking-wider">
                  Full Reference Picture
                </span>
                <h4 className="text-lg font-black text-[#2D3A2F]">{currentPuzzle.title}</h4>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="w-8 h-8 rounded-full bg-[#F8F6F0] text-[#2D3A2F] font-black flex items-center justify-center hover:bg-[#EAE6DF]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-[#E0DCD3] shadow-xs">
                <img
                  src={currentPuzzle.image}
                  alt={currentPuzzle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#EAE6DF]">
                <p className="text-xs text-[#2D3A2F] font-medium leading-relaxed">
                  {currentPuzzle.description}
                </p>
              </div>

              <button
                onClick={() => setShowReferenceModal(false)}
                className="w-full py-3 rounded-2xl bg-[#5B825B] text-white font-black text-sm shadow-xs hover:bg-[#4a6d4a]"
              >
                Back to Puzzle Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Cognitive Auto-Adjust Explanation & Interactive Simulator Modal */}
      {showAIInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E0DCD3] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[#EAE6DF] flex items-center justify-between bg-[#F8F6F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-[#2D3A2F]">AI Difficulty Auto-Adjust</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#EAF1E8] text-[#5B825B] border border-[#5B825B]/20">
                      Gemini 3.8 Flash
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6E5D] font-medium">
                    Dynamic Cognitive Difficulty Adjustment (DDA) Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIInfoModal(false)}
                className="w-8 h-8 rounded-full bg-white text-[#2D3A2F] font-black flex items-center justify-center hover:bg-[#EAE6DF] border border-[#E0DCD3]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#2D3A2F] leading-relaxed">
              <div className="bg-[#EAF1E8] p-3.5 rounded-2xl border border-[#5B825B]/20 space-y-1">
                <div className="flex items-center gap-1.5 text-[#5B825B] font-black">
                  <Sparkles className="w-4 h-4 text-[#E8B25C]" />
                  <span>Personalized Cognitive Pacing & Calibration</span>
                </div>
                <p className="text-[#2D3A2F]/90 font-medium">
                  The AI model monitors solving pace against clinically calibrated target averages for each level to maintain confidence, prevent cognitive overload, and celebrate mastery:
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-bold text-center">
                  <div className="p-2 rounded-xl bg-white border border-[#E0DCD3]">
                    <div className="text-[10px] text-[#8A8070]">Easy (2×2)</div>
                    <div className="text-xs font-black text-[#5B825B]">~25s Target</div>
                    <div className="text-[10px] text-[#8A8070]">Degrade: &gt;50s</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E0DCD3]">
                    <div className="text-[10px] text-[#8A8070]">Medium (3×3)</div>
                    <div className="text-xs font-black text-[#5B825B]">~45s Target</div>
                    <div className="text-[10px] text-[#8A8070]">Degrade: &gt;70s</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E0DCD3]">
                    <div className="text-[10px] text-[#8A8070]">Tough (4×4)</div>
                    <div className="text-xs font-black text-[#5B825B]">~120s Target</div>
                    <div className="text-[10px] text-[#8A8070]">Degrade: &gt;145s</div>
                  </div>
                </div>
              </div>

              {/* Case 1: Taking 25s More Than Designated Average (Degrade 1 step) */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E8B25C]/40 bg-gradient-to-r from-[#FDF0D5]/50 to-transparent space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E8B25C] text-white flex items-center justify-center font-black">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-[#2D3A2F]">
                    1. Taking 25s More Than Designated Average (Degrade 1 Step)
                  </h4>
                </div>
                <p className="text-[#5A6E5D] pl-8">
                  If the player takes <strong>25 seconds more</strong> than the designated average time (e.g. &gt;70s on Medium or &gt;145s on Tough), the AI immediately softens difficulty by <strong>1 step</strong> with warm, reassuring encouragement:
                </p>
                <div className="pl-8 pt-1 flex items-center gap-2 flex-wrap font-black text-[11px]">
                  <span className="px-2 py-1 rounded-lg bg-white border border-[#E0DCD3]">Tough (4×4) ➔ Medium (3×3)</span>
                  <span className="text-[#8A8070]">or</span>
                  <span className="px-2 py-1 rounded-lg bg-white border border-[#E0DCD3]">Medium (3×3) ➔ Easy (2×2)</span>
                </div>
              </div>

              {/* Case 2: 3 Consecutive Solves Within Target (Upgrade 1 step) */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#5B825B]/40 bg-gradient-to-r from-[#EAF1E8]/50 to-transparent space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#5B825B] text-white flex items-center justify-center font-black">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-[#2D3A2F]">
                    2. Three Consecutive Fast Solves (Upgrade 1 Step)
                  </h4>
                </div>
                <p className="text-[#5A6E5D] pl-8">
                  If the player easily solves the puzzle <strong>3 consecutive times</strong> within the designated average time, the AI advances difficulty by <strong>1 step</strong> to provide fresh cognitive engagement:
                </p>
                <div className="pl-8 pt-1 flex items-center gap-2 flex-wrap font-black text-[11px]">
                  <span className="px-2 py-1 rounded-lg bg-white border border-[#E0DCD3]">Easy (2×2) ➔ Medium (3×3)</span>
                  <span className="text-[#8A8070]">or</span>
                  <span className="px-2 py-1 rounded-lg bg-white border border-[#E0DCD3]">Medium (3×3) ➔ Tough (4×4)</span>
                </div>
              </div>

              {/* Current Live Stats */}
              <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#EAE6DF] space-y-1">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#5A6E5D]">
                  Current Player Telemetry
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className="bg-white p-2 rounded-xl border border-[#E0DCD3] text-center">
                    <div className="text-[10px] text-[#8A8070] font-bold">Grid Level</div>
                    <div className="text-xs font-black text-[#2D3A2F] truncate">{GRID_LABELS[gridSize].name}</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#E0DCD3] text-center">
                    <div className="text-[10px] text-[#8A8070] font-bold">Designated Avg</div>
                    <div className="text-xs font-black text-[#2D3A2F]">{designatedTime}s</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#E0DCD3] text-center">
                    <div className="text-[10px] text-[#8A8070] font-bold">Degrade Point</div>
                    <div className="text-xs font-black text-[#E8B25C]">&gt;{degradeThreshold}s</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#E0DCD3] text-center">
                    <div className="text-[10px] text-[#8A8070] font-bold">Streak</div>
                    <div className="text-xs font-black text-[#5B825B]">{consecutiveSolves}/3</div>
                  </div>
                </div>
              </div>

              {/* Interactive Test Simulator for Caregivers */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#2D3A2F]">
                    Caregiver / Clinician Test Simulator
                  </span>
                  <span className="text-[10px] text-[#8A8070] font-bold">Live Calibration</span>
                </div>
                <p className="text-[11px] text-[#5A6E5D]">
                  Test both rules immediately to verify automatic level shifting:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowAIInfoModal(false);
                      simulateAIDifficultyTest('slower');
                    }}
                    disabled={isAnalyzingAI}
                    className="p-2.5 rounded-xl bg-[#FDF0D5] border border-[#E8B25C] text-[#332610] font-black text-[11px] flex flex-col items-center justify-center gap-1 hover:bg-[#fae6b8] active:scale-95 transition-all shadow-2xs text-center"
                  >
                    <div className="flex items-center gap-1 text-[#E8B25C]">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Simulate Slower ({degradeThreshold + 5}s)</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#8A8070]">Takes &gt;25s over ➔ Degrades 1 step</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAIInfoModal(false);
                      simulateAIDifficultyTest('faster');
                    }}
                    disabled={isAnalyzingAI}
                    className="p-2.5 rounded-xl bg-[#EAF1E8] border border-[#5B825B] text-[#1E3B1E] font-black text-[11px] flex flex-col items-center justify-center gap-1 hover:bg-[#d8e8d5] active:scale-95 transition-all shadow-2xs text-center"
                  >
                    <div className="flex items-center gap-1 text-[#5B825B]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Simulate 3rd Quick Solve</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#5B825B]">3 consecutive solves ➔ Upgrades 1 step</span>
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setShowAIInfoModal(false);
                      setDifficultyToast({
                        show: true,
                        gameTitle: 'Photo Puzzle',
                        action: 'EASE_DIFFICULTY',
                        previousLevelName: 'Tough (4×4)',
                        newLevelName: 'Medium (3×3)',
                        encouragement: `You're doing wonderfully, ${playerName}! We've made the puzzle a little gentler so you can relax, take your time, and enjoy every piece.`,
                        timeTaken: 152,
                        averageTime: 120,
                        onUndo: () => handleSelectGridSize(4),
                        onDismiss: () => setDifficultyToast(null),
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#FFFDF8] hover:bg-[#FDFBF7] border border-[#E8B25C]/60 text-[#332610] font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
                    <span>Preview Notification Toast (Gentle Comfort Message)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#EAE6DF] bg-[#F8F6F0]">
              <button
                onClick={() => setShowAIInfoModal(false)}
                className="w-full py-3 rounded-2xl bg-[#5B825B] text-white font-black text-sm shadow-xs hover:bg-[#4a6d4a] transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

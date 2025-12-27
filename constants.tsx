
import { PixelArtImage } from './types';

// 이 이름을 관리자 닉네임으로 사용하세요.
export const ADMIN_NAME = '픽셀관리자';

export const INITIAL_ART: PixelArtImage[] = [
  {
    id: '1',
    url: 'https://picsum.photos/seed/pixel1/400/400',
    title: '행복한 아기 공룡',
    creator: '픽셀마스터88',
    likes: 12,
    likedBy: [],
    comments: [
      { id: 'c1', text: '와, 색깔이 정말 예뻐요!', author: '그림쟁이', timestamp: Date.now() - 100000 },
      { id: 'c2', text: '공룡이 너무 귀여워요!', author: '공룡박사', timestamp: Date.now() - 50000 }
    ],
    timestamp: Date.now() - 500000
  },
  {
    id: '2',
    url: 'https://picsum.photos/seed/pixel2/400/400',
    title: '별이 빛나는 밤의 고양이',
    creator: '야옹화가',
    likes: 8,
    likedBy: [],
    comments: [],
    timestamp: Date.now() - 400000
  },
  {
    id: '3',
    url: 'https://picsum.photos/seed/pixel3/400/400',
    title: '사이버 우주 버거',
    creator: '맛있는픽셀',
    likes: 25,
    likedBy: [],
    comments: [
      { id: 'c3', text: '우와, 진짜 맛있어 보여요!', author: '배고픈게이머', timestamp: Date.now() - 10000 }
    ],
    timestamp: Date.now() - 300000
  }
];

export const GET_STATUS = (likes: number) => {
  if (likes >= 50) return { label: '픽셀 전설', color: 'bg-yellow-400 text-yellow-900', icon: '👑' };
  if (likes >= 20) return { label: '트렌딩', color: 'bg-pink-400 text-white', icon: '🔥' };
  if (likes >= 10) return { label: '인기 작품', color: 'bg-purple-400 text-white', icon: '✨' };
  if (likes >= 5) return { label: '라이징 스타', color: 'bg-blue-400 text-white', icon: '⭐' };
  return { label: '새내기 작가', color: 'bg-green-400 text-green-900', icon: '🌱' };
};

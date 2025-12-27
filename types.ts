
export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: number;
}

export interface PixelArtImage {
  id: string;
  url: string;
  title: string;
  creator: string;
  likes: number;
  likedBy: string[]; // 좋아요를 누른 유저 닉네임 목록
  comments: Comment[];
  timestamp: number;
}

export type StatusLevel = 'Newcomer' | 'Rising Star' | 'Popular' | 'Trending' | 'Pixel Legend';


import React, { useState, useEffect } from 'react';
import { PixelArtImage, Comment } from '../types';
import { GET_STATUS } from '../constants';

interface ImageCardProps {
  image: PixelArtImage;
  currentUser: string | null;
  onLike: (id: string) => void;
  onComment: (id: string, commentText: string, author: string) => void;
  onDelete: (id: string, firebaseId?: string) => void;
  onLoginPrompt: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, currentUser, onLike, onComment, onDelete, onLoginPrompt }) => {
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [showStatusPop, setShowStatusPop] = useState(false);
  
  const status = GET_STATUS(image.likes);
  const hasLiked = currentUser ? image.likedBy.includes(currentUser) : false;
  const isOwner = currentUser === image.creator;

  useEffect(() => {
    setShowStatusPop(true);
    const timer = setTimeout(() => setShowStatusPop(false), 1000);
    return () => clearTimeout(timer);
  }, [status.label]);

  const handleLike = () => {
    if (!currentUser) { onLoginPrompt(); return; }
    if (hasLiked) { alert("이미 이 작품을 좋아하고 있어요! ❤️"); return; }
    setIsLiking(true);
    onLike(image.id);
    setTimeout(() => setIsLiking(false), 500);
  };

  const handleDelete = () => {
    if (confirm("정말로 이 작품을 삭제할까요? 지워진 작품은 다시 되돌릴 수 없어요! 😢")) {
      onDelete(image.id, (image as any).firebaseId);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { onLoginPrompt(); return; }
    if (newComment.trim()) {
      onComment(image.id, newComment, currentUser);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-white hover:border-indigo-100 transition-all duration-300 flex flex-col h-full hover:shadow-2xl group/card relative">
      <div className="relative overflow-hidden aspect-square">
        <div className={`absolute top-4 left-4 ${status.color} px-3 py-1 rounded-full text-[10px] font-black shadow-md z-10 flex items-center space-x-1 transition-all ${showStatusPop ? 'scale-125 rotate-3' : 'scale-100'}`}>
          <span>{status.icon}</span>
          <span>{status.label}</span>
        </div>

        {isOwner && (
          <button 
            onClick={handleDelete}
            className="absolute top-4 right-4 bg-red-100 text-red-500 p-2 rounded-xl z-20 opacity-0 group-hover/card:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-lg"
            title="작품 삭제하기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        <img 
          src={image.url} 
          alt={image.title} 
          className="w-full h-full object-cover pixelated transition-transform duration-700 group-hover/card:scale-110"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-indigo-900 leading-tight">{image.title}</h3>
            <p className="text-indigo-400 text-sm">By {image.creator}</p>
          </div>
          <div className="flex flex-col items-center">
             <button 
              onClick={handleLike}
              className={`p-2 rounded-full transition-all duration-300 ${isLiking ? 'scale-150 rotate-12' : 'hover:scale-125'} ${hasLiked ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <svg className={`w-10 h-10 transition-colors ${hasLiked ? 'text-pink-500 fill-current' : 'text-gray-300'}`} fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <span className="text-indigo-900 font-black text-[10px] mt-1">LIKE {image.likes}</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto max-h-40 mb-4 space-y-2 pr-1 custom-scrollbar min-h-[60px]">
          {image.comments.length === 0 ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-indigo-50 rounded-2xl py-4 text-indigo-200 text-xs italic">댓글을 기다리고 있어요... ✨</div>
          ) : (
            image.comments.map((c) => (
              <div key={c.id} className="text-[13px] bg-indigo-50/50 p-2.5 rounded-2xl border border-indigo-50 animate-in slide-in-from-left duration-300">
                <span className="font-bold text-indigo-600 mr-2">{c.author}</span>
                <span className="text-indigo-900 break-words">{c.text}</span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleCommentSubmit} className="mt-auto">
          <div className="relative">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={currentUser ? "댓글 쓰기..." : "로그인이 필요해요"} className="w-full pl-4 pr-12 py-3 rounded-2xl border-2 border-indigo-50 focus:border-indigo-400 focus:ring-0 focus:outline-none text-sm transition-all bg-slate-50" />
            <button type="submit" className="absolute right-2 top-1.5 p-1.5 text-indigo-600 hover:text-indigo-800 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, push, update, remove } from 'firebase/database';
import { Layout } from './components/Layout';
import { ImageCard } from './components/ImageCard';
import { UploadForm } from './components/UploadForm';
import { PixelArtImage, Comment } from './types';
import { INITIAL_ART, ADMIN_NAME } from './constants';

const FIREBASE_DB_URL = "https://pixelpals-342d3-default-rtdb.asia-southeast1.firebasedatabase.app";

const firebaseConfig = { databaseURL: FIREBASE_DB_URL };

let db: any = null;
try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getDatabase(app);
} catch (e) {
  console.error("Firebase 초기화 에러:", e);
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try { return localStorage.getItem('pixelpals_user'); } catch { return null; }
  });
  
  const [currentView, setCurrentView] = useState<'all' | 'hallOfFame' | 'myWorks'>('all');
  const [notifications, setNotifications] = useState<{id: string, text: string}[]>([]);
  const [images, setImages] = useState<PixelArtImage[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginName, setLoginName] = useState('');

  const addNotification = (text: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{id, text}, ...prev].slice(0, 3));
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      addNotification("갤러리 주소가 복사되었습니다! 친구들에게 보내주세요 🔗");
    }).catch(() => {
      alert("주소: " + url);
    });
  };

  useEffect(() => {
    if (!db) { setImages(INITIAL_ART); return; }
    const imagesRef = ref(db, 'images');
    const unsubscribe = onValue(imagesRef, (snapshot) => {
      const data = snapshot.val();
      setIsLive(true);
      let imageList: PixelArtImage[] = [];
      if (data) {
        imageList = Object.keys(data).map(key => ({
          ...data[key],
          firebaseId: key,
          likes: data[key].likes || 0,
          likedBy: data[key].likedBy || [],
          comments: data[key].comments || []
        }));
      }
      const combined = [...imageList];
      INITIAL_ART.forEach(initArt => {
        if (!combined.some(img => img.id === initArt.id)) combined.push(initArt);
      });
      setImages(combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
    }, (error) => {
      setIsLive(false);
      setImages(INITIAL_ART);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loginName.trim()) {
      const name = loginName.trim();
      setCurrentUser(name);
      try { localStorage.setItem('pixelpals_user', name); } catch (err) {}
      addNotification(name === ADMIN_NAME ? "관리자 모드로 접속했습니다 🛡️" : `반가워요, ${name}님! 🌟`);
      setShowLoginModal(false);
      setLoginName('');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('all');
    try { localStorage.removeItem('pixelpals_user'); } catch (err) {}
    addNotification("로그아웃 되었습니다. 다음에 또 봐요! 👋");
  };

  const handleLike = (id: string) => {
    if (!currentUser) { setShowLoginModal(true); return; }
    const target = images.find(img => img.id === id);
    if (!target) return;
    if (target.likedBy?.includes(currentUser)) {
      addNotification("이미 '좋아요'를 누른 작품이에요! ❤️");
      return;
    }
    const updatedLikedBy = [...(target.likedBy || []), currentUser];
    const updatedLikes = (target.likes || 0) + 1;
    setImages(prev => prev.map(img => img.id === id ? { ...img, likes: updatedLikes, likedBy: updatedLikedBy } : img));
    if (db && (target as any).firebaseId) {
      update(ref(db, `images/${(target as any).firebaseId}`), { likes: updatedLikes, likedBy: updatedLikedBy });
    }
    addNotification(`'${target.title}' 작품에 하트를 보냈어요! ❤️`);
  };

  const handleComment = (id: string, text: string, author: string) => {
    const target = images.find(img => img.id === id);
    if (!target) return;
    const newComment: Comment = { id: Math.random().toString(36).substr(2, 9), text, author, timestamp: Date.now() };
    const updatedComments = [newComment, ...(target.comments || [])];
    setImages(prev => prev.map(img => img.id === id ? { ...img, comments: updatedComments } : img));
    if (db && (target as any).firebaseId) {
      update(ref(db, `images/${(target as any).firebaseId}`), { comments: updatedComments });
    }
  };

  const handleDelete = (id: string, firebaseId?: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (db && firebaseId) {
      remove(ref(db, `images/${firebaseId}`))
        .then(() => addNotification("게시물이 갤러리에서 완전히 제거되었습니다. 🗑️"))
        .catch(err => console.error("삭제 실패:", err));
    } else {
      addNotification("작품을 리스트에서 지웠습니다.");
    }
  };

  const handleUpload = (title: string, creator: string, url: string) => {
    const newArt: PixelArtImage = {
      id: Math.random().toString(36).substr(2, 9),
      url, title, creator, likes: 0, likedBy: [], comments: [], timestamp: Date.now()
    };
    setImages(prev => [newArt, ...prev]);
    setCurrentView('all');
    addNotification(`와! 새 작품 '${title}'이(가) 등록되었어요! 🚀`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    if (db) { push(ref(db, 'images'), newArt); }
  };

  const displayedImages = useMemo(() => {
    let filtered = [...images];
    if (currentView === 'hallOfFame') {
      return filtered.filter(img => img.likes >= 10).sort((a, b) => b.likes - a.likes);
    }
    if (currentView === 'myWorks' && currentUser) {
      return filtered.filter(img => img.creator === currentUser);
    }
    return filtered;
  }, [images, currentView, currentUser]);

  const getPageTitle = () => {
    switch(currentView) {
      case 'hallOfFame': return '🏆 명예의 전당';
      case 'myWorks': return `🎨 ${currentUser} 작가님의 갤러리`;
      default: return '픽셀 아티스트 광장 🎨';
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      onLogin={() => setShowLoginModal(true)} 
      onLogout={handleLogout} 
      onSetView={setCurrentView}
      onCopyLink={handleCopyLink}
    >
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-4 border-yellow-400">
            <h3 className="text-2xl font-black text-indigo-900 mb-2 text-center">반가워요! 👋</h3>
            <p className="text-indigo-400 text-center mb-6 font-medium text-sm">갤러리에서 사용할 이름을 알려주세요.</p>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input autoFocus type="text" value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="멋진 닉네임 입력..." className="w-full px-6 py-4 rounded-2xl bg-indigo-50 border-2 border-transparent focus:border-indigo-400 focus:outline-none font-bold text-center" />
              <button type="submit" className="w-full py-4 rounded-2xl bg-yellow-400 text-indigo-900 font-black hover:bg-yellow-300 shadow-lg transition-all active:scale-95">입장하기!</button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed top-24 right-4 z-[60] flex flex-col space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="bg-white/95 text-indigo-900 px-5 py-3.5 rounded-2xl shadow-xl border-l-4 border-yellow-400 backdrop-blur-sm flex items-center space-x-3 animate-in slide-in-from-right duration-300">
            <span className="text-xl">🔔</span>
            <span className="font-bold text-sm leading-tight">{n.text}</span>
          </div>
        ))}
      </div>

      <div className="text-center mb-10">
        <h2 className="text-4xl sm:text-7xl font-black text-indigo-900 mb-4 tracking-tight px-2">
          {getPageTitle()}
        </h2>
        <p className="text-sm sm:text-lg text-indigo-400 max-w-2xl mx-auto font-medium px-4">
          {currentView === 'myWorks' 
            ? '내가 세상에 공개한 소중한 보물들이에요!' 
            : '내 작품을 올리고 친구들의 그림에 하트를 눌러보세요!'}
        </p>
      </div>

      {currentView !== 'hallOfFame' && (
        <UploadForm currentUser={currentUser} onUpload={handleUpload} onLoginPrompt={() => setShowLoginModal(true)} />
      )}

      <div id="gallery-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {displayedImages.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="text-6xl mb-4">🏜️</div>
            <p className="text-indigo-300 font-bold text-xl">아직 작품이 없어요. 첫 번째 주인공이 되어보세요!</p>
          </div>
        ) : (
          displayedImages.map(image => (
            <ImageCard 
              key={image.id} 
              image={image} 
              currentUser={currentUser} 
              onLike={handleLike} 
              onComment={handleComment} 
              onDelete={handleDelete}
              onLoginPrompt={() => setShowLoginModal(true)} 
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default App;

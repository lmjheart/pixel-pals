
import React, { useState } from 'react';

interface UploadFormProps {
  currentUser: string | null;
  onUpload: (title: string, creator: string, imageUrl: string) => void;
  onLoginPrompt: () => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ currentUser, onUpload, onLoginPrompt }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleStart = () => {
    if (!currentUser) {
      onLoginPrompt();
      return;
    }
    setIsExpanding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onLoginPrompt();
      return;
    }
    if (!title || !file) {
      alert("작품 제목과 이미지를 선택해 주세요! 😊");
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // 로그인된 currentUser를 작성자로 자동 사용
        onUpload(title, currentUser, base64String);
        
        setTitle('');
        setFile(null);
        setPreviewUrl(null);
        setIsExpanding(false);
        setIsUploading(false);
      };
    } catch (error) {
      alert("업로드 중 오류가 발생했어요.");
      setIsUploading(false);
    }
  };

  if (!isExpanding) {
    return (
      <div className="mb-12 flex justify-center">
        <button 
          onClick={handleStart}
          className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-8 py-4 rounded-3xl font-black text-xl shadow-xl transform hover:scale-105 transition-all flex items-center space-x-3 active:scale-95"
        >
          <span className="text-3xl">🎨</span>
          <span>내 작품 게시하기!</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-12 max-w-2xl mx-auto bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-indigo-200 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-indigo-900 tracking-tight">작품 등록 중 🖼️</h2>
        <button onClick={() => setIsExpanding(false)} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-black text-indigo-400 uppercase tracking-widest">작품 제목</label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 무지개 고양이" className="w-full px-6 py-4 rounded-2xl bg-indigo-50 border-2 border-transparent focus:border-indigo-400 focus:outline-none font-bold" />
          <p className="text-xs text-indigo-300 font-bold mt-1">작성자: <span className="text-indigo-600">{currentUser}</span> 작가님</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-black text-indigo-400 uppercase tracking-widest">이미지 선택</label>
          <div className="relative group h-64 border-4 border-dashed border-indigo-100 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-300 bg-slate-50">
            <input required type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            {previewUrl ? (
              <div className="relative h-full w-full p-4">
                <img src={previewUrl} className="h-full w-full object-contain pixelated" alt="Preview" />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-5xl mb-2 grayscale group-hover:grayscale-0 transition-all">🖼️</div>
                <p className="text-indigo-300 font-bold">여기를 눌러 파일을 선택하세요</p>
              </div>
            )}
          </div>
        </div>

        <button 
          disabled={isUploading}
          type="submit"
          className={`w-full ${isUploading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-5 rounded-[2rem] font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-3`}
        >
          {isUploading ? <span>전시 준비 중...</span> : <span>전 세계 친구들에게 보여주기! 🚀</span>}
        </button>
      </form>
    </div>
  );
};

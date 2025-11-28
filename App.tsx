import React, { useState, useEffect } from 'react';
import { WorldMap } from './components/WorldMap';
import { MemoryModal } from './components/MemoryModal';
import { AddMemoryModal } from './components/AddMemoryModal';
import { ManageMemoriesModal } from './components/ManageMemoriesModal';
import { Memory, Coordinate } from './types';
import { ArrowRight, Map as MapIcon, Globe, Heart, Sparkles, Camera, List, Loader2, Instagram } from 'lucide-react';

// Firebase Imports
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { db, uploadImage } from './services/firebase';

// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
// 步骤：
// 1. 在您的网站上上传照片
// 2. 右键点击照片 -> "复制图片地址"
// 3. 将地址粘贴到下方双引号中，替换原本的链接
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

const DEFAULT_HERO_IMAGE = "https://i.postimg.cc/XJG1qMLB/tang-tang.jpg"; 

// Custom Icons for Social Media
// Updated XhsIcon (Xiaohongshu) - A literal "Book" shape with a bookmark
const XhsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Book Cover */}
    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" />
    {/* Bookmark */}
    <path d="M7 3V11L9.5 9.5L12 11V3H7Z" fill="white" fillOpacity="0.5" />
  </svg>
);

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  // ▼▼▼ 请在此处修改您的文字内容 ▼▼▼
  const TEXT_CONFIG = {
    badge: "Love you 3000 times", 
    titleLine1: "世界辣么大", 
    titleLine2: "我想去看看", 
    description: "世界很大，而我们的故事不断延伸。从北风吹过的奥斯陆街角到马赛海边落日的余温，每一个被记录的瞬间，都让地图变得更像家", 
    buttonText: "打开地图", 
    photoLabel: "For Saeko",
    
    // ▼▼▼ 社交账号配置 ▼▼▼
    socials: {
      // 填入完整的 URL
      xiaohongshu: "https://www.xiaohongshu.com/user/profile/5be5a3377f58480001f30720?xsec_token=ABp0lnP5nsZKIfHQeHF4mx4iRdNxQAMyh-Nuxxf89XekA%3D&xsec_source=pc_search",
      instagram: "https://instagram.com/kawaiisaeko3o3"
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'landing_page'), (doc) => {
      if (doc.exists() && doc.data().heroImageUrl) {
        setHeroImage(doc.data().heroImageUrl);
      } else {
        setHeroImage(DEFAULT_HERO_IMAGE);
      }
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingHero(true);
      setIsImgLoaded(false); 

      try {
        const downloadUrl = await uploadImage(file);
        await setDoc(doc(db, 'settings', 'landing_page'), { 
          heroImageUrl: downloadUrl,
          updatedAt: Date.now()
        }, { merge: true });
      } catch (error) {
        console.error("Failed to upload hero image:", error);
        alert("Failed to update cover photo. Please try again.");
      } finally {
        setIsUploadingHero(false);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-pink-50 to-blue-50 text-slate-700">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-pink-300/20 rounded-full blur-[120px] animate-pulse-slow" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
         <div className="absolute top-[10%] left-[10%] opacity-20 animate-float-delayed">
            <Sparkles className="text-yellow-400 w-12 h-12" />
         </div>
         <div className="absolute bottom-[20%] left-[20%] opacity-20 animate-float">
            <Heart className="text-pink-400 w-8 h-8" fill="currentColor" />
         </div>
      </div>

      <div className="z-10 w-full max-w-6xl p-6 flex flex-col md:flex-row items-center gap-12 md:gap-24">
        
        {/* Left Side: Photo Frame */}
        <div className="order-2 md:order-1 relative animate-float">
            <div className="polaroid w-72 md:w-80 rotate-[-6deg] hover:rotate-0 transition-all duration-500 relative group cursor-pointer bg-white">
                <div className="aspect-[3/4] overflow-hidden bg-gray-50 mb-4 rounded-sm border border-gray-100 relative flex items-center justify-center">
                    
                    <div className={`absolute inset-0 bg-pink-50/50 transition-opacity duration-1000 ${isImgLoaded ? 'opacity-0' : 'opacity-100'}`} />

                    {heroImage ? (
                        <img 
                            src={heroImage} 
                            alt="Hero" 
                            onLoad={() => setIsImgLoaded(true)}
                            className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-[2000ms] ease-out ${
                                isImgLoaded ? 'opacity-100 blur-0 grayscale-0' : 'opacity-0 blur-md grayscale'
                            } ${isUploadingHero ? 'opacity-50 blur-sm' : ''}`} 
                        />
                    ) : (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin text-pink-300" size={32} />
                        </div>
                    )}
                    
                    {isUploadingHero && (
                        <div className="absolute inset-0 flex items-center justify-center z-30">
                            <Loader2 className="animate-spin text-pink-500 w-10 h-10" />
                        </div>
                    )}

                    <label className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer z-20">
                         <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-slate-700 font-medium text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Camera size={16} className="text-pink-500" />
                            {isUploadingHero ? "Uploading..." : "Change Photo"}
                         </div>
                         <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={isUploadingHero}
                         />
                    </label>
                </div>

                <div className="text-center font-serif italic text-xl text-gray-600 flex items-center justify-center gap-2">
                    <span>{TEXT_CONFIG.photoLabel}</span>
                    <Heart size={16} className="text-pink-400" fill="currentColor" />
                </div>
                
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-pink-200/50 backdrop-blur-sm rotate-2 shadow-sm pointer-events-none"></div>
            </div>
            <div className="absolute -z-10 -right-12 -bottom-12 w-48 h-48 bg-blue-200/30 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side: Text & CTA */}
        <div className="order-1 md:order-2 text-center md:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/80 backdrop-blur-sm shadow-sm mb-6 text-indigo-900/60 text-sm font-medium tracking-wider uppercase">
                <Sparkles size={14} className="text-yellow-500" />
                <span>{TEXT_CONFIG.badge}</span>
            </div>

            <h1 className="font-serif text-6xl md:text-8xl font-medium tracking-tight text-slate-800 mb-6 leading-[1.1]">
                {TEXT_CONFIG.titleLine1}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-500 italic pr-2">{TEXT_CONFIG.titleLine2}</span>
            </h1>
            
            <p className="max-w-md text-slate-500 text-lg mb-8 leading-relaxed font-light">
                {TEXT_CONFIG.description}
            </p>

            {/* Social Media Pills - Hyperlinks */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-10">
                {TEXT_CONFIG.socials.xiaohongshu && (
                  <a 
                    href={TEXT_CONFIG.socials.xiaohongshu}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/80 rounded-full text-sm font-medium text-slate-600 border border-white/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer hover:text-red-500"
                  >
                    <XhsIcon className="w-4 h-4 text-red-500" />
                    <span>小红书</span>
                  </a>
                )}
                {/* WeChat Removed */}
                {TEXT_CONFIG.socials.instagram && (
                  <a 
                    href={TEXT_CONFIG.socials.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/80 rounded-full text-sm font-medium text-slate-600 border border-white/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer hover:text-pink-600"
                  >
                    <Instagram size={16} className="text-pink-600" />
                    <span>Instagram</span>
                  </a>
                )}
            </div>

            <button 
                onClick={onStart}
                className="group relative px-8 py-4 bg-white/80 hover:bg-white text-slate-800 rounded-full font-medium transition-all shadow-[0_4px_20px_rgba(236,72,153,0.15)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.25)] flex items-center gap-3 overflow-hidden border border-pink-100 mx-auto md:mx-0"
            >
                <span className="relative z-10">{TEXT_CONFIG.buttonText}</span>
                <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
        </div>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'map'>('landing');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [pendingCoordinate, setPendingCoordinate] = useState<Coordinate | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  // REAL-TIME LISTENER to Firebase Firestore
  useEffect(() => {
    // Subscribe to the 'memories' collection
    const q = query(collection(db, 'memories'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMemories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Memory[];
      
      setMemories(loadedMemories);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleMapClick = (coord: Coordinate) => {
    if (!selectedMemory && !showManageModal) {
        setPendingCoordinate(coord);
        setIsAdding(true);
    }
  };

  const handleSaveMemory = async (newMemory: Memory) => {
    try {
        // Add to Firestore
        // Note: we remove the 'id' property here because Firestore generates its own ID
        const { id, ...memoryData } = newMemory; 
        const docRef = await addDoc(collection(db, 'memories'), memoryData);
        console.log("Memory written with ID: ", docRef.id);
        
        setIsAdding(false);
        setPendingCoordinate(null);
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to save to cloud. Please try again.");
    }
  };

  const handleUpdateMemory = async (updated: Memory) => {
    try {
        const { id, ...memoryData } = updated;
        const memoryRef = doc(db, 'memories', id);
        await updateDoc(memoryRef, memoryData);
        
        // Update local selected state directly for immediate UI feedback
        setSelectedMemory(updated);
    } catch (e) {
        console.error("Error updating document: ", e);
    }
  };

  const handleDeleteMemory = async () => {
      if (selectedMemory) {
          try {
              await deleteDoc(doc(db, 'memories', selectedMemory.id));
              setSelectedMemory(null);
          } catch (e) {
              console.error("Error deleting document: ", e);
          }
      }
  };

  const handleBulkDelete = async (idsToDelete: string[]) => {
      try {
          // Delete multiple documents
          const promises = idsToDelete.map(id => deleteDoc(doc(db, 'memories', id)));
          await Promise.all(promises);
          setShowManageModal(false);
      } catch (e) {
          console.error("Error bulk deleting: ", e);
      }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50">
      
      <div 
        className={`absolute inset-0 w-full h-full transition-all duration-[1200ms] cubic-bezier(0.2, 0.8, 0.2, 1) transform will-change-transform ${
          view === 'map' 
            ? 'opacity-100 blur-0 scale-100 z-10' 
            : 'opacity-0 blur-2xl scale-110 z-0 pointer-events-none'
        }`}
      >
        <div className="w-full h-full font-sans flex flex-col overflow-hidden relative">
          
          <div className="absolute top-0 left-0 right-0 z-[500] p-6 pointer-events-none flex justify-between items-start">
            <button 
              onClick={() => setView('landing')}
              className="pointer-events-auto glass-panel-light px-5 py-3 rounded-full shadow-lg flex items-center gap-3 hover:bg-white transition group border-white/50"
            >
                <div className="bg-pink-100 p-2 rounded-full text-pink-500 group-hover:scale-110 transition-transform">
                    <Heart size={18} fill="currentColor" />
                </div>
                <div className="text-left">
                    <h1 className="text-base font-bold tracking-tight text-slate-700 font-serif italic">Saeko's World</h1>
                </div>
            </button>

            <div className="pointer-events-auto flex items-start gap-3">
                <button 
                    onClick={() => setShowManageModal(true)}
                    className="glass-panel-light p-4 rounded-2xl shadow-lg hover:bg-white transition text-slate-600 hover:text-indigo-600 border border-white/50"
                    title="Manage Memories"
                >
                    <List size={24} />
                </button>

                <div className="glass-panel-light px-6 py-4 rounded-2xl shadow-lg text-right min-w-[140px] flex flex-col items-end border border-white/50">
                    <div className="flex items-center gap-2 mb-1 text-pink-500">
                        <Globe size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Cities Visited</span>
                    </div>
                    <p className="text-3xl font-serif text-slate-800">{memories.length}</p>
                </div>
            </div>
          </div>

          <div className="flex-1 relative z-10">
            <WorldMap 
                memories={memories} 
                onMemoryClick={setSelectedMemory} 
                onMapClick={handleMapClick}
            />
            
            {!selectedMemory && !isAdding && !showManageModal && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 pointer-events-none z-[400]">
                    <div className="bg-white/70 text-slate-600 px-6 py-3 rounded-full shadow-lg backdrop-blur-md border border-white/50 flex items-center gap-3 text-sm animate-pulse-slow">
                        <MapIcon size={18} className="text-pink-400"/>
                        <span className="tracking-wide font-medium">Tap map to pin a new city</span>
                    </div>
                </div>
            )}
          </div>

          {selectedMemory && (
            <MemoryModal 
                memory={selectedMemory} 
                onClose={() => setSelectedMemory(null)} 
                onUpdateMemory={handleUpdateMemory}
                onDelete={handleDeleteMemory}
            />
          )}

          {isAdding && pendingCoordinate && (
            <AddMemoryModal 
                coordinate={pendingCoordinate} 
                onClose={() => { setIsAdding(false); setPendingCoordinate(null); }}
                onSave={handleSaveMemory}
            />
          )}

          {showManageModal && (
            <ManageMemoriesModal
                memories={memories}
                onClose={() => setShowManageModal(false)}
                onDelete={handleBulkDelete}
            />
          )}
        </div>
      </div>

      <div 
         className={`absolute inset-0 w-full h-full transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) transform will-change-transform ${
            view === 'landing' 
                ? 'opacity-100 blur-0 scale-100 z-20' 
                : 'opacity-0 blur-2xl scale-110 z-0 pointer-events-none'
         }`}
      >
         <LandingPage onStart={() => setView('map')} />
      </div>

    </div>
  );
};

export default App;
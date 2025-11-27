import React, { useState, useEffect } from 'react';
import { Memory, Photo } from '../types';
import { X, Calendar, MapPin, Wand2, ChevronLeft, ChevronRight, Image as ImageIcon, Grid, Maximize2, Trash2, Edit2, Check, Save, Upload, Loader2, Plus } from 'lucide-react';
import { generateLocationDescription, generatePhotoCaption } from '../services/gemini';
import { uploadImage } from '../services/firebase';

interface MemoryModalProps {
  memory: Memory;
  onClose: () => void;
  onUpdateMemory: (updated: Memory) => void;
  onDelete: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ memory, onClose, onUpdateMemory, onDelete }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [viewMode, setViewMode] = useState<'featured' | 'grid'>('featured');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(memory.title);
  const [editLocation, setEditLocation] = useState(memory.locationName);
  const [editDate, setEditDate] = useState(memory.date);
  const [editDescription, setEditDescription] = useState(memory.description);
  const [editPhotos, setEditPhotos] = useState<Photo[]>(memory.photos);
  
  // File upload state for Edit Mode
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Reset state when memory changes
    setEditTitle(memory.title);
    setEditLocation(memory.locationName);
    setEditDate(memory.date);
    setEditDescription(memory.description);
    setEditPhotos(memory.photos);
    setIsEditing(false);
    setIsSaving(false);
  }, [memory]);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    const textToEnhance = isEditing ? editDescription : memory.description;
    const newDesc = await generateLocationDescription(isEditing ? editLocation : memory.locationName, textToEnhance);
    
    if (isEditing) {
        setEditDescription(newDesc);
    } else {
        onUpdateMemory({ ...memory, description: newDesc });
    }
    setIsGenerating(false);
  };

  const handleGenerateCaption = async () => {
      setIsGeneratingCaption(true);
      const caption = await generatePhotoCaption(memory.locationName);
      
      if (isEditing) {
          const updated = [...editPhotos];
          updated[activePhotoIndex] = { ...updated[activePhotoIndex], caption };
          setEditPhotos(updated);
      } else {
          const updatedPhotos = [...memory.photos];
          updatedPhotos[activePhotoIndex] = { ...updatedPhotos[activePhotoIndex], caption };
          onUpdateMemory({ ...memory, photos: updatedPhotos });
      }
      setIsGeneratingCaption(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Check if there are temporary preview URLs (blobs) that need uploading?
    // In handleAddPhotos below, we are uploading immediately or keeping as File?
    // To simplify, let's assume photos added in edit mode are uploaded immediately upon selection in this implementation version,
    // OR we upload them now.
    // NOTE: For better UX in edit mode, usually we might upload immediately when file selected or batch here.
    // Let's modify handleAddPhotos to upload immediately to keep state simple (URLs are always remote).
    
    onUpdateMemory({
        ...memory,
        title: editTitle,
        locationName: editLocation,
        date: editDate,
        description: editDescription,
        photos: editPhotos
    });
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(memory.title);
    setEditLocation(memory.locationName);
    setEditDate(memory.date);
    setEditDescription(memory.description);
    setEditPhotos(memory.photos);
    setIsEditing(false);
  };

  const handleRemovePhoto = (id: string) => {
    setEditPhotos(prev => {
        const newPhotos = prev.filter(p => p.id !== id);
        if (activePhotoIndex >= newPhotos.length) {
            setActivePhotoIndex(Math.max(0, newPhotos.length - 1));
        }
        return newPhotos;
    });
  };

  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setIsSaving(true); // Show loading state
        const files = Array.from(e.target.files) as File[];
        
        try {
            const newPhotos: Photo[] = [];
            for (const file of files) {
                const url = await uploadImage(file);
                newPhotos.push({
                    id: Math.random().toString(36).substr(2, 9),
                    url: url,
                    timestamp: Date.now()
                });
            }
            setEditPhotos(prev => [...prev, ...newPhotos]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload photo");
        }
        setIsSaving(false);
    }
  };

  const photosToDisplay = isEditing ? editPhotos : memory.photos;
  const currentPhoto = photosToDisplay[activePhotoIndex];

  const nextPhoto = () => {
    if (photosToDisplay.length === 0) return;
    setActivePhotoIndex((prev) => (prev + 1) % photosToDisplay.length);
  };

  const prevPhoto = () => {
    if (photosToDisplay.length === 0) return;
    setActivePhotoIndex((prev) => (prev - 1 + photosToDisplay.length) % photosToDisplay.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel-light w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] animate-scale-in relative">
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-xl border border-pink-100 p-8 max-w-sm w-full text-center animate-scale-in">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 animate-pulse-slow">
                  <Trash2 size={32} />
               </div>
               <h3 className="text-xl font-serif font-semibold text-slate-800 mb-2">Delete this Memory?</h3>
               <p className="text-slate-500 mb-6 text-sm">Are you sure you want to delete <span className="font-semibold text-slate-700">"{memory.title}"</span>? This cannot be undone.</p>
               <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
                  >
                    Keep it
                  </button>
                  <button 
                    onClick={onDelete}
                    className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 shadow-lg shadow-red-200 transition"
                  >
                    Yes, Delete
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Left Side: Photo Viewer */}
        <div className={`w-full ${viewMode === 'grid' ? 'md:w-1/2' : 'md:w-2/3'} bg-gray-50/50 relative flex items-center justify-center group overflow-hidden transition-all duration-500`}>
           
           {currentPhoto && (
             <div 
               className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 transform scale-125"
               style={{ backgroundImage: `url(${currentPhoto.url})` }}
             />
           )}

           {photosToDisplay.length > 0 ? (
               <>
                <div className="relative z-10 w-full h-full p-4 md:p-8 flex items-center justify-center">
                    <img 
                        src={currentPhoto.url} 
                        alt="Memory" 
                        className="max-h-full max-w-full object-contain shadow-2xl rounded-lg bg-white"
                    />
                </div>
                
                {photosToDisplay.length > 1 && (
                    <>
                        <button onClick={prevPhoto} className="absolute z-20 left-4 p-3 rounded-full bg-white/50 backdrop-blur-md text-slate-700 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextPhoto} className="absolute z-20 right-4 p-3 rounded-full bg-white/50 backdrop-blur-md text-slate-700 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110">
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {!isEditing && (
                    <div className="absolute z-20 bottom-6 inset-x-0 flex justify-center">
                        <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-white/50 max-w-lg text-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <p className="text-sm font-medium text-slate-700 font-serif italic">
                                "{currentPhoto.caption || "Untitled Moment"}"
                            </p>
                            <button 
                                onClick={handleGenerateCaption}
                                disabled={isGeneratingCaption}
                                className="mt-1 text-[10px] uppercase tracking-wider text-pink-500 hover:text-pink-600 font-bold flex items-center justify-center gap-1 mx-auto"
                            >
                                <Wand2 size={10} className={isGeneratingCaption ? "animate-spin" : ""} />
                                {isGeneratingCaption ? "Magic..." : "AI Caption"}
                            </button>
                        </div>
                    </div>
                )}
               </>
           ) : (
               <div className="text-slate-400 flex flex-col items-center">
                   <ImageIcon size={64} className="mb-4 opacity-30" />
                   <p className="font-light">No photos in this album</p>
                   {isEditing && <p className="text-xs text-pink-500 mt-2 font-medium">Click + in the grid to add some!</p>}
               </div>
           )}
        </div>

        {/* Right Side: Info & Album Grid */}
        <div className={`w-full ${viewMode === 'grid' ? 'md:w-1/2' : 'md:w-1/3'} p-8 flex flex-col bg-white/60 backdrop-blur-xl border-l border-white/50 relative transition-all duration-500`}>
          
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            {isEditing ? (
                <>
                    <button 
                        onClick={handleCancelEdit} 
                        className="text-slate-500 hover:text-slate-800 transition px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-sm font-medium animate-slide-in-right"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-green-500 hover:bg-green-600 text-white transition px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1 text-sm font-medium animate-slide-in-right disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} />} 
                        Save
                    </button>
                </>
            ) : (
                <>
                     <button 
                        onClick={() => setIsEditing(true)} 
                        className="text-slate-400 hover:text-indigo-600 transition p-2 hover:bg-indigo-50 rounded-full"
                        title="Edit Memory"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button 
                        onClick={() => setShowDeleteConfirm(true)} 
                        className="text-slate-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"
                        title="Delete Memory"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition p-2 hover:bg-slate-100 rounded-full">
                        <X size={24} />
                    </button>
                </>
            )}
          </div>

          <div className="mb-6 mt-2">
            {isEditing ? (
                <div className="space-y-3 animate-fade-in-up">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Title</label>
                        <input 
                            type="text" 
                            value={editTitle} 
                            onChange={e => setEditTitle(e.target.value)} 
                            className="w-full text-2xl font-serif font-medium bg-white/50 border-b-2 border-pink-200 focus:border-pink-500 outline-none p-1 text-slate-800"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                         <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">Place</label>
                            <input 
                                type="text" 
                                value={editLocation} 
                                onChange={e => setEditLocation(e.target.value)} 
                                className="w-full text-sm bg-white/50 border border-slate-200 rounded p-2 focus:ring-1 focus:ring-pink-400 outline-none"
                            />
                         </div>
                         <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">Date</label>
                            <input 
                                type="date" 
                                value={editDate} 
                                onChange={e => setEditDate(e.target.value)} 
                                className="w-full text-sm bg-white/50 border border-slate-200 rounded p-2 focus:ring-1 focus:ring-pink-400 outline-none"
                            />
                         </div>
                    </div>
                </div>
            ) : (
                <>
                    <h2 className="text-4xl font-serif font-medium mb-3 text-slate-800 tracking-tight leading-tight">{memory.title}</h2>
                    <div className="flex items-center gap-4 text-slate-500 text-sm font-medium tracking-wide">
                        <div className="flex items-center gap-1.5 text-pink-500">
                            <MapPin size={16} fill="currentColor" className="text-pink-100" />
                            <span>{memory.locationName}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            <span>{new Date(memory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
            
            {/* Description / Journal */}
            <div className={`mb-8 bg-white/50 p-6 rounded-2xl border border-white/60 shadow-sm transition-all duration-300 ${isEditing ? 'ring-2 ring-pink-100 animate-fade-in-up' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Our Story</h3>
                    {!isEditing && (
                        <button 
                            onClick={handleGenerateDescription}
                            disabled={isGenerating}
                            className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-all"
                        >
                            <Wand2 size={12} className={isGenerating ? "animate-spin" : ""} />
                            {isGenerating ? "Writing..." : "AI Storyteller"}
                        </button>
                    )}
                    {isEditing && (
                         <button 
                            onClick={handleGenerateDescription}
                            className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1"
                         >
                            <Wand2 size={12} /> Rewrite
                         </button>
                    )}
                </div>
                {isEditing ? (
                    <textarea 
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        className="w-full h-32 bg-transparent border-none focus:ring-0 text-slate-600 leading-relaxed font-serif text-lg italic p-0 resize-none"
                    />
                ) : (
                    <p className="text-slate-600 leading-relaxed font-serif text-lg italic opacity-90">
                        "{memory.description || "No description yet. Use AI to generate a poetic memory!"}"
                    </p>
                )}
            </div>
            
            {/* Album Grid */}
            <div className="mt-auto">
                <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Photo Album ({photosToDisplay.length})</h3>
                    {!isEditing && (
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode('featured')} className={`p-1.5 rounded-md ${viewMode === 'featured' ? 'bg-pink-100 text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Maximize2 size={16} />
                            </button>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Grid size={16} />
                            </button>
                        </div>
                    )}
                </div>
                
                <div className={`grid gap-3 transition-all ${viewMode === 'grid' || isEditing ? 'grid-cols-4' : 'grid-cols-4'}`}>
                    {photosToDisplay.map((photo, idx) => (
                        <div 
                            key={photo.id}
                            onClick={() => { if (!isEditing) setActivePhotoIndex(idx); }}
                            className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 transform shadow-sm relative group ${!isEditing ? 'cursor-pointer hover:scale-105' : ''} ${!isEditing && idx === activePhotoIndex ? 'ring-2 ring-pink-400 ring-offset-2' : ''}`}
                        >
                            <img src={photo.url} alt="thumbnail" className="w-full h-full object-cover" />
                            {!isEditing && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />}
                            
                            {/* Delete Overlay in Edit Mode */}
                            {isEditing && (
                                <div 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        handleRemovePhoto(photo.id); 
                                    }}
                                    className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-100 cursor-pointer hover:bg-red-500/20 transition animate-fade-in-up z-20"
                                >
                                    <div className="bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors">
                                        <X size={14} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Add Photo Button */}
                    {isEditing ? (
                        <label className={`aspect-square rounded-xl border-2 border-dashed border-pink-300 bg-pink-50 flex flex-col items-center justify-center text-pink-400 hover:bg-pink-100 hover:text-pink-500 transition-all cursor-pointer animate-fade-in-up ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                            <span className="text-[10px] font-bold mt-1">ADD</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddPhotos} disabled={isSaving} />
                        </label>
                    ) : (
                         <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-pink-300 hover:text-pink-400 transition-all cursor-pointer" title="Edit to add photos">
                            <ImageIcon size={20} />
                         </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
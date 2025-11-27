import React, { useState } from 'react';
import { Coordinate, Memory, Photo } from '../types';
import { X, Upload, MapPin, Loader2, Calendar, Target, Check } from 'lucide-react';
import { getCityCoordinates } from '../services/gemini';
import { uploadImage } from '../services/firebase';

interface AddMemoryModalProps {
  coordinate: Coordinate;
  onClose: () => void;
  onSave: (memory: Memory) => void;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ coordinate, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  // File handling state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [activeCoordinate, setActiveCoordinate] = useState<Coordinate>(coordinate);
  const [isLocating, setIsLocating] = useState(false);
  const [locatingSuccess, setLocatingSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Update selected files state
      setSelectedFiles(prev => [...prev, ...files]);

      // Create previews (just for UI)
      files.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreviewUrls(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
      });
    }
  };

  const handleRemovePreview = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAutoLocate = async () => {
    if (!locationName) return;
    setIsLocating(true);
    setLocatingSuccess(false);
    const newCoords = await getCityCoordinates(locationName);
    if (newCoords) {
      setActiveCoordinate(newCoords);
      setLocatingSuccess(true);
      setTimeout(() => setLocatingSuccess(false), 2000);
    }
    setIsLocating(false);
  };

  const handleBlurLocation = () => {
    if (locationName && !locatingSuccess) handleAutoLocate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress('Uploading photos to cloud...');

    try {
        const uploadedPhotos: Photo[] = [];

        // Upload all files to Firebase Storage
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            setUploadProgress(`Uploading ${i + 1}/${selectedFiles.length}...`);
            const downloadUrl = await uploadImage(file);
            
            uploadedPhotos.push({
                id: Math.random().toString(36).substr(2, 9),
                url: downloadUrl,
                timestamp: Date.now()
            });
        }

        setUploadProgress('Saving memory...');

        const newMemory: Memory = {
          id: Math.random().toString(36).substr(2, 9), // Temporary ID, Firestore will override
          title,
          locationName: locationName || `${activeCoordinate.lat.toFixed(2)}, ${activeCoordinate.lng.toFixed(2)}`,
          coordinates: activeCoordinate,
          date,
          description,
          photos: uploadedPhotos,
        };

        onSave(newMemory);
    } catch (error) {
        console.error("Failed to upload/save:", error);
        setUploadProgress('Error uploading photos.');
        setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel-light w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-scale-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
          <h3 className="text-xl font-serif font-semibold flex items-center gap-2 text-slate-800">
            <div className="p-2 bg-pink-100 rounded-full text-pink-500">
                <MapPin size={18} fill="currentColor"/>
            </div>
            New Memory
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition bg-white/50 hover:bg-white p-2 rounded-full">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white/40">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Title</label>
              <input 
                required
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Summer in Paris"
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">City / Place</label>
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                          <input 
                              type="text" 
                              value={locationName} 
                              onChange={e => setLocationName(e.target.value)}
                              onBlur={handleBlurLocation}
                              placeholder="Type City..."
                              className="w-full bg-white border border-slate-200 rounded-lg p-3 pl-9 text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-none transition-all"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={handleAutoLocate}
                          disabled={!locationName || isLocating}
                          className={`p-3 rounded-lg border transition-all shadow-sm flex items-center justify-center ${
                            locatingSuccess 
                              ? 'bg-green-50 border-green-200 text-green-600' 
                              : 'bg-white border-slate-200 text-slate-400 hover:text-pink-500'
                          }`}
                        >
                           {isLocating ? <Loader2 size={18} className="animate-spin" /> : locatingSuccess ? <Check size={18} /> : <Target size={18} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Date</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-3 pl-9 text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">My Notes</label>
              <textarea 
                rows={3}
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="What did you do there?"
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-none resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Photos (Album)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-white hover:border-pink-400 transition-all relative group cursor-pointer bg-slate-50/50">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center text-slate-500 group-hover:text-pink-500 transition-colors">
                    <Upload className="mb-2" />
                    <span className="text-sm font-medium">Click to upload photos</span>
                </div>
              </div>
              
              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar p-1">
                      {previewUrls.map((url, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative group shadow-sm bg-white">
                              <img src={url} alt="preview" className="h-full w-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => handleRemovePreview(idx)}
                                className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:scale-110"
                              >
                                  <X size={10} />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-200 items-center">
             {isUploading && (
                 <div className="flex items-center gap-2 text-pink-500 text-sm font-medium mr-auto animate-pulse">
                     <Loader2 className="animate-spin" size={16} />
                     {uploadProgress}
                 </div>
             )}
             
             {!isUploading && (
                 <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition font-medium">Cancel</button>
             )}
             
             <button 
                type="submit" 
                disabled={isUploading}
                className={`px-8 py-2.5 rounded-lg bg-gradient-to-r from-pink-400 to-indigo-500 text-white font-semibold transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-pink-500 hover:to-indigo-600'}`}
             >
                {isUploading ? 'Saving...' : 'Save Memory'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Memory } from '../types';
import { X, Trash2, CheckSquare, Square, MapPin, Calendar, AlertTriangle } from 'lucide-react';

interface ManageMemoriesModalProps {
  memories: Memory[];
  onClose: () => void;
  onDelete: (ids: string[]) => void;
}

export const ManageMemoriesModal: React.FC<ManageMemoriesModalProps> = ({ memories, onClose, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === memories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(memories.map(m => m.id)));
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.size > 0) {
      setShowConfirm(true);
    }
  };

  const confirmDelete = () => {
    onDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel-light w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-scale-in border border-white/60 relative">
        
        {/* Delete Confirmation Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center p-8 animate-in fade-in duration-200">
             <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">Are you sure?</h3>
                <p className="text-slate-500 mb-6">
                    You are about to delete <span className="font-bold text-slate-800">{selectedIds.size}</span> memories. 
                    This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setShowConfirm(false)}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 shadow-lg shadow-red-200 transition"
                    >
                        Yes, Delete All
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-slate-200/60 flex justify-between items-center bg-white/40 backdrop-blur-md rounded-t-2xl">
          <div>
            <h3 className="text-xl font-serif font-semibold text-slate-800">Manage Memories</h3>
            <p className="text-sm text-slate-500">Select memories to remove from your map</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition bg-white/50 hover:bg-white p-2 rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-white/30 border-b border-slate-200/60 flex justify-between items-center">
            <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-pink-600 transition"
            >
                {selectedIds.size === memories.length && memories.length > 0 ? <CheckSquare size={18} className="text-pink-500"/> : <Square size={18} />}
                Select All
            </button>

            {selectedIds.size > 0 && (
                <button 
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition"
                >
                    <Trash2 size={16} />
                    Delete ({selectedIds.size})
                </button>
            )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white/20">
            {memories.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p>No memories found.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {memories.map(memory => (
                        <div 
                            key={memory.id}
                            onClick={() => toggleSelection(memory.id)}
                            className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                selectedIds.has(memory.id) 
                                    ? 'bg-pink-50/80 border-pink-200 shadow-sm' 
                                    : 'bg-white/60 border-transparent hover:bg-white hover:shadow-md'
                            }`}
                        >
                            <div className={`text-slate-400 ${selectedIds.has(memory.id) ? 'text-pink-500' : 'group-hover:text-pink-400'}`}>
                                {selectedIds.has(memory.id) ? <CheckSquare size={20} fill="currentColor" className="text-pink-100" /> : <Square size={20} />}
                            </div>
                            
                            <div className="h-16 w-16 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-white shadow-sm">
                                {memory.photos.length > 0 ? (
                                    <img src={memory.photos[0].url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-300">
                                        <MapPin size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-800 truncate">{memory.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><MapPin size={12}/> {memory.locationName}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {memory.date}</span>
                                </div>
                            </div>
                            
                            <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                {memory.photos.length} photos
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
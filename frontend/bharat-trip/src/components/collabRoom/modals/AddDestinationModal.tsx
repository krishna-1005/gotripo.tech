import React, { useState } from 'react';
import { X, Plus, Loader2, Globe, MapPin, Image as ImageIcon } from 'lucide-react';
import { addDestination } from '@/lib/api';
import { toast } from 'sonner';

const AddDestinationModal = ({ tripId, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    description: '',
    imageUrl: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.country) {
      toast.error('Name and Country are required');
      return;
    }

    setLoading(true);
    try {
      const destData = {
        ...formData,
        imageUrl: formData.imageUrl || `https://source.unsplash.com/featured/?${encodeURIComponent(formData.name)}`,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      await addDestination(tripId, destData);
      toast.success('Destination suggested!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add destination');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <Plus className="size-5" />
             </div>
             <div>
                <h3 className="text-2xl font-display font-bold">Suggest a Place</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Share your dream destination</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="size-6 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Destination Name</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                autoFocus
                required
                placeholder="e.g. Manali"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-14 pl-11 pr-5 rounded-2xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Country</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                required
                placeholder="e.g. India"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full h-14 pl-11 pr-5 rounded-2xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Short Description</label>
            <textarea 
              placeholder="Why should we go here?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full h-24 p-5 rounded-2xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 outline-none text-sm font-bold transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Image URL (optional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full h-14 pl-11 pr-5 rounded-2xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tags (comma separated)</label>
            <input 
              placeholder="Adventure, Snow, Mountains"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full h-14 px-5 rounded-2xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 outline-none text-sm font-bold transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-warm-gradient text-white font-black uppercase tracking-widest text-sm shadow-cta flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Suggest Destination'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDestinationModal;

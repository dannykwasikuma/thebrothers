import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil, X, Check, ImagePlus, Info } from 'lucide-react';
import {
  useListServicesAdmin, useCreateService, useUpdateService, useDeleteService,
  useListProductsAdmin, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListGallery, useCreateGalleryItem, useUpdateGalleryItem, useDeleteGalleryItem,
  uploadSiteImage,
  type Service, type Product, type GalleryItem,
} from '@/hooks/useCatalog';

type SubTab = 'services' | 'products' | 'gallery';

/** Small reusable "pick a file, upload it, get a URL back" control used by
 *  all three sections below — keeps the upload/preview logic in one place
 *  instead of three near-identical copies. */
const ImagePicker: React.FC<{
  currentUrl: string | null;
  folder: 'services' | 'products' | 'gallery';
  onUploaded: (url: string) => void;
}> = ({ currentUrl, folder, onUploaded }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage(file, folder);
      onUploaded(url);
    } catch (err: any) {
      toast({ title: 'Image Upload Failed', description: err?.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      {currentUrl ? (
        <img src={currentUrl} alt="" className="w-16 h-16 object-cover rounded-sm border border-border" />
      ) : (
        <div className="w-16 h-16 rounded-sm border border-dashed border-border flex items-center justify-center text-muted-foreground">
          <ImagePlus className="w-5 h-5" />
        </div>
      )}
      <label className="text-sm text-primary cursor-pointer hover:underline">
        {uploading ? 'Uploading…' : currentUrl ? 'Replace Image' : 'Upload Image'}
        <input type="file" accept="image/*" className="hidden" onChange={handlePick} disabled={uploading} />
      </label>
    </div>
  );
};

// ── SERVICES ────────────────────────────────────────────────────────────
const ServicesSection: React.FC = () => {
  const { toast } = useToast();
  const { data: services, isLoading, error } = useListServicesAdmin();
  if (error) console.error('Failed to load services (admin):', error);
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const blank = { name: '', category: 'catering' as const, subcategory: '', description: '', price: 0, priceUnit: '', imageUrl: '', featured: false, active: true };
  const [draft, setDraft] = useState(blank);

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setDraft({ name: s.name, category: s.category, subcategory: s.subcategory || '', description: s.description || '', price: s.price, priceUnit: s.priceUnit || '', imageUrl: s.imageUrl || '', featured: s.featured, active: (s as any).active ?? true });
  };
  const startNew = () => { setEditingId('new'); setDraft(blank); };
  const cancel = () => setEditingId(null);

  const save = () => {
    if (!draft.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    const input = { ...draft, subcategory: draft.subcategory || null, description: draft.description || null, priceUnit: draft.priceUnit || null, imageUrl: draft.imageUrl || null };
    const onDone = { onSuccess: () => { toast({ title: editingId === 'new' ? 'Service Added' : 'Service Updated' }); setEditingId(null); }, onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }) };
    if (editingId === 'new') createMutation.mutate(input, onDone);
    else updateMutation.mutate({ id: editingId as string, ...input }, onDone);
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    deleteMutation.mutate(id, { onSuccess: () => toast({ title: 'Service Deleted' }), onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Prices, descriptions, and photos shown on the Catering/Ushering pages.</p>
        <Button size="sm" className="rounded-none gap-1.5" onClick={startNew}><Plus className="w-4 h-4" /> Add Service</Button>
      </div>

      {editingId === 'new' && <ServiceForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} saving={createMutation.isPending} />}

      {isLoading ? <p className="text-sm text-muted-foreground italic">Loading…</p> : (
        <div className="space-y-3">
          {services?.map(s => editingId === s.id ? (
            <ServiceForm key={s.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} saving={updateMutation.isPending} />
          ) : (
            <div key={s.id} className="flex items-center gap-4 p-4 border border-border bg-card flex-wrap">
              {s.imageUrl && <img src={s.imageUrl} alt="" className="w-12 h-12 object-cover rounded-sm flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-serif text-foreground">{s.name} {!((s as any).active ?? true) && <span className="text-xs text-destructive uppercase ml-2">Hidden</span>}</p>
                <p className="text-xs text-muted-foreground">{s.category} &middot; GHS {s.price.toFixed(2)}{s.priceUnit ? ` / ${s.priceUnit}` : ''}</p>
              </div>
              <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => startEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="outline" className="rounded-none h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => remove(s.id, s.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
          {services?.length === 0 && <p className="text-sm text-muted-foreground italic">No services yet — add your first one above.</p>}
        </div>
      )}
    </div>
  );
};

const ServiceForm: React.FC<{ draft: any; setDraft: (d: any) => void; onSave: () => void; onCancel: () => void; saving: boolean }> = ({ draft, setDraft, onSave, onCancel, saving }) => (
  <div className="p-5 border border-primary/30 bg-card space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Name</label>
        <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="rounded-none" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Category</label>
        <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className="w-full h-9 px-3 bg-background border border-input rounded-md text-sm">
          <option value="catering">Catering</option>
          <option value="ushering">Ushering</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Price (GHS)</label>
        <Input type="number" step="0.01" min="0" value={draft.price} onChange={e => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })} className="rounded-none" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Price Unit (optional)</label>
        <Input placeholder="e.g. per plate, per hour" value={draft.priceUnit} onChange={e => setDraft({ ...draft, priceUnit: e.target.value })} className="rounded-none" />
      </div>
    </div>
    <div className="space-y-1.5">
      <label className="text-xs text-primary uppercase tracking-wider">Description</label>
      <Textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="rounded-none resize-none" rows={2} />
    </div>
    <div className="space-y-1.5">
      <label className="text-xs text-primary uppercase tracking-wider">Image</label>
      <ImagePicker currentUrl={draft.imageUrl || null} folder="services" onUploaded={(url) => setDraft({ ...draft, imageUrl: url })} />
    </div>
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={draft.featured} onChange={e => setDraft({ ...draft, featured: e.target.checked })} /> Featured on homepage</label>
      <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> Visible on site</label>
    </div>
    <div className="flex gap-2">
      <Button size="sm" className="rounded-none gap-1.5" disabled={saving} onClick={onSave}><Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}</Button>
      <Button size="sm" variant="ghost" className="gap-1.5" onClick={onCancel}><X className="w-3.5 h-3.5" /> Cancel</Button>
    </div>
  </div>
);

// ── PRODUCTS ────────────────────────────────────────────────────────────
const ProductsSection: React.FC = () => {
  const { toast } = useToast();
  const { data: products, isLoading, error } = useListProductsAdmin();
  if (error) console.error('Failed to load products (admin):', error);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const blank = { name: '', description: '', price: 0, imageUrl: '', category: '', active: true };
  const [draft, setDraft] = useState(blank);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setDraft({ name: p.name, description: p.description || '', price: p.price, imageUrl: p.imageUrl || '', category: p.category || '', active: (p as any).active ?? true });
  };
  const startNew = () => { setEditingId('new'); setDraft(blank); };
  const cancel = () => setEditingId(null);

  const save = () => {
    if (!draft.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    const input = { ...draft, description: draft.description || null, imageUrl: draft.imageUrl || null, category: draft.category || null };
    const onDone = { onSuccess: () => { toast({ title: editingId === 'new' ? 'Product Added' : 'Product Updated' }); setEditingId(null); }, onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }) };
    if (editingId === 'new') createMutation.mutate(input, onDone);
    else updateMutation.mutate({ id: editingId as string, ...input }, onDone);
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    deleteMutation.mutate(id, { onSuccess: () => toast({ title: 'Product Deleted' }), onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Items shown in the Shop.</p>
        <Button size="sm" className="rounded-none gap-1.5" onClick={startNew}><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      {editingId === 'new' && <ProductForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} saving={createMutation.isPending} />}

      {isLoading ? <p className="text-sm text-muted-foreground italic">Loading…</p> : (
        <div className="space-y-3">
          {products?.map(p => editingId === p.id ? (
            <ProductForm key={p.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} saving={updateMutation.isPending} />
          ) : (
            <div key={p.id} className="flex items-center gap-4 p-4 border border-border bg-card flex-wrap">
              {p.imageUrl && <img src={p.imageUrl} alt="" className="w-12 h-12 object-cover rounded-sm flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-serif text-foreground">{p.name} {!((p as any).active ?? true) && <span className="text-xs text-destructive uppercase ml-2">Hidden</span>}</p>
                <p className="text-xs text-muted-foreground">GHS {p.price.toFixed(2)}{p.category ? ` · ${p.category}` : ''}</p>
              </div>
              <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => startEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="outline" className="rounded-none h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => remove(p.id, p.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
          {products?.length === 0 && <p className="text-sm text-muted-foreground italic">No products yet — add your first one above.</p>}
        </div>
      )}
    </div>
  );
};

const ProductForm: React.FC<{ draft: any; setDraft: (d: any) => void; onSave: () => void; onCancel: () => void; saving: boolean }> = ({ draft, setDraft, onSave, onCancel, saving }) => (
  <div className="p-5 border border-primary/30 bg-card space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Name</label>
        <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="rounded-none" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Category (optional)</label>
        <Input value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className="rounded-none" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Price (GHS)</label>
        <Input type="number" step="0.01" min="0" value={draft.price} onChange={e => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })} className="rounded-none" />
      </div>
    </div>
    <div className="space-y-1.5">
      <label className="text-xs text-primary uppercase tracking-wider">Description</label>
      <Textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="rounded-none resize-none" rows={2} />
    </div>
    <div className="space-y-1.5">
      <label className="text-xs text-primary uppercase tracking-wider">Image</label>
      <ImagePicker currentUrl={draft.imageUrl || null} folder="products" onUploaded={(url) => setDraft({ ...draft, imageUrl: url })} />
    </div>
    <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> Visible on site</label>
    <div className="flex gap-2">
      <Button size="sm" className="rounded-none gap-1.5" disabled={saving} onClick={onSave}><Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}</Button>
      <Button size="sm" variant="ghost" className="gap-1.5" onClick={onCancel}><X className="w-3.5 h-3.5" /> Cancel</Button>
    </div>
  </div>
);

// ── GALLERY ─────────────────────────────────────────────────────────────
const GallerySection: React.FC = () => {
  const { toast } = useToast();
  const { data: items, isLoading, error } = useListGallery();
  if (error) console.error('Failed to load gallery (admin):', error);
  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const blank = { title: '', category: '', imageUrl: '' };
  const [draft, setDraft] = useState(blank);

  const startEdit = (g: GalleryItem) => { setEditingId(g.id); setDraft({ title: g.title, category: g.category || '', imageUrl: g.imageUrl }); };
  const startNew = () => { setEditingId('new'); setDraft(blank); };
  const cancel = () => setEditingId(null);

  const save = () => {
    if (!draft.imageUrl) { toast({ title: 'Please upload an image first', variant: 'destructive' }); return; }
    const input = { title: draft.title || 'Untitled', category: draft.category || null, imageUrl: draft.imageUrl };
    const onDone = { onSuccess: () => { toast({ title: editingId === 'new' ? 'Photo Added' : 'Photo Updated' }); setEditingId(null); }, onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }) };
    if (editingId === 'new') createMutation.mutate(input, onDone);
    else updateMutation.mutate({ id: editingId as string, ...input }, onDone);
  };

  const remove = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    deleteMutation.mutate(id, { onSuccess: () => toast({ title: 'Photo Deleted' }), onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Photos shown on the public Gallery page.</p>
        <Button size="sm" className="rounded-none gap-1.5" onClick={startNew}><Plus className="w-4 h-4" /> Add Photo</Button>
      </div>

      {editingId === 'new' && <GalleryForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} saving={createMutation.isPending} />}

      {isLoading ? <p className="text-sm text-muted-foreground italic">Loading…</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items?.map(g => editingId === g.id ? (
            <div key={g.id} className="sm:col-span-2 md:col-span-3"><GalleryForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} saving={updateMutation.isPending} /></div>
          ) : (
            <div key={g.id} className="border border-border bg-card overflow-hidden">
              <img src={g.imageUrl} alt={g.title} className="w-full h-40 object-cover" />
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-serif text-foreground truncate">{g.title}</p>
                  {g.category && <p className="text-xs text-muted-foreground">{g.category}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="outline" className="rounded-none h-8 w-8 p-0" onClick={() => startEdit(g)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" className="rounded-none h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => remove(g.id, g.title)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
          {items?.length === 0 && <p className="text-sm text-muted-foreground italic col-span-full">No photos yet — add your first one above.</p>}
        </div>
      )}
    </div>
  );
};

const GalleryForm: React.FC<{ draft: any; setDraft: (d: any) => void; onSave: () => void; onCancel: () => void; saving: boolean }> = ({ draft, setDraft, onSave, onCancel, saving }) => (
  <div className="p-5 border border-primary/30 bg-card space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Title</label>
        <Input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} className="rounded-none" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-primary uppercase tracking-wider">Category (optional)</label>
        <Input placeholder="e.g. Weddings, Corporate" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className="rounded-none" />
      </div>
    </div>
    <div className="space-y-1.5">
      <label className="text-xs text-primary uppercase tracking-wider">Image</label>
      <ImagePicker currentUrl={draft.imageUrl || null} folder="gallery" onUploaded={(url) => setDraft({ ...draft, imageUrl: url })} />
    </div>
    <div className="flex gap-2">
      <Button size="sm" className="rounded-none gap-1.5" disabled={saving} onClick={onSave}><Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}</Button>
      <Button size="sm" variant="ghost" className="gap-1.5" onClick={onCancel}><X className="w-3.5 h-3.5" /> Cancel</Button>
    </div>
  </div>
);

// ── MAIN TAB ─────────────────────────────────────────────────────────────
const CatalogManagementTab: React.FC = () => {
  const [sub, setSub] = useState<SubTab>('services');

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-primary/5 border border-primary/20 p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Manage everything customers see for pricing and photos: Services (Catering/Ushering pages), Products (Shop), and Gallery.
          Changes appear on the live site immediately after saving.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['services', 'products', 'gallery'] as SubTab[]).map(key => (
          <button
            key={key}
            onClick={() => setSub(key)}
            className={`px-4 py-2.5 text-sm font-serif capitalize border-b-2 transition-colors ${sub === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {key}
          </button>
        ))}
      </div>

      {sub === 'services' && <ServicesSection />}
      {sub === 'products' && <ProductsSection />}
      {sub === 'gallery' && <GallerySection />}
    </div>
  );
};

export default CatalogManagementTab;

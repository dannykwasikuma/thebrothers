import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, Save, ImagePlus, Star } from 'lucide-react';
import {
  useListAllServicesAdmin, useCreateService, useUpdateService, useDeleteService,
  useListAllProductsAdmin, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListGallery, useCreateGalleryItem, useUpdateGalleryItem, useDeleteGalleryItem, uploadGalleryImage,
  type AdminService, type AdminProduct, type GalleryItem,
} from '@/hooks/useCatalog';

type SubTab = 'services' | 'products' | 'gallery';

const emptyService = { name: '', category: 'catering' as 'catering' | 'ushering', subcategory: '', description: '', price: '', priceUnit: '', imageUrl: '', featured: false };
const emptyProduct = { name: '', description: '', price: '', imageUrl: '', category: '' };
const emptyGallery = { title: '', category: '', startingPrice: '', priceUnit: '', description: '' };

const CatalogManagementTab: React.FC = () => {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<SubTab>('services');

  // ── Services ──
  const { data: services, isLoading: loadingServices } = useListAllServicesAdmin();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const [editingServiceId, setEditingServiceId] = useState<string | 'new' | null>(null);
  const [serviceDraft, setServiceDraft] = useState(emptyService);

  const startEditService = (s?: AdminService) => {
    if (s) {
      setServiceDraft({
        name: s.name, category: s.category, subcategory: s.subcategory || '', description: s.description || '',
        price: String(s.price), priceUnit: s.priceUnit || '', imageUrl: s.imageUrl || '', featured: s.featured,
      });
      setEditingServiceId(s.id);
    } else {
      setServiceDraft(emptyService);
      setEditingServiceId('new');
    }
  };

  const saveService = () => {
    if (!serviceDraft.name.trim() || !serviceDraft.price) {
      toast({ title: 'Missing Info', description: 'Name and price are required.', variant: 'destructive' });
      return;
    }
    const input = {
      name: serviceDraft.name.trim(),
      category: serviceDraft.category,
      subcategory: serviceDraft.subcategory.trim() || undefined,
      description: serviceDraft.description.trim() || undefined,
      price: Number(serviceDraft.price),
      priceUnit: serviceDraft.priceUnit.trim() || undefined,
      imageUrl: serviceDraft.imageUrl.trim() || undefined,
      featured: serviceDraft.featured,
    };
    const onDone = {
      onSuccess: () => { toast({ title: 'Saved' }); setEditingServiceId(null); },
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    };
    if (editingServiceId === 'new') createService.mutate(input, onDone);
    else if (editingServiceId) updateService.mutate({ id: editingServiceId, ...input }, onDone);
  };

  // ── Products ──
  const { data: products, isLoading: loadingProducts } = useListAllProductsAdmin();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [editingProductId, setEditingProductId] = useState<string | 'new' | null>(null);
  const [productDraft, setProductDraft] = useState(emptyProduct);

  const startEditProduct = (p?: AdminProduct) => {
    if (p) {
      setProductDraft({ name: p.name, description: p.description || '', price: String(p.price), imageUrl: p.imageUrl || '', category: p.category || '' });
      setEditingProductId(p.id);
    } else {
      setProductDraft(emptyProduct);
      setEditingProductId('new');
    }
  };

  const saveProduct = () => {
    if (!productDraft.name.trim() || !productDraft.price) {
      toast({ title: 'Missing Info', description: 'Name and price are required.', variant: 'destructive' });
      return;
    }
    const input = {
      name: productDraft.name.trim(),
      description: productDraft.description.trim() || undefined,
      price: Number(productDraft.price),
      imageUrl: productDraft.imageUrl.trim() || undefined,
      category: productDraft.category.trim() || undefined,
    };
    const onDone = {
      onSuccess: () => { toast({ title: 'Saved' }); setEditingProductId(null); },
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    };
    if (editingProductId === 'new') createProduct.mutate(input, onDone);
    else if (editingProductId) updateProduct.mutate({ id: editingProductId, ...input }, onDone);
  };

  // ── Gallery ──
  const { data: gallery, isLoading: loadingGallery } = useListGallery();
  const createGalleryItem = useCreateGalleryItem();
  const updateGalleryItem = useUpdateGalleryItem();
  const deleteGalleryItem = useDeleteGalleryItem();
  const [editingGalleryId, setEditingGalleryId] = useState<string | 'new' | null>(null);
  const [galleryDraft, setGalleryDraft] = useState(emptyGallery);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const startEditGallery = (g?: GalleryItem) => {
    if (g) {
      setGalleryDraft({
        title: g.title, category: g.category || '', startingPrice: g.startingPrice !== null ? String(g.startingPrice) : '',
        priceUnit: g.priceUnit || '', description: g.description || '',
      });
      setEditingGalleryId(g.id);
    } else {
      setGalleryDraft(emptyGallery);
      setEditingGalleryId('new');
    }
    setGalleryFile(null);
  };

  const saveGallery = async () => {
    if (!galleryDraft.title.trim()) {
      toast({ title: 'Missing Info', description: 'A title is required.', variant: 'destructive' });
      return;
    }
    if (editingGalleryId === 'new' && !galleryFile) {
      toast({ title: 'Missing Photo', description: 'Please choose a photo to upload.', variant: 'destructive' });
      return;
    }
    try {
      let imageUrl: string | undefined;
      if (galleryFile) {
        setGalleryUploading(true);
        imageUrl = await uploadGalleryImage(galleryFile);
      }
      setGalleryUploading(false);
      const input = {
        title: galleryDraft.title.trim(),
        category: galleryDraft.category.trim() || undefined,
        ...(imageUrl ? { imageUrl } : {}),
        startingPrice: galleryDraft.startingPrice ? Number(galleryDraft.startingPrice) : null,
        priceUnit: galleryDraft.priceUnit.trim() || undefined,
        description: galleryDraft.description.trim() || undefined,
      };
      if (editingGalleryId === 'new') {
        await createGalleryItem.mutateAsync({ ...input, imageUrl: imageUrl! });
      } else if (editingGalleryId) {
        await updateGalleryItem.mutateAsync({ id: editingGalleryId, ...input });
      }
      toast({ title: 'Saved' });
      setEditingGalleryId(null);
    } catch (err: any) {
      setGalleryUploading(false);
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    }
  };

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'services', label: 'Services' },
    { key: 'products', label: 'Shop Products' },
    { key: 'gallery', label: 'Gallery' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex gap-2 flex-wrap">
        {subTabs.map((t) => (
          <Button key={t.key} size="sm" variant={subTab === t.key ? 'default' : 'outline'} className="rounded-none" onClick={() => setSubTab(t.key)}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* ══ SERVICES ══ */}
      {subTab === 'services' && (
        <div className="bg-card border border-border p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif text-foreground">Catering &amp; Ushering Services</h3>
            <Button size="sm" className="rounded-none gap-1.5" onClick={() => startEditService()}>
              <Plus className="w-4 h-4" /> New Service
            </Button>
          </div>

          {editingServiceId && (
            <div className="border border-primary/30 bg-background p-6 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Service name" value={serviceDraft.name} onChange={(e) => setServiceDraft((d) => ({ ...d, name: e.target.value }))} className="rounded-none" />
                <select value={serviceDraft.category} onChange={(e) => setServiceDraft((d) => ({ ...d, category: e.target.value as any }))} className="h-10 px-3 bg-background border border-border rounded-none text-sm">
                  <option value="catering">Catering</option>
                  <option value="ushering">Ushering</option>
                </select>
                <Input placeholder="Subcategory (e.g. Wedding)" value={serviceDraft.subcategory} onChange={(e) => setServiceDraft((d) => ({ ...d, subcategory: e.target.value }))} className="rounded-none" />
                <Input placeholder="Image URL (optional)" value={serviceDraft.imageUrl} onChange={(e) => setServiceDraft((d) => ({ ...d, imageUrl: e.target.value }))} className="rounded-none" />
                <Input type="number" min="0" step="0.01" placeholder="Price (GHS)" value={serviceDraft.price} onChange={(e) => setServiceDraft((d) => ({ ...d, price: e.target.value }))} className="rounded-none" />
                <Input placeholder="Price unit (e.g. per 50 guests, event)" value={serviceDraft.priceUnit} onChange={(e) => setServiceDraft((d) => ({ ...d, priceUnit: e.target.value }))} className="rounded-none" />
              </div>
              <Textarea placeholder="Description" rows={3} value={serviceDraft.description} onChange={(e) => setServiceDraft((d) => ({ ...d, description: e.target.value }))} className="rounded-none resize-none" />
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={serviceDraft.featured} onChange={(e) => setServiceDraft((d) => ({ ...d, featured: e.target.checked }))} />
                Featured on homepage
              </label>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-none gap-1.5" disabled={createService.isPending || updateService.isPending} onClick={saveService}>
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingServiceId(null)}><X className="w-3.5 h-3.5" /> Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loadingServices && <p className="text-sm text-muted-foreground italic">Loading…</p>}
            {services?.map((s) => (
              <div key={s.id} className={`flex items-center justify-between p-4 border border-border flex-wrap gap-3 ${!s.active ? 'opacity-50' : ''}`}>
                <div>
                  <p className="font-serif text-foreground flex items-center gap-2">
                    {s.name} {s.featured && <Star className="w-3.5 h-3.5 text-primary fill-current" />}
                    {!s.active && <span className="text-xs text-destructive uppercase">Hidden</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.category} {s.subcategory ? `· ${s.subcategory}` : ''} · GHS {s.price.toLocaleString()}{s.priceUnit ? ` / ${s.priceUnit}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => startEditService(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                  {s.active ? (
                    <Button size="sm" variant="outline" className="rounded-none h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { if (confirm(`Hide "${s.name}" from the site?`)) deleteService.mutate(s.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => updateService.mutate({ id: s.id, active: true })}>
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!loadingServices && services?.length === 0 && <p className="text-sm text-muted-foreground italic">No services yet.</p>}
          </div>
        </div>
      )}

      {/* ══ PRODUCTS ══ */}
      {subTab === 'products' && (
        <div className="bg-card border border-border p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif text-foreground">Shop Products</h3>
            <Button size="sm" className="rounded-none gap-1.5" onClick={() => startEditProduct()}>
              <Plus className="w-4 h-4" /> New Product
            </Button>
          </div>

          {editingProductId && (
            <div className="border border-primary/30 bg-background p-6 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Product name" value={productDraft.name} onChange={(e) => setProductDraft((d) => ({ ...d, name: e.target.value }))} className="rounded-none" />
                <Input placeholder="Category (optional)" value={productDraft.category} onChange={(e) => setProductDraft((d) => ({ ...d, category: e.target.value }))} className="rounded-none" />
                <Input type="number" min="0" step="0.01" placeholder="Price (GHS)" value={productDraft.price} onChange={(e) => setProductDraft((d) => ({ ...d, price: e.target.value }))} className="rounded-none" />
                <Input placeholder="Image URL (optional)" value={productDraft.imageUrl} onChange={(e) => setProductDraft((d) => ({ ...d, imageUrl: e.target.value }))} className="rounded-none" />
              </div>
              <Textarea placeholder="Description" rows={3} value={productDraft.description} onChange={(e) => setProductDraft((d) => ({ ...d, description: e.target.value }))} className="rounded-none resize-none" />
              <div className="flex gap-2">
                <Button size="sm" className="rounded-none gap-1.5" disabled={createProduct.isPending || updateProduct.isPending} onClick={saveProduct}>
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingProductId(null)}><X className="w-3.5 h-3.5" /> Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loadingProducts && <p className="text-sm text-muted-foreground italic">Loading…</p>}
            {products?.map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-4 border border-border flex-wrap gap-3 ${!p.active ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  {p.imageUrl && <img src={p.imageUrl} alt="" className="w-10 h-10 object-cover" />}
                  <div>
                    <p className="font-serif text-foreground">{p.name} {!p.active && <span className="text-xs text-destructive uppercase ml-2">Hidden</span>}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.category || 'Uncategorized'} · GHS {p.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => startEditProduct(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                  {p.active ? (
                    <Button size="sm" variant="outline" className="rounded-none h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { if (confirm(`Hide "${p.name}" from the shop?`)) deleteProduct.mutate(p.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => updateProduct.mutate({ id: p.id, active: true })}>
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!loadingProducts && products?.length === 0 && <p className="text-sm text-muted-foreground italic">No products yet.</p>}
          </div>
        </div>
      )}

      {/* ══ GALLERY ══ */}
      {subTab === 'gallery' && (
        <div className="bg-card border border-border p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif text-foreground">Gallery Photos</h3>
            <Button size="sm" className="rounded-none gap-1.5" onClick={() => startEditGallery()}>
              <Plus className="w-4 h-4" /> New Photo
            </Button>
          </div>

          {editingGalleryId && (
            <div className="border border-primary/30 bg-background p-6 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Title" value={galleryDraft.title} onChange={(e) => setGalleryDraft((d) => ({ ...d, title: e.target.value }))} className="rounded-none" />
                <select value={galleryDraft.category} onChange={(e) => setGalleryDraft((d) => ({ ...d, category: e.target.value }))} className="h-10 px-3 bg-background border border-border rounded-none text-sm">
                  <option value="">No category</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="private">Private</option>
                </select>
                <Input type="number" min="0" step="0.01" placeholder="Starting price (GHS, optional)" value={galleryDraft.startingPrice} onChange={(e) => setGalleryDraft((d) => ({ ...d, startingPrice: e.target.value }))} className="rounded-none" />
                <Input placeholder="Price unit (e.g. per event)" value={galleryDraft.priceUnit} onChange={(e) => setGalleryDraft((d) => ({ ...d, priceUnit: e.target.value }))} className="rounded-none" />
              </div>
              <Textarea placeholder="Description (optional)" rows={2} value={galleryDraft.description} onChange={(e) => setGalleryDraft((d) => ({ ...d, description: e.target.value }))} className="rounded-none resize-none" />
              <label className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline w-fit">
                <ImagePlus className="w-4 h-4" />
                {galleryFile ? galleryFile.name : editingGalleryId === 'new' ? 'Choose photo to upload' : 'Replace photo (optional)'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} />
              </label>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-none gap-1.5" disabled={galleryUploading || createGalleryItem.isPending || updateGalleryItem.isPending} onClick={saveGallery}>
                  <Save className="w-3.5 h-3.5" /> {galleryUploading ? 'Uploading…' : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingGalleryId(null)}><X className="w-3.5 h-3.5" /> Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loadingGallery && <p className="text-sm text-muted-foreground italic col-span-full">Loading…</p>}
            {gallery?.map((g) => (
              <div key={g.id} className="border border-border bg-background overflow-hidden">
                <img src={g.imageUrl} alt={g.title} className="w-full h-32 object-cover" />
                <div className="p-3">
                  <p className="font-serif text-sm text-foreground truncate">{g.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.category || 'Uncategorized'}{g.startingPrice !== null ? ` · GHS ${g.startingPrice.toLocaleString()}` : ''}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="rounded-none h-7 flex-1" onClick={() => startEditGallery(g)}><Pencil className="w-3 h-3" /></Button>
                    <Button size="sm" variant="outline" className="rounded-none h-7 flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { if (confirm(`Permanently delete "${g.title}"?`)) deleteGalleryItem.mutate(g.id); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!loadingGallery && gallery?.length === 0 && <p className="text-sm text-muted-foreground italic col-span-full">No gallery photos yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogManagementTab;

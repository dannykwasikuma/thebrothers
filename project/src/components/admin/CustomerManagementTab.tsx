import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Ban, CheckCircle, Users, Info } from 'lucide-react';
import { useListCustomers, useUpdateCustomer } from '@/hooks/useAdmin';

const CustomerManagementTab: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const { data: customers, isLoading } = useListCustomers(search);
  const updateMutation = useUpdateCustomer();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleToggleStatus = (id: string, currentStatus: 'active' | 'disabled') => {
    updateMutation.mutate({ id, status: currentStatus === 'active' ? 'disabled' : 'active' }, {
      onSuccess: () => toast({ title: currentStatus === 'active' ? 'Customer Disabled' : 'Customer Re-enabled' }),
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({ id, fullName: editName.trim() }, {
      onSuccess: () => {
        setEditingId(null);
        toast({ title: 'Display Name Updated' });
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">

      <div className="bg-primary/5 border border-primary/20 p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          This panel manages each customer's profile (display name, account status) so you can
          tell customers and staff apart at a glance. Order and booking history is managed in the Bookings
          and Orders tabs.
        </p>
      </div>

      <div className="bg-card border border-border p-8">
        <h3 className="text-xl font-serif text-foreground mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Customers ({customers?.length ?? 0})
        </h3>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="rounded-none h-11 pl-10"
          />
        </div>

        <div className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground italic">Loading…</p>}
          {!isLoading && customers?.length === 0 && <p className="text-sm text-muted-foreground italic">No customers found.</p>}
          {customers?.map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 border border-border bg-background flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                {editingId === c.id ? (
                  <div className="flex gap-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="rounded-none h-9 max-w-xs" />
                    <Button size="sm" className="rounded-none h-9" onClick={() => saveEdit(c.id)}>Save</Button>
                    <Button size="sm" variant="ghost" className="rounded-none h-9" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <p className="font-serif text-foreground">
                      {c.fullName || 'Unnamed Customer'}
                      <span className={`ml-3 text-xs px-2 py-0.5 rounded-sm uppercase tracking-wider ${c.status === 'active' ? 'bg-green-500/15 text-green-500' : 'bg-destructive/15 text-destructive'}`}>
                        {c.status}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.email || c.phone} &middot; joined {new Date(c.createdAt).toLocaleDateString()}</p>
                  </>
                )}
              </div>
              {editingId !== c.id && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => startEdit(c.id, c.fullName || '')}>Edit Name</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`rounded-none h-8 ${c.status === 'active' ? 'text-destructive border-destructive/30 hover:bg-destructive/10' : 'text-green-500 border-green-500/30 hover:bg-green-500/10'}`}
                    onClick={() => handleToggleStatus(c.id, c.status)}
                  >
                    {c.status === 'active' ? <Ban className="w-3.5 h-3.5 mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                    {c.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagementTab;

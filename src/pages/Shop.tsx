import React, { useState } from 'react';
import { useListProducts } from '@/hooks/useCatalog';
import { useAddToCart } from '@/hooks/useCart';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Shop: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const { toast } = useToast();

  const { data: products, isLoading } = useListProducts({
    search: searchQuery || undefined,
    category: category || undefined
  });

  const addToCartMutation = useAddToCart();

  const handleAddToCart = (productId: string, productName: string) => {
    addToCartMutation.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        toast({
          title: "Added to Cart",
          description: `${productName} has been added to your cart.`,
          duration: 3000,
        });
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err?.message || "Could not add item to cart. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const categories = ['All', 'Meals', 'Beverages', 'Desserts', 'Platters'];

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 mt-12 mb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display text-primary mb-6">The Brothers Shop</h1>
          <p className="text-xl font-serif text-muted-foreground italic max-w-2xl mx-auto">
            Gourmet selections delivered directly to your doorstep.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === (cat === 'All' ? '' : cat) ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`rounded-none font-serif tracking-wider ${
                  category === (cat === 'All' ? '' : cat) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'border-border text-foreground hover:border-primary'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-none border-border bg-card pr-10 focus-visible:ring-primary font-sans"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-none" />
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-2xl font-serif text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground font-sans">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products?.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="h-full border border-border/50 bg-card rounded-none overflow-hidden flex flex-col group">
                  <div className="relative h-64 overflow-hidden bg-muted">
                    <img 
                      src={product.imageUrl || "/images/wedding-catering.png"} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-sans text-primary uppercase tracking-wider">{product.category}</p>
                      {product.rating && (
                        <div className="flex items-center text-primary text-xs">
                          <Star className="w-3 h-3 fill-current mr-1" />
                          <span>{product.rating}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-serif text-foreground mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-muted-foreground font-sans text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-serif text-foreground font-bold">GHS {product.price.toFixed(2)}</span>
                      <Button 
                        size="sm"
                        disabled={addToCartMutation.isPending}
                        onClick={() => handleAddToCart(product.id, product.name)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;

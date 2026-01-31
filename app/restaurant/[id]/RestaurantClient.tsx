'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FrontendMenuItem, FrontendCategory, FrontendRestaurant } from '@/lib/data-transform';

type ModificationOption = {
  id: string;
  name: string;
  price: number;
};

type ModificationGroup = {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModificationOption[];
};

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  isPopular?: boolean;
  dietaryTags: string[];
  modificationGroups?: ModificationGroup[];
};

type SelectedModification = {
  groupId: string;
  optionId: string;
  name: string;
  price: number;
};

type CartItem = {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  modifications: SelectedModification[];
  totalPrice: number;
};

type RestaurantClientProps = {
  restaurant: FrontendRestaurant;
  categories: FrontendCategory[];
  menuItems: FrontendMenuItem[];
};

export default function RestaurantClient({ restaurant, categories, menuItems }: RestaurantClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Load cart from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`cart-${restaurant.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cart-${restaurant.id}`, JSON.stringify(cart));
    }
  }, [cart, restaurant.id]);

  // Prevent background scroll when cart drawer or item modal is open
  useEffect(() => {
    const hasOverlayOpen = isCartOpen || !!selectedItem;
    if (hasOverlayOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isCartOpen, selectedItem]);

  // Convert FrontendMenuItem to MenuItem format for compatibility
  const convertedMenuItems: MenuItem[] = menuItems.map(item => ({
    id: item.id,
    category: item.categoryId,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image,
    isPopular: item.isPopular,
    dietaryTags: item.dietaryTags,
    modificationGroups: item.modificationGroups,
  }));

  const filteredItems = convertedMenuItems.filter(
    (item) => item.category === activeCategory
  );

  const addToCart = (item: MenuItem, modifications: SelectedModification[], quantity: number) => {
    const modPrice = modifications.reduce((sum, m) => sum + m.price, 0);
    const totalPrice = (item.price + modPrice) * quantity;
    
    // Create a unique key based on item + modifications
    const modKey = modifications.map(m => `${m.groupId}:${m.optionId}`).sort().join('|');
    const cartItemId = `${item.id}-${modKey}`;
    
    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId 
            ? { ...i, quantity: i.quantity + quantity, totalPrice: (i.price + modPrice) * (i.quantity + quantity) } 
            : i
        );
      }
      return [...prev, {
        id: cartItemId,
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
        modifications,
        totalPrice,
      }];
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === cartItemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          const modPrice = item.modifications.reduce((sum, m) => sum + m.price, 0);
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: (item.price + modPrice) * newQuantity,
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleItemClick = (item: MenuItem) => {
    if (item.modificationGroups && item.modificationGroups.length > 0) {
      setSelectedItem(item);
    } else {
      addToCart(item, [], 1);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 bg-stone-200 overflow-hidden">
        <img
          src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
        
        {/* Cart button (mobile) */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-stone-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cartItemCount > 0 && (
            <>
              <span>₵{cartTotal.toFixed(2)}</span>
              <span className="w-5 h-5 bg-amber-500 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Restaurant Info Card */}
      <section className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            {restaurant.isOpen ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                Closed
              </span>
            )}
            {restaurant.rating && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-stone-900">{restaurant.rating}</span>
                {restaurant.reviewCount && (
                  <span className="text-xs text-stone-400">({restaurant.reviewCount})</span>
                )}
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p className="text-stone-500 text-sm mb-3">{restaurant.tagline}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
            {restaurant.deliveryTime && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {restaurant.deliveryTime} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              ₵{restaurant.deliveryFee.toFixed(2)} delivery
            </span>
            {restaurant.cuisine && (
              <span className="text-stone-400">{restaurant.cuisine}</span>
            )}
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <nav className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60 mt-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-stone-900 text-stone-50'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Menu Items */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
              cartQuantity={cart.filter((i) => i.itemId === item.id).reduce((sum, i) => sum + i.quantity, 0)}
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <p>No items in this category yet.</p>
          </div>
        )}
      </main>

      {/* Bottom spacing for mobile cart button */}
      {cartItemCount > 0 && <div className="h-24 sm:hidden" />}

      {/* Fixed Cart Button (Mobile) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent sm:hidden z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 bg-stone-900 text-stone-50 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 shadow-lg"
          >
            <span>View Cart</span>
            <span className="w-6 h-6 bg-amber-500 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
            <span>₵{cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Item Customization Modal */}
      {selectedItem && (
        <ItemCustomizeModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(modifications, quantity) => {
            addToCart(selectedItem, modifications, quantity);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
          total={cartTotal}
          deliveryFee={restaurant.deliveryFee}
          minOrder={restaurant.minOrder}
          onCheckout={() => router.push(`/restaurant/${restaurant.id}/checkout`)}
          onAddItem={(itemId) => {
            const item = convertedMenuItems.find((i) => i.id === itemId);
            if (!item) return;
            if (item.modificationGroups && item.modificationGroups.length > 0) {
              setSelectedItem(item);
            } else {
              addToCart(item, [], 1);
            }
          }}
          allMenuItems={convertedMenuItems}
        />
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  onClick,
  cartQuantity,
}: {
  item: MenuItem;
  onClick: () => void;
  cartQuantity: number;
}) {
  const hasCustomizations = item.modificationGroups && item.modificationGroups.length > 0;
  
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 p-3 bg-white rounded-2xl border border-stone-200/60 hover:border-stone-300/80 hover:shadow-md transition-all text-left w-full"
    >
      {/* Image */}
      <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-stone-100 relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {cartQuantity > 0 && (
          <span className="absolute top-1 right-1 w-6 h-6 bg-amber-500 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
            {cartQuantity}
          </span>
        )}
      </div>
      
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-stone-900 leading-tight">{item.name}</h3>
          {item.isPopular && (
            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Popular
            </span>
          )}
        </div>
        
        <p className="text-xs text-stone-500 mb-2 line-clamp-2 leading-relaxed">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-900">
              ₵{item.price.toFixed(2)}
            </span>
            {item.dietaryTags.length > 0 && (
              <div className="flex gap-1">
                {item.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-stone-400"
                  >
                    {tag === 'vegetarian' && '🌿'}
                    {tag === 'vegan' && '🌱'}
                    {tag === 'gluten-free' && 'GF'}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {hasCustomizations && (
            <span className="text-[10px] text-stone-400 uppercase tracking-wider">
              Customizable
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ItemCustomizeModal({
  item,
  onClose,
  onAddToCart,
}: {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (modifications: SelectedModification[], quantity: number) => void;
}) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  const groups = item.modificationGroups || [];
  
  // Calculate additional price from modifications
  const modificationPrice = groups.reduce((total, group) => {
    const selectedOptions = selections[group.id] || [];
    return total + selectedOptions.reduce((sum, optId) => {
      const opt = group.options.find(o => o.id === optId);
      return sum + (opt?.price || 0);
    }, 0);
  }, 0);

  const totalPrice = (item.price + modificationPrice) * quantity;

  // Check if all required groups are satisfied
  const isValid = groups.every(group => {
    if (!group.required) return true;
    const selected = selections[group.id] || [];
    return selected.length >= group.minSelect;
  });

  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      
      if (isSelected) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      } else {
        if (maxSelect === 1) {
          return { ...prev, [groupId]: [optionId] };
        } else if (current.length < maxSelect) {
          return { ...prev, [groupId]: [...current, optionId] };
        }
        return prev;
      }
    });
  };

  const handleAddToCart = () => {
    const modifications: SelectedModification[] = [];
    groups.forEach(group => {
      const selectedOptions = selections[group.id] || [];
      selectedOptions.forEach(optId => {
        const opt = group.options.find(o => o.id === optId);
        if (opt) {
          modifications.push({
            groupId: group.id,
            optionId: opt.id,
            name: opt.name,
            price: opt.price,
          });
        }
      });
    });
    onAddToCart(modifications, quantity);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 sm:p-4">
        <div className="bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header Image */}
          <div className="relative h-48 sm:h-56 bg-stone-100 shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-stone-700 hover:bg-white transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              {/* Item Info */}
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-stone-900 mb-1">{item.name}</h2>
                <p className="text-sm text-stone-500 mb-2">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-stone-900">₵{item.price.toFixed(2)}</span>
                  {item.dietaryTags.length > 0 && (
                    <div className="flex gap-1.5">
                      {item.dietaryTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modification Groups */}
              <div className="space-y-5">
                {groups.map((group) => {
                  const selected = selections[group.id] || [];
                  const isGroupValid = !group.required || selected.length >= group.minSelect;
                  
                  return (
                    <div key={group.id}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-stone-900">{group.name}</h3>
                          <p className="text-xs text-stone-400">
                            {group.required ? (
                              <span className="text-amber-600">
                                Required · Select {group.minSelect === group.maxSelect ? group.minSelect : `${group.minSelect}-${group.maxSelect}`}
                              </span>
                            ) : (
                              <span>Optional · Select up to {group.maxSelect}</span>
                            )}
                          </p>
                        </div>
                        {group.required && !isGroupValid && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {group.options.map((option) => {
                          const isSelected = selected.includes(option.id);
                          const isRadio = group.maxSelect === 1;
                          
                          return (
                            <button
                              key={option.id}
                              onClick={() => toggleOption(group.id, option.id, group.maxSelect)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? 'border-stone-900 bg-stone-50'
                                  : 'border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Checkbox/Radio indicator */}
                                <div className={`w-5 h-5 ${isRadio ? 'rounded-full' : 'rounded-md'} border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'border-stone-900 bg-stone-900'
                                    : 'border-stone-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-sm ${isSelected ? 'font-medium text-stone-900' : 'text-stone-700'}`}>
                                  {option.name}
                                </span>
                              </div>
                              {option.price > 0 && (
                                <span className="text-sm text-stone-500">+₵{option.price.toFixed(2)}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="shrink-0 p-4 border-t border-stone-200/60 bg-white">
            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-lg font-semibold text-stone-900 w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!isValid}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>Add to Cart</span>
              <span>·</span>
              <span>₵{totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CartDrawer({
  cart,
  onClose,
  onUpdateQuantity,
  total,
  deliveryFee,
  minOrder,
  onCheckout,
  onAddItem,
  allMenuItems,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  total: number;
  deliveryFee: number;
  minOrder: number;
  onCheckout: () => void;
  onAddItem: (id: string) => void;
  allMenuItems: MenuItem[];
}) {
  const isMinOrderMet = total >= minOrder;

  // Find drinks category items for recommendations
  // First, we need to find which category ID corresponds to "drinks"
  // For now, we'll filter items that don't have modifications and aren't in cart
  const recommendedDrinks = allMenuItems
    .filter(
      (item) =>
        (!item.modificationGroups || item.modificationGroups.length === 0) &&
        !cart.some((c) => c.itemId === item.id)
    )
    .slice(0, 3);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-stone-50 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200/60">
          <h2 className="text-lg font-semibold text-stone-900">Your Order</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200/60 text-stone-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-stone-500 mb-1">Your cart is empty</p>
              <p className="text-sm text-stone-400">Add some delicious items to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-stone-200/60"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 text-sm">{item.name}</p>
                        {item.modifications.length > 0 && (
                          <p className="text-xs text-stone-400 mt-0.5">
                            {item.modifications.map(m => m.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-stone-900 shrink-0">
                        ₵{item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {recommendedDrinks.length > 0 && (
                <div className="pt-4 border-t border-stone-200/70">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-stone-900">
                        Complete your order
                      </p>
                    </div>
                    <p className="text-xs text-stone-500 ml-6">
                      Popular additions that pair perfectly
                    </p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {recommendedDrinks.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onAddItem(item.id)}
                        className="group flex min-w-[160px] items-center gap-3 rounded-2xl border border-stone-200/70 bg-white px-3 py-2.5 text-left hover:border-amber-300 hover:shadow-md hover:bg-amber-50/30 transition-all"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 ring-1 ring-stone-200/50 group-hover:ring-amber-200 transition-all">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-stone-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-stone-900 truncate group-hover:text-stone-950">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-stone-500 group-hover:text-amber-700 font-medium">
                            ₵{item.price.toFixed(2)}
                          </p>
                        </div>
                        <svg
                          className="w-4 h-4 text-stone-400 group-hover:text-amber-600 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200/60 bg-white">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-900">₵{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Delivery</span>
                <span className="text-stone-900">₵{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-stone-100">
                <span className="text-stone-900">Total</span>
                <span className="text-stone-900">₵{(total + deliveryFee).toFixed(2)}</span>
              </div>
            </div>
            
            {!isMinOrderMet && (
              <p className="text-xs text-amber-600 mb-3 text-center">
                Add ₵{(minOrder - total).toFixed(2)} more to meet the ₵{minOrder.toFixed(2)} minimum
              </p>
            )}
            
            <button
              disabled={!isMinOrderMet}
              onClick={onCheckout}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                isMinOrderMet
                  ? 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

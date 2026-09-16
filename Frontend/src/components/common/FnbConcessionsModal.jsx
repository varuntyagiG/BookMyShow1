import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Armchair,
  Zap,
  CheckCircle2,
  Info
} from 'lucide-react';
import { playPop, playSeatClick } from '../../utils/soundEffects';

export const FNB_CATALOG = [
  {
    id: 'combo-duo',
    name: 'Blockbuster Duo Combo',
    category: 'combos',
    price: 420,
    desc: '1 Large Tub Cheese Popcorn + 2 Chilled Fountain Pepsis (Save 18%)',
    badge: 'BESTSELLER',
    isVeg: true,
    emoji: '🍿🥤',
    calories: '540 kcal'
  },
  {
    id: 'combo-family',
    name: 'Family Mega Saver Tub',
    category: 'combos',
    price: 690,
    desc: '1 Jumbo Caramel + 1 Cheese Popcorn + 3 Drinks + Nachos with Dip',
    badge: 'SUPER SAVER',
    isVeg: true,
    emoji: '🎉🍿',
    calories: '920 kcal'
  },
  {
    id: 'popcorn-caramel',
    name: 'Signature Caramel Popcorn Tub',
    category: 'popcorn',
    price: 250,
    desc: 'Golden crisp butterfly kernels hand-coated in rich molten caramel glaze',
    badge: 'SWEET TREAT',
    isVeg: true,
    emoji: '🍿✨',
    calories: '420 kcal'
  },
  {
    id: 'popcorn-cheese',
    name: 'Jumbo Cheddar Cheese Popcorn',
    category: 'popcorn',
    price: 240,
    desc: 'Warm popcorn dusted with savory aged cheddar and creamy melted butter',
    badge: 'CHEF PICK',
    isVeg: true,
    emoji: '🍿🧀',
    calories: '380 kcal'
  },
  {
    id: 'popcorn-salted',
    name: 'Classic Golden Butter Popcorn',
    category: 'popcorn',
    price: 200,
    desc: 'Traditional cinema-style freshly popped corn with sea salt & dairy butter',
    badge: 'CLASSIC',
    isVeg: true,
    emoji: '🍿🧈',
    calories: '310 kcal'
  },
  {
    id: 'nachos-cheese',
    name: 'Loaded Nachos with Warm Cheese Dip',
    category: 'snacks',
    price: 210,
    desc: 'Crunchy golden corn tortilla chips served with warm melted cheddar dip & salsa',
    badge: 'CRUNCHY',
    isVeg: true,
    emoji: '🧀🌮',
    calories: '360 kcal'
  },
  {
    id: 'fries-periperi',
    name: 'Peri Peri Crispy French Fries',
    category: 'snacks',
    price: 190,
    desc: 'Golden potato crinkle fries tossed in zesty African peri-peri spices',
    badge: 'SPICY',
    isVeg: true,
    emoji: '🍟🌶️',
    calories: '290 kcal'
  },
  {
    id: 'sub-chicken',
    name: 'Smoked Chicken Tikka Sub',
    category: 'snacks',
    price: 260,
    desc: 'Tender tandoori chicken tikka cubes in herbs & mint mayonnaise on toasted baguette',
    badge: 'HOT MEAL',
    isVeg: false,
    emoji: '🥪🍗',
    calories: '440 kcal'
  },
  {
    id: 'drink-pepsi',
    name: 'Fountain Pepsi (Large 650ml)',
    category: 'beverages',
    price: 120,
    desc: 'Chilled bubbly cola served over crystal clear ice',
    badge: 'REFRESHING',
    isVeg: true,
    emoji: '🥤🧊',
    calories: '180 kcal'
  },
  {
    id: 'drink-coldcoffee',
    name: 'Iced Hazelnut Cold Coffee',
    category: 'beverages',
    price: 180,
    desc: 'Rich roasted Arabica espresso blended with cold milk and French hazelnut syrup',
    badge: 'PREMIUM',
    isVeg: true,
    emoji: '☕❄️',
    calories: '220 kcal'
  },
  {
    id: 'dessert-brownie',
    name: 'Belgian Chocolate Truffle Brownie',
    category: 'desserts',
    price: 160,
    desc: 'Warm fudge brownie topped with dark Belgian chocolate drizzle',
    badge: 'INDULGENT',
    isVeg: true,
    emoji: '🍫🍰',
    calories: '350 kcal'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Concessions', emoji: '🍿' },
  { id: 'combos', label: 'Saver Combos', emoji: '🌟' },
  { id: 'popcorn', label: 'Popcorn & Tubs', emoji: '🌽' },
  { id: 'snacks', label: 'Nachos & Fast Bites', emoji: '🌮' },
  { id: 'beverages', label: 'Cold Beverages', emoji: '🥤' },
  { id: 'desserts', label: 'Sweet Treats', emoji: '🍫' }
];

export default function FnbConcessionsModal({
  isOpen,
  onClose,
  onProceed,
  onSkip,
  selectedSeats = [],
  screenName = 'Screen 1',
  theatreName = 'Cinema',
  initialSnacks = [],
  initialDelivery = 'seat_delivery'
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState(() => {
    const map = {};
    if (Array.isArray(initialSnacks)) {
      initialSnacks.forEach((item) => {
        if (item && item.snackId) {
          map[item.snackId] = item.quantity || 1;
        }
      });
    }
    return map;
  });
  const [deliveryPreference, setDeliveryPreference] = useState(initialDelivery);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return FNB_CATALOG;
    return FNB_CATALOG.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const totalItemsCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const totalSnacksPrice = useMemo(() => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = FNB_CATALOG.find((x) => x.id === id);
      return total + (item ? item.price * qty : 0);
    }, 0);
  }, [cart]);

  const handleAdd = (id) => {
    playSeatClick();
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleRemove = (id) => {
    playPop();
    setCart((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: current - 1
      };
    });
  };

  const handleConfirm = () => {
    playPop();
    const snacksList = Object.entries(cart).map(([id, qty]) => {
      const item = FNB_CATALOG.find((x) => x.id === id);
      return {
        snackId: id,
        name: item ? item.name : id,
        category: item ? item.category : 'Snacks',
        price: item ? item.price : 0,
        quantity: qty,
        emoji: item ? item.emoji : '🍿'
      };
    });

    onProceed({
      snacksList,
      deliveryPreference,
      snacksFee: totalSnacksPrice,
      includeSnacks: snacksList.length > 0
    });
  };

  const handleSkipAll = () => {
    playPop();
    setCart({});
    onSkip();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#181a24] via-[#1f2230] to-[#161822] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Glow Ambient Background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-60 h-60 bg-[#F84464]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-5 pt-5 pb-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-[#F84464] flex items-center justify-center shadow-lg shadow-amber-500/20 text-2xl">
              🍿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black tracking-widest uppercase border border-amber-400/30">
                  Cinema Concessions
                </span>
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                  Skip the interval queue
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                Grab a Bite &amp; Save Time
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery Mode Selector Strip */}
        <div className="relative z-10 px-5 py-3.5 bg-white/5 border-b border-white/10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2">
            Choose Delivery Preference:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* In-Seat Delivery */}
            <button
              type="button"
              onClick={() => {
                playPop();
                setDeliveryPreference('seat_delivery');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                deliveryPreference === 'seat_delivery'
                  ? 'bg-gradient-to-r from-amber-500/20 to-[#F84464]/20 border-amber-400/60 ring-1 ring-amber-400/40'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                deliveryPreference === 'seat_delivery' ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-300'
              }`}>
                <Armchair className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Deliver to Seat at Intermission</span>
                  {deliveryPreference === 'seat_delivery' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Delivered to <span className="text-amber-300 font-semibold">{screenName}</span> (Seats {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Selected'})
                </p>
              </div>
            </button>

            {/* Express Counter Pickup */}
            <button
              type="button"
              onClick={() => {
                playPop();
                setDeliveryPreference('counter_pickup');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                deliveryPreference === 'counter_pickup'
                  ? 'bg-gradient-to-r from-amber-500/20 to-[#F84464]/20 border-amber-400/60 ring-1 ring-amber-400/40'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                deliveryPreference === 'counter_pickup' ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-300'
              }`}>
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Express Counter Pickup</span>
                  {deliveryPreference === 'counter_pickup' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Show your digital snack pass at Refreshment Counter #3
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playPop();
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#F84464] text-white shadow-md shadow-[#F84464]/30 scale-102'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Items List (Scrollable Area) */}
        <div className="p-5 max-h-[360px] sm:max-h-[380px] overflow-y-auto space-y-3 custom-scrollbar">
          {filteredItems.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div
                key={item.id}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 sm:gap-4 ${
                  qty > 0
                    ? 'bg-amber-500/10 border-amber-400/50 shadow-sm shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                }`}
              >
                {/* Left Side: Food Icon & Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {item.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Veg / Non-Veg Indicator */}
                      <span
                        className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                          item.isVeg ? 'border-emerald-500' : 'border-rose-600'
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-500' : 'bg-rose-600'
                          }`}
                        />
                      </span>

                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.name}
                      </span>

                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[8px] font-black uppercase tracking-wider border border-amber-400/30">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm font-black text-amber-400">
                        ₹{item.price}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        • {item.calories}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Quantity Stepper */}
                <div className="shrink-0">
                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleAdd(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#F84464] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-500 text-white rounded-xl p-1 shadow-md shadow-amber-500/30">
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="w-6 h-6 rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 text-white" />
                      </button>
                      <span className="text-xs font-black px-1 min-w-[16px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdd(item.id)}
                        className="w-6 h-6 rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer & Actions */}
        <div className="px-5 py-4 bg-[#14161f] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in tray
                </span>
                <span className="text-base font-black text-white">
                  ₹{totalSnacksPrice}
                </span>
              </div>
            </div>
            {totalItemsCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {deliveryPreference === 'seat_delivery' ? '🛋️ In-Seat' : '⚡ Counter'}
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSkipAll}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Skip Snacks
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F84464] to-rose-600 hover:from-[#E03A58] hover:to-rose-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-[#F84464]/30 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{totalItemsCount > 0 ? `Proceed with Snacks (₹${totalSnacksPrice})` : 'Continue to Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

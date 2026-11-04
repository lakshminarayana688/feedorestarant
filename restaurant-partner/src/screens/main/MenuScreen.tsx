import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, MenuCategory } from '../../types/menu';
import { VegIndicator } from '../../components/common/VegIndicator';
import { AddEditMenuItemModal } from './AddEditMenuItemModal';
import {
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  Star,
  Clock,
  Sparkles,
  Utensils,
  Heart,
  SlidersHorizontal,
  ArrowLeft,
} from 'lucide-react';

const CATEGORIES: MenuCategory[] = [
  'Biryani',
  'Starters',
  'Main Course',
  'Rice',
  'Breads',
  'Desserts',
  'Beverages',
];

export const MenuScreen: React.FC = () => {
  const { setScreen, menuItems, toggleItemAvailability, deleteMenuItem, duplicateMenuItem } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesDietary =
      dietaryFilter === 'ALL' || (dietaryFilter === 'VEG' ? item.isVeg : !item.isVeg);
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDietary && matchesSearch;
  });

  const handleAddNew = () => { setItemToEdit(null); setIsModalOpen(true); };
  const handleEdit  = (item: MenuItem) => { setItemToEdit(item); setIsModalOpen(true); };
  const toggleFav   = (id: string) => setFavorites(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Top Bar ───────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 pt-5 pb-3 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setScreen('dashboard')}
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
              className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Restaurant Menu</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">{menuItems.length} items · {CATEGORIES.length} categories</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 bg-[#FFC700] hover:bg-amber-400 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-amber-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dishes (e.g. Biryani, Naan, Paneer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 bg-slate-100 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-300 transition-all"
          />
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'VEG' ? 'ALL' : dietaryFilter === 'ALL' ? 'NON_VEG' : 'ALL')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl bg-[#FFC700] flex items-center justify-center shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-900" />
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({menuItems.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = menuItems.filter((i) => i.category === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FFC700] text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Dietary filter tabs */}
        <div className="flex gap-2">
          {(['ALL', 'VEG', 'NON_VEG'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setDietaryFilter(f)}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                dietaryFilter === f
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'ALL' ? '🍽 All Items' : f === 'VEG' ? '🟢 Veg Only' : '🔴 Non-Veg'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="p-4 pb-28">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 mt-2">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No items found</h3>
            <p className="text-xs text-slate-400">Try resetting filters or add a new dish.</p>
            <button
              onClick={handleAddNew}
              className="mt-4 px-5 py-2.5 bg-[#FFC700] text-slate-900 text-xs font-bold rounded-2xl shadow hover:bg-amber-400 transition-colors"
            >
              + Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                isFav={favorites.has(item.id)}
                onFav={() => toggleFav(item.id)}
                onEdit={() => handleEdit(item)}
                onDuplicate={() => duplicateMenuItem(item.id)}
                onDelete={() => deleteMenuItem(item.id)}
                onToggleStock={() => toggleItemAvailability(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddEditMenuItemModal
        isOpen={isModalOpen}
        itemToEdit={itemToEdit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

// ── Food Card Component ──────────────────────────────────────────────────────
interface FoodCardProps {
  item: MenuItem;
  isFav: boolean;
  onFav: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleStock: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({
  item, isFav, onFav, onEdit, onDuplicate, onDelete, onToggleStock,
}) => (
  <div
    className={`bg-white rounded-3xl overflow-hidden border transition-all card-lift ${
      item.isAvailable ? 'border-slate-100' : 'border-slate-200 opacity-70'
    }`}
  >
    {/* Image */}
    <div className="relative h-36 w-full overflow-hidden bg-slate-100">
      <img
        src={item.imageUrl}
        alt={item.name}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          !item.isAvailable ? 'grayscale' : 'hover:scale-105'
        }`}
      />
      {/* Top-left: veg badge */}
      <div className="absolute top-2 left-2">
        <VegIndicator isVeg={item.isVeg} size="sm" />
      </div>
      {/* Top-right: heart */}
      <button
        onClick={onFav}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all active:scale-90"
      >
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
          }`}
        />
      </button>
      {/* Bestseller ribbon */}
      {item.isBestSeller && (
        <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-[#FFC700] text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
          <Sparkles className="w-2.5 h-2.5" /> BESTSELLER
        </div>
      )}
      {/* Prep time */}
      <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg backdrop-blur-sm">
        <Clock className="w-2.5 h-2.5" /> {item.preparationTimeMinutes}m
      </div>
      {/* Out of stock overlay */}
      {!item.isAvailable && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
          <span className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
            Out of Stock
          </span>
        </div>
      )}
    </div>

    {/* Body */}
    <div className="p-3 space-y-2">
      {/* Name & Category */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">{item.name}</h3>
        <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
      </div>

      {/* Rating + Distance row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-700">{item.rating}</span>
          <span className="text-[10px] text-slate-400">({item.votes})</span>
        </div>
        <span className="text-[10px] text-slate-400">{item.preparationTimeMinutes} min prep</span>
      </div>

      {/* Price row */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-black text-slate-900">
          ₹{item.discountPrice || item.price}
        </span>
        {item.discountPrice && (
          <span className="text-[10px] text-slate-400 line-through font-mono">
            ₹{item.price}
          </span>
        )}
      </div>

      {/* Stock toggle */}
      <button
        onClick={onToggleStock}
        className={`w-full py-1.5 rounded-xl text-[10px] font-bold transition-all ${
          item.isAvailable
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
        }`}
      >
        {item.isAvailable ? '🟢 In Stock' : '🔴 Out of Stock'}
      </button>

      {/* Action row */}
      <div className="flex items-center justify-between pt-0.5 border-t border-slate-50">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-amber-600 py-1 px-1.5 rounded-lg hover:bg-amber-50 transition-colors"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={onDuplicate}
          className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-indigo-600 py-1 px-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Copy className="w-3 h-3" /> Copy
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-rose-600 py-1 px-1.5 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Del
        </button>
      </div>
    </div>
  </div>
);

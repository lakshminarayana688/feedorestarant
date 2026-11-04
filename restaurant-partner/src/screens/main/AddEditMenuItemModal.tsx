import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, MenuCategory } from '../../types/menu';
import { VegIndicator } from '../../components/common/VegIndicator';
import { X, Plus, Trash2, Camera, Sparkles } from 'lucide-react';

interface AddEditMenuItemModalProps {
  itemToEdit: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddEditMenuItemModal: React.FC<AddEditMenuItemModalProps> = ({
  itemToEdit,
  isOpen,
  onClose,
}) => {
  const { addMenuItem, updateMenuItem, showToast } = useApp();

  const categories: MenuCategory[] = [
    'Biryani',
    'Starters',
    'Main Course',
    'Rice',
    'Breads',
    'Desserts',
    'Beverages',
  ];

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Biryani' as MenuCategory,
    price: 180,
    discountPrice: 0,
    imageUrl: '',
    isVeg: false,
    isAvailable: true,
    preparationTimeMinutes: 15,
    isBestSeller: false,
  });

  useEffect(() => {
    if (itemToEdit) {
      setForm({
        name: itemToEdit.name,
        description: itemToEdit.description,
        category: itemToEdit.category,
        price: itemToEdit.price,
        discountPrice: itemToEdit.discountPrice || 0,
        imageUrl: itemToEdit.imageUrl,
        isVeg: itemToEdit.isVeg,
        isAvailable: itemToEdit.isAvailable,
        preparationTimeMinutes: itemToEdit.preparationTimeMinutes,
        isBestSeller: !!itemToEdit.isBestSeller,
      });
    } else {
      setForm({
        name: '',
        description: '',
        category: 'Biryani',
        price: 180,
        discountPrice: 0,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80',
        isVeg: false,
        isAvailable: true,
        preparationTimeMinutes: 15,
        isBestSeller: false,
      });
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0) {
      showToast('Please enter a valid item name and price', 'error');
      return;
    }

    if (itemToEdit) {
      updateMenuItem(itemToEdit.id, {
        ...form,
        discountPrice: form.discountPrice > 0 ? form.discountPrice : undefined,
      });
    } else {
      addMenuItem({
        ...form,
        discountPrice: form.discountPrice > 0 ? form.discountPrice : undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <p className="text-xs text-slate-500">
              Set food prices, veg/non-veg tags, and prep times
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Food Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Dish / Item Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Chicken Dum Biryani"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Culinary Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Fragrant basmati rice layered with juicy marinated chicken..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
            />
          </div>

          {/* Category & Veg/Non-Veg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dietary Indicator *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isVeg: true })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    form.isVeg
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <VegIndicator isVeg={true} size="sm" />
                  <span>Pure Veg</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, isVeg: false })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !form.isVeg
                      ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <VegIndicator isVeg={false} size="sm" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Menu Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:border-feedo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Discount Price (₹) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min={0}
                  value={form.discountPrice || ''}
                  onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })}
                  placeholder="e.g. 160"
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:border-feedo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Preparation Time & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Prep Time (Minutes)
              </label>
              <input
                type="number"
                min={2}
                max={90}
                value={form.preparationTimeMinutes}
                onChange={(e) => setForm({ ...form, preparationTimeMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:border-feedo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Availability Status
              </label>
              <button
                type="button"
                onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  form.isAvailable
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-rose-300 bg-rose-50 text-rose-800'
                }`}
              >
                {form.isAvailable ? '🟢 In Stock (Available)' : '🔴 Out of Stock'}
              </button>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Food Image URL
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:border-feedo-500 focus:outline-hidden"
            />
          </div>

          {/* Bestseller checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isBestSeller"
              checked={form.isBestSeller}
              onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
              className="w-4 h-4 text-feedo-600 rounded border-slate-300 focus:ring-feedo-500 cursor-pointer"
            />
            <label htmlFor="isBestSeller" className="text-xs font-bold text-slate-700 cursor-pointer">
              Tag as Bestseller ⭐ (Promote on customer app)
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-feedo-500/20 cursor-pointer"
            >
              {itemToEdit ? 'Save Changes' : 'Save Item to Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

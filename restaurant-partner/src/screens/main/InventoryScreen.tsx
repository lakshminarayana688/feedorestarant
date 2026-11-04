import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  Search,
  Plus,
  RefreshCw,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const InventoryScreen: React.FC = () => {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');

  const [inventoryItems, setInventoryItems] = useState([
    { id: 'inv-1', name: 'Aged Royal Basmati Rice (25kg bags)', category: 'Grains & Rice', stock: 18, minStock: 5, unit: 'Bags', status: 'In Stock' },
    { id: 'inv-2', name: 'Fresh Chicken Cuts (Bone-in)', category: 'Meat & Poultry', stock: 12, minStock: 20, unit: 'kg', status: 'Low Stock' },
    { id: 'inv-3', name: 'Fresh Malai Paneer (Dairy)', category: 'Dairy & Cheese', stock: 8, minStock: 15, unit: 'kg', status: 'Low Stock' },
    { id: 'inv-4', name: 'Desi Cow Ghee (Tin 15L)', category: 'Oils & Dairy', stock: 6, minStock: 2, unit: 'Tins', status: 'In Stock' },
    { id: 'inv-5', name: 'Shahi Biryani Spice Mix', category: 'Spices & Herbs', stock: 4, minStock: 10, unit: 'kg', status: 'Critical' },
    { id: 'inv-6', name: 'Refined Maida Flour (50kg)', category: 'Flour & Bakery', stock: 14, minStock: 4, unit: 'Bags', status: 'In Stock' },
    { id: 'inv-7', name: 'Eco-friendly Leakproof Food Containers (500ml)', category: 'Packaging', stock: 850, minStock: 200, unit: 'Pcs', status: 'In Stock' },
    { id: 'inv-8', name: 'Coke 750ml Bottles (Cases of 24)', category: 'Beverages', stock: 3, minStock: 8, unit: 'Cases', status: 'Low Stock' },
  ]);

  const handleReorder = (itemName: string) => {
    showToast(`Purchase order generated for "${itemName}" with registered supplier.`, 'success');
  };

  const filteredItems = inventoryItems.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory & Raw Materials
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor kitchen stock levels, automated re-order triggers, and supplier vendor directories.
          </p>
        </div>

        <button
          onClick={() => showToast('Add raw material item form opened', 'info')}
          className="py-2.5 px-4 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-feedo-500/20 flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Stock Item</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Raw SKUs</span>
          <h3 className="text-3xl font-black text-slate-900">48</h3>
          <span className="text-xs text-slate-400">Across 6 storage zones</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</span>
          <h3 className="text-3xl font-black text-rose-600">4</h3>
          <span className="text-xs font-bold text-rose-600">Action required today</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Utilization</span>
          <h3 className="text-3xl font-black text-slate-900">78%</h3>
          <span className="text-xs text-emerald-600 font-semibold">Cold room capacity optimal</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Orders</span>
          <h3 className="text-3xl font-black text-amber-600">2 Pending</h3>
          <span className="text-xs text-slate-400">Delivery expected 4:00 PM</span>
        </div>
      </div>

      {/* Low Stock Alerts Priority Banner */}
      <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <h3 className="text-sm font-bold">Priority Stock Shortage Warnings</h3>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed">
          The following items have dropped below daily safety thresholds. Re-order now to avoid automatic menu item disabling.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {inventoryItems.filter((i) => i.status !== 'In Stock').map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-2xl border border-rose-200 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900">{item.name}</h4>
                <p className="text-[11px] text-rose-700 font-bold">
                  {item.stock} {item.unit} left (Min: {item.minStock})
                </p>
              </div>
              <button
                onClick={() => handleReorder(item.name)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shadow-2xs cursor-pointer"
              >
                Reorder
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Inventory Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Inventory Tracker</h3>
            <p className="text-xs text-slate-500">Track current counts, minimum thresholds, and units</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredient or material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Item Name</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Current Stock</th>
                <th className="pb-3 px-3">Safety Min</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3 px-3 text-slate-500">{item.category}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {item.stock} {item.unit}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {item.minStock} {item.unit}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleReorder(item.name)}
                      className="text-xs font-bold text-feedo-600 hover:underline"
                    >
                      + Reorder →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warehouse Locations & Supplier Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-feedo-500" />
            <span>Kitchen Storage Locations</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Dry Pantry Storage A1</span>
                <span className="text-slate-400">Rice, Flours, Ghee, Whole Spices</span>
              </div>
              <span className="font-bold text-emerald-600">82% Full</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Cold Storage & Chiller B2</span>
                <span className="text-slate-400">Chicken, Dairy Paneer, Fresh Vegetables</span>
              </div>
              <span className="font-bold text-emerald-600">65% Full</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-feedo-500" />
            <span>Verified Vendor Directory</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Sri Venkateshwara Poultry & Dairy</span>
                <span className="text-slate-400">Contact: +91 98450 12345 • Daily Delivery</span>
              </div>
              <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">Primary</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">EcoPack Solutions Bengaluru</span>
                <span className="text-slate-400">Contact: +91 80 2552 9000 • Containers & Bags</span>
              </div>
              <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

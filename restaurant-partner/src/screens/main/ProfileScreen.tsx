import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Camera,
  MapPin,
  Clock,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { restaurant, updateRestaurant, showToast, setScreen, setIsSignOutModalOpen } = useApp();

  const [form, setForm] = useState({
    name: restaurant.restaurantName,
    legalName: 'Lucky Hospitality & Foods Private Limited',
    bio: restaurant.description,
    address: restaurant.address,
    phone: restaurant.ownerPhone,
    email: restaurant.ownerEmail,
    instagram: '@luckybiryaniofficial',
    facebook: 'facebook.com/luckyfamilyrestaurant',
    twitter: '@lucky_blr',
    lat: '12.9352',
    lng: '77.6245',
  });

  const [cuisines, setCuisines] = useState(restaurant.cuisines);
  const [certifications, setCertifications] = useState(['FSSAI Food Hygiene 5★', 'Halal Certified', 'Vegan Friendly Options']);
  const [hours, setHours] = useState(restaurant.openingHours);

  const [galleryPhotos, setGalleryPhotos] = useState([
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
  ]);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurant({
      restaurantName: form.name,
      description: form.bio,
      address: form.address,
      ownerPhone: form.phone,
      ownerEmail: form.email,
      cuisines,
      openingHours: hours,
    });
    showToast('Restaurant profile details saved successfully!', 'success');
  };

  const handleAddPhoto = () => {
    const randomPhotos = [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    ];
    setGalleryPhotos([...galleryPhotos, randomPhotos[Math.floor(Math.random() * randomPhotos.length)]]);
    showToast('Photo uploaded to gallery', 'success');
  };

  const handleDeletePhoto = (idx: number) => {
    setGalleryPhotos(galleryPhotos.filter((_, i) => i !== idx));
    showToast('Photo removed', 'info');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Restaurant Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your public storefront, dining photos, business certifications, and geolocation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast('Opening preview listing on FEEDO Customer App', 'info')}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Preview Listing ↗
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-6 py-2.5 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-feedo-500/20 transition-all cursor-pointer"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Verified Partner Status Card (Dark Card) */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">FEEDO Verified SuperPartner</h3>
              <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Your profile is 100% compliant with FSSAI hygiene standards and appears in Koramangala top search results.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Merchant Code: <strong className="text-feedo-400">FD-LUCKY-2026</strong>
        </div>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        {/* 1. Basic Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Basic Restaurant Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Display Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Legal Registered Entity Name *
              </label>
              <input
                type="text"
                required
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Culinary Bio & Tagline
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
            />
          </div>

          {/* Cuisines & Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cuisine Specialties
              </label>
              <div className="flex flex-wrap gap-2">
                {cuisines.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1 bg-feedo-50 text-feedo-800 border border-feedo-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => setCuisines(cuisines.filter((x) => x !== c))}
                      className="text-feedo-400 hover:text-feedo-700 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Badges & Certifications
              </label>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold"
                  >
                    ✓ {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Photo Gallery (4-image grid with hover overlays) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">2. Storefront & Food Photo Gallery</h3>
              <p className="text-xs text-slate-500">High-resolution photos increase order conversions by 35%</p>
            </div>
            <button
              type="button"
              onClick={handleAddPhoto}
              className="px-3.5 py-1.5 bg-feedo-50 hover:bg-feedo-100 text-feedo-700 font-bold text-xs rounded-xl border border-feedo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {galleryPhotos.map((photoUrl, idx) => (
              <div key={idx} className="relative h-36 rounded-2xl overflow-hidden group bg-slate-100 border border-slate-200">
                <img
                  src={photoUrl}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast('Edit photo caption', 'info')}
                    className="p-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(idx)}
                    className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Operating Hours Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">3. Operating & Kitchen Hours</h3>
            <p className="text-xs text-slate-500">Configure weekly order acceptance windows</p>
          </div>

          <div className="divide-y divide-slate-100">
            {hours.map((h, idx) => (
              <div key={h.day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="w-32 font-bold text-slate-900">{h.day}</span>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    disabled={!h.isOpen}
                    value={h.openTime}
                    onChange={(e) => {
                      const updated = [...hours];
                      updated[idx].openTime = e.target.value;
                      setHours(updated);
                    }}
                    className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center disabled:opacity-40"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="text"
                    disabled={!h.isOpen}
                    value={h.closeTime}
                    onChange={(e) => {
                      const updated = [...hours];
                      updated[idx].closeTime = e.target.value;
                      setHours(updated);
                    }}
                    className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center disabled:opacity-40"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated = [...hours];
                    updated[idx].isOpen = !updated[idx].isOpen;
                    setHours(updated);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                    h.isOpen
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {h.isOpen ? 'Open' : 'Closed'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Location & Contact Socials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-feedo-500" />
              <span>Location & Coordinates</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Physical Address
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Latitude</label>
                <input
                  type="text"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Longitude</label>
                <input
                  type="text"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Contact & Socials */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-feedo-500" />
              <span>Contact & Social Presence</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Customer Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Public Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-rose-500" />
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3.5 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-feedo-500/25 transition-all cursor-pointer"
          >
            Save All Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  CheckCheck,
  Utensils,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sliders,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { FeedoDispatchAgentModal } from '../../components/chat/FeedoDispatchAgentModal';

type NotifTab = 'ALL' | 'ORDERS' | 'MESSAGES' | 'MARKETING' | 'SYSTEM';

export const NotificationsScreen: React.FC = () => {
  const { showToast, setSelectedOrder, orders, setScreen, isPrototypeMode } = useApp();
  const [activeTab, setActiveTab] = useState<NotifTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);

  const notificationsList = [
    {
      id: 'notif-842',
      type: 'ORDERS',
      borderColor: 'border-l-feedo-500',
      badgeBg: 'bg-feedo-50 text-feedo-700',
      title: 'New High-Priority Order #FD10245',
      time: '2 mins ago',
      description: 'Rahul Kumar ordered 2x Chicken Dum Biryani + 1x Coke (Total: ₹470). Kitchen prep timer initiated.',
      hasActions: true,
    },
    {
      id: 'notif-msg-1',
      type: 'MESSAGES',
      borderColor: 'border-l-blue-500',
      badgeBg: 'bg-blue-50 text-blue-700',
      title: 'Customer Inquiry: Gluten-Free Options',
      time: '18 mins ago',
      description: 'Priya Sharma inquired if Dal Makhani is cooked in separate utensils for celiac safety.',
      isMessage: true,
    },
    {
      id: 'notif-bank-1',
      type: 'SYSTEM',
      borderColor: 'border-l-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      title: 'Bank Account Verified for Settlements',
      time: '2 hours ago',
      description: 'HDFC Bank ending in •••• 9921 successfully verified. Daily NEFT deposits active.',
    },
    {
      id: 'notif-mkt-1',
      type: 'MARKETING',
      borderColor: 'border-l-purple-500',
      badgeBg: 'bg-purple-50 text-purple-700',
      title: 'Weekend Promo Opportunity: Biryani Feast Boost',
      time: '5 hours ago',
      description: 'Activate 20% OFF campaign on Biryani items to rank in Friday Dinner Spotlight.',
    },
    {
      id: 'notif-sys-2',
      type: 'SYSTEM',
      borderColor: 'border-l-slate-400',
      badgeBg: 'bg-slate-100 text-slate-700',
      title: 'Daily Business Summary Ready',
      time: 'Yesterday',
      description: 'Yesterday revenue audited and closed with 100% handover score.',
    },
  ];

  const filteredNotifs = notificationsList.filter((n) => {
    const matchesTab = activeTab === 'ALL' || n.type === activeTab;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Top Header */}
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-feedo-50 text-feedo-700 px-2.5 py-0.5 rounded-full border border-feedo-200">
                {filteredNotifs.length > 0 ? `${filteredNotifs.length} Unread Notifications` : '0 unread notifications'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Notifications Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time kitchen alerts, customer queries, payouts, and system notices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('All notifications marked as read', 'success')}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Tabs, Search & Notification Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Tabs */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search alerts, order updates, customer queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: 'ALL', label: 'All Alerts (24)' },
                  { id: 'ORDERS', label: 'Orders' },
                  { id: 'MESSAGES', label: 'Messages' },
                  { id: 'MARKETING', label: 'Marketing' },
                  { id: 'SYSTEM', label: 'System' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-feedo-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredNotifs.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs border-l-4 ${n.borderColor} space-y-3 transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${n.badgeBg}`}>
                    {n.type}
                  </span>
                  <span className="text-[11px] text-slate-400">{n.time}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.description}</p>
                </div>

                {/* Actions if present */}
                {n.hasActions && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (orders.length > 0) {
                          setSelectedOrder(orders[0]);
                        } else {
                          setScreen('orders');
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      View Order
                    </button>
                    <button
                      onClick={() => setScreen('orders')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Orders Hub
                    </button>
                  </div>
                )}

                {n.isMessage && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => showToast('Chat response sent to Priya Sharma', 'success')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Reply to Inquiry
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Column: Notification Settings Panel */}
        <div className="space-y-6">
          {/* Channel Delivery Settings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-feedo-500" />
              <span>Delivery Channels</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Push Notifications</h4>
                  <p className="text-[11px] text-slate-400">Immediate sound rings on order arrival</p>
                </div>
                <button
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    pushEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      pushEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Daily Email Digests</h4>
                  <p className="text-[11px] text-slate-400">Nightly PDF settlement receipts</p>
                </div>
                <button
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    emailEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      emailEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Urgent SMS Alerts</h4>
                  <p className="text-[11px] text-slate-400">Delivery partner delay warnings</p>
                </div>
                <button
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    smsEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      smsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Alert Category Checkboxes */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Category Filters
              </span>
              {['Order Lifecycle Events', 'Customer Reviews & Feedback', 'Stock Out-of-Stock Warnings', 'Marketing Promotion Tips'].map(
                (item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-feedo-600 rounded border-slate-300 focus:ring-feedo-500 cursor-pointer"
                    />
                    <span>{item}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Quick Support Dark Card */}
          <div className="bg-[#0f172a] rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FFB703]" />
              <span>Partner Operational Support</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Facing rider delays or customer address discrepancies? Live restaurant agent support is online 24/7.
            </p>
            <button
              type="button"
              id="start-live-chat-btn"
              onClick={() => setIsChatModalOpen(true)}
              className="w-full py-3 bg-[#FFB703] hover:bg-[#FFA200] active:scale-98 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Start Live Chat →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Operational Support Chat Modal */}
      <FeedoDispatchAgentModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </div>
  );
};

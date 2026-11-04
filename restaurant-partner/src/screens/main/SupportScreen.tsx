import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  MessageSquare,
  LifeBuoy,
  FileQuestion,
  Search,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { FeedoDispatchAgentModal } from '../../components/chat/FeedoDispatchAgentModal';

export const SupportScreen: React.FC = () => {
  const { showToast, setScreen } = useApp();
  const [searchFaq, setSearchFaq] = useState('');
  const [activeFaqCat, setActiveFaqCat] = useState('ALL');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeOrderIdForChat, setActiveOrderIdForChat] = useState<string | undefined>(undefined);

  const tickets = [
    { id: 'TKT-9912', subject: 'Rider ETA Delay on Koramangala 4th Block Signal', priority: 'High', status: 'In Progress', time: '10 mins ago', agent: 'Sandeep (FEEDO Dispatch)' },
    { id: 'TKT-9884', subject: 'Payout Statement Tax Deduction Reconciliation', priority: 'Medium', status: 'Resolved', time: 'Yesterday', agent: 'Divya (Finance Support)' },
    { id: 'TKT-9850', subject: 'Menu Item Photo Watermark Update Request', priority: 'Low', status: 'Resolved', time: '16 Sep', agent: 'Merchant Catalog Ops' },
  ];

  const faqs = [
    { cat: 'Orders', q: 'How do I handle an order if a menu item suddenly goes out of stock?', a: 'You can reject the incoming order within 30 seconds by selecting "Item Unavailable", or toggle the dish to "Out of Stock" immediately in the Menu tab to pause new customer orders.' },
    { cat: 'Payments', q: 'When are daily restaurant settlements credited to my bank?', a: 'All online and COD orders from the previous calendar day are audited and transferred via automated NEFT every morning by 10:00 AM directly into your verified bank account.' },
    { cat: 'Delivery', q: 'What happens if a delivery partner takes more than 15 minutes to arrive?', a: 'The FEEDO dispatch algorithm automatically detects courier delays and assigns the next closest partner to ensure food reaches the customer hot and fresh.' },
    { cat: 'Technical', q: 'How can I ensure the new order ring chime is never missed?', a: 'Keep the FEEDO Partner app open with volume turned up. You can also enable "Auto-Accept Orders" in Settings during peak kitchen hours.' },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const matchCat = activeFaqCat === 'ALL' || f.cat === activeFaqCat;
    const matchText = f.q.toLowerCase().includes(searchFaq.toLowerCase()) || f.a.toLowerCase().includes(searchFaq.toLowerCase());
    return matchCat && matchText;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header with Live Chat CTA */}
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
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Support 24/7
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              FEEDO Support Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant operational assistance, priority ticketing, and merchant knowledge base.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsChatModalOpen(true)}
            className="py-2.5 px-5 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-feedo-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Live Agent Chat</span>
          </button>
        </div>
      </div>

      {/* Response Time Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Agent Response</span>
          <h3 className="text-3xl font-black text-slate-900">42 seconds</h3>
          <span className="text-xs text-emerald-600 font-semibold">Priority SuperPartner lane</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Contact Resolution</span>
          <h3 className="text-3xl font-black text-emerald-600">96.8%</h3>
          <span className="text-xs text-slate-400">Resolved without escalation</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Dispatch Helpline</span>
          <h3 className="text-2xl font-black font-mono text-feedo-600">1800-208-FEEDO</h3>
          <span className="text-xs text-slate-400">Toll free 24 hours</span>
        </div>
      </div>

      {/* Ticketing System & Live Tickets */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Support Tickets</h3>
            <p className="text-xs text-slate-500">Track inquiries escalated to dispatch or finance</p>
          </div>
          <button
            onClick={() => showToast('New support ticket form opened', 'info')}
            className="text-xs font-bold text-feedo-600 hover:underline"
          >
            + Create Ticket
          </button>
        </div>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-slate-900">{t.id}</span>
                  <span
                    className={`px-2 py-0.2 rounded-full font-bold text-[10px] ${
                      t.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {t.priority} Priority
                  </span>
                  <span
                    className={`px-2 py-0.2 rounded-full font-bold text-[10px] ${
                      t.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800">{t.subject}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Assigned to: {t.agent} • {t.time}</p>
              </div>

              <button
                onClick={() => {
                  setActiveOrderIdForChat(t.id);
                  setIsChatModalOpen(true);
                }}
                className="text-xs font-bold text-feedo-600 hover:underline self-end sm:self-auto cursor-pointer"
              >
                View Discussion →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions Search & Articles */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500">Quick answers to common operational questions</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. settlements, out of stock, delayed rider)..."
            value={searchFaq}
            onChange={(e) => setSearchFaq(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['ALL', 'Orders', 'Payments', 'Delivery', 'Technical'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFaqCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeFaqCat === cat
                  ? 'bg-feedo-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="text-feedo-600 font-bold">Q:</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live AI Dispatch Agent Modal */}
      <FeedoDispatchAgentModal
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setActiveOrderIdForChat(undefined);
        }}
        initialOrderId={activeOrderIdForChat}
      />
    </div>
  );
};

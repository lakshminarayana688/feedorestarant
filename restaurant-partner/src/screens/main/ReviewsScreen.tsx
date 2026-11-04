import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Star,
  MessageSquare,
  Sparkles,
  TrendingUp,
  ThumbsUp,
  Award,
  Flag,
  CornerDownRight,
  Smile,
  ShieldCheck,
  Tag,
  ArrowLeft,
} from 'lucide-react';

export const ReviewsScreen: React.FC = () => {
  const { reviews, addReviewReply, showToast, setScreen } = useApp();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    addReviewReply(reviewId, replyText);
    setReplyingTo(null);
    setReplyText('');
  };

  const trendingKeywords = [
    'Fresh Ingredients',
    'Fast Delivery',
    'Hot Food',
    'Authentic Dum Biryani',
    'Spill-Proof Packaging',
    'Tender Meat',
    'Polite Courier',
    'Crispy Starters',
  ];

  const dishPerformance = [
    { name: 'Chicken Dum Biryani', rating: 4.9, count: 412, percent: 98 },
    { name: 'Royal Paneer Biryani', rating: 4.7, count: 284, percent: 94 },
    { name: 'Chicken 65 Andhra Style', rating: 4.6, count: 215, percent: 92 },
    { name: 'Paneer Butter Masala', rating: 4.8, count: 180, percent: 96 },
    { name: 'Clay Oven Butter Naan', rating: 4.5, count: 140, percent: 90 },
  ];

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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Reviews & Ratings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor customer satisfaction, sentiment insights, and respond to diner feedback.
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Top 5% Rated Restaurant in Koramangala</span>
        </span>
      </div>

      {/* Top Row: Centered Average Rating + Breakdown & Sentiment Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Centered Average Rating & Breakdown */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Centered Rating Hero */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-r-0 sm:border-r border-slate-100">
            <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
              4.8
            </span>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-700">Overall Partner Score</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Based on 1,248 verified diner orders</p>
          </div>

          {/* Rating Distribution Progress Bars */}
          <div className="space-y-2 text-xs">
            {[
              { stars: '5★', percent: '78%', width: '78%' },
              { stars: '4★', percent: '15%', width: '15%' },
              { stars: '3★', percent: '4%', width: '4%' },
              { stars: '2★', percent: '2%', width: '2%' },
              { stars: '1★', percent: '1%', width: '1%' },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center gap-2">
                <span className="w-6 font-bold text-slate-600 shrink-0">{bar.stars}</span>
                <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: bar.width }}
                    className="bg-amber-400 h-full rounded-full"
                  />
                </div>
                <span className="w-8 text-[11px] font-mono text-slate-500 text-right">{bar.percent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Sentiment Analysis Dark Card */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Sentiment Analysis
              </h3>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                Very Positive
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Food Quality & Taste</span>
                <span className="font-bold text-emerald-400">Excellent (94%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Delivery Speed & Packaging</span>
                <span className="font-bold text-emerald-400">Good (88%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Portion Size & Value</span>
                <span className="font-bold text-emerald-400">Excellent (91%)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-[11px] text-slate-300">
            💬 <strong>Key Customer Takeaway:</strong> "Diners consistently praise the authentic dum aroma and leak-proof packaging containers."
          </div>
        </div>
      </div>

      {/* Dish Performance & Trending Keywords Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dish Performance (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Individual Dish Performance</h3>
            <p className="text-xs text-slate-500">Item-level satisfaction ratings and volume</p>
          </div>

          <div className="space-y-3.5">
            {dishPerformance.map((dish) => (
              <div key={dish.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{dish.name}</span>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{dish.rating}</span>
                    <span className="text-slate-400 font-normal">({dish.count} reviews)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${dish.percent}%` }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Keywords & Reputation Booster (1 col) */}
        <div className="space-y-6">
          {/* Trending Keywords */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-feedo-500" />
              <span>Trending Review Keywords</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {trendingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Reputation Booster Card (Gradient orange to rose) */}
          <div className="bg-gradient-to-br from-feedo-500 to-rose-500 rounded-3xl p-6 text-white shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-200" />
              <h3 className="text-base font-black">Reputation Booster Badge</h3>
            </div>
            <p className="text-xs text-rose-100 leading-relaxed">
              You maintain a 4.8★ rating with &gt;90% response rate! Your dishes are boosted by 1.4× in FEEDO search recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Feedback Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Recent Customer Reviews</h3>
          <p className="text-xs text-slate-500">Direct diner feedback with reply composer</p>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-feedo-100 text-feedo-700 font-bold flex items-center justify-center text-xs">
                    {rev.customerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.customerName}</h4>
                    <p className="text-[10px] text-slate-400">{rev.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

              {/* Ordered Dishes tags */}
              <div className="flex flex-wrap gap-1.5">
                {rev.orderedItems.map((dish) => (
                  <span
                    key={dish}
                    className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-slate-600"
                  >
                    🍽 {dish}
                  </span>
                ))}
              </div>

              {/* Restaurant Reply if exists */}
              {rev.reply ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-feedo-700 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5" /> Restaurant Reply
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">{rev.reply.repliedAt}</span>
                  </div>
                  <p className="text-slate-600">{rev.reply.text}</p>
                </div>
              ) : (
                <div className="pt-2">
                  {replyingTo === rev.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a polite response to this customer..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-feedo-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendReply(rev.id)}
                          className="px-4 py-1.5 bg-feedo-500 hover:bg-feedo-600 text-white font-bold text-xs rounded-lg shadow-xs"
                        >
                          Publish Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingTo(rev.id);
                        setReplyText('');
                      }}
                      className="text-xs font-bold text-feedo-600 hover:text-feedo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply to {rev.customerName}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

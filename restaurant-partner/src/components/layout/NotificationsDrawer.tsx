import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, Bike, Utensils, IndianRupee, Star, CheckCheck, Info } from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, notifications, markNotificationsAsRead } = useApp();

  if (!isNotificationsOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Utensils className="w-4 h-4 text-orange-600" />;
      case 'RIDER':
        return <Bike className="w-4 h-4 text-indigo-600" />;
      case 'PAYMENT':
        return <IndianRupee className="w-4 h-4 text-emerald-600" />;
      case 'REVIEW':
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-feedo-500/10 text-feedo-600 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
                <p className="text-xs text-slate-500">Live operational alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={markNotificationsAsRead}
                title="Mark all as read"
                className="p-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">New incoming orders and updates will appear here</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl transition-all mb-1 ${
                    !n.read ? 'bg-feedo-50/50 border border-feedo-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="text-xs font-semibold text-feedo-600 hover:text-feedo-700"
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

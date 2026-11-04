import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types/order';
import {
  Send,
  X,
  Package,
  Bike,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  ChevronRight,
  Sparkles,
  Phone,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
  orderData?: {
    id: string;
    status: string;
    customerName: string;
    itemsSummary: string;
    total: number;
    riderName?: string;
    riderPhone?: string;
    riderVehicle?: string;
    riderEta?: number;
  };
  actionButtons?: Array<{
    label: string;
    action: string;
    orderId?: string;
  }>;
}

interface FeedoDispatchAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const FeedoDispatchAgentModal: React.FC<FeedoDispatchAgentModalProps> = ({
  isOpen,
  onClose,
  initialOrderId,
}) => {
  const {
    restaurant,
    orders,
    settlements,
    markFoodReady,
    showToast,
    setScreen,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeOrders = orders.filter((o) =>
    ['PLACED', 'PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome-1',
      sender: 'agent',
      text: `Hello ${restaurant.restaurantName || 'Lucky Family Restaurant'}! I'm Sandeep from FEEDO Partner Support. How can I help with your orders or kitchen operations right now?`,
      time: 'Just now',
    },
    {
      id: 'msg-welcome-2',
      sender: 'user',
      text: 'Hi Sandeep, all kitchen operations are running smoothly today.',
      time: 'Just now',
    },
  ]);

  // Auto-scroll to bottom on message change or typing
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  // If opened with a specific order ID, automatically offer assistance
  useEffect(() => {
    if (isOpen && initialOrderId) {
      const targetOrder = orders.find((o) => o.id.toLowerCase() === initialOrderId.toLowerCase());
      if (targetOrder) {
        setTimeout(() => {
          handleIncomingAIResponse(`I notice you're asking about Order #${targetOrder.id}. Here is the live status:`, targetOrder);
        }, 500);
      }
    }
  }, [isOpen, initialOrderId]);

  if (!isOpen) return null;

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper: Find order by ID or mention in prompt
  const findMentionedOrder = (query: string): Order | undefined => {
    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Try exact ID match
    for (const order of orders) {
      const cleanOrderId = order.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanQuery.includes(cleanOrderId) || cleanOrderId.includes(cleanQuery)) {
        return order;
      }
      // Try last 4 digits
      const digits = order.id.replace(/\D/g, '');
      if (digits && digits.length >= 3 && cleanQuery.includes(digits)) {
        return order;
      }
    }
    // If asking about "latest" or "active", return first active order
    if (query.includes('latest') || query.includes('current') || query.includes('active') || query.includes('first')) {
      return activeOrders[0] || orders[0];
    }
    return undefined;
  };

  // AI Response Generator
  const generateAIResponse = (userPrompt: string): { text: string; orderData?: any; actionButtons?: any[] } => {
    const q = userPrompt.toLowerCase().trim();
    const mentionedOrder = findMentionedOrder(q);

    // 1. SPECIFIC ORDER LOOKUP OR STATUS
    if (mentionedOrder || q.includes('order status') || q.includes('track order')) {
      const order = mentionedOrder || activeOrders[0] || orders[0];
      if (order) {
        const itemsList = order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ');
        const isRiderActive = order.rider !== undefined;

        let statusText = `I've tracked **Order #${order.id}** for customer **${order.customer.name}**:\n\n` +
          `• **Status:** ${order.status.replace(/_/g, ' ')}\n` +
          `• **Items:** ${itemsList}\n` +
          `• **Total:** ₹${order.total} (${order.paymentMethod})\n`;

        if (order.status === 'PREPARING') {
          statusText += `• **Kitchen Target:** Food should be packed within ~${order.prepTargetMinutes || 15} mins.\n`;
        }

        if (order.rider) {
          statusText += `• **Delivery Partner:** ${order.rider.name} (${order.rider.vehicleNumber})\n` +
            `• **Rider ETA:** Arriving at your store in ~${order.rider.etaMinutes} mins.`;
        } else if (['PLACED', 'PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED', 'PREPARING'].includes(order.status)) {
          statusText += `• **Delivery Partner:** Automated dispatch is currently allocating the closest rider within 1.5 km radius.`;
        }

        const actions: Array<{ label: string; action: string; orderId?: string }> = [];

        if (order.status === 'PREPARING') {
          actions.push({ label: 'Mark Food Ready', action: 'MARK_READY', orderId: order.id });
          actions.push({ label: 'Add +5m Prep Time', action: 'ADD_PREP_TIME', orderId: order.id });
        }
        if (order.rider) {
          actions.push({ label: 'Call Rider Hotline', action: 'CALL_RIDER', orderId: order.id });
        }
        actions.push({ label: 'View in Orders Tab', action: 'VIEW_ORDERS', orderId: order.id });

        return {
          text: statusText,
          orderData: {
            id: order.id,
            status: order.status,
            customerName: order.customer.name,
            itemsSummary: itemsList,
            total: order.total,
            riderName: order.rider?.name,
            riderPhone: order.rider?.phoneMasked,
            riderVehicle: order.rider?.vehicleNumber,
            riderEta: order.rider?.etaMinutes,
          },
          actionButtons: actions,
        };
      }
    }

    // 2. RIDER DELAY / WHERE IS RIDER
    if (q.includes('rider') || q.includes('delay') || q.includes('late') || q.includes('courier') || q.includes('driver')) {
      const delayedOrder = activeOrders.find((o) => o.rider !== undefined) || activeOrders[0];
      if (delayedOrder && delayedOrder.rider) {
        return {
          text: `I've sent an urgent ping to rider **${delayedOrder.rider.name}** (${delayedOrder.rider.vehicleNumber}) for Order #${delayedOrder.id}.\n\n` +
            `GPS telemetry indicates they are ~${delayedOrder.rider.distanceKm || '1.1'} km away, arriving in **${delayedOrder.rider.etaMinutes} minutes**. ` +
            `If the rider is delayed beyond 10 minutes, FEEDO Dispatch will automatically re-assign the order with **zero delay penalty** to your restaurant score.`,
          actionButtons: [
            { label: 'Re-assign Closest Rider', action: 'REASSIGN_RIDER', orderId: delayedOrder.id },
            { label: 'Contact Rider Dispatch', action: 'CALL_DISPATCH' },
          ],
        };
      }
      return {
        text: `All delivery partners for your active queue are currently on track. If any rider is taking longer than expected, let me know the Order ID and I will immediately ping them or dispatch a backup rider.`,
        actionButtons: [
          { label: 'Check Active Orders', action: 'VIEW_ORDERS' },
        ],
      };
    }

    // 2b. CUSTOMER ADDRESS DISCREPANCY & LOCATION SUPPORT
    if (q.includes('address') || q.includes('location') || q.includes('discrepancy') || q.includes('wrong address') || q.includes('customer location') || q.includes('landmark')) {
      return {
        text: `**Customer Address & Location Resolution Support:**\n\n` +
          `• **GPS Pin Verification:** Customer delivery addresses are synced with live street navigation.\n` +
          `• **Dispatch Contact:** If your delivery partner cannot find the customer entrance or unit, our 24/7 team contacts the customer directly to update the rider.\n` +
          `• **Delivery Payout Guarantee:** If the customer is unreachable after 10 minutes, the order is safely closed with full compensation to your restaurant.`,
        actionButtons: [
          { label: 'Check Active Orders', action: 'VIEW_ORDERS' },
          { label: 'Contact Live Dispatch Desk', action: 'CALL_DISPATCH' },
        ],
      };
    }

    // 3. CANCELLATIONS & REFUND POLICY
    if (q.includes('cancel') || q.includes('reject') || q.includes('refund') || q.includes('mistake') || q.includes('stop')) {
      return {
        text: `**FEEDO Restaurant Cancellation & Payout Protection Policy:**\n\n` +
          `1. **Kitchen Payout Guarantee:** If an order is already in **PREPARING** status and the customer cancels, your restaurant is credited with **100% of the food payout**.\n` +
          `2. **Item Out of Stock:** You can reject orders within 30 seconds of arrival with no impact on your SuperPartner rating.\n` +
          `3. **Customer Compensation:** Handled directly by FEEDO Customer Support without deducting from your restaurant balance.`,
        actionButtons: [
          { label: 'Request Cancellation for Order', action: 'REQUEST_CANCEL' },
          { label: 'View Earnings & Protection', action: 'VIEW_EARNINGS' },
        ],
      };
    }

    // 4. ITEM OUT OF STOCK / MENU INGREDIENTS
    if (q.includes('stock') || q.includes('ingredient') || q.includes('unavailable') || q.includes('finished') || q.includes('sold out') || q.includes('menu')) {
      return {
        text: `If any dish or ingredient has run out:\n\n` +
          `1. Navigate to the **Restaurant Menu** screen.\n` +
          `2. Find the item and toggle the switch to **"🔴 Out of Stock"**.\n` +
          `3. Customer apps update instantly across the city to prevent any unfillable orders.\n\n` +
          `You can turn it back to **"🟢 In Stock"** anytime once your kitchen is restocked.`,
        actionButtons: [
          { label: 'Open Restaurant Menu', action: 'NAVIGATE_MENU' },
        ],
      };
    }

    // 5. SETTLEMENTS & PAYOUTS
    if (q.includes('settlement') || q.includes('payout') || q.includes('payment') || q.includes('bank') || q.includes('money') || q.includes('neft') || q.includes('balance')) {
      const settledCount = settlements.filter((s) => s.status === 'SETTLED').length;
      return {
        text: `**Daily Payout & Settlement Ledger:**\n\n` +
          `• **Clearing Time:** Daily at **10:00 AM** via automated direct NEFT.\n` +
          `• **Account:** Verified account at **${restaurant.bankName}** (•••• ${restaurant.bankAccount.slice(-4) || '9921'}).\n` +
          `• **Transfer Fee:** ₹0 (Zero fees on partner daily bank settlements).\n` +
          `• **History:** ${settledCount} settlement batches completed successfully.`,
        actionButtons: [
          { label: 'Open Earnings Ledger', action: 'VIEW_EARNINGS' },
        ],
      };
    }

    // 6. GENERAL GREETING / KITCHEN BUSY
    if (q.includes('hello') || q.includes('hi') || q.includes('good morning') || q.includes('thanks') || q.includes('thank you') || q.includes('busy')) {
      return {
        text: `You're welcome! I'm here 24/7 to ensure your kitchen operations stay smooth and hassle-free.\n\n` +
          `If you ever have issues with an order, just mention the Order ID or topic, and I will resolve it immediately.`,
        actionButtons: [
          { label: 'Check Live Orders', action: 'VIEW_ORDERS' },
          { label: 'View Today\'s Settlements', action: 'VIEW_EARNINGS' },
        ],
      };
    }

    // 7. DEFAULT HELPFUL FALLBACK
    return {
      text: `I'm on it! I can help you resolve:\n\n` +
        `• **Order Status & Details:** Type any Order ID (e.g. #FD10245)\n` +
        `• **Rider Tracking & Delays:** Ping riders or reassign nearest courier\n` +
        `• **Cancellations:** Automatic 100% payout compensation protection\n` +
        `• **Out-of-Stock Items:** Immediate catalog pause\n` +
        `• **Settlements:** Daily bank clearing audit\n\n` +
        `How would you like to proceed?`,
      actionButtons: [
        { label: 'Check Active Orders', action: 'VIEW_ORDERS' },
        { label: 'Rider ETA Assistance', action: 'TRACK_RIDER' },
        { label: 'Cancellation Policy', action: 'CANCEL_POLICY' },
      ],
    };
  };

  const handleIncomingAIResponse = (text: string, orderData?: any, actionButtons?: any[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-agent-${Date.now()}`,
          sender: 'agent',
          text,
          time: formatCurrentTime(),
          orderData,
          actionButtons,
        },
      ]);
    }, 650);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      time: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Generate AI Response with natural typing delay
    setIsTyping(true);
    setTimeout(() => {
      const aiReply = generateAIResponse(text);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-agent-${Date.now()}`,
          sender: 'agent',
          text: aiReply.text,
          time: formatCurrentTime(),
          orderData: aiReply.orderData,
          actionButtons: aiReply.actionButtons,
        },
      ]);
    }, 700);
  };

  // Handle action buttons inside chat
  const handleActionButtonClick = (action: string, orderId?: string) => {
    switch (action) {
      case 'MARK_READY':
        if (orderId) {
          markFoodReady(orderId);
          showToast(`Order #${orderId} marked ready! Rider notified for pickup.`, 'success');
          handleIncomingAIResponse(`✓ Done! Order #${orderId} has been marked as **READY FOR PICKUP**. The assigned courier partner has received notification to proceed to your kitchen counter.`);
        }
        break;

      case 'ADD_PREP_TIME':
        if (orderId) {
          showToast(`+5 mins added to prep target for Order #${orderId}`, 'info');
          handleIncomingAIResponse(`✓ Added +5 minutes prep buffer to Order #${orderId}. The customer and delivery partner apps have been updated with the adjusted ETA.`);
        }
        break;

      case 'REASSIGN_RIDER':
        showToast('FEEDO Dispatch is re-assigning closest partner...', 'success');
        handleIncomingAIResponse(`✓ Automated Dispatch has initiated priority re-assignment. A nearby courier within 1.2 km is being assigned to ensure the order is collected without delay.`);
        break;

      case 'CALL_RIDER':
        showToast('Connecting to masked partner bridge: +91 98*** **234', 'info');
        handleIncomingAIResponse(`Dialing delivery partner via masked privacy bridge. Please check your registered phone for the incoming call.`);
        break;

      case 'CALL_DISPATCH':
        showToast('Priority Dispatch Helpline: 1800-208-FEEDO', 'info');
        handleIncomingAIResponse(`Our Lead Dispatch Desk is on standby. You can reach Sandeep directly at **1800-208-FEEDO** (Ext 2).`);
        break;

      case 'REQUEST_CANCEL':
        handleIncomingAIResponse(`Please provide the Order ID you wish to cancel. If kitchen preparation has already started, full payout compensation will be credited to your account.`);
        break;

      case 'VIEW_ORDERS':
        onClose();
        setScreen('orders');
        break;

      case 'VIEW_EARNINGS':
        onClose();
        setScreen('earnings');
        break;

      case 'NAVIGATE_MENU':
        onClose();
        setScreen('menu');
        break;

      case 'TRACK_RIDER':
        handleSendMessage('Where is the delivery rider?');
        break;

      case 'CANCEL_POLICY':
        handleSendMessage('What is the order cancellation policy?');
        break;

      default:
        break;
    }
  };

  const quickPrompts = [
    { label: '🛵 Track Rider Delay', text: 'Where is the rider for my order?' },
    { label: '📦 Check Order Status', text: 'What is the status of my latest order?' },
    { label: '❌ Cancel Order Help', text: 'I need help cancelling an order' },
    { label: '💰 Settlement Payout', text: 'When is my daily settlement credited?' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-white rounded-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[560px] sm:h-[600px] animate-in zoom-in-95 duration-200">
        
        {/* ── Top Header ─────────────────────────────────────── */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-xs text-slate-950 shadow-sm">
              FD
            </div>
            <div>
              <h3 className="text-xs font-black text-white tracking-tight">FEEDO Dispatch Agent</h3>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online • Sandeep (Lead Dispatcher)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close ✕
          </button>
        </div>

        {/* ── Chat Messages Body ─────────────────────────────── */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#F8F9FA] text-xs">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[82%] p-3.5 rounded-2xl shadow-2xs leading-relaxed text-xs sm:text-[13px] ${
                      isAgent
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        : 'bg-[#FFC700] text-white font-medium rounded-2xl shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Order Data Card if attached */}
                    {msg.orderData && (
                      <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1">
                          <span className="font-mono">#{msg.orderData.id}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                            {msg.orderData.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          <strong>Customer:</strong> {msg.orderData.customerName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          <strong>Items:</strong> {msg.orderData.itemsSummary}
                        </p>
                        {msg.orderData.riderName && (
                          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <Bike className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{msg.orderData.riderName} ({msg.orderData.riderVehicle})</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons if attached */}
                    {msg.actionButtons && msg.actionButtons.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                        {msg.actionButtons.map((btn, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleActionButtonClick(btn.action, btn.orderId)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-[#FFC700] text-amber-900 hover:text-slate-950 border border-amber-200 text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <span>{btn.label}</span>
                            <ChevronRight className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 mt-1 text-right">
                      {msg.time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 font-medium ml-1.5">Sandeep is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Suggestion Prompts ───────────────────────── */}
        <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              className="shrink-0 px-2.5 py-1 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-full text-[10px] font-semibold transition-all active:scale-95 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Bottom Input Bar ───────────────────────────────── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message to support..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#FFC700] transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 shadow-md ${
              inputMessage.trim()
                ? 'bg-[#FFC700] hover:bg-amber-400 text-white cursor-pointer active:scale-95 shadow-amber-200'
                : 'bg-[#FFC700] opacity-90 text-white cursor-pointer shadow-amber-100'
            }`}
          >
            <Send className="w-4 h-4 ml-0.5 text-white" />
          </button>
        </form>

      </div>
    </div>
  );
};
export default FeedoDispatchAgentModal;

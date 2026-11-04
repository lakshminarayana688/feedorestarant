import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RestaurantDetails, VerificationDocument, RestaurantRegStatus } from '../types/restaurant';
import { Order, OrderStatus, DeliveryPartner, PaymentStatus } from '../types/order';
import { MenuItem } from '../types/menu';
import { ReviewItem, OfferItem, SettlementRecord } from '../types/extras';
import { initialDocuments, initialRestaurantDetails } from '../data/sampleData';
import { initialMenuItems } from '../data/initialMenu';
import { initialOrders } from '../data/initialOrders';
import { initialReviews, initialOffers, initialSettlements } from '../data/initialExtras';
import { soundEffects } from '../utils/audio';

import {
  AppMode,
  getAppMode,
  setAppMode as persistAppMode,
  isDemoMode as checkIsDemoMode,
  authService,
  restaurantService,
  menuService,
  orderService,
  deliveryService,
  paymentService,
  settlementService,
  notificationService,
  analyticsService,
  healthService,
  orderSoundService,
  pushNotificationService,
  OrderSoundSettings,
  loadDocumentsFromStorage,
  saveDocumentsToStorage,
  validateRequiredDocuments,
} from '../services';
import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabase';
import { generateUniquePickupCode } from '../utils/orderUtils';


export type ScreenName =
  | 'splash'
  | 'welcome'
  | 'terms'
  | 'privacy'
  | 'acceptance'
  | 'permissions'
  | 'onboarding'
  | 'login'
  | 'otp'
  | 'register'
  | 'documents'
  | 'verification_status'
  | 'approval'
  | 'setup'
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'earnings'
  | 'analytics'
  | 'reviews'
  | 'offers'
  | 'profile'
  | 'documents_compliance'
  | 'staff'
  | 'notifications_center'
  | 'inventory'
  | 'support'
  | 'settings'
  | 'admin';

export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF' | 'KITCHEN' | 'CASHIER' | 'ADMIN';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'AUTH' | 'ORDER' | 'PAYMENT' | 'DISPATCH' | 'KYC' | 'ADMIN';
  actor: string;
  actorRole: UserRole;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'ORDER' | 'RIDER' | 'PAYMENT' | 'REVIEW' | 'ALERT';
  read: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentScreen: ScreenName;
  setScreen: (screen: ScreenName) => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  
  // App Mode (DEMO vs PRODUCTION)
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isDemoMode: boolean;
  isPrototypeMode: boolean;
  
  restaurant: RestaurantDetails;
  updateRestaurant: (details: Partial<RestaurantDetails>) => void;
  documents: VerificationDocument[];
  updateDocument: (id: string, updates: Partial<VerificationDocument>) => void;
  submitDocumentsForVerification: () => void;
  simulateApproval: () => void;
  completeSetup: () => void;
  
  orders: Order[];
  incomingOrder: Order | null;
  setIncomingOrder: (order: Order | null) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  
  menuItems: MenuItem[];
  reviews: ReviewItem[];
  offers: OfferItem[];
  settlements: SettlementRecord[];
  
  notifications: AppNotification[];
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  markNotificationsAsRead: () => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  
  toasts: ToastMessage[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  
  viewMode: 'responsive' | 'mobile_frame';
  setViewMode: (mode: 'responsive' | 'mobile_frame') => void;
  isRiderSimulatorOpen: boolean;
  setIsRiderSimulatorOpen: (open: boolean) => void;
  isOfflineModalOpen: boolean;
  setIsOfflineModalOpen: (open: boolean) => void;
  isDatabaseModalOpen: boolean;
  setIsDatabaseModalOpen: (open: boolean) => void;
  isDownloadModalOpen: boolean;
  setIsDownloadModalOpen: (open: boolean) => void;
  isSignOutModalOpen: boolean;
  setIsSignOutModalOpen: (open: boolean) => void;
  confirmSignOut: () => Promise<void>;
  toggleOnlineStatus: () => void;
  isSupabaseLive: boolean;
  isLoading: boolean;
  
  // Order Lifecycle
  simulateNewIncomingOrder: () => void;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  startPreparingOrder: (orderId: string) => void;
  markFoodReady: (orderId: string) => void;
  assignRider: (orderId: string) => void;
  markRiderArrived: (orderId: string) => void;
  verifyPickup: (orderId: string, enteredCode?: string) => boolean;
  confirmHandover: (orderId: string) => void;
  startOutForDelivery: (orderId: string) => void;
  markDelivered: (orderId: string) => void;
  
  // Menu Actions
  addMenuItem: (item: Omit<MenuItem, 'id' | 'rating' | 'votes'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  duplicateMenuItem: (id: string) => void;
  
  // Extra Actions
  addReviewReply: (reviewId: string, replyText: string) => void;
  createOffer: (offer: Omit<OfferItem, 'id' | 'totalRedemptions'>) => void;
  // Audio Alert Controls
  orderSoundSettings: OrderSoundSettings;
  updateOrderSoundSettings: (settings: Partial<OrderSoundSettings>) => void;
  isAudioUnlocked: boolean;
  unlockAudio: () => Promise<boolean>;
  testOrderSound: () => void;
  stopOrderSound: () => void;

  // Reset
  resetAllDemoData: () => void;
  refreshData: () => Promise<void>;

  // Admin & Dispatch Platform Operations
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  adminApproveRestaurant: () => void;
  adminSuspendRestaurant: (suspend: boolean) => void;
  adminUpdateCommissionRate: (rate: number) => void;
  adminForceOrderStatus: (orderId: string, status: OrderStatus) => void;
  adminReleaseSettlement: (settlementId: string) => void;
}


const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: 'Today, 10:15 AM',
    action: 'RESTAURANT_REGISTERED',
    category: 'AUTH',
    actor: 'Lakshmi Narayana',
    actorRole: 'OWNER',
    details: 'New merchant account registered with +91 98765 43210',
    status: 'SUCCESS',
  },
  {
    id: 'audit-002',
    timestamp: 'Today, 10:24 AM',
    action: 'KYC_DOCUMENTS_SUBMITTED',
    category: 'KYC',
    actor: 'Lakshmi Narayana',
    actorRole: 'OWNER',
    details: 'Uploaded 5 compliance documents: FSSAI, PAN, GST, Cheque, Photos',
    status: 'SUCCESS',
  },
  {
    id: 'audit-003',
    timestamp: 'Today, 10:30 AM',
    action: 'STORE_KYC_APPROVED',
    category: 'ADMIN',
    actor: 'FEEDO Ops Lead',
    actorRole: 'ADMIN',
    details: 'FSSAI License #21223004000891 verified against government portal',
    status: 'SUCCESS',
  },
  {
    id: 'audit-004',
    timestamp: 'Today, 11:00 AM',
    action: 'STORE_ONLINE',
    category: 'ADMIN',
    actor: 'Lakshmi Narayana',
    actorRole: 'OWNER',
    details: 'Kitchen status transitioned to ONLINE accepting orders',
    status: 'SUCCESS',
  },
  {
    id: 'audit-005',
    timestamp: 'Today, 12:45 PM',
    action: 'PAYMENT_WEBHOOK_VERIFIED',
    category: 'PAYMENT',
    actor: 'Razorpay Gateway',
    actorRole: 'ADMIN',
    details: 'HMAC-SHA256 signature verified for order #FD1024',
    status: 'SUCCESS',
  },
  {
    id: 'audit-006',
    timestamp: 'Today, 01:10 PM',
    action: 'RIDER_ASSIGNED',
    category: 'DISPATCH',
    actor: 'FEEDO Dispatch Engine',
    actorRole: 'ADMIN',
    details: 'Assigned rider Arun Kumar (+91 98765 88991) to order #FD1024',
    status: 'SUCCESS',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppModeState] = useState<AppMode>(getAppMode());
  const isDemo = appMode === 'DEMO';
  const isPrototypeMode = isDemo;
  
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('OWNER');
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  
  // Restaurant data
  const [restaurant, setRestaurant] = useState<RestaurantDetails>(initialRestaurantDetails);
  const [documents, setDocuments] = useState<VerificationDocument[]>(initialDocuments);

  // Restore persisted documents from Supabase Storage / LocalStorage
  useEffect(() => {
    const restId = restaurant.id || initialRestaurantDetails.id || 'default';
    loadDocumentsFromStorage(restId, initialDocuments).then((loaded) => {
      if (loaded && loaded.length > 0) {
        setDocuments(loaded);
      }
    });
  }, [restaurant.id]);
  
  // Orders & Menu
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [offers, setOffers] = useState<OfferItem[]>(initialOffers);
  const [settlements, setSettlements] = useState<SettlementRecord[]>(initialSettlements);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  
  // UI States
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile_frame'>('responsive');
  const [isRiderSimulatorOpen, setIsRiderSimulatorOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(isSupabaseConfigured());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'notif-1', title: 'New Order Received', message: 'Order #FD10245 received from Rahul Kumar', time: '11:42 AM', type: 'ORDER', read: false },
    { id: 'notif-2', title: 'Rider Assigned', message: 'Arun Kumar is on his way to your restaurant', time: '11:45 AM', type: 'RIDER', read: false },
    { id: 'notif-3', title: 'Daily Settlement Processed', message: '₹14,207 transferred to HDFC Bank ****9921', time: '10:00 AM', type: 'PAYMENT', read: true },
  ]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sound Settings State
  const [orderSoundSettings, setOrderSoundSettings] = useState<OrderSoundSettings>(orderSoundService.getSettings());
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(orderSoundService.isAudioUnlocked());

  // Keep isAudioUnlocked state synchronized in real-time across user interactions
  useEffect(() => {
    const unsubscribe = orderSoundService.addUnlockListener((unlocked) => {
      setIsAudioUnlocked(unlocked);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const updateOrderSoundSettings = (updates: Partial<OrderSoundSettings>) => {
    orderSoundService.saveSettings(updates);
    setOrderSoundSettings(orderSoundService.getSettings());
    if (updates.enabled !== undefined) {
      updateRestaurant({ newOrderSound: updates.enabled });
    }
  };

  const unlockAudio = async () => {
    const success = await orderSoundService.unlockAudio();
    setIsAudioUnlocked(success);
    return success;
  };

  const testOrderSound = () => {
    unlockAudio();
    orderSoundService.testSound();
    showToast('🔔 Playing FEEDO order alert chime', 'info');
  };

  const stopOrderSound = useCallback(() => {
    orderSoundService.stopAlert();
  }, []);

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    persistAppMode(mode);
    showToast(`Switched to ${mode} MODE`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      time: 'Just now',
      type,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // --- DATA REFRESH FUNCTION ---
  const refreshData = useCallback(async () => {
    if (isDemo) {
      setOrders(initialOrders);
      orderSoundService.seedKnownOrderIds(initialOrders.map(o => o.id));
      setMenuItems(initialMenuItems);
      setSettlements(initialSettlements);
      setRestaurant(initialRestaurantDetails);
      return;
    }

    setIsLoading(true);
    try {
      const [restRes, ordersRes, menuRes, settRes] = await Promise.all([
        restaurantService.getRestaurant(restaurant.id),
        orderService.getOrders(restaurant.id),
        menuService.getMenuItems(restaurant.id),
        settlementService.getSettlements(restaurant.id),
      ]);

      if (restRes.success && restRes.data) setRestaurant(restRes.data);
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
        orderSoundService.seedKnownOrderIds(ordersRes.data.map(o => o.id));
      }
      if (menuRes.success && menuRes.data) setMenuItems(menuRes.data);
      if (settRes.success && settRes.data) setSettlements(settRes.data);
    } catch (err: any) {
      showToast('Could not refresh data from server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isDemo, restaurant.id]);

  // Initial load & seed known order IDs
  useEffect(() => {
    orderSoundService.seedKnownOrderIds(initialOrders.map(o => o.id));
    if (!isDemo && isSupabaseConfigured()) {
      refreshData();
    }
  }, [isDemo, refreshData]);


  // --- REALTIME SUBSCRIPTION VIA SERVICE LAYER ---
  useEffect(() => {
    if (isDemo || !isSupabaseConfigured()) {
      setIsSupabaseLive(false);
      return;
    }

    setIsSupabaseLive(true);

    const unsubscribe = orderService.subscribeToOrders(
      restaurant.id || '',
      (newOrderRow) => {
        const newOrder: Order = {
          id: newOrderRow.id,
          customer: {
            name: newOrderRow.customer_name_snapshot || 'Customer',
            phoneMasked: newOrderRow.customer_phone_masked || '+91 98*** **123',
            address: newOrderRow.customer_address_snapshot || 'Bengaluru',
            area: 'Nearby',
            distanceKm: 2.4,
            orderCount: 1,
          },
          items: [
            {
              id: 'supa-item-1',
              name: 'Customer Selected Dish',
              category: 'Main Course',
              price: Number(newOrderRow.subtotal) || 280,
              quantity: 1,
              isVeg: true,
            },
          ],
          subtotal: Number(newOrderRow.subtotal) || 280,
          deliveryFee: Number(newOrderRow.delivery_fee) || 40,
          platformFee: Number(newOrderRow.platform_fee) || 10,
          taxes: Number(newOrderRow.tax) || 18,
          discount: Number(newOrderRow.discount) || 0,
          total: Number(newOrderRow.total_amount) || 348,
          paymentStatus: (newOrderRow.payment_status || 'PAID') as PaymentStatus,
          paymentMethod: newOrderRow.payment_method || 'UPI',
          status: 'RESTAURANT_ACCEPTED',
          specialInstructions: newOrderRow.special_instructions || '',
          pickupCode: newOrderRow.pickup_code || generateUniquePickupCode(orders),
          createdAt: 'Just now',
          acceptedAt: 'Just now',
          prepMinutes: newOrderRow.prep_minutes || 18,
          prepTargetMinutes: 20,
          packagingDone: false,
          timeline: [
            { status: 'CREATED', title: 'Order Placed', description: 'Customer created order in database', time: 'Just now', completed: true },
            { status: 'RESTAURANT_ACCEPTED', title: 'Order Assigned', description: 'Order assigned directly to restaurant', time: 'Just now', completed: true },
          ],
        };

        setOrders(prev => {
          if (prev.some(o => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });

        setIncomingOrder(newOrder);
        // Alert sound triggers when order is assigned to this restaurant
        orderSoundService.playOrderAssignedSound(newOrder.id);
        addNotification('Order Assigned to Restaurant', `Order #${newOrder.id} from ${newOrder.customer.name}`, 'ORDER');
        showToast(`⚡ Order #${newOrder.id} assigned to your restaurant!`, 'success');
      },

      (updatedRow) => {
        if (updatedRow.restaurant_id && restaurant.id && updatedRow.restaurant_id !== restaurant.id) {
          return;
        }

        setOrders(prev => {
          const exists = prev.some(o => o.id === updatedRow.id);
          // If order is newly assigned to this restaurant
          if (!exists && ['CREATED', 'PLACED', 'PAYMENT_CONFIRMED', 'ASSIGNED'].includes(updatedRow.status)) {
            const assignedOrder: Order = {
              id: updatedRow.id,
              customer: {
                name: updatedRow.customer_name_snapshot || 'Customer',
                phoneMasked: updatedRow.customer_phone_masked || '+91 98*** **123',
                address: updatedRow.customer_address_snapshot || 'Bengaluru',
                area: 'Nearby',
                distanceKm: 2.4,
                orderCount: 1,
              },
              items: [
                {
                  id: 'supa-item-assigned',
                  name: 'Customer Selected Dish',
                  category: 'Main Course',
                  price: Number(updatedRow.subtotal) || 280,
                  quantity: 1,
                  isVeg: true,
                },
              ],
              subtotal: Number(updatedRow.subtotal) || 280,
              deliveryFee: Number(updatedRow.delivery_fee) || 40,
              platformFee: Number(updatedRow.platform_fee) || 10,
              taxes: Number(updatedRow.tax) || 18,
              discount: Number(updatedRow.discount) || 0,
              total: Number(updatedRow.total_amount) || 348,
              paymentStatus: (updatedRow.payment_status || 'PAID') as PaymentStatus,
              paymentMethod: updatedRow.payment_method || 'UPI',
              status: 'RESTAURANT_ACCEPTED',
              specialInstructions: updatedRow.special_instructions || '',
              pickupCode: updatedRow.pickup_code || generateUniquePickupCode(orders),
              createdAt: 'Just now',
              acceptedAt: 'Just now',
              prepMinutes: updatedRow.prep_minutes || 18,
              prepTargetMinutes: 20,
              packagingDone: false,
              timeline: [
                { status: 'CREATED', title: 'Order Placed', description: 'Order created', time: 'Just now', completed: true },
                { status: 'RESTAURANT_ACCEPTED', title: 'Order Assigned', description: 'Order assigned directly to restaurant in database', time: 'Just now', completed: true },
              ],
            };

            setIncomingOrder(assignedOrder);
            orderSoundService.playOrderAssignedSound(assignedOrder.id);
            addNotification('Order Assigned to Restaurant', `Order #${assignedOrder.id} from ${assignedOrder.customer.name}`, 'ORDER');
            showToast(`🔔 Order #${assignedOrder.id} assigned to your restaurant!`, 'success');
            return [assignedOrder, ...prev];
          }

          return prev.map(o => (o.id === updatedRow.id ? { ...o, status: updatedRow.status as OrderStatus } : o));
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isDemo, restaurant.id, restaurant.newOrderSound]);

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notificationService.markAllAsRead();
  };

  const updateRestaurant = async (details: Partial<RestaurantDetails>) => {
    setRestaurant(prev => ({ ...prev, ...details }));
    if (!isDemo && restaurant.id) {
      await restaurantService.updateRestaurant(restaurant.id, details as any);
    }
  };

  const updateDocument = (id: string, updates: Partial<VerificationDocument>) => {
    setDocuments(prev => {
      const updated = prev.map(doc => doc.id === id ? { ...doc, ...updates } : doc);
      saveDocumentsToStorage(restaurant.id || initialRestaurantDetails.id || 'default', updated);
      return updated;
    });
  };

  const submitDocumentsForVerification = async (): Promise<boolean> => {
    const { isValid, missingNames } = validateRequiredDocuments(documents);
    if (!isValid) {
      showToast(`Please upload required documents: ${missingNames.join(', ')}`, 'error');
      return false;
    }

    const updated = documents.map(doc => ({ ...doc, status: 'UNDER_REVIEW' as const }));
    setDocuments(updated);
    saveDocumentsToStorage(restaurant.id || initialRestaurantDetails.id || 'default', updated);
    setRestaurant(prev => ({ ...prev, regStatus: 'UNDER_REVIEW' }));

    const client = getSupabaseClient();
    if (client && isSupabaseConfigured() && restaurant.id) {
      try {
        await client
          .from('restaurant_documents')
          .update({ status: 'UNDER_REVIEW' })
          .eq('restaurant_id', restaurant.id);
      } catch (e) {
        console.warn('Supabase documents update status error:', e);
      }
    }

    if (!isDemo && restaurant.id) {
      await restaurantService.submitKyc({
        restaurant_id: restaurant.id,
        pan_number: restaurant.panNumber,
        gst_number: restaurant.gstNumber,
        fssai_number: restaurant.fssaiNumber,
      });

      await restaurantService.updateBankAccount({
        restaurant_id: restaurant.id,
        account_holder_name: restaurant.ownerName,
        bank_name: restaurant.bankName,
        account_number: restaurant.bankAccount,
        ifsc_code: restaurant.ifscCode,
      });
    }

    showToast('Documents submitted for FEEDO verification', 'success');
    setCurrentScreen('verification_status');
    return true;
  };

  const simulateApproval = () => {
    setDocuments(prev => prev.map(doc => ({ ...doc, status: 'VERIFIED' })));
    setRestaurant(prev => ({ ...prev, regStatus: 'APPROVED' }));
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    soundEffects.playSuccessHandoverTone();
    showToast('Congratulations! Restaurant approved by FEEDO', 'success');
    setCurrentScreen('approval');
  };

  const completeSetup = () => {
    setRestaurant(prev => ({ ...prev, regStatus: 'ACTIVE', isOnline: true }));
    showToast('Setup complete! Restaurant is now ONLINE', 'success');
    setCurrentScreen('dashboard');
  };

  const toggleOnlineStatus = async () => {
    if (!['OWNER', 'MANAGER', 'ADMIN'].includes(currentUserRole)) {
      showToast('Permission denied: Only Owner, Manager or Admin can change kitchen online status', 'error');
      return;
    }

    if (restaurant.regStatus === 'UNDER_REVIEW') {
      showToast('Cannot switch ONLINE: Restaurant KYC is under verification review by FEEDO compliance team', 'warning');
      return;
    }

    if (restaurant.isOnline) {
      setIsOfflineModalOpen(true);
    } else {
      setRestaurant(prev => ({ ...prev, isOnline: true }));
      showToast('Kitchen is now ONLINE and actively accepting orders', 'success');
      if (restaurant.newOrderSound) soundEffects.playAcceptTone();

      if (!isDemo && restaurant.id) {
        await restaurantService.updateRestaurant(restaurant.id, { is_online: true });
      }
    }
  };

  // --- ORDER LIFECYCLE MANAGEMENT ---

  const simulateNewIncomingOrder = () => {
    if (!restaurant.isOnline) {
      showToast('Restaurant is currently OFFLINE. Switch to Online to receive orders.', 'warning');
      return;
    }

    const newId = 'FD' + Math.floor(10246 + Math.random() * 800);
    const mockOrder: Order = {
      id: newId,
      customer: {
        name: 'Rahul Kumar',
        phoneMasked: '+91 98*** **234',
        address: 'Flat 402, Green Glen Layout, Bellandur',
        area: 'Bellandur (3.2 km)',
        distanceKm: 3.2,
        orderCount: 14,
      },
      items: [
        {
          id: 'item-1',
          name: 'Chicken Dum Biryani',
          category: 'Biryani',
          price: 180,
          quantity: 2,
          isVeg: false,
          notes: 'Less spicy, extra raita',
          imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
        },
        {
          id: 'item-11',
          name: 'Chilled Coke (750ml)',
          category: 'Beverages',
          price: 40,
          quantity: 1,
          isVeg: true,
          imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=200&q=80',
        },
      ],
      subtotal: 400,
      deliveryFee: 40,
      platformFee: 10,
      taxes: 20,
      discount: 0,
      total: 470,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI (Google Pay)',
      status: 'RESTAURANT_ACCEPTED',
      specialInstructions: 'Less spicy, please pack extra spoons and napkins.',
      pickupCode: generateUniquePickupCode(orders),
      createdAt: 'Just now',
      acceptedAt: 'Just now',
      prepMinutes: 18,
      prepTargetMinutes: 20,
      packagingDone: false,
      timeline: [
        { status: 'CREATED', title: 'Order Placed', description: 'Customer placed order with online payment', time: 'Just now', completed: true },
        { status: 'PAYMENT_CONFIRMED', title: 'Payment Confirmed', description: 'Paid ₹470 via UPI', time: 'Just now', completed: true },
        { status: 'RESTAURANT_ACCEPTED', title: 'Order Assigned', description: 'Order assigned directly to restaurant', time: 'Just now', completed: true },
      ],
    };

    setOrders(prev => {
      if (prev.some(o => o.id === mockOrder.id)) return prev;
      return [mockOrder, ...prev];
    });

    setIncomingOrder(mockOrder);
    // Distinct order assigned alert sound with duplicate tracking & immediate audio unlock
    orderSoundService.unlockAudio();
    orderSoundService.playOrderAssignedSound(mockOrder.id);
    addNotification('Order Assigned to Restaurant', `Order #${mockOrder.id} from ${mockOrder.customer.name}`, 'ORDER');
    showToast(`🔔 Order #${mockOrder.id} assigned to your restaurant!`, 'success');
  };

  const acceptOrder = async (orderId: string) => {
    orderSoundService.stopAlert();
    let orderToAccept = incomingOrder && incomingOrder.id === orderId ? incomingOrder : orders.find(o => o.id === orderId);
    if (!orderToAccept) return;

    const acceptedOrder: Order = {
      ...orderToAccept,
      status: 'RESTAURANT_ACCEPTED',
      acceptedAt: 'Just now',
      timeline: [
        ...orderToAccept.timeline,
        { status: 'RESTAURANT_ACCEPTED', title: 'Order Accepted', description: 'Restaurant accepted order', time: 'Just now', completed: true }
      ]
    };

    setOrders(prev => {
      const exists = prev.some(o => o.id === orderId);
      if (exists) {
        return prev.map(o => o.id === orderId ? acceptedOrder : o);
      }
      return [acceptedOrder, ...prev];
    });

    if (incomingOrder?.id === orderId) setIncomingOrder(null);
    if (selectedOrder?.id === orderId) setSelectedOrder(acceptedOrder);

    if (restaurant.newOrderSound) soundEffects.playAcceptTone();
    showToast(`Order #${orderId} accepted. Start preparing!`, 'success');

    await orderService.updateOrderStatus(orderId, restaurant.id || '', 'ACCEPTED');
  };

  const rejectOrder = async (orderId: string, reason: string) => {
    orderSoundService.stopAlert();
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'RESTAURANT_REJECTED' as OrderStatus,
          rejectionReason: reason,
          timeline: [
            ...o.timeline,
            { status: 'RESTAURANT_REJECTED' as OrderStatus, title: 'Order Rejected', description: `Reason: ${reason}`, time: 'Just now', completed: true }
          ]
        };
      }
      return o;
    });

    setOrders(updated);
    if (incomingOrder?.id === orderId) setIncomingOrder(null);

    if (selectedOrder?.id === orderId) setSelectedOrder(null);

    soundEffects.playRejectTone();
    showToast(`Order #${orderId} rejected: ${reason}`, 'warning');
    addNotification('Order Rejected', `Order #${orderId} rejected (${reason})`, 'ALERT');

    await orderService.updateOrderStatus(orderId, restaurant.id || '', 'REJECTED', undefined, reason);
  };

  const startPreparingOrder = async (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated: Order = {
          ...o,
          status: 'PREPARING',
          prepStartedAt: 'Just now',
          timeline: [
            ...o.timeline,
            { status: 'PREPARING', title: 'Kitchen Preparing', description: 'Chefs started cooking', time: 'Just now', completed: true, current: true }
          ]
        };
        if (selectedOrder?.id === orderId) setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    if (restaurant.newOrderSound) soundEffects.playAcceptTone();
    showToast(`Order #${orderId} is now PREPARING`, 'info');

    await orderService.updateOrderStatus(orderId, restaurant.id || '', 'PREPARING');

    // Auto simulate rider assignment after 4 seconds in demo mode
    if (isDemo) {
      setTimeout(() => {
        assignRider(orderId);
      }, 4000);
    }
  };

  const assignRider = async (orderId: string) => {
    const riderRes = await deliveryService.assignRider(orderId);
    const rider = riderRes.data || {
      id: 'rider-arun',
      name: 'Arun Kumar',
      phoneMasked: '+91 91*** **890',
      vehicleNumber: 'KA 05 AB 1234',
      vehicleModel: 'Hero Splendor (Black)',
      rating: 4.8,
      distanceKm: 1.2,
      etaMinutes: 6,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated: Order = {
          ...o,
          rider,
          deliveryState: 'RIDER_ASSIGNED',
          riderAssignedAt: 'Just now',
          timeline: [
            ...o.timeline,
            { status: 'RIDER_ASSIGNED', title: 'Delivery Partner Assigned', description: `${rider.name} assigned (1.2 km away)`, time: 'Just now', completed: true }
          ]
        };
        if (selectedOrder?.id === orderId) setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    addNotification('Delivery Partner Assigned', `${rider.name} assigned to Order #${orderId}`, 'RIDER');
    showToast(`Delivery partner ${rider.name} assigned for #${orderId}`, 'info');
  };

  const markFoodReady = async (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated: Order = {
          ...o,
          status: 'READY_FOR_PICKUP',
          readyAt: 'Just now',
          packagingDone: true,
          timeline: [
            ...o.timeline,
            { status: 'READY_FOR_PICKUP', title: 'Food Ready', description: 'Food packed and ready at counter', time: 'Just now', completed: true, current: true }
          ]
        };
        if (selectedOrder?.id === orderId) setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    if (restaurant.newOrderSound) soundEffects.playFoodReadyTone();
    showToast(`Order #${orderId} marked FOOD READY! Waiting for pickup.`, 'success');
    addNotification('Food Ready for Pickup', `Order #${orderId} is packed & ready`, 'ORDER');

    await orderService.updateOrderStatus(orderId, restaurant.id || '', 'READY_FOR_PICKUP');
  };

  const markRiderArrived = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated: Order = {
          ...o,
          deliveryState: 'RIDER_ARRIVED',
          status: o.status === 'READY_FOR_PICKUP' ? 'RIDER_ARRIVED' : o.status,
          riderArrivedAt: 'Just now',
          timeline: [
            ...o.timeline,
            { status: 'RIDER_ARRIVED', title: 'Rider Arrived', description: 'Delivery partner arrived at restaurant counter', time: 'Just now', completed: true }
          ]
        };
        if (selectedOrder?.id === orderId) setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    if (restaurant.newOrderSound) soundEffects.playRiderArrivedTone();
    showToast(`Delivery partner arrived for #${orderId}!`, 'info');
    addNotification('Delivery Partner Arrived', `Delivery partner is at the counter for #${orderId}`, 'RIDER');
  };

  const verifyPickup = (orderId: string, enteredCode?: string): boolean => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    const cleanEntered = (enteredCode || '').trim();
    const cleanExpected = (order.pickupCode || '').trim();

    if (!cleanEntered) {
      showToast('INVALID PICKUP CODE: Please enter the 4-digit code.', 'error');
      return false;
    }

    if (cleanEntered.length !== 4 || cleanEntered !== cleanExpected) {
      showToast('INVALID PICKUP CODE. Please verify with delivery partner.', 'error');
      return false;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated: Order = {
          ...o,
          status: 'PICKED_UP',
          deliveryState: 'HANDOVER_COMPLETED',
          pickedUpAt: nowTime,
          timeline: [
            ...o.timeline,
            { status: 'PICKUP_VERIFIED', title: 'Pickup Code Verified', description: `4-digit code ${o.pickupCode} verified successfully`, time: nowTime, completed: true },
            { status: 'PICKED_UP', title: 'Order Picked Up', description: 'Order handed over to delivery partner', time: nowTime, completed: true }
          ]
        };
        if (selectedOrder?.id === orderId) setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    // Dispatch background sync to backend & Edge functions
    deliveryService.verifyPickupCode(orderId, cleanEntered, restaurant.id, cleanExpected).catch(() => {});
    orderService.updateOrderStatus(orderId, restaurant.id || '', 'PICKED_UP', cleanEntered).catch(() => {});

    soundEffects.playSuccessHandoverTone();
    showToast(`✓ Pickup code verified for Order #${orderId}! Status updated to Picked Up.`, 'success');
    addNotification('Order Picked Up', `Delivery partner verified code and picked up Order #${orderId}`, 'RIDER');
    return true;
  };

  const confirmHandover = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated: Order = {
          ...o,
          status: 'PICKED_UP',
          deliveryState: 'HANDOVER_COMPLETED',
          pickedUpAt: 'Just now',
          timeline: [
            ...o.timeline,
            { status: 'PICKED_UP', title: 'Handover Completed', description: 'Order handed over to delivery partner', time: 'Just now', completed: true }
          ]
        };
        if (selectedOrder?.id === orderId) setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    soundEffects.playSuccessHandoverTone();
    showToast(`Order #${orderId} Handover Complete!`, 'success');

    await orderService.updateOrderStatus(orderId, restaurant.id || '', 'PICKED_UP', order?.pickupCode);
  };

  const startOutForDelivery = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated: Order = {
          ...o,
          status: 'OUT_FOR_DELIVERY',
          outForDeliveryAt: 'Just now',
          timeline: [
            ...o.timeline,
            { status: 'OUT_FOR_DELIVERY', title: 'Out For Delivery', description: 'Rider on the way to customer location', time: 'Just now', completed: true, current: true }
          ]
        };
        if (selectedOrder?.id === orderId) setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    showToast(`Order #${orderId} is now OUT FOR DELIVERY!`, 'info');
  };

  const markDelivered = async (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated: Order = {
          ...o,
          status: 'DELIVERED',
          deliveredAt: 'Just now',
          timeline: [
            ...o.timeline,
            { status: 'DELIVERED', title: 'Order Delivered', description: 'Delivered successfully to customer', time: 'Just now', completed: true }
          ]
        };
        if (selectedOrder?.id === orderId) setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    showToast(`Order #${orderId} delivered to customer!`, 'success');
    addNotification('Order Delivered', `Order #${orderId} successfully delivered`, 'ORDER');

    await orderService.updateOrderStatus(orderId, restaurant.id || '', 'DELIVERED');
  };

  // --- MENU ACTIONS ---

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'rating' | 'votes'>) => {
    const res = await menuService.addMenuItem(restaurant.id || '', item);
    if (res.success && res.data) {
      setMenuItems(prev => [res.data!, ...prev]);
      showToast(`"${res.data.name}" added to menu successfully`, 'success');
    } else {
      showToast(res.error?.message || 'Failed to add menu item', 'error');
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    await menuService.updateMenuItem(id, updates);
    showToast('Menu item updated successfully', 'success');
  };

  const deleteMenuItem = async (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    await menuService.deleteMenuItem(id);
    showToast('Menu item deleted', 'info');
  };

  const toggleItemAvailability = async (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    const nextState = !item.isAvailable;

    setMenuItems(prev => prev.map(it => it.id === id ? { ...it, isAvailable: nextState } : it));
    showToast(`"${item.name}" is now ${nextState ? 'IN STOCK' : 'OUT OF STOCK'}`, nextState ? 'success' : 'warning');
    await menuService.updateMenuItem(id, { isAvailable: nextState });
  };

  const duplicateMenuItem = async (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    const duplicated: MenuItem = {
      ...item,
      name: `${item.name} (Copy)`,
    };
    await addMenuItem(duplicated);
  };

  // --- REVIEWS & OFFERS ---

  const addReviewReply = (reviewId: string, replyText: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          reply: {
            text: replyText,
            repliedAt: 'Just now',
          }
        };
      }
      return r;
    }));
    showToast('Reply published to customer', 'success');
  };

  const createOffer = (offer: Omit<OfferItem, 'id' | 'totalRedemptions'>) => {
    const newOffer: OfferItem = {
      ...offer,
      id: 'off-' + Date.now(),
      totalRedemptions: 0,
    };
    setOffers(prev => [newOffer, ...prev]);
    showToast(`Offer coupon "${newOffer.code}" created!`, 'success');
  };

  const toggleOfferActive = (offerId: string) => {
    setOffers(prev => prev.map(off => {
      if (off.id === offerId) {
        const next = !off.isActive;
        showToast(`Offer ${off.code} is now ${next ? 'ACTIVE' : 'PAUSED'}`, 'info');
        return { ...off, isActive: next };
      }
      return off;
    }));
  };

  // --- ADMIN OPERATIONS ---

  const addAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  }, []);

  const adminApproveRestaurant = useCallback(() => {
    setRestaurant((prev) => ({
      ...prev,
      regStatus: 'ACTIVE',
      isOnline: true,
      isSuspended: false,
    }));
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        status: 'VERIFIED' as const,
      }))
    );
    addAuditLog({
      action: 'RESTAURANT_KYC_APPROVED',
      category: 'ADMIN',
      actor: 'FEEDO Super Admin',
      actorRole: 'ADMIN',
      details: 'All merchant compliance documents verified and store status activated.',
      status: 'SUCCESS',
    });
    showToast('🛡️ Restaurant KYC & Store Approved by Super Admin!', 'success');
  }, [addAuditLog, showToast]);

  const adminSuspendRestaurant = useCallback((suspend: boolean) => {
    setRestaurant((prev) => ({
      ...prev,
      isSuspended: suspend,
      isOnline: suspend ? false : prev.isOnline,
    }));
    addAuditLog({
      action: suspend ? 'RESTAURANT_SUSPENDED' : 'RESTAURANT_REACTIVATED',
      category: 'ADMIN',
      actor: 'FEEDO Operations Admin',
      actorRole: 'ADMIN',
      details: suspend ? 'Store suspended due to compliance review or maintenance.' : 'Store suspension lifted.',
      status: suspend ? 'WARNING' : 'SUCCESS',
    });
    showToast(
      suspend ? '⚠️ Restaurant has been SUSPENDED by Admin' : '✅ Restaurant reactivated by Admin',
      suspend ? 'warning' : 'success'
    );
  }, [addAuditLog, showToast]);

  const adminUpdateCommissionRate = useCallback((rate: number) => {
    setRestaurant((prev) => ({ ...prev, commissionRate: rate }));
    addAuditLog({
      action: 'COMMISSION_RATE_UPDATED',
      category: 'ADMIN',
      actor: 'FEEDO Finance Admin',
      actorRole: 'ADMIN',
      details: `Platform commission rate adjusted to ${rate}%.`,
      status: 'SUCCESS',
    });
    showToast(`Platform commission rate updated to ${rate}%`, 'info');
  }, [addAuditLog, showToast]);

  const adminForceOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            deliveredAt: status === 'DELIVERED' ? new Date().toISOString() : o.deliveredAt,
            pickedUpAt: status === 'PICKED_UP' ? new Date().toISOString() : o.pickedUpAt,
            acceptedAt: status === 'ACCEPTED' || status === 'RESTAURANT_ACCEPTED' ? new Date().toISOString() : o.acceptedAt,
          };
        }
        return o;
      })
    );
    addAuditLog({
      action: `ORDER_OVERRIDE_${status}`,
      category: 'ORDER',
      actor: 'FEEDO Dispatch Admin',
      actorRole: 'ADMIN',
      details: `Admin forcefully transitioned order #${orderId} to ${status}.`,
      status: 'SUCCESS',
    });
    showToast(`Order #${orderId} status updated to ${status}`, 'success');
  }, [addAuditLog, showToast]);

  const adminReleaseSettlement = useCallback((settlementId: string) => {
    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === settlementId) {
          return {
            ...s,
            status: 'SETTLED' as const,
            payoutRef: s.payoutRef.startsWith('UTR-') && !s.payoutRef.includes('PENDING') ? s.payoutRef : `UTR-INSTANT-${Date.now().toString().slice(-6)}`,
          };
        }
        return s;
      })
    );
    addAuditLog({
      action: 'SETTLEMENT_RELEASED',
      category: 'PAYMENT',
      actor: 'FEEDO Payout Engine',
      actorRole: 'ADMIN',
      details: `Immediate settlement released for batch ${settlementId}.`,
      status: 'SUCCESS',
    });
    showToast(`Settlement ${settlementId} released and marked SETTLED`, 'success');
  }, [addAuditLog, showToast]);

  // --- RESET ALL DATA ---

  const resetAllDemoData = () => {
    setRestaurant(initialRestaurantDetails);
    setDocuments(initialDocuments);
    setOrders(initialOrders);
    setMenuItems(initialMenuItems);
    setReviews(initialReviews);
    setOffers(initialOffers);
    setSettlements(initialSettlements);
    setAuditLogs(initialAuditLogs);
    setIncomingOrder(null);
    setSelectedOrder(null);
    setCurrentScreen('dashboard');
    showToast('Demo data reset to default state', 'info');
  };

  const confirmSignOut = async () => {
    try {
      await authService.logout();
      if (restaurant?.id) {
        await pushNotificationService.removeTokenOnLogout(restaurant.id);
      }
    } catch (err) {
      console.warn('Error during sign out:', err);
    } finally {
      setIsSignOutModalOpen(false);
      showToast('Signed out successfully', 'info');
      setCurrentScreen('login');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setScreen: setCurrentScreen,
        currentUserRole,
        setCurrentUserRole,
        appMode,
        setAppMode,
        isDemoMode: isDemo,
        isPrototypeMode,
        restaurant,
        updateRestaurant,
        documents,
        updateDocument,
        submitDocumentsForVerification,
        simulateApproval,
        completeSetup,
        orders,
        incomingOrder,
        setIncomingOrder,
        selectedOrder,
        setSelectedOrder,
        menuItems,
        reviews,
        offers,
        settlements,
        notifications,
        isNotificationsOpen,
        setIsNotificationsOpen,
        markNotificationsAsRead,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        toasts,
        showToast,
        viewMode,
        setViewMode,
        isRiderSimulatorOpen,
        setIsRiderSimulatorOpen,
        isOfflineModalOpen,
        setIsOfflineModalOpen,
        isDatabaseModalOpen,
        setIsDatabaseModalOpen,
        isDownloadModalOpen,
        setIsDownloadModalOpen,
        isSignOutModalOpen,
        setIsSignOutModalOpen,
        confirmSignOut,
        toggleOnlineStatus,
        isSupabaseLive,
        isLoading,
        simulateNewIncomingOrder,
        acceptOrder,
        rejectOrder,
        startPreparingOrder,
        markFoodReady,
        assignRider,
        markRiderArrived,
        verifyPickup,
        confirmHandover,
        startOutForDelivery,
        markDelivered,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,

        duplicateMenuItem,
        addReviewReply,
        createOffer,
        toggleOfferActive,
        orderSoundSettings,
        updateOrderSoundSettings,
        isAudioUnlocked,
        unlockAudio,
        testOrderSound,
        stopOrderSound,
        resetAllDemoData,
        refreshData,
        auditLogs,
        addAuditLog,
        adminApproveRestaurant,
        adminSuspendRestaurant,
        adminUpdateCommissionRate,
        adminForceOrderStatus,
        adminReleaseSettlement,
      }}


    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

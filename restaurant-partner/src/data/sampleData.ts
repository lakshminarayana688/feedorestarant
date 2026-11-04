import { RestaurantDetails, VerificationDocument } from '../types/restaurant';

export const initialDocuments: VerificationDocument[] = [
  {
    id: 'doc-fssai',
    name: 'FSSAI Certificate',
    description: '14-digit Food Safety and Standards Authority of India license',
    isRequired: true,
    status: 'NOT_UPLOADED',
  },
  {
    id: 'doc-aadhaar',
    name: 'Aadhaar Card',
    description: 'Proprietor or Authorized Signatory 12-digit UIDAI Aadhaar Card',
    isRequired: true,
    status: 'NOT_UPLOADED',
  },
  {
    id: 'doc-gst',
    name: 'GST Certificate',
    description: 'Goods and Services Tax registration document (Optional for small outlets)',
    isRequired: false,
    status: 'NOT_UPLOADED',
  },
  {
    id: 'doc-bank',
    name: 'Bank Passbook',
    description: 'First page copy of bank passbook with account number, name & IFSC',
    isRequired: true,
    status: 'NOT_UPLOADED',
  },
  {
    id: 'doc-address',
    name: 'Restaurant Address Proof',
    description: 'Electricity bill / Rent agreement / Trade license copy',
    isRequired: true,
    status: 'NOT_UPLOADED',
  },
  {
    id: 'doc-photos',
    name: 'Restaurant Photos (Kitchen & Facade)',
    description: 'Front signboard facade & clean kitchen hygiene photos',
    isRequired: true,
    status: 'NOT_UPLOADED',
  },
];

export const initialRestaurantDetails: RestaurantDetails = {
  id: 'a0000000-0000-0000-0000-000000000001',
  ownerName: 'Lakshmi Narayana',
  ownerPhone: '+91 98765 43210',
  ownerEmail: 'lucky.family.blr@feedopartner.com',
  altPhone: '+91 80 2553 4900',
  
  restaurantName: 'Lucky Family Restaurant',
  restaurantType: 'Restaurant',
  cuisines: ['Biryani', 'South Indian', 'North Indian', 'Chinese'],
  address: 'No. 42, 80 Feet Road, 4th Block, Koramangala',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560034',
  landmark: 'Opposite Sony World Signal',
  
  fssaiNumber: '21223004000891',
  panNumber: 'AABCL9921D',
  aadhaarNumber: 'XXXX-XXXX-9921',
  gstNumber: '29AABCL9921D1Z5',
  bankAccount: '•••• •••• •••• 9921',
  bankName: 'HDFC Bank Ltd',
  ifscCode: 'HDFC0000053',
  
  logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&h=200&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=400&q=80',
  description: 'Authentic Hyderabadi Dum Biryani, sizzling Tandoori starters, rich South Indian thalis and fresh culinary delicacies crafted with passion since 2012.',
  rating: 4.6,
  totalReviews: 1248,
  
  isOnline: true,
  autoAcceptOrders: true,
  newOrderSound: true,
  regStatus: 'APPROVED', // Default approved so demo opens ready, but can be switched with Demo Controller!
  commissionRate: 18,
  isSuspended: false,
  openingHours: [
    { day: 'Monday', isOpen: true, openTime: '11:00 AM', closeTime: '11:00 PM' },
    { day: 'Tuesday', isOpen: true, openTime: '11:00 AM', closeTime: '11:00 PM' },
    { day: 'Wednesday', isOpen: true, openTime: '11:00 AM', closeTime: '11:00 PM' },
    { day: 'Thursday', isOpen: true, openTime: '11:00 AM', closeTime: '11:00 PM' },
    { day: 'Friday', isOpen: true, openTime: '11:00 AM', closeTime: '11:30 PM' },
    { day: 'Saturday', isOpen: true, openTime: '11:00 AM', closeTime: '11:30 PM' },
    { day: 'Sunday', isOpen: true, openTime: '11:00 AM', closeTime: '11:30 PM' },
  ],
};

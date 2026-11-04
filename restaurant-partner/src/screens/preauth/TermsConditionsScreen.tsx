import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { legalService, LEGAL_VERSIONS } from '../../services/legalService';
import { PRIVACY_SECTIONS } from './PrivacyPolicyScreen';
import {
  Scale,
  FileText,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Search,
  BookOpen,
} from 'lucide-react';

export interface TermsSection {
  number: number;
  title: string;
  summary: string;
  content: string[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    number: 1,
    title: 'Introduction',
    summary: 'Binding merchant agreement between the Restaurant Partner and FEEDO Technologies Private Limited.',
    content: [
      'These Restaurant Partner Terms and Conditions ("Agreement") constitute a legally binding electronic agreement under the Information Technology Act, 2000, between the Restaurant Partner ("You", "Partner", "Merchant") and FEEDO Technologies Private Limited ("FEEDO", "We", "Us").',
      'By clicking "Continue", registering your restaurant, or accepting online orders through the FEEDO Partner Portal, You explicitly agree to comply with and be bound by all terms, policies, operational SLAs, and service agreements set forth herein.',
      'If You are entering into this Agreement on behalf of an incorporated entity, partnership, or proprietorship, You warrant that You hold the requisite legal power and authorization to bind that business entity to these terms.',
    ],
  },
  {
    number: 2,
    title: 'Eligibility and Account Registration',
    summary: 'Statutory qualifications, business entity verification, and authorized personnel declarations.',
    content: [
      'To register and operate as a Restaurant Partner on FEEDO, the business must be a legally recognized entity (Sole Proprietorship, Partnership Firm, LLP, Private Limited, or Public Company) validly existing under Indian laws.',
      'The Partner warrants that all information provided during digital registration, including trade names, kitchen addresses, ownership identities, contact details, and banking information, is accurate, truthful, and updated.',
      'FEEDO reserves the absolute right to reject onboarding applications or revoke account approval if registration details are found to be fraudulent, misleading, or in violation of applicable laws.',
    ],
  },
  {
    number: 3,
    title: 'Document Verification and KYC',
    summary: 'Mandatory PAN, Aadhaar guidelines, GSTIN, and business registration validations.',
    content: [
      'Statutory KYC Compliance: Every Partner must submit authentic documentation: (a) Permanent Account Number (PAN) of the proprietor or commercial entity; (b) Goods and Services Tax Identification Number (GSTIN) if statutorily registered; (c) Valid municipal trade license or business registration certificate; and (d) Proof of verified commercial address.',
      'Voluntary Aadhaar Masking: Where Aadhaar is provided for identity verification, the Partner must adhere to UIDAI guidelines by masking the first eight (8) digits. FEEDO systems automatically redact sensitive identifiers and maintain strict encryption standards.',
      'Document Re-verification: FEEDO reserves the right to request updated KYC documents periodically. Failure to furnish authentic records within forty-eight (48) hours of formal notice may result in temporary storefront deactivation.',
    ],
  },
  {
    number: 4,
    title: 'FSSAI and Food Business Compliance',
    summary: '14-digit FSSAI license mandate, display rules, renewal duties, and food safety standards.',
    content: [
      'Mandatory 14-Digit FSSAI License: The Partner warrants that it possesses an active, valid 14-digit FSSAI Registration or State/Central License under the Food Safety and Standards Act, 2006, covering the physical kitchen address listed on FEEDO.',
      'Continuous License Validity: The Partner is strictly responsible for renewing its FSSAI license prior to its expiry date. If an FSSAI license expires or is cancelled by regulatory authorities, FEEDO shall immediately suspend the Partner\'s listing without prior notice.',
      'Marketplace Display: The Partner agrees that FEEDO will display its 14-digit FSSAI license number and hygiene rating publicly on the consumer application alongside all menu listings.',
    ],
  },
  {
    number: 5,
    title: 'Restaurant Menu and Product Listing',
    summary: 'Accurate descriptions, allergen tags, price parity, and prohibited item restrictions.',
    content: [
      'Menu Accuracy: The Partner is solely responsible for listing item names, accurate food descriptions, pricing, portion sizes, dietary markers (Vegetarian, Non-Vegetarian, Vegan), and common allergen alerts.',
      'Price Parity: Prices displayed on FEEDO must not exceed the prices offered by the restaurant for offline dine-in or direct customer takeaway, save for reasonable, transparently disclosed packaging surcharges.',
      'Prohibited Items: The listing or delivery of tobacco, nicotine, unapproved intoxicants, wild game meat, raw milk, unpasteurized dairy, or any substance prohibited under Indian food safety statutes is strictly forbidden.',
    ],
  },
  {
    number: 6,
    title: 'Order Management and Acceptance',
    summary: 'Acceptance response SLAs, auto-rejection rules, and kitchen operational readiness.',
    content: [
      'Order Notification SLA: Upon notification of a new customer order via visual and audio alarms, the Partner agrees to accept or reject the order within three (3) minutes (180 seconds).',
      'Auto-Rejection: Orders not accepted within the SLA window will automatically be cancelled to prevent customer delay. High auto-rejection rates degrade restaurant algorithmic ranking and may trigger automated cooling periods.',
      'Kitchen Readiness: The Partner agrees to operate the kitchen actively during declared operating hours and update the app immediately if unexpected kitchen stockouts occur.',
    ],
  },
  {
    number: 7,
    title: 'Food Quality, Hygiene and Packaging',
    summary: 'Tamper-evident packaging, temperature integrity, spill resistance, and fresh preparation standards.',
    content: [
      'Fresh Preparation: Every order must be prepared fresh upon order receipt. Stale, reheated, contaminated, or adulterated food products are strictly prohibited and constitute a material breach of this Agreement.',
      'Tamper-Evident Packaging: The Partner agrees to package all food items in food-grade, spill-resistant, tamper-evident containers with security seals. If packaging fails due to substandard materials, the refund cost shall be debited to the Partner.',
      'Hygiene Protocols: Kitchen personnel must follow strict food safety procedures, including hair nets, sanitized cooking surfaces, and clean food prep zones as mandated by FSSAI Schedule 4 regulations.',
    ],
  },
  {
    number: 8,
    title: 'Order Preparation and Delivery Partner Handover',
    summary: 'Mandatory 4-digit pickup code verification, rider dispatch sync, and handover SLAs.',
    content: [
      'Food Ready Notification: Kitchen staff must tap "FOOD READY" on the partner device ONLY when the food parcel is completely cooked, packaged, sealed, and ready for immediate handover.',
      'Mandatory 4-Digit Pickup Code: Food packages must NEVER be released to any delivery rider without successful 4-digit code verification on the partner device. FEEDO shall not reimburse lost food parcels released without code authentication.',
      'Delivery Partner Handover SLA: The Partner agrees to hand over prepared parcels to arriving delivery riders within two (2) minutes of rider arrival, ensuring prompt customer dispatch.',
    ],
  },
  {
    number: 9,
    title: 'Commission and Service Charges',
    summary: 'FEEDO platform commission (20%–25%), separate 2% Razorpay payment gateway charge, and statutory GST.',
    content: [
      'In consideration of marketplace listing, algorithmic routing, delivery fleet orchestration, payment gateway access, and partner technology, FEEDO charges a platform service commission.\n\nThe agreed platform service commission shall range from 20% to 25%, depending on the restaurant\'s applicable partnership tier or as specified in the Merchant Agreement.\n\nThe commission is calculated on the net food bill, excluding government taxes and customer delivery fees.',
      'An additional 2% payment gateway processing charge shall apply to transactions processed through Razorpay, subject to the applicable payment processing agreement and actual charges levied by Razorpay.\n\nThis charge is separate from the FEEDO platform service commission.',
      'GST and other applicable statutory taxes shall be charged on the FEEDO platform service commission and payment gateway charges, as legally applicable.\n\nFEEDO will provide appropriate invoices with applicable tax details and input tax credit information wherever eligible under applicable GST laws.',
    ],
  },
  {
    number: 10,
    title: 'Payments and Restaurant Settlements',
    summary: 'Daily 10:00 AM IST payouts, Sunday & bank holiday carry-forwards, transparent deductions, and 2FA bank cooling.',
    content: [
      'Daily Settlement Cadence: Net accumulated earnings for fulfilled customer orders must be settled daily by 10:00 AM IST on the next business day, directly to the restaurant\'s verified primary bank account.',
      'Sundays – No Payouts: FEEDO must not process or release restaurant payouts on Sundays. Any payout scheduled for Sunday must be carried forward to the next available business day. Accumulated restaurant earnings remain completely safe and are automatically included in the next eligible settlement cycle.',
      'Bank Holidays – No Payouts: FEEDO must not process or release restaurant payouts on applicable bank holidays or public holidays when banking services are unavailable. If a scheduled payout falls on a bank holiday, it is carried forward to the next available business day. Accumulated earnings must not be cancelled, deducted or forfeited because of holidays, and payouts resume according to the normal settlement schedule on the next eligible business day.',
      'Settlement Calculation: Net Payout = Gross Food Order Revenue − FEEDO Platform Commission (20%–25%) − Razorpay Payment Gateway Charge (2%) − Applicable GST on charges − Applicable Statutory TCS/TDS Withholdings + Contractual Merchant Incentives/Credits. All applicable deductions and credits shall be displayed transparently in the partner settlement breakdown.',
      'Bank Account Changes: To prevent financial fraud: Changes to bank account numbers or IFSC details must require dual-factor authorization. Apply a mandatory 24-hour verification cooling period. Keep payouts to the newly updated account on hold until successful verification. Resume settlements according to the applicable business-day payout schedule.',
    ],
  },
  {
    number: 11,
    title: 'Refunds, Cancellations and Customer Complaints',
    summary: 'Fair resolution mechanisms, kitchen payout protections, and defective dish audits.',
    content: [
      '100% Kitchen Payout Guarantee: Once order preparation begins and is updated to "PREPARING", the Restaurant Partner is guaranteed full settlement for food preparation costs even if the customer cancels mid-transit.',
      'Defective Orders and Missing Items: Where a customer complaint regarding missing dishes, wrong items, or spoiled food is verified through photographs and rider dispatch audits, the refund cost for the defective portion will be debited from the merchant settlement ledger.',
      'Dispute Redressal: Partners have forty-eight (48) hours from statement generation to raise formal dispute tickets with FEEDO Merchant Support regarding any settlement deduction.',
    ],
  },
  {
    number: 12,
    title: 'Pricing, Taxes and Invoicing',
    summary: 'Price parity with dine-in menus, GST compliance, and e-invoicing standards.',
    content: [
      'Price Parity: The Restaurant Partner warrants that prices listed on the FEEDO marketplace do not unfairly exceed the dine-in or takeaway prices listed at the physical premises, subject to reasonable packaging surcharges.',
      'Tax Compliance: Restaurant Partners registered under GST must furnish their active GSTIN. FEEDO shall collect and remit Tax Collected at Source (TCS) under Section 52 of the CGST Act where statutory provisions apply.',
      'Customer Invoices: FEEDO generates system-standardized digital invoices to customers on behalf of the Partner detailing itemized food costs, applicable taxes, and restaurant GSTIN.',
    ],
  },
  {
    number: 13,
    title: 'Restaurant Responsibilities',
    summary: 'Operational readiness, staff conduct, kitchen maintenance, and equipment requirements.',
    content: [
      'The Partner agrees to maintain a reliable smartphone or POS tablet with active internet connectivity to run the FEEDO Partner App during all declared operating hours.',
      'Staff Conduct: Restaurant personnel must treat FEEDO delivery partners with courtesy, dignity, and promptness upon arrival. Discrimination, verbal abuse, or undue detention of delivery personnel is strictly prohibited.',
      'Operating Hours: The restaurant must ensure staff is present during all scheduled business hours published on the app to prevent unfulfilled incoming orders.',
    ],
  },
  {
    number: 14,
    title: 'Prohibited Activities',
    summary: 'Actions strictly barred including off-platform solicitations and fake reviews.',
    content: [
      'Off-Platform Solicitation: Restaurant staff shall not insert leaflets, business cards, or promotional flyers into FEEDO food parcels directing consumers to order directly or through rival portals.',
      'Review Manipulation: Partners shall not create fake customer orders, self-reviews, or artificially inflate ratings through illicit incentives.',
      'Unauthorized Re-packaging: Food parcels must not be combined or re-routed through unverified third-party couriers outside the FEEDO dispatch infrastructure.',
    ],
  },
  {
    number: 15,
    title: 'Customer Data and Privacy',
    summary: 'Customer data protection, masked communications, and strict non-disclosure obligations.',
    content: [
      'Customer Data Confidentiality: Restaurant Partners receive access to limited customer information (first name, partial address, dietary instructions) strictly to fulfill specific orders.',
      'Masked Telephony: Communication with customers must be conducted exclusively through FEEDO virtual telephone numbers with automatic call masking. Direct storage or harvesting of customer numbers is forbidden.',
      'Data Protection Compliance: Partners warrant strict compliance with the Digital Personal Data Protection Act, 2023, and agree to purge customer delivery records immediately after order delivery.',
    ],
  },
  {
    number: 16,
    title: 'Intellectual Property',
    summary: 'Trademarks, dish photos, restaurant branding, and mutual license grants.',
    content: [
      'License to FEEDO: The Partner grants FEEDO a royalty-free, worldwide license to display restaurant trade names, logos, menu descriptions, and food photographs on FEEDO platforms and marketing collateral.',
      'FEEDO Property: All software, algorithmic routing tools, user interfaces, logos, sounds, and partner application IP belong solely to FEEDO Technologies Private Limited.',
      'Infringement Protection: The Partner warrants that all trademarks and photographs furnished to FEEDO do not infringe any third-party intellectual property rights.',
    ],
  },
  {
    number: 17,
    title: 'Account Suspension and Termination',
    summary: 'Grounds for deactivation, notice periods, and post-termination settlement resolution.',
    content: [
      'Termination for Convenience: Either party may terminate this partnership by providing thirty (30) days written notice via official registered email.',
      'Immediate Suspension: FEEDO may immediately suspend or deactivate a Partner storefront for: (a) repeated food hygiene complaints or FSSAI license cancellation; (b) commercial fraud or payment tampering; (c) harassment of riders or customers; or (d) order auto-cancellation rates exceeding 15%.',
      'Post-Termination Reconciliation: Upon termination, FEEDO shall reconcile all outstanding order credits and transfer net payable balances within seven (7) business days.',
    ],
  },
  {
    number: 18,
    title: 'Limitation of Liability',
    summary: 'Statutory liability caps, indirect damage disclaimers, and platform availability thresholds.',
    content: [
      'Platform "As-Is": While FEEDO strives for 99.9% uptime, the platform is provided on an "as-is" and "as-available" basis without warranties against transient cellular network dropouts.',
      'Indirect Damages: In no event shall FEEDO be liable for indirect, incidental, punitive, or consequential damages, including loss of anticipated restaurant profits or business interruptions.',
      'Total Aggregate Liability: FEEDO\'s total aggregate liability for any direct claim arising under this agreement shall be limited to the total platform commission earned by FEEDO from the Partner in the thirty (30) days preceding the incident.',
    ],
  },
  {
    number: 19,
    title: 'Indemnification',
    summary: 'Merchant obligations protecting FEEDO against food safety claims, licensing flaws, and tax liabilities.',
    content: [
      'The Partner agrees to defend, indemnify, and hold harmless FEEDO, its directors, employees, and logistics affiliates from any third-party claims, customer health liabilities, legal penalties, or consumer forum complaints resulting from:',
      '(a) Contaminated, spoiled, defective, or mislabeled food prepared at the Partner kitchen;',
      '(b) Lapses in FSSAI, GST, or municipal statutory licenses; and',
      '(c) Any breach of representation, warranty, or covenant contained in this Agreement.',
    ],
  },
  {
    number: 20,
    title: 'Force Majeure',
    summary: 'Excused delays for natural disasters, severe weather, civil unrest, and network outages.',
    content: [
      'Neither party shall be held liable for delayed fulfillment or platform unavailability resulting from events beyond reasonable control, including earthquakes, floods, severe monsoon deluges, public health lockdowns, labor strikes, civil riots, or telecom grid failures.',
      'Both parties agree to exercise commercially reasonable diligence to resume normal operations promptly once Force Majeure circumstances abate.',
    ],
  },
  {
    number: 21,
    title: 'Changes to Terms and Conditions',
    summary: 'Transparent notice procedures, digital publication, and continued usage assent.',
    content: [
      'FEEDO reserves the right to revise commercial terms, platform commission structures, or operational policies with reasonable advance notice.',
      'Notice of Revision: Partners shall be notified of material modifications via partner portal announcements or registered email at least seven (7) days prior to the effective date.',
      'Assent by Continued Usage: Continued operation of the restaurant storefront following published revisions constitutes formal acceptance of the updated terms.',
    ],
  },
  {
    number: 22,
    title: 'Governing Law and Dispute Resolution',
    summary: 'Jurisdiction of Bengaluru courts, mandatory good-faith mediation, and arbitration clauses.',
    content: [
      'Governing Law: This Agreement shall be governed by, construed, and interpreted strictly in accordance with the substantive laws of India.',
      'Amicable Settlement: In the event of any commercial dispute or claim, the parties agree to engage in good-faith executive mediation for thirty (30) days before initiating formal legal proceedings.',
      'Arbitration and Jurisdiction: Unresolved disputes shall be submitted to binding arbitration in Bengaluru, Karnataka, under the Arbitration and Conciliation Act, 1996. The Courts of Bengaluru have exclusive jurisdiction.',
    ],
  },
  {
    number: 23,
    title: 'Contact and Customer Support',
    summary: 'Merchant help desk channels, escalation matrices, and emergency contact details.',
    content: [
      'Restaurant Partners can reach FEEDO Merchant Support through multiple dedicated channels:',
      'Email Support: partner@feedodelivery.com (Response SLA: under 4 business hours)',
      'Partner Help Desk: In-app 24x7 merchant ticketing portal',
      'Escalation Officer: Legal and Merchant Relations Desk, FEEDO Technologies Private Limited, Outer Ring Road, Bellandur, Bengaluru 560103.',
    ],
  },
  {
    number: 24,
    title: 'Final Acknowledgement',
    summary: 'Affirmation of complete legal understanding and voluntary commercial entry.',
    content: [
      'By clicking "Continue" and checking the mandatory agreement box below, You certify that You have thoroughly read, understood, and voluntarily accepted all twenty-four (24) sections of this Agreement.',
      'You confirm that You understand all commercial terms, FSSAI hygiene duties, 4-digit order pickup code protocols, 10:00 AM daily bank settlement mechanics, and customer privacy mandates, and agree to be bound by them without reservation.',
    ],
  },
];

export const TermsConditionsScreen: React.FC = () => {
  const { setScreen, showToast, addAuditLog, restaurant } = useApp();

  // Exactly ONE checkbox for accepting both documents together
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal reader state: null | 'TERMS' | 'PRIVACY'
  const [activeModal, setActiveModal] = useState<'TERMS' | 'PRIVACY' | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (num: number) => {
    setExpandedSection((prev) => (prev === num ? null : num));
  };

  const expandAll = () => setExpandedSection(-1);
  const collapseAll = () => setExpandedSection(null);

  // Handle single Continue action
  const handleContinue = async () => {
    if (!isAgreed) {
      showToast('Please select the checkbox to agree to the Terms & Conditions and Privacy Policy.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save acceptance of BOTH documents together in Supabase & local storage
      await legalService.recordAcceptance(undefined, restaurant?.id);

      addAuditLog({
        action: 'LEGAL_POLICIES_ACCEPTED',
        category: 'AUTH',
        actor: restaurant?.ownerName || 'Partner Applicant',
        actorRole: 'OWNER',
        details: `Accepted Terms & Conditions (${LEGAL_VERSIONS.terms}) and Privacy Policy (${LEGAL_VERSIONS.privacy}) with digital signature timestamp.`,
        status: 'SUCCESS',
      });

      showToast('Terms & Conditions and Privacy Policy accepted successfully.', 'success');

      // Proceed directly to existing next step: Permission Requests
      setScreen('permissions');
    } catch (err: any) {
      showToast('Failed to save legal acceptance: ' + (err?.message || 'Please try again'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 flex flex-col justify-center items-center select-none font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-8 animate-in fade-in">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center p-3 shadow-lg mx-auto">
            <img
              src="/feedo-logo.png"
              alt="FEEDO"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold mb-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>Partner Portal &bull; Legal Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Terms &amp; Conditions and Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
              Please review our statutory merchant agreement and data protection policies. Both documents must be accepted together before proceeding to permission requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-feedo-700 border border-orange-200 rounded-full font-bold text-[11px]">
              <FileText className="w-3 h-3 text-feedo-600" />
              Terms &amp; Conditions {LEGAL_VERSIONS.terms}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px]">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Privacy Policy {LEGAL_VERSIONS.privacy}
            </span>
            <span className="text-slate-400 text-[11px]">
              &bull; Effective: {LEGAL_VERSIONS.effectiveDate}
            </span>
          </div>
        </div>

        {/* =========================================================
            TWO CARDS SIDE BY SIDE (Terms & Conditions & Privacy Policy)
        ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Terms & Conditions */}
          <div className="bg-white hover:bg-orange-50/20 border-2 border-slate-200 hover:border-feedo-400 rounded-3xl p-6 transition-all shadow-xs flex flex-col justify-between group space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-feedo-600 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  24 Mandatory Sections
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold font-heading text-slate-900 group-hover:text-feedo-700 transition-colors">
                  Terms &amp; Conditions
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Comprehensive commercial merchant agreement covering:
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-feedo-600 font-bold">•</span>
                  <span><strong>Platform Service Commission:</strong> 20% to 25% on net food bill</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-feedo-600 font-bold">•</span>
                  <span><strong>Razorpay Gateway Charge:</strong> Separate 2% payment processing fee</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-feedo-600 font-bold">•</span>
                  <span><strong>Daily Settlements:</strong> Settle by 10:00 AM IST on next business day</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-feedo-600 font-bold">•</span>
                  <span><strong>Sundays &amp; Holidays:</strong> Zero payouts; safely carried forward</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-feedo-600 font-bold">•</span>
                  <span><strong>Food Safety &amp; Pickup:</strong> FSSAI rules &amp; 4-digit code handovers</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              id="read-terms-btn"
              onClick={() => {
                setActiveModal('TERMS');
                setExpandedSection(1);
                setSearchQuery('');
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-feedo-200 bg-orange-50/80 hover:bg-orange-100/80 text-feedo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-feedo-600" />
              <span>Read Full Terms &amp; Conditions (24 Sections)</span>
              <ArrowRight className="w-3.5 h-3.5 text-feedo-600" />
            </button>
          </div>

          {/* Card 2: Privacy Policy */}
          <div className="bg-white hover:bg-emerald-50/20 border-2 border-slate-200 hover:border-emerald-400 rounded-3xl p-6 transition-all shadow-xs flex flex-col justify-between group space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  22 Mandatory Sections
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold font-heading text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Privacy Policy
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Statutory data protection standards under Indian IT &amp; DPDP Acts:
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>DPDP Act 2023:</strong> Full compliance with digital privacy regulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Customer Phone Masking:</strong> Proxy routing protects phone numbers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Financial Encryption:</strong> TLS 1.3 in transit &amp; AES-256 bank encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Aadhaar 8-Digit Masking:</strong> Strict voluntary redaction protocols</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Camera Permissions:</strong> Exclusively for live FSSAI certificate capture</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              id="read-privacy-btn"
              onClick={() => {
                setActiveModal('PRIVACY');
                setExpandedSection(1);
                setSearchQuery('');
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Read Full Privacy Policy (22 Sections)</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* =========================================================
            ONLY ONE CHECKBOX BELOW BOTH CARDS
        ========================================================= */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
            isAgreed
              ? 'border-feedo-500 bg-feedo-50/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <label className="flex items-start gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              id="single-acceptance-checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded-md border-slate-300 text-feedo-600 focus:ring-feedo-500 cursor-pointer accent-feedo-600 shrink-0"
            />
            <div className="text-xs sm:text-sm text-slate-800 leading-snug">
              <span className="font-bold text-slate-900 block text-sm sm:text-base">
                I have read and agree to the Terms &amp; Conditions and Privacy Policy.
              </span>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-sans">
                By selecting this box and continuing, you legally assent to both FEEDO's 24-section Merchant Agreement and 22-section Partner Privacy Policy under Indian IT and DPDP Acts.
              </p>
            </div>
          </label>
        </div>

        {/* =========================================================
            ONLY ONE CONTINUE BUTTON
        ========================================================= */}
        <div className="space-y-4">
          <button
            type="button"
            id="terms-continue-btn"
            disabled={!isAgreed || isSubmitting}
            onClick={handleContinue}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isAgreed && !isSubmitting
                ? 'bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white shadow-lg shadow-feedo-500/25 active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-75'
            }`}
          >
            <span>{isSubmitting ? 'Saving Legal Agreement...' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-center gap-2 text-center">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Digital assent is timestamped and recorded under Indian IT &amp; DPDP Statutes.</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 py-3">
        FEEDO Technologies Private Limited &bull; Legal Compliance Division &bull; Support: partner@feedodelivery.com
      </div>

      {/* =========================================================
          DOCUMENT READER MODAL (Terms or Privacy)
      ========================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeModal === 'TERMS'
                      ? 'bg-orange-50 text-feedo-600 border border-orange-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}
                >
                  {activeModal === 'TERMS' ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    {activeModal === 'TERMS'
                      ? 'Terms & Conditions (24 Sections)'
                      : 'Partner Privacy Policy (22 Sections)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Version {activeModal === 'TERMS' ? LEGAL_VERSIONS.terms : LEGAL_VERSIONS.privacy} &bull; Effective {LEGAL_VERSIONS.effectiveDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close document reader"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls (Search & Expand/Collapse) */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search legal clauses..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-feedo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="font-bold text-feedo-600 hover:text-feedo-700 px-2 py-1 rounded hover:bg-white transition-colors cursor-pointer"
                >
                  Expand All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-white transition-colors cursor-pointer"
                >
                  Collapse
                </button>
              </div>
            </div>

            {/* Modal Scrollable Document Body */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 font-sans">
              {(activeModal === 'TERMS' ? TERMS_SECTIONS : PRIVACY_SECTIONS)
                .filter(
                  (sec) =>
                    !searchQuery ||
                    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sec.content.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((sec) => {
                  const isExpanded = expandedSection === -1 || expandedSection === sec.number;

                  return (
                    <div
                      key={sec.number}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(sec.number)}
                        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                              activeModal === 'TERMS' ? 'bg-slate-900' : 'bg-emerald-700'
                            }`}
                          >
                            {sec.number}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {sec.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {sec.summary}
                            </p>
                          </div>
                        </div>
                        <div className="text-slate-400 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-1 pb-4 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-700 space-y-2.5">
                          {sec.content.map((paragraph, pIdx) => (
                            <p key={pIdx} className="leading-relaxed whitespace-pre-line">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-3xl shrink-0">
              <span className="text-[11px] text-slate-500">
                Verified under Indian IT &amp; FSSAI Regulations.
              </span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsConditionsScreen;

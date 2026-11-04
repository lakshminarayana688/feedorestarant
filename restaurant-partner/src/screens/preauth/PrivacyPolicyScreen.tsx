import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { legalService, LEGAL_VERSIONS } from '../../services/legalService';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Camera,
  CreditCard,
  MapPin,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
} from 'lucide-react';

export interface PrivacySection {
  number: number;
  title: string;
  summary: string;
  content: string[];
}

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    number: 1,
    title: 'Introduction',
    summary: 'Our commitment to protecting partner business and personal data under Indian law.',
    content: [
      'This Privacy Policy ("Policy") explains how FEEDO Technologies Private Limited ("FEEDO", "We", "Us", or "Our") collects, processes, stores, protects, and discloses personal and business information when you register, access, or operate the FEEDO Restaurant Partner App and merchant services.',
      'We are committed to respecting your privacy in strict compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act), the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.',
      'This Policy applies to all authorized representatives, proprietors, partners, directors, kitchen personnel, and managers operating a restaurant partner account on the FEEDO platform.',
    ],
  },
  {
    number: 2,
    title: 'Information We Collect',
    summary: 'Overview of information categories necessary for merchant onboarding and order dispatch.',
    content: [
      'FEEDO collects only such information as is strictly necessary to verify commercial legitimacy, authenticate kitchen personnel, process consumer food orders, execute automated financial payouts, and uphold platform safety.',
      'Information is collected directly from you during registration, through device sensors (camera for document verification), and automatically generated during app usage (audit timestamps, order lifecycle telemetry, and settlement histories).',
    ],
  },
  {
    number: 3,
    title: 'Personal Information',
    summary: 'Identifiable information collected from restaurant owners and authorized managers.',
    content: [
      'We collect personal contact details of authorized business representatives, including: full legal name, primary mobile telephone number, secondary business telephone number, and official email address.',
      'This information is utilized for two-factor SMS OTP authentication, transactional service notifications, emergency order alerts, and regulatory partner correspondence.',
    ],
  },
  {
    number: 4,
    title: 'Restaurant and Business Information',
    summary: 'Culinary trade details, physical premises, tax registration, and operating hours.',
    content: [
      'Commercial details collected include: registered business trade name, legal operating entity name, business category (e.g., Restaurant, Cafe, Cloud Kitchen), cuisine specialties, physical kitchen address, city, state, postal PIN code, and declared daily opening/closing schedules.',
      'This information is published on the FEEDO customer discovery marketplace to enable patrons to browse menus and calculate accurate delivery times.',
    ],
  },
  {
    number: 5,
    title: 'Identity Verification and KYC Information',
    summary: 'Statutory compliance credentials submitted for fraud prevention and licensing validation.',
    content: [
      'To prevent marketplace fraud and satisfy statutory merchant vetting obligations, we collect official compliance certificates: (a) 14-digit FSSAI License/Registration Certificate; (b) Business or Individual PAN details; (c) Goods and Services Tax Identification Number (GSTIN); and (d) Municipal trade licenses where applicable.',
      'These records are verified against national registry portals and maintained securely to prevent unauthorized merchant impersonation.',
    ],
  },
  {
    number: 6,
    title: 'Aadhaar Information Handling',
    summary: 'Strict voluntary verification safeguards and redaction of Aadhaar numbers.',
    content: [
      'Where an authorized proprietor voluntarily submits an Aadhaar document for personal identity verification, FEEDO strictly complies with the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016, and UIDAI security directives.',
      'Partners are instructed to mask or redact the first eight (8) digits of their Aadhaar number prior to upload. FEEDO systems automatically store only masked representations where only the final four (4) digits are referenced for audit verification.',
      'FEEDO never stores raw biometric data, Aadhaar core biometric secrets, or unrestricted Aadhaar card numbers in unencrypted storage.',
    ],
  },
  {
    number: 7,
    title: 'Camera and Photo Information',
    summary: 'Purpose and constraints of device camera capture for statutory documents.',
    content: [
      'The FEEDO Partner App requests device camera permissions specifically to enable Live Camera Capture of the original FSSAI certificate and physical kitchen/facade premises.',
      'Live Camera Capture is strictly initiated only upon your explicit action when tapping the "Capture Certificate" button. The app does not access your camera in the background or when the app is closed.',
      'Captured photographs are encrypted during transit via TLS 1.3 and stored in isolated, access-controlled Supabase Storage buckets accessible only to verified compliance auditors.',
    ],
  },
  {
    number: 8,
    title: 'Device and Application Information',
    summary: 'Technical telemetry, hardware models, operating systems, and crash diagnostics.',
    content: [
      'We automatically collect device diagnostic metadata, including device brand, model, operating system version (Android / iOS / Desktop Web), browser engine, IP address, cellular carrier network status, and app performance logs.',
      'This information is utilized solely to ensure seamless order ringtone execution, troubleshoot printer connectivity, and detect unauthorized multi-device login anomalies.',
    ],
  },
  {
    number: 9,
    title: 'Location Information',
    summary: 'Physical premises verification and dispatch distance calculations.',
    content: [
      'With your permission, we collect precise or approximate geolocation coordinates of your culinary premises during onboarding.',
      'Location data is used strictly to verify physical storefront existence, plot customer delivery radii (e.g., within 5 km to 10 km), and optimize delivery partner algorithmic routing.',
      'FEEDO does not continuously track merchant staff background location after storefront coordinates are registered.',
    ],
  },
  {
    number: 10,
    title: 'Customer and Delivery Partner Information',
    summary: 'Privacy protocols safeguarding customer phone numbers and rider safety.',
    content: [
      'To protect consumer privacy, customer phone numbers displayed in the Restaurant Partner App are permanently masked via virtual routing proxies (e.g., +91 98*** **123). Direct personal phone numbers are never disclosed.',
      'Delivery partner arrival telemetry and name/phone are provided exclusively for the purpose of coordinating physical food parcel handover and verifying the unique 4-digit pickup code.',
      'Restaurant Partners are strictly forbidden from harvesting, exporting, or utilizing customer delivery details for off-platform promotional outreach or personal contact.',
    ],
  },
  {
    number: 11,
    title: 'Payment and Banking Information',
    summary: 'Bank account number encryption and automated settlement processing.',
    content: [
      'For daily 10:00 AM bank settlements, we collect: bank account holder name, bank institution name, bank account number, and Indian Financial System Code (IFSC).',
      'Banking credentials are encrypted in our database using cryptographic encryption. In the merchant user interface, account numbers are masked to display only the last four digits (e.g., HDFC Bank ****9921) to prevent shoulder-surfing in busy kitchen environments.',
    ],
  },
  {
    number: 12,
    title: 'How We Use Information',
    summary: 'Exhaustive specification of lawful operational purposes for data processing.',
    content: [
      'FEEDO processes your data for the following legitimate business purposes: (a) authenticating partner identity and securing access via 2-factor OTP; (b) verifying FSSAI food hygiene licensing; (c) routing and alerting kitchens to incoming customer food orders; (d) orchestrating automated delivery partner assignment and pickup code validation; (e) calculating itemized platform commissions and executing automated daily NEFT bank payouts; (f) complying with tax withholding (TCS/TDS) and statutory audit reporting; and (g) providing 24x7 merchant support.',
    ],
  },
  {
    number: 13,
    title: 'Data Storage and Security',
    summary: 'Cryptographic controls, Row-Level Security, and TLS communication standards.',
    content: [
      'Data in transit is encrypted using Transport Layer Security (TLS 1.3 / HTTPS). Sensitive database columns (PAN, Bank Accounts) are encrypted at rest using industry-standard AES-256 / pgcrypto algorithms.',
      'Access to partner operational data is guarded by PostgreSQL Row Level Security (RLS) policies, ensuring that each restaurant merchant can only read and write records belonging to their authenticated tenant ID.',
      'Administrative access by FEEDO personnel is restricted to authorized operations leads via role-based access control, VPN isolation, and immutable audit logging.',
    ],
  },
  {
    number: 14,
    title: 'Supabase Data Processing',
    summary: 'Role of Supabase as backend cloud infrastructure and compliance isolation.',
    content: [
      'FEEDO utilizes enterprise-managed Supabase PostgreSQL infrastructure for database storage, real-time order event subscriptions, and encrypted document storage buckets.',
      'Supabase operates under SOC 2 Type II compliance standards and processes data under strict Data Processing Agreements guaranteeing that partner data is neither sold nor leveraged for third-party machine learning models.',
    ],
  },
  {
    number: 15,
    title: 'Razorpay and Third-Party Services',
    summary: 'Payment gateway integrations, webhook validation, and bank payout rails.',
    content: [
      'Payment processing and merchant settlement disbursements are facilitated via RBI-authorized payment aggregators, including Razorpay Software Private Limited.',
      'Transactional callbacks and payout notifications are secured using HMAC-SHA256 cryptographic signatures. FEEDO does not store full credit card numbers or banking net-banking credentials on its servers.',
    ],
  },
  {
    number: 16,
    title: 'Data Sharing',
    summary: 'Limited disclosure circumstances for logistics, legal mandates, and audits.',
    content: [
      'FEEDO NEVER sells, rents, leases, or trades partner business data to advertising brokers, marketing agencies, or unauthorized third parties.',
      'We share information strictly in the following circumstances: (a) With assigned FEEDO delivery partners (order items, packaging status, restaurant address, and pickup code validation); (b) With banking institutions and Razorpay for settlement credit; (c) With statutory authorities (FSSAI, GST departments, police) when mandated by a lawful warrant or court order; and (d) With professional chartered accountants and legal auditors under non-disclosure obligations.',
    ],
  },
  {
    number: 17,
    title: 'Data Retention',
    summary: 'Retention timeframes aligned with Indian taxation and food safety statutes.',
    content: [
      'Partner KYC records, completed order transaction ledgers, tax invoices, and settlement histories are retained for eight (8) financial years following account closure in compliance with Section 128 of the Companies Act, 2013, and GST statutory audit mandates.',
      'Temporary diagnostic logs, device crash telemetry, and session cache tokens are purged automatically within ninety (90) days.',
    ],
  },
  {
    number: 18,
    title: 'Data Deletion',
    summary: 'Procedure to request account termination and personal data erasure.',
    content: [
      'Upon formal termination of your restaurant partnership and settlement of all outstanding customer dues, you may submit a formal Data Deletion Request to privacy@feedodelivery.com.',
      'FEEDO will permanently delete personal telephone numbers, photographs, and marketing preferences from active production databases within thirty (30) days, retaining only such historical financial ledgers as required by Indian tax laws.',
    ],
  },
  {
    number: 19,
    title: 'User Rights',
    summary: 'Partner rights of access, correction, nomination, and grievance redressal.',
    content: [
      'Under the DPDP Act, 2023, you possess the right to: (a) access a summary of your personal data processed by FEEDO; (b) request correction or updating of inaccurate bank details or contact information; (c) withdraw optional consent for promotional communications; (d) nominate a representative in the event of incapacity; and (e) lodge grievances with our Data Protection Officer.',
    ],
  },
  {
    number: 20,
    title: 'Security Incident Reporting',
    summary: 'Prompt breach detection, regulatory notification, and partner remediation.',
    content: [
      'FEEDO maintains an active Information Security incident response team. In the unlikely event of a confirmed data security incident compromising sensitive partner records, FEEDO will notify affected partners and the Data Protection Board of India in accordance with statutory timelines.',
    ],
  },
  {
    number: 21,
    title: 'Policy Updates',
    summary: 'Notice mechanisms for policy revisions and archive accessibility.',
    content: [
      'FEEDO may periodically update this Privacy Policy to reflect regulatory modifications or system enhancements.',
      'Substantive updates will be notified through in-app banners or registered email with an updated Effective Date. Previous policy revisions remain archived and accessible upon request to partner support.',
    ],
  },
  {
    number: 22,
    title: 'Contact and Grievance Redressal',
    summary: 'Designated Grievance Officer and Data Protection Redressal contact details.',
    content: [
      'If you have questions, concerns, or formal grievances regarding your personal data or this Privacy Policy, please contact our designated Grievance Officer:',
      'Attention: Data Protection & Grievance Officer',
      'FEEDO Technologies Private Limited',
      'Email: privacy@feedodelivery.com | Partner Desk: partner@feedodelivery.com',
      'Address: No. 104, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103, India.',
      'Grievance Redressal SLA: We acknowledge grievances within 24 hours and resolve inquiries within 15 working days.',
    ],
  },
];

export const PrivacyPolicyScreen: React.FC = () => {
  const { setScreen } = useApp();
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  const toggleSection = (num: number) => {
    setExpandedSection((prev) => (prev === num ? null : num));
  };

  const expandAll = () => setExpandedSection(-1);
  const collapseAll = () => setExpandedSection(null);

  const handleContinue = () => {
    legalService.markPrivacyViewed();
    setScreen('acceptance');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-5 sm:p-10 mb-6">
        {/* Brand & Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 shadow-xs shrink-0">
              <img
                src="/feedo-logo.png"
                alt="FEEDO"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 font-heading">
                  FEEDO
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md">
                  Data Protection
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  Step 3 of 8
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Restaurant Partner Privacy Policy
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Version {LEGAL_VERSIONS.privacy}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Effective: {LEGAL_VERSIONS.effectiveDate}
            </span>
          </div>
        </div>

        {/* Legal Context Notice */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-emerald-950 font-bold block mb-0.5">
              DPDP Act 2023 &amp; Indian Information Technology Compliance (Full 22 Sections)
            </strong>
            This Privacy Policy details how FEEDO secures your culinary data, protects owner identity, handles live camera FSSAI captures, masks customer telephone numbers, and executes automated settlements.
          </div>
        </div>

        {/* Accordion Expand/Collapse Controls */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <span className="font-bold text-slate-600">
            All 22 Privacy Sections (Scroll to read)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
            >
              Expand All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-slate-500 hover:text-slate-700 font-bold px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Complete 22-Section Privacy Document */}
        <div className="space-y-3 mb-8 max-h-[550px] overflow-y-auto pr-1.5 border border-slate-200 rounded-2xl p-3 bg-slate-50/40">
          {PRIVACY_SECTIONS.map((sec) => {
            const isExpanded = expandedSection === -1 || expandedSection === sec.number;

            return (
              <div
                key={sec.number}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(sec.number)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {sec.number}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                        {sec.title}
                      </h2>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {sec.summary}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-1 pb-4 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-700 space-y-2.5">
                    {sec.content.map((paragraph, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Navigation Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setScreen('terms')}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Terms &amp; Conditions</span>
          </button>

          <button
            type="button"
            id="privacy-continue-btn"
            onClick={handleContinue}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
          >
            <span>Proceed to Terms &amp; Privacy Acceptance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 py-2">
        FEEDO Technologies Private Limited &bull; Data Protection Desk &bull; Privacy Officer: privacy@feedodelivery.com
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;


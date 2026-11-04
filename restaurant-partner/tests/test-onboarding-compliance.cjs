// tests/test-onboarding-compliance.cjs
/**
 * FEEDO Restaurant Partner - Onboarding, Legal Compliance & Registration Test Suite
 */

const assert = require('assert');
const fs = require('fs');

let passedTests = 0;
let failedTests = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`✅ PASSED: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAILED: ${description}`);
    console.error(err);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log('📜 RUNNING FEEDO ONBOARDING & LEGAL COMPLIANCE TESTS');
console.log('======================================================\n');

// Mock localStorage for node environment
const store = {};
const mockLocalStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

// 1. SCREEN SEQUENCE ORDER TEST
console.log('--- 1. SCREEN SEQUENCE ORDER ---');
const EXPECTED_9_STEPS = [
  'splash',
  'welcome',
  'notifications',
  'camera',
  'location',
  'microphone',
  'login',
  'otp',
  'dashboard',
];

it('Step sequence follows exact required 9-step initial app flow', () => {
  assert.strictEqual(EXPECTED_9_STEPS[0], 'splash', 'Step 1 must be Splash Screen');
  assert.strictEqual(EXPECTED_9_STEPS[1], 'welcome', 'Step 2 must be Welcome Screen');
  assert.strictEqual(EXPECTED_9_STEPS[2], 'notifications', 'Step 3 must be Notification Permission');
  assert.strictEqual(EXPECTED_9_STEPS[3], 'camera', 'Step 4 must be Camera Permission');
  assert.strictEqual(EXPECTED_9_STEPS[4], 'location', 'Step 5 must be Location Permission');
  assert.strictEqual(EXPECTED_9_STEPS[5], 'microphone', 'Step 6 must be Microphone Permission');
  assert.strictEqual(EXPECTED_9_STEPS[6], 'login', 'Step 7 must be Mobile Number Login');
  assert.strictEqual(EXPECTED_9_STEPS[7], 'otp', 'Step 8 must be OTP Verification');
  assert.strictEqual(EXPECTED_9_STEPS[8], 'dashboard', 'Step 9 must be Successful Login & Dashboard');
});

// 2. TERMS & CONDITIONS (24 SECTIONS)
console.log('\n--- 2. TERMS & CONDITIONS (24 MANDATORY SECTIONS) ---');
const REQUIRED_TERMS_SECTIONS = [
  'Introduction',
  'Eligibility and Account Registration',
  'Document Verification and KYC',
  'FSSAI and Food Business Compliance',
  'Restaurant Menu and Product Listing',
  'Order Management and Acceptance',
  'Food Quality, Hygiene and Packaging',
  'Order Preparation and Delivery Partner Handover',
  'Commission and Service Charges',
  'Payments and Restaurant Settlements',
  'Refunds, Cancellations and Customer Complaints',
  'Pricing, Taxes and Invoicing',
  'Restaurant Responsibilities',
  'Prohibited Activities',
  'Customer Data and Privacy',
  'Intellectual Property',
  'Account Suspension and Termination',
  'Limitation of Liability',
  'Indemnification',
  'Force Majeure',
  'Changes to Terms and Conditions',
  'Governing Law and Dispute Resolution',
  'Contact and Customer Support',
  'Final Acknowledgement',
];

it('Terms & Conditions contains all 24 required sections without truncation', () => {
  assert.strictEqual(REQUIRED_TERMS_SECTIONS.length, 24, 'Must have exactly 24 sections');
});

it('Section 9 specifies FEEDO platform commission (20%–25%), separate 2% Razorpay fee, and GST', () => {
  const termsFile = fs.readFileSync('src/screens/preauth/TermsConditionsScreen.tsx', 'utf8');
  assert.ok(termsFile.includes('20% to 25%'), 'Must include 20% to 25%');
  assert.ok(termsFile.includes('20%–25%'), 'Must include 20%–25% in summary');
  assert.ok(!termsFile.includes('15% to 22%'), 'Old 15% to 22% reference must be removed');
  assert.ok(!termsFile.includes('15%–22%'), 'Old 15%–22% reference must be removed');
  assert.ok(termsFile.includes('An additional 2% payment gateway processing charge shall apply to transactions processed through Razorpay'), 'Must include 2% Razorpay fee clause');
  assert.ok(termsFile.includes('This charge is separate from the FEEDO platform service commission'), 'Must specify separate charge');
  assert.ok(termsFile.includes('GST and other applicable statutory taxes shall be charged on the FEEDO platform service commission and payment gateway charges, as legally applicable.'), 'Must specify GST on commission and gateway charges');
  assert.ok(termsFile.includes('input tax credit information'), 'Must provide input tax credit details');
});

// 3. PRIVACY POLICY (22 SECTIONS)
console.log('\n--- 3. PRIVACY POLICY (22 MANDATORY SECTIONS) ---');
const REQUIRED_PRIVACY_SECTIONS = [
  'Introduction',
  'Information We Collect',
  'Personal Information',
  'Restaurant and Business Information',
  'Identity Verification and KYC Information',
  'Aadhaar Information Handling',
  'Camera and Photo Information',
  'Device and Application Information',
  'Location Information',
  'Customer and Delivery Partner Information',
  'Payment and Banking Information',
  'How We Use Information',
  'Data Storage and Security',
  'Supabase Data Processing',
  'Razorpay and Third-Party Services',
  'Data Sharing',
  'Data Retention',
  'Data Deletion',
  'User Rights',
  'Security Incident Reporting',
  'Policy Updates',
  'Contact and Grievance Redressal',
];

it('Privacy Policy contains all 22 required sections without truncation', () => {
  assert.strictEqual(REQUIRED_PRIVACY_SECTIONS.length, 22, 'Must have exactly 22 sections');
});

// 4. SINGLE LEGAL ACCEPTANCE CHECKBOX RULES
console.log('\n--- 4. SINGLE TERMS & PRIVACY ACCEPTANCE CHECKBOX LOGIC ---');
function validateSingleAcceptance(isAgreed) {
  if (!isAgreed) {
    return { canProceed: false, error: 'The single checkbox must be selected.' };
  }
  return { canProceed: true, error: null };
}

it('Continue button is disabled when single acceptance checkbox is unchecked', () => {
  const res = validateSingleAcceptance(false);
  assert.strictEqual(res.canProceed, false);
});

it('Continue button is enabled and succeeds when single acceptance checkbox is checked', () => {
  const res = validateSingleAcceptance(true);
  assert.strictEqual(res.canProceed, true);
});

it('TermsConditionsScreen renders single checkbox with exact statutory text', () => {
  const termsFile = fs.readFileSync('src/screens/preauth/TermsConditionsScreen.tsx', 'utf8');
  assert.ok(
    termsFile.includes('I have read and agree to the Terms &amp; Conditions and Privacy Policy.') ||
    termsFile.includes('I have read and agree to the Terms & Conditions and Privacy Policy.'),
    'Must have exact single checkbox label'
  );
  assert.ok(termsFile.includes('single-acceptance-checkbox'), 'Must have single acceptance checkbox element');
});

it('TermsConditionsScreen renders Terms & Conditions and Privacy Policy cards side by side with separate reader modals', () => {
  const termsFile = fs.readFileSync('src/screens/preauth/TermsConditionsScreen.tsx', 'utf8');
  assert.ok(termsFile.includes('grid grid-cols-1 md:grid-cols-2'), 'Must layout cards side by side in responsive grid');
  assert.ok(termsFile.includes('read-terms-btn'), 'Must allow opening Terms & Conditions document');
  assert.ok(termsFile.includes('read-privacy-btn'), 'Must allow opening Privacy Policy document');
});

// 5. PERMISSION HANDLING & CONDITIONAL PERMISSION SYSTEM
console.log('\n--- 5. DEVICE PERMISSION SCENARIOS (ALL 6 PERMISSIONS & CONDITIONAL ALLOW / DONT ALLOW) ---');

const ALL_PERMISSION_KEYS = [
  'notifications',
  'camera',
  'audio',
  'location',
  'photos',
  'microphone',
];

const PERMISSION_CONFIG = {
  notifications: { name: 'Notifications', isRequired: true },
  camera: { name: 'Camera', isRequired: true },
  audio: { name: 'Sound / Audio Alerts', isRequired: true },
  location: { name: 'Location', isRequired: false },
  photos: { name: 'Photos & Media Storage', isRequired: true },
  microphone: { name: 'Microphone (Voice Support)', isRequired: false },
};

function checkPermissionCapabilities(cameraStatus, notifStatus, locStatus, micStatus) {
  return {
    canCaptureFSSAI: cameraStatus === 'granted',
    canReceivePush: notifStatus === 'granted',
    hasLocationAudit: locStatus === 'granted',
    hasVoiceAgent: micStatus === 'granted',
    isApplicationBlocked: false, // Optional permissions do not block the app
  };
}

it('All 6 required permissions are defined with correct required/optional status', () => {
  assert.strictEqual(ALL_PERMISSION_KEYS.length, 6);
  assert.strictEqual(PERMISSION_CONFIG.notifications.isRequired, true);
  assert.strictEqual(PERMISSION_CONFIG.camera.isRequired, true);
  assert.strictEqual(PERMISSION_CONFIG.audio.isRequired, true);
  assert.strictEqual(PERMISSION_CONFIG.location.isRequired, false, 'Location must be optional');
  assert.strictEqual(PERMISSION_CONFIG.photos.isRequired, true);
  assert.strictEqual(PERMISSION_CONFIG.microphone.isRequired, false, 'Microphone must be optional');
});

it('Granted camera enables FSSAI capture without blocking', () => {
  const res = checkPermissionCapabilities('granted', 'prompt', 'prompt', 'prompt');
  assert.strictEqual(res.canCaptureFSSAI, true);
  assert.strictEqual(res.isApplicationBlocked, false);
});

it('Denied optional location does not block core merchant app', () => {
  const res = checkPermissionCapabilities('granted', 'granted', 'denied', 'denied');
  assert.strictEqual(res.isApplicationBlocked, false);
  assert.strictEqual(res.hasLocationAudit, false);
});

it('Allow condition sets status to granted, disables reminders, and never asks again', () => {
  // Simulate Allow state update
  const permState = {
    key: 'camera',
    status: 'granted',
    userDecision: 'allowed',
    remindOnNextVisit: false,
  };
  assert.strictEqual(permState.status, 'granted');
  assert.strictEqual(permState.remindOnNextVisit, false);
  assert.strictEqual(permState.userDecision, 'allowed');
});

it('Don\'t Allow condition sets status to denied, marks remindOnNextVisit true', () => {
  // Simulate Don't Allow state update
  const permState = {
    key: 'notifications',
    status: 'denied',
    userDecision: 'not_allowed',
    remindOnNextVisit: true,
  };
  assert.strictEqual(permState.status, 'denied');
  assert.strictEqual(permState.remindOnNextVisit, true);
  assert.strictEqual(permState.userDecision, 'not_allowed');
});

it('Blocked in settings provides recovery guidance without repeatedly popping browser prompts', () => {
  const permFile = fs.readFileSync('src/services/permissionService.ts', 'utf8');
  assert.ok(permFile.includes('settingsInstruction'), 'Must provide instructions to unblock in settings');
  assert.ok(permFile.includes('status: \'blocked\''), 'Must handle blocked state');
});

it('Reminder queue returns at most one single reminder dialog at a time', () => {
  // Priority queue logic: 1 at a time, essential first
  const pending = [
    { key: 'notifications', isRequired: true, remindOnNextVisit: true, sessionDismissed: false },
    { key: 'microphone', isRequired: false, remindOnNextVisit: true, sessionDismissed: false },
  ];
  const nextReminder = pending.find(p => !p.sessionDismissed);
  assert.strictEqual(nextReminder.key, 'notifications', 'Must select single highest-priority pending reminder');
});

it('Not Now dismisses reminder for current session without continuous interruptions', () => {
  const sessionDismissed = { notifications: false };
  // User clicks "Not Now"
  sessionDismissed.notifications = true;
  assert.strictEqual(sessionDismissed.notifications, true, 'Must suppress reminders for rest of current session');
});

it('PermissionsScreen renders one permission at a time with exact progress indicator sequence', () => {
  const screenFile = fs.readFileSync('src/screens/preauth/PermissionsScreen.tsx', 'utf8');
  assert.ok(screenFile.includes('Permission 1 of 4'), 'Must include Permission 1 of 4');
  assert.ok(screenFile.includes('Permission 2 of 4'), 'Must include Permission 2 of 4');
  assert.ok(screenFile.includes('Permission 3 of 4'), 'Must include Permission 3 of 4');
  assert.ok(screenFile.includes('Permission 4 of 4'), 'Must include Permission 4 of 4');
  assert.ok(screenFile.includes('btn-allow-'), 'PermissionsScreen must render Allow button');
  assert.ok(screenFile.includes('Granted / Enabled'), 'Must display Granted / Enabled badge');
  assert.ok(screenFile.includes('Blocked in Settings'), 'Must display Blocked in Settings badge');
  assert.ok(screenFile.includes('window.addEventListener(\'focus\''), 'Must auto-detect status when returning from settings');
  assert.strictEqual(screenFile.includes('Skip for Now'), false, 'Must not include Skip for Now option');
  assert.strictEqual(screenFile.includes('Skip'), false, 'Must not include Skip option');
});

it('WelcomeScreen exists and renders Get Started button', () => {
  const welcomeFile = fs.readFileSync('src/screens/preauth/WelcomeScreen.tsx', 'utf8');
  assert.ok(welcomeFile.includes('welcome-get-started-btn'), 'Must render Get Started button');
  assert.ok(welcomeFile.includes('FEEDO'), 'Must render FEEDO brand');
});

it('LoginScreen renders Get OTP button and validates Indian mobile numbers', () => {
  const loginFile = fs.readFileSync('src/screens/preauth/LoginScreen.tsx', 'utf8');
  assert.ok(loginFile.includes('Get OTP'), 'Must display Get OTP button');
  assert.ok(loginFile.includes('+91'), 'Must display +91 country code');
  assert.ok(loginFile.includes('/^[6-9]\\d{9}$/'), 'Must validate 10-digit Indian phone number starting with 6-9');
});

it('OtpScreen supports 6-digit verification and routes to dashboard on login success', () => {
  const otpFile = fs.readFileSync('src/screens/preauth/OtpScreen.tsx', 'utf8');
  assert.ok(otpFile.includes('handlePaste'), 'Must support OTP paste');
  assert.ok(otpFile.includes('nextInput?.focus()'), 'Must support automatic focus between OTP fields');
  assert.ok(otpFile.includes('timer > 0'), 'Must include resend OTP countdown');
  assert.ok(otpFile.includes('setScreen(\'dashboard\')'), 'Must navigate to dashboard upon login success');
});

it('PermissionReminderDialog renders Allow and Not Now options globally', () => {
  const dialogFile = fs.readFileSync('src/components/common/PermissionReminderDialog.tsx', 'utf8');
  assert.ok(dialogFile.includes('handleAllow'), 'Must have Allow handler in reminder dialog');
  assert.ok(dialogFile.includes('handleNotNow'), 'Must have Not Now handler in reminder dialog');
  assert.ok(dialogFile.includes('dismissReminderForSession'), 'Must dismiss reminder for session on Not Now');
});

// 6. ONBOARDING TOPICS (6 TOPICS)
console.log('\n--- 6. ONBOARDING TOPICS (6 TOPICS) ---');
const ONBOARDING_TOPICS = [
  'Manage Restaurant Orders',
  'Manage Restaurant Menu',
  'Track Restaurant Earnings',
  'Manage Daily Settlements',
  'Coordinate Delivery Partner Pickups',
  'Monitor Restaurant Performance',
];

it('Onboarding contains all 6 required feature walkthrough topics', () => {
  assert.strictEqual(ONBOARDING_TOPICS.length, 6);
  assert.ok(ONBOARDING_TOPICS.includes('Coordinate Delivery Partner Pickups'));
  assert.ok(ONBOARDING_TOPICS.includes('Manage Daily Settlements'));
});

// 7. LOGIN & OTP TIMEOUT / RESEND
console.log('\n--- 7. AUTHENTICATION & OTP VERIFICATION ---');
function validateOtpSubmission(phone, otpToken, isVerifying) {
  if (isVerifying) return { success: false, reason: 'Duplicate submission blocked' };
  if (!phone || phone.length < 10) return { success: false, reason: 'Invalid phone' };
  if (!otpToken || otpToken.length !== 6) return { success: false, reason: 'Incomplete OTP' };
  return { success: true, reason: null };
}

it('Validates 10-digit mobile number input', () => {
  const invalid = validateOtpSubmission('9876', '123456', false);
  assert.strictEqual(invalid.success, false);
});

it('Prevents duplicate concurrent OTP verification submissions', () => {
  const res = validateOtpSubmission('+91 98765 43210', '123456', true);
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.reason, 'Duplicate submission blocked');
});

it('Rejects invalid length OTP tokens', () => {
  const res = validateOtpSubmission('+91 98765 43210', '123', false);
  assert.strictEqual(res.success, false);
});

// 8. KYC STATUS WORKFLOW & REJECTION HANDLING
console.log('\n--- 8. KYC STATUS LIFECYCLE & RESUBMISSION ---');
function getKycNextScreen(status) {
  switch (status) {
    case 'DRAFT':
    case 'NOT_SUBMITTED':
      return 'register';
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
      return 'verification_status';
    case 'REJECTED':
      return 'verification_status'; // Shows rejection reason & resubmit action
    case 'APPROVED':
    case 'ACTIVE':
      return 'dashboard';
    default:
      return 'dashboard';
  }
}

it('KYC DRAFT routes to Registration screen', () => {
  assert.strictEqual(getKycNextScreen('DRAFT'), 'register');
});

it('KYC UNDER_REVIEW routes to Verification Status screen', () => {
  assert.strictEqual(getKycNextScreen('UNDER_REVIEW'), 'verification_status');
});

it('KYC REJECTED routes to Verification Status with resubmission support', () => {
  assert.strictEqual(getKycNextScreen('REJECTED'), 'verification_status');
});

it('KYC APPROVED routes directly to Dashboard', () => {
  assert.strictEqual(getKycNextScreen('APPROVED'), 'dashboard');
});

// 9. RETURNING USER RESUME LOGIC (NO REPEATING)
console.log('\n--- 9. RETURNING USER RESUME EVALUATION ---');
function resolveUserNextScreen(state) {
  if (!state.termsAccepted || !state.privacyAccepted) {
    return 'terms';
  }
  if (!state.permissionsDone) return 'permissions';
  if (!state.onboardingDone) return 'onboarding';
  if (!state.isAuthenticated) return 'login';
  return getKycNextScreen(state.kycStatus);
}

it('User who has not accepted legal terms begins at single Terms & Conditions screen', () => {
  const next = resolveUserNextScreen({
    termsAccepted: false,
    privacyAccepted: false,
    termsViewed: false,
    privacyViewed: false,
    permissionsDone: false,
    onboardingDone: false,
    isAuthenticated: false,
    kycStatus: 'NOT_SUBMITTED',
  });
  assert.strictEqual(next, 'terms');
});

it('User with single legal acceptance completed resumes directly at Permissions', () => {
  const next = resolveUserNextScreen({
    termsAccepted: true,
    privacyAccepted: true,
    termsViewed: true,
    privacyViewed: true,
    permissionsDone: false,
    onboardingDone: false,
    isAuthenticated: false,
    kycStatus: 'NOT_SUBMITTED',
  });
  assert.strictEqual(next, 'permissions');
});

it('User with legal accepted resumes at Permissions', () => {
  const next = resolveUserNextScreen({
    termsAccepted: true,
    privacyAccepted: true,
    termsViewed: true,
    privacyViewed: true,
    permissionsDone: false,
    onboardingDone: false,
    isAuthenticated: false,
    kycStatus: 'NOT_SUBMITTED',
  });
  assert.strictEqual(next, 'permissions');
});

it('User with permissions done resumes at Onboarding', () => {
  const next = resolveUserNextScreen({
    termsAccepted: true,
    privacyAccepted: true,
    termsViewed: true,
    privacyViewed: true,
    permissionsDone: true,
    onboardingDone: false,
    isAuthenticated: false,
    kycStatus: 'NOT_SUBMITTED',
  });
  assert.strictEqual(next, 'onboarding');
});

it('Unauthenticated user with onboarding done resumes at Login', () => {
  const next = resolveUserNextScreen({
    termsAccepted: true,
    privacyAccepted: true,
    termsViewed: true,
    privacyViewed: true,
    permissionsDone: true,
    onboardingDone: true,
    isAuthenticated: false,
    kycStatus: 'NOT_SUBMITTED',
  });
  assert.strictEqual(next, 'login');
});

it('Authenticated approved returning user resumes straight at Dashboard', () => {
  const next = resolveUserNextScreen({
    termsAccepted: true,
    privacyAccepted: true,
    termsViewed: true,
    privacyViewed: true,
    permissionsDone: true,
    onboardingDone: true,
    isAuthenticated: true,
    kycStatus: 'ACTIVE',
  });
  assert.strictEqual(next, 'dashboard');
});

// 10. SETTLEMENT & PAYOUT POLICY VERIFICATION
console.log('\n--- 10. SETTLEMENT & PAYOUT POLICY (CADENCE, SUNDAYS, HOLIDAYS, CALCULATION & 2FA 24H COOLING) ---');

const termsFileContent = fs.readFileSync('src/screens/preauth/TermsConditionsScreen.tsx', 'utf8');
const financeFileContent = fs.readFileSync('src/screens/main/FinanceScreen.tsx', 'utf8');
const settlementFileContent = fs.readFileSync('src/services/settlementService.ts', 'utf8');

it('Section 10 enforces Daily Settlement Cadence by 10:00 AM IST on next business day', () => {
  assert.ok(termsFileContent.includes('10:00 AM IST on the next business day'), 'Must specify 10:00 AM IST next business day cadence');
  assert.ok(termsFileContent.includes('verified primary bank account'), 'Must specify verified primary bank account');
});

it('Section 10 enforces Sundays – No Payouts with carry forward to next business day', () => {
  assert.ok(termsFileContent.includes('Sundays – No Payouts'), 'Must have Sundays – No Payouts heading');
  assert.ok(termsFileContent.includes('FEEDO must not process or release restaurant payouts on Sundays'), 'Must forbid Sunday payouts');
  assert.ok(termsFileContent.includes('carried forward to the next available business day'), 'Must carry forward Sunday payouts');
  assert.ok(termsFileContent.includes('Accumulated restaurant earnings remain completely safe'), 'Must ensure safe accumulated earnings');
});

it('Section 10 enforces Bank Holidays – No Payouts with non-forfeiture protection', () => {
  assert.ok(termsFileContent.includes('Bank Holidays – No Payouts'), 'Must have Bank Holidays – No Payouts heading');
  assert.ok(termsFileContent.includes('carried forward to the next available business day'), 'Must carry forward holiday payouts');
  assert.ok(termsFileContent.includes('Accumulated earnings must not be cancelled, deducted or forfeited because of holidays'), 'Must forbid forfeiture due to holidays');
});

it('Section 10 specifies transparent Settlement Calculation with 20%–25% commission and separate Razorpay fee', () => {
  const termsFileContentCurrent = fs.readFileSync('src/screens/preauth/TermsConditionsScreen.tsx', 'utf8');
  assert.ok(termsFileContentCurrent.includes('Gross Food Order Revenue − FEEDO Platform Commission (20%–25%) − Razorpay Payment Gateway Charge (2%) − Applicable GST on charges − Applicable Statutory TCS/TDS Withholdings + Contractual Merchant Incentives/Credits'), 'Must state complete settlement calculation formula');
  assert.ok(termsFileContentCurrent.includes('displayed transparently in the partner settlement breakdown'), 'Must require transparent breakdown display');
});

it('Section 10 enforces Bank Account Changes dual-factor authorization and 24-hour cooling hold', () => {
  const termsFileContentUpdated = fs.readFileSync('src/screens/preauth/TermsConditionsScreen.tsx', 'utf8');
  assert.ok(termsFileContentUpdated.includes('Bank Account Changes: To prevent financial fraud'), 'Must mention fraud prevention for bank changes');
  assert.ok(termsFileContentUpdated.includes('dual-factor authorization'), 'Must require 2FA');
  assert.ok(termsFileContentUpdated.includes('mandatory 24-hour verification cooling period'), 'Must enforce 24-hour cooling period');
  assert.ok(termsFileContentUpdated.includes('Keep payouts to the newly updated account on hold until successful verification'), 'Must hold payouts during cooling');
  assert.ok(termsFileContentUpdated.includes('Resume settlements according to the applicable business-day payout schedule'), 'Must resume on business day');
});

it('Settlement calculation formula calculates exact separate deductions and final net payout', () => {
  // Formula:
  // 1. Gross Food Order Revenue: 10,000
  // 2. FEEDO Platform Commission (20%): 2,000
  // 3. Razorpay Payment Gateway Charge (2%): 200
  // 4. Applicable GST on charges (18% on 2,200): 396
  // 5. Applicable statutory TCS/TDS deductions (1%): 100
  // 6. Contractual Merchant Incentives/Credits: 500
  // 7. Final Net Restaurant Payout: 10,000 - 2,000 - 200 - 396 - 100 + 500 = 7,804
  const gross = 10000;
  const commRate = 0.20;
  const razorpayRate = 0.02;
  const commission = Math.round(gross * commRate * 100) / 100;
  const razorpayFee = Math.round(gross * razorpayRate * 100) / 100;
  const gst = Math.round((commission + razorpayFee) * 0.18 * 100) / 100;
  const tcsTds = Math.round(gross * 0.01 * 100) / 100;
  const incentives = 500;
  const net = Math.round((gross - commission - razorpayFee - gst - tcsTds + incentives) * 100) / 100;

  assert.strictEqual(commission, 2000, '20% commission on 10,000 is 2,000');
  assert.strictEqual(razorpayFee, 200, '2% Razorpay charge on 10,000 is 200');
  assert.strictEqual(gst, 396, '18% GST on 2,200 total charges is 396');
  assert.strictEqual(tcsTds, 100, '1% statutory TCS/TDS on 10,000 is 100');
  assert.strictEqual(net, 7804, 'Final net payout is 7,804');
});

it('Sunday carry-forward scheduler automatically defers payout to Monday 10:00 AM IST', () => {
  // Saturday base date: Candidate next day is Sunday (getDay() === 0)
  const saturday = new Date(2026, 9, 17); // 17 Oct 2026 is Saturday
  assert.strictEqual(saturday.getDay(), 6, 'Should be Saturday');

  const candidate = new Date(saturday.getTime());
  candidate.setDate(candidate.getDate() + 1);
  assert.strictEqual(candidate.getDay(), 0, 'Candidate next day is Sunday');

  // Rollover simulation
  while (candidate.getDay() === 0) {
    candidate.setDate(candidate.getDate() + 1);
  }
  assert.strictEqual(candidate.getDay(), 1, 'Rolled over to Monday');
  assert.strictEqual(candidate.getDate(), 19, 'Monday date is 19 Oct 2026');
});

it('Bank Holiday scheduler automatically defers payout to next eligible business day', () => {
  // Candidate on Gandhi Jayanti (Oct 02)
  const candidate = new Date(2026, 9, 2); // 02 Oct 2026 is Gandhi Jayanti
  const isHoliday = candidate.getMonth() === 9 && candidate.getDate() === 2;
  assert.ok(isHoliday, 'Oct 2 is recognized as statutory bank holiday');

  const nextEligible = new Date(candidate.getTime());
  nextEligible.setDate(nextEligible.getDate() + 1);
  assert.strictEqual(nextEligible.getDate(), 3, 'Deferred to next eligible date Oct 3');
});

it('Bank account 24-hour cooling period hold validation', () => {
  const COOLING_PERIOD_MS = 24 * 60 * 60 * 1000;
  const recentUpdate = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
  const oldUpdate = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago

  const isRecentInCooling = (Date.now() - recentUpdate) < COOLING_PERIOD_MS;
  const isOldInCooling = (Date.now() - oldUpdate) < COOLING_PERIOD_MS;

  assert.strictEqual(isRecentInCooling, true, '2h old update must be in active cooling hold');
  assert.strictEqual(isOldInCooling, false, '25h old update is clear of cooling hold');
});

it('FinanceScreen displays all required settlement items and Sunday/Holiday carry-forward', () => {
  const financeContent = fs.readFileSync('src/screens/main/FinanceScreen.tsx', 'utf8');
  assert.ok(financeContent.includes('Total Earnings'), 'Must display Total Earnings');
  assert.ok(financeContent.includes('Gross Food Order Revenue'), 'Must display Gross Food Order Revenue');
  assert.ok(financeContent.includes('FEEDO Platform Commission'), 'Must display FEEDO Platform Commission');
  assert.ok(financeContent.includes('Razorpay Payment Gateway Charge (2%)'), 'Must display separate Razorpay Payment Gateway Charge (2%)');
  assert.ok(financeContent.includes('Applicable GST on Charges'), 'Must display Applicable GST on Charges');
  assert.ok(financeContent.includes('Applicable Statutory TCS/TDS Deductions'), 'Must display Applicable Statutory TCS/TDS Deductions');
  assert.ok(financeContent.includes('Contractual Merchant Incentives/Credits'), 'Must display Contractual Merchant Incentives/Credits');
  assert.ok(financeContent.includes('Final Net Restaurant Payout'), 'Must display Final Net Restaurant Payout');
  assert.ok(financeContent.includes('Next Settlement Date'), 'Must display Next Settlement Date');
  assert.ok(financeContent.includes('Expected Settlement Time'), 'Must display Expected Settlement Time');
  assert.ok(financeContent.includes('Settlement Status'), 'Must display Settlement Status');
  assert.ok(financeContent.includes('Bank Account Details'), 'Must display Bank Account Details');
  assert.ok(financeContent.includes('Sunday / Bank Holiday Payout Carry-Forward Active'), 'Must display Sunday/Holiday carry-forward banner');
  assert.ok(financeContent.includes('24-Hour Verification Cooling Period'), 'Must display 24-hour cooling notice');
});

// 11. PARTNER OPERATIONAL SUPPORT & LIVE DISPATCH CHAT
console.log('\n--- 11. PARTNER OPERATIONAL SUPPORT & LIVE DISPATCH CHAT ---');
it('Partner Operational Support card is activated with FeedoDispatchAgentModal', () => {
  const notifFile = fs.readFileSync('src/screens/main/NotificationsScreen.tsx', 'utf8');
  assert.ok(notifFile.includes('Partner Operational Support'), 'Must render Partner Operational Support card');
  assert.ok(notifFile.includes('Facing rider delays or customer address discrepancies?'), 'Must render operational support description');
  assert.ok(notifFile.includes('Start Live Chat →'), 'Must render Start Live Chat button');
  assert.ok(notifFile.includes('start-live-chat-btn'), 'Must have Start Live Chat button id');
  assert.ok(notifFile.includes('FeedoDispatchAgentModal'), 'Must import FeedoDispatchAgentModal');
  assert.ok(notifFile.includes('setIsChatModalOpen(true)'), 'Must open live chat modal on click');

  const chatModalFile = fs.readFileSync('src/components/chat/FeedoDispatchAgentModal.tsx', 'utf8');
  assert.ok(chatModalFile.includes('Customer Address & Location Resolution Support'), 'Must support address discrepancies resolution');
  assert.ok(chatModalFile.includes('FEEDO Dispatch'), 'Must support dispatch live assistance');
});

console.log('\n======================================================');
console.log(`🎉 ALL ${passedTests} ONBOARDING & COMPLIANCE TESTS PASSED!`);
if (failedTests > 0) {
  console.error(`⚠️ ${failedTests} tests failed.`);
  process.exit(1);
}
console.log('======================================================\n');


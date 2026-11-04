// src/services/settlementService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { SettlementRecord } from '../types/extras';
import { initialSettlements } from '../data/initialExtras';
import { getSupabaseClient, invokeEdgeFunction } from '../utils/supabase';

/**
 * Known Statutory Bank Holidays (RBI / National Clearing Holidays)
 * Stored as MM-DD for recurring annual holidays, plus specific calendar dates.
 */
export const STATUTORY_BANK_HOLIDAYS: Record<string, string> = {
  '01-01': "New Year's Day",
  '01-26': 'Republic Day',
  '05-01': 'May Day / International Labour Day',
  '08-15': 'Independence Day',
  '10-02': 'Mahatma Gandhi Jayanti',
  '11-01': 'Karnataka Rajyotsava',
  '12-25': 'Christmas Day',
};

export const SPECIAL_BANK_HOLIDAYS_2026: Record<string, string> = {
  '2026-03-03': 'Holi',
  '2026-03-20': 'Eid-ul-Fitr',
  '2026-04-03': 'Good Friday',
  '2026-04-14': 'Dr. B.R. Ambedkar Jayanti',
  '2026-10-20': 'Dussehra (Vijayadashami)',
  '2026-11-08': 'Diwali (Deepavali)',
};

/**
 * 24-hour security cooling period for bank detail modifications
 */
export const BANK_COOLING_PERIOD_HOURS = 24;
export const BANK_COOLING_PERIOD_MS = BANK_COOLING_PERIOD_HOURS * 60 * 60 * 1000;

export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

export function isBankHoliday(date: Date): { isHoliday: boolean; holidayName?: string } {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const mmdd = `${mm}-${dd}`;
  const fullDate = `${yyyy}-${mm}-${dd}`;

  if (STATUTORY_BANK_HOLIDAYS[mmdd]) {
    return { isHoliday: true, holidayName: STATUTORY_BANK_HOLIDAYS[mmdd] };
  }
  if (SPECIAL_BANK_HOLIDAYS_2026[fullDate]) {
    return { isHoliday: true, holidayName: SPECIAL_BANK_HOLIDAYS_2026[fullDate] };
  }
  return { isHoliday: false };
}

export interface SettlementSchedule {
  date: Date;
  formattedDate: string;
  formattedTime: string;
  isSundayDeferred: boolean;
  isHolidayDeferred: boolean;
  deferralReasons: string[];
  holidayNames: string[];
  isDeferred: boolean;
  deferralSummary?: string;
}

/**
 * Calculates the next eligible settlement date:
 * - Net earnings settled daily by 10:00 AM IST on the next business day.
 * - Zero payouts on Sundays: carried forward to next available business day.
 * - Zero payouts on Bank Holidays: carried forward to next available business day.
 * - Earnings remain completely safe, non-forfeited, and accumulated.
 */
export function getNextEligibleSettlementDate(baseDate: Date = new Date()): SettlementSchedule {
  const candidate = new Date(baseDate.getTime());
  // Move to next day
  candidate.setDate(candidate.getDate() + 1);
  candidate.setHours(10, 0, 0, 0);

  let isSundayDeferred = false;
  let isHolidayDeferred = false;
  const deferralReasons: string[] = [];
  const holidayNames: string[] = [];

  // Carry forward while candidate lands on Sunday or Bank Holiday
  while (true) {
    const sunday = isSunday(candidate);
    const holidayCheck = isBankHoliday(candidate);

    if (sunday) {
      isSundayDeferred = true;
      if (!deferralReasons.includes('Sunday')) {
        deferralReasons.push('Sunday');
      }
      candidate.setDate(candidate.getDate() + 1);
      continue;
    }

    if (holidayCheck.isHoliday) {
      isHolidayDeferred = true;
      if (holidayCheck.holidayName && !holidayNames.includes(holidayCheck.holidayName)) {
        holidayNames.push(holidayCheck.holidayName);
        deferralReasons.push(holidayCheck.holidayName);
      }
      candidate.setDate(candidate.getDate() + 1);
      continue;
    }

    break;
  }

  const isDeferred = isSundayDeferred || isHolidayDeferred;
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  const formattedDate = candidate.toLocaleDateString('en-IN', options);
  const formattedTime = '10:00 AM IST';

  let deferralSummary: string | undefined;
  if (isDeferred) {
    const reasonsStr = deferralReasons.join(' & ');
    deferralSummary = `Payout carry-forward active (${reasonsStr}): Banking clearing unavailable. Payout safely scheduled for ${formattedDate} at ${formattedTime}. Accumulated earnings remain 100% safe without deduction or forfeiture.`;
  }

  return {
    date: candidate,
    formattedDate,
    formattedTime,
    isSundayDeferred,
    isHolidayDeferred,
    deferralReasons,
    holidayNames,
    isDeferred,
    deferralSummary,
  };
}

export interface SettlementCalculationParams {
  grossOrderRevenue: number;
  commissionRate?: number; // 0.20 to 0.25 (default: 0.20 / 20%)
  razorpayChargeRate?: number; // 0.02 (2% per Razorpay payment processing agreement)
  isRazorpayTransaction?: boolean; // Applied only to eligible Razorpay-processed transactions (default: true)
  gstRateOnCharges?: number; // Statutory GST rate as legally applicable (default: 0.18 / 18%)
  gstRateOnCommission?: number; // Backward compatibility alias
  tcsTdsRate?: number; // Statutory TCS/TDS withholdings (default: 0.01 / 1%)
  merchantIncentives?: number; // default: 0
}

export interface SettlementBreakdown {
  grossFoodOrderRevenue: number;
  grossOrderRevenue: number; // Backward compatibility alias
  commissionRatePercent: number; // e.g. 20 (range: 20%–25%)
  platformCommission: number;
  razorpayChargeRatePercent: number; // 2%
  razorpayGatewayCharge: number;
  gstRatePercent: number; // 18% (statutory GST rate on charges)
  gstOnCharges: number;
  gstOnCommission: number; // Backward compatibility alias
  tcsTdsRatePercent: number; // 1%
  statutoryTcsTds: number;
  merchantIncentives: number;
  netPayableAmount: number;
  finalNetPayout: number; // Alias
}

/**
 * Authoritative transparent settlement calculation:
 * Final Net Restaurant Payout =
 *    1. Gross Food Order Revenue
 *  − 2. FEEDO Platform Commission (20%–25%)
 *  − 3. Razorpay Payment Gateway Charge (2%) [separate from FEEDO commission]
 *  − 4. Applicable GST on charges (statutory taxes on commission & gateway fee)
 *  − 5. Applicable statutory TCS/TDS deductions (1%)
 *  + 6. Contractual Merchant Incentives/Credits
 *  = 7. Final Net Restaurant Payout
 */
export function calculateSettlementBreakdown(params: SettlementCalculationParams): SettlementBreakdown {
  const gross = Math.max(0, Number(params.grossOrderRevenue) || 0);
  const commRate = params.commissionRate !== undefined ? params.commissionRate : 0.20; // 20% (agreed 20%–25% tier)
  const razorpayRate = params.razorpayChargeRate !== undefined ? params.razorpayChargeRate : 0.02; // 2% Razorpay fee
  const applyRazorpay = params.isRazorpayTransaction !== false;
  const gstRate = params.gstRateOnCharges !== undefined
    ? params.gstRateOnCharges
    : (params.gstRateOnCommission !== undefined ? params.gstRateOnCommission : 0.18);
  const tcsRate = params.tcsTdsRate !== undefined ? params.tcsTdsRate : 0.01; // 1%
  const incentives = Math.max(0, Number(params.merchantIncentives) || 0);

  // 1. FEEDO Platform Commission (20%–25% calculated on net food bill)
  const platformCommission = Math.round(gross * commRate * 100) / 100;

  // 2. Razorpay Payment Gateway Charge (separate 2% processing charge, not combined with FEEDO commission)
  const razorpayGatewayCharge = applyRazorpay ? Math.round(gross * razorpayRate * 100) / 100 : 0;

  // 3. GST and other applicable statutory taxes charged on platform commission & gateway charges
  const totalChargesSubjectToGst = platformCommission + razorpayGatewayCharge;
  const gstOnCharges = Math.round(totalChargesSubjectToGst * gstRate * 100) / 100;

  // 4. Applicable statutory TCS/TDS withholdings (1%)
  const statutoryTcsTds = Math.round(gross * tcsRate * 100) / 100;

  // 5. Final Net Restaurant Payout
  const netPayableAmount = Math.round(
    (gross - platformCommission - razorpayGatewayCharge - gstOnCharges - statutoryTcsTds + incentives) * 100
  ) / 100;

  return {
    grossFoodOrderRevenue: gross,
    grossOrderRevenue: gross,
    commissionRatePercent: Math.round(commRate * 100),
    platformCommission,
    razorpayChargeRatePercent: Math.round(razorpayRate * 100),
    razorpayGatewayCharge,
    gstRatePercent: Math.round(gstRate * 100),
    gstOnCharges,
    gstOnCommission: gstOnCharges,
    tcsTdsRatePercent: Math.round(tcsRate * 100),
    statutoryTcsTds,
    merchantIncentives: incentives,
    netPayableAmount,
    finalNetPayout: netPayableAmount,
  };
}

/**
 * Bank cooling check: changes to bank account number or IFSC trigger
 * mandatory dual-factor authorization and 24-hour verification cooling hold.
 */
export function isBankAccountInCoolingPeriod(updatedAtTimestamp?: number): {
  isInCooling: boolean;
  remainingHours: number;
  remainingMinutes: number;
} {
  if (!updatedAtTimestamp) {
    return { isInCooling: false, remainingHours: 0, remainingMinutes: 0 };
  }

  const elapsed = Date.now() - updatedAtTimestamp;
  if (elapsed >= BANK_COOLING_PERIOD_MS) {
    return { isInCooling: false, remainingHours: 0, remainingMinutes: 0 };
  }

  const remainingMs = BANK_COOLING_PERIOD_MS - elapsed;
  const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
  const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

  return {
    isInCooling: true,
    remainingHours,
    remainingMinutes,
  };
}

export const settlementService = {
  /**
   * Helper to fetch next scheduled payout info
   */
  getSchedule(baseDate?: Date): SettlementSchedule {
    return getNextEligibleSettlementDate(baseDate);
  },

  /**
   * Helper to calculate itemized settlement breakdown
   */
  calculate(
    gross: number,
    commissionRate: number = 0.20,
    merchantIncentives: number = 0,
    isRazorpayTransaction: boolean = true
  ): SettlementBreakdown {
    return calculateSettlementBreakdown({
      grossOrderRevenue: gross,
      commissionRate,
      merchantIncentives,
      isRazorpayTransaction,
    });
  },

  /**
   * Fetch settlement ledger
   */
  async getSettlements(restaurantId?: string): Promise<ApiResponse<SettlementRecord[]>> {
    if (isDemoMode()) {
      return createSuccessResponse(initialSettlements);
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      let query = client.from('payouts').select('*').order('created_at', { ascending: false });
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;
      if (error) {
        return createErrorResponse('BAD_REQUEST', error.message);
      }

      const records: SettlementRecord[] = (data || []).map((row: any) => ({
        id: row.id,
        payoutRef: row.settlement_reference,
        date: new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        grossAmount: Number(row.amount) || 0,
        commission: Number(row.commission) || 0,
        taxes: Number(row.tax) || 0,
        netPayout: Number(row.net_amount) || 0,
        status: row.status === 'COMPLETED' ? 'SETTLED' : 'PROCESSING',
      }));

      return createSuccessResponse(records);
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Failed to fetch settlements');
    }
  },

  /**
   * Calculate and create daily payout batch (authoritative backend)
   */
  async createPayout(
    restaurantId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<ApiResponse<any>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        id: 'demo-payout-id',
        settlement_reference: `SET-${periodStart.replace(/-/g, '')}`,
        amount: 18450,
        commission: 3690, // 20%
        tax: 664.20,     // 18% GST on commission
        net_amount: 13911.30,
        status: 'PENDING',
      });
    }

    const res = await invokeEdgeFunction(
      'create-payout',
      { restaurant_id: restaurantId, period_start: periodStart, period_end: periodEnd },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to generate settlement batch');
    }

    return createSuccessResponse(res.data);
  },

  /**
   * Process settlement clearing
   */
  async processPayout(payoutId: string, utrReference: string): Promise<ApiResponse<any>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        payout_id: payoutId,
        utr_reference: utrReference,
        status: 'COMPLETED',
      });
    }

    const res = await invokeEdgeFunction('process-payout', {
      payout_id: payoutId,
      utr_reference: utrReference,
      status: 'COMPLETED',
    });

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to process payout clearing');
    }

    return createSuccessResponse(res.data);
  },
};

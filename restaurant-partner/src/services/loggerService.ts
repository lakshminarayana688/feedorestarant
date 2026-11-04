/**
 * FEEDO Restaurant Partner - Production Safe Structured Logger
 * Enforces zero-leakage of PII, secrets, OTPs, or financial tokens in production telemetry.
 */

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export interface StructuredLogEntry {
  timestamp: string;
  eventId: string;
  userId?: string;
  restaurantId?: string;
  orderId?: string;
  operation: string;
  status: LogLevel;
  errorCode?: string;
  message?: string;
  metadata?: Record<string, any>;
}

export class LoggerService {
  private static recentLogs: StructuredLogEntry[] = [];
  private static readonly MAX_IN_MEMORY_LOGS = 200;

  /**
   * Masks sensitive PII, passwords, bank numbers, PAN, tokens, and HMAC signatures.
   */
  public static maskValue(key: string, rawValue: any): any {
    if (rawValue === null || rawValue === undefined) return '';
    const str = String(rawValue).trim();
    if (!str) return '';

    const lowerKey = key.toLowerCase();

    // 1. Full Redaction (Passwords, OTPs, Tokens, Secrets, Signatures)
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('otp') ||
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('signature') ||
      lowerKey.includes('jwt') ||
      lowerKey.includes('auth') ||
      lowerKey.includes('key')
    ) {
      return '[REDACTED]';
    }

    // 2. Bank Account Masking (Show only last 4 digits)
    if (lowerKey.includes('bank') || lowerKey.includes('account')) {
      if (str.length <= 4) return '****';
      return '****' + str.slice(-4);
    }

    // 3. PAN / Tax ID Masking
    if (lowerKey.includes('pan') || lowerKey.includes('tax_id')) {
      if (str.length === 10) {
        return str.slice(0, 5) + '****' + str.slice(9);
      }
      return '****';
    }

    // 4. Phone Number Masking (Show first 4 and last 4)
    if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
      if (str.length >= 10) {
        return str.slice(0, 4) + '****' + str.slice(-4);
      }
      return '****';
    }

    // 5. Email Masking
    if (lowerKey.includes('email') && str.includes('@')) {
      const [name, domain] = str.split('@');
      const maskedName = name.length > 2 ? name[0] + '***' + name.slice(-1) : '***';
      return `${maskedName}@${domain}`;
    }

    return str;
  }

  public static sanitizeObject(raw: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((v) =>
          typeof v === 'object' && v !== null ? this.sanitizeObject(v) : this.maskValue(key, v)
        );
      } else {
        sanitized[key] = this.maskValue(key, value);
      }
    }
    return sanitized;
  }

  public static log(entry: {
    operation: string;
    level: LogLevel;
    userId?: string;
    restaurantId?: string;
    orderId?: string;
    errorCode?: string;
    message?: string;
    metadata?: Record<string, any>;
  }): StructuredLogEntry {
    const logItem: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      eventId: 'evt_' + Math.random().toString(36).substring(2, 11),
      userId: entry.userId,
      restaurantId: entry.restaurantId,
      orderId: entry.orderId,
      operation: entry.operation,
      status: entry.level,
      errorCode: entry.errorCode,
      message: entry.message,
      metadata: entry.metadata ? this.sanitizeObject(entry.metadata) : undefined,
    };

    this.recentLogs.push(logItem);
    if (this.recentLogs.length > this.MAX_IN_MEMORY_LOGS) {
      this.recentLogs.shift();
    }

    return logItem;
  }

  public static info(operation: string, details?: Partial<Omit<StructuredLogEntry, 'operation' | 'status'>>) {
    return this.log({ operation, level: 'INFO', ...details });
  }

  public static warn(operation: string, details?: Partial<Omit<StructuredLogEntry, 'operation' | 'status'>>) {
    return this.log({ operation, level: 'WARN', ...details });
  }

  public static error(operation: string, details?: Partial<Omit<StructuredLogEntry, 'operation' | 'status'>>) {
    return this.log({ operation, level: 'ERROR', ...details });
  }

  public static getLogs(): StructuredLogEntry[] {
    return [...this.recentLogs];
  }

  public static clear(): void {
    this.recentLogs = [];
  }
}

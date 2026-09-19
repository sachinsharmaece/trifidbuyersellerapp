/**
 * API_CONTRACT.md §1/§10 error envelope, copied from trifid-serverapp
 * (src/shared/errors.ts) per §11.2. Each frontend keeps its own copy rather
 * than sharing a package, so a contract change is a reviewable diff in both
 * places instead of a silent drift.
 */
export type ErrorCode =
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'LOCKED_OUT'
  | 'NEW_DEVICE'
  | 'SESSION_REPLACED'
  | 'ACCOUNT_NOT_ACTIVE'
  | 'ACCOUNT_BLACKLISTED'
  | 'PERMISSION_DENIED'
  | 'NOT_VISIBLE'
  | 'NOT_FOUND'
  | 'REAUTH_REQUIRED'
  | 'RATE_LIMITED'
  | 'VALIDATION_FAILED'
  | 'INTERNAL_ERROR'
  // M5 additions — modules/listing, modules/demand, modules/pool,
  // modules/orders (trifid-serverapp shared/errors.ts).
  | 'MARGIN_CELL_MISSING'
  | 'NO_AREA_SET'
  | 'SHELF_LIFE_FLOOR'
  | 'BATCH_REQUIRED'
  | 'BELOW_MOQ'
  | 'EXPIRY_REQUIRED'
  | 'DOUBLE_CONFIRM_REQUIRED'
  | 'PILE_ALREADY_DECIDED'
  | 'POOL_CLOSED'
  | 'ORDER_NOT_DISPATCHABLE'
  | 'ORDER_NOT_YET_DELIVERABLE'
  | 'COMPLAINT_WINDOW_CLOSED'
  | 'NETWORK_ERROR'; // client-only: fetch itself failed, no response came back

export class ApiError extends Error {
  code: ErrorCode;
  messageHi?: string;
  field?: string;
  retryable: boolean;
  correlationId?: string;

  constructor(options: {
    code: ErrorCode;
    message: string;
    messageHi?: string;
    field?: string;
    retryable?: boolean;
    correlationId?: string;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.code = options.code;
    this.messageHi = options.messageHi;
    this.field = options.field;
    this.retryable = options.retryable ?? false;
    this.correlationId = options.correlationId;
  }
}

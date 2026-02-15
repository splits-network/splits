/**
 * Billing Listing Model
 * Shared across billing page variants
 */

export type BillingType = 'placement_fee' | 'subscription' | 'platform_fee' | 'refund' | 'credit';
export type BillingStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'draft';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'ach' | 'wire';
export type RecurringInterval = 'monthly' | 'quarterly' | 'annual';

export interface BillingListing {
  id: string;
  invoiceNumber: string;
  type: BillingType;
  status: BillingStatus;
  amount: {
    value: number;
    currency: string;
  };
  client: {
    name: string;
    company: string;
    avatar: string; // Unsplash URL
  };
  description: string;
  paymentMethod?: PaymentMethod;
  dueDate: string; // ISO date string
  paidDate?: string; // ISO date string
  createdDate: string; // ISO date string
  relatedPlacement?: {
    candidateName: string;
    jobTitle: string;
    company: string;
  };
  lineItems: {
    description: string;
    amount: number;
  }[];
  taxAmount?: number;
  notes?: string;
  featured: boolean;
  recurringInterval?: RecurringInterval;
}

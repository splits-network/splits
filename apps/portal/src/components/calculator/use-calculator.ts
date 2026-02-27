'use client';

import { useState, useMemo } from 'react';
import { CalculatorState, TierPayout, RecruiterRole, Tier, CommissionRates } from './types';

const TIERS: Tier[] = ['free', 'paid', 'premium'];

const DEFAULT_STATE: CalculatorState = {
  salary: 100000,      // Default $100k salary
  feePercentage: 20,   // Default 20% fee
  selectedRoles: ['candidate_recruiter'], // Default to most common role
};

const EMPTY_RATES: CommissionRates = {
  candidate_recruiter: 0, job_owner: 0, company_recruiter: 0,
  candidate_sourcer: 0, company_sourcer: 0,
};

export interface UseCalculatorConfig {
  /** Commission rates by tier (0-1 decimal format). Null while loading. */
  rates: Record<Tier, CommissionRates> | null;
  /** Platform take by tier (0-1 decimal format). Null while loading. */
  platformTake: Record<Tier, number> | null;
  /** Tier display info. Null while loading. */
  tierInfo: Record<Tier, { name: string; monthlyPrice: number }> | null;
}

export function useCalculator(config: UseCalculatorConfig, initialState?: Partial<CalculatorState>) {
  const { rates, platformTake, tierInfo } = config;

  const [state, setState] = useState<CalculatorState>({
    ...DEFAULT_STATE,
    ...initialState,
  });

  // Calculate effective placement fee from salary + percentage
  const effectiveFee = useMemo(() => {
    return (state.salary * state.feePercentage) / 100;
  }, [state.salary, state.feePercentage]);

  // Calculate payout for a given tier based on selected roles
  const calculateTierPayout = (tier: Tier): number => {
    if (!rates || state.selectedRoles.length === 0) return 0;

    const tierRates = rates[tier] || EMPTY_RATES;
    const totalRate = state.selectedRoles.reduce((sum, role) => {
      return sum + tierRates[role];
    }, 0);

    return effectiveFee * totalRate;
  };

  // Calculate payouts for all tiers
  const payouts = useMemo((): TierPayout[] => {
    return TIERS.map((tier) => ({
      tier,
      tierName: tierInfo?.[tier]?.name || tier,
      monthlyPrice: tierInfo?.[tier]?.monthlyPrice || 0,
      payout: calculateTierPayout(tier),
      platformTake: effectiveFee * (platformTake?.[tier] || 0),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveFee, state.selectedRoles, rates, platformTake, tierInfo]);

  // Calculate upgrade value (difference between paid/premium and free)
  const upgradeValue = useMemo(() => {
    const freePayout = payouts.find(p => p.tier === 'free')?.payout ?? 0;
    const paidPayout = payouts.find(p => p.tier === 'paid')?.payout ?? 0;
    const premiumPayout = payouts.find(p => p.tier === 'premium')?.payout ?? 0;

    return {
      paidVsFree: paidPayout - freePayout,
      premiumVsFree: premiumPayout - freePayout,
      premiumVsPaid: premiumPayout - paidPayout,
    };
  }, [payouts]);

  // State update functions
  const setSalary = (salary: number) => {
    setState(prev => ({ ...prev, salary: Math.max(0, salary) }));
  };

  const setFeePercentage = (percentage: number) => {
    setState(prev => ({ ...prev, feePercentage: Math.min(100, Math.max(0, percentage)) }));
  };

  const toggleRole = (role: RecruiterRole) => {
    setState(prev => {
      const isSelected = prev.selectedRoles.includes(role);
      const newRoles = isSelected
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role];
      return { ...prev, selectedRoles: newRoles };
    });
  };

  const setSelectedRoles = (roles: RecruiterRole[]) => {
    setState(prev => ({ ...prev, selectedRoles: roles }));
  };

  return {
    state,
    effectiveFee,
    payouts,
    upgradeValue,
    setSalary,
    setFeePercentage,
    toggleRole,
    setSelectedRoles,
  };
}

'use client';

import { useState, useMemo } from 'react';
import { CalculatorState, TierPayout, RecruiterRole, Tier } from './types';
import { COMMISSION_RATES, PLATFORM_TAKE, TIER_INFO } from './commission-rates';

const TIERS: Tier[] = ['free', 'paid', 'premium'];

const DEFAULT_STATE: CalculatorState = {
  salary: 100000,      // Default $100k salary
  feePercentage: 20,   // Default 20% fee
  selectedRoles: ['candidate_recruiter'], // Default to most common role
};

export function useCalculator(initialState?: Partial<CalculatorState>) {
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
    if (state.selectedRoles.length === 0) return 0;

    const rates = COMMISSION_RATES[tier];
    const totalRate = state.selectedRoles.reduce((sum, role) => {
      return sum + rates[role];
    }, 0);

    return effectiveFee * totalRate;
  };

  // Calculate payouts for all tiers
  const payouts = useMemo((): TierPayout[] => {
    return TIERS.map((tier) => ({
      tier,
      tierName: TIER_INFO[tier].name,
      monthlyPrice: TIER_INFO[tier].monthlyPrice,
      payout: calculateTierPayout(tier),
      platformTake: effectiveFee * PLATFORM_TAKE[tier],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveFee, state.selectedRoles]);

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

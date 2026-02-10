'use client';

import { TierPayout, Tier } from './types';
import { AnimatedPayout } from './animated-payout';

interface TierComparisonProps {
  payouts: TierPayout[];
  upgradeValue: {
    paidVsFree: number;
    premiumVsFree: number;
    premiumVsPaid: number;
  };
  effectiveFee: number;
  /** Optional: highlight the user's current tier with a "Your Plan" indicator */
  currentTier?: Tier;
}

export function TierComparison({ payouts, upgradeValue, effectiveFee, currentTier }: TierComparisonProps) {
  const freePayout = payouts.find((p) => p.tier === 'free');
  const paidPayout = payouts.find((p) => p.tier === 'paid');
  const premiumPayout = payouts.find((p) => p.tier === 'premium');

  if (!freePayout || !paidPayout || !premiumPayout) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Tier Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* Free Tier */}
        <div className={`card bg-base-200 shadow ${currentTier === 'free' ? 'ring-2 ring-primary' : ''}`}>
          <div className="card-body p-3 text-center">
            {currentTier === 'free' && (
              <div className="badge badge-primary badge-xs mb-1">
                Your Plan
              </div>
            )}
            <div className="badge badge-ghost badge-sm mb-1">{freePayout.tierName}</div>
            <div className="text-xs text-base-content/60">
              {formatCurrency(freePayout.monthlyPrice)}/mo
            </div>
            <div className="text-xl font-bold my-1">
              <AnimatedPayout value={freePayout.payout} highlightChange />
            </div>
            <div className="text-xs text-base-content/50">Your payout</div>
          </div>
        </div>

        {/* Paid Tier - Highlighted */}
        <div className={`card bg-primary text-primary-content shadow-lg ${currentTier === 'paid' ? 'ring-2 ring-accent ring-offset-2' : ''}`}>
          <div className="card-body p-3 text-center">
            {currentTier === 'paid' && (
              <div className="badge badge-accent badge-xs mb-1">
                Your Plan
              </div>
            )}
            <div className="badge badge-secondary badge-sm mb-1">{paidPayout.tierName}</div>
            <div className="text-xs opacity-80">
              {formatCurrency(paidPayout.monthlyPrice)}/mo
            </div>
            <div className="text-xl font-bold my-1">
              <AnimatedPayout value={paidPayout.payout} highlightChange />
            </div>
            <div className="text-xs opacity-70">Your payout</div>
            {/* Upgrade Value Highlight */}
            {upgradeValue.paidVsFree > 0 && (
              <div className="mt-1 pt-1 border-t border-primary-content/20">
                <div className="badge badge-success badge-sm gap-1">
                  <i className="fa-duotone fa-regular fa-arrow-up text-[10px]"></i>
                  +{formatCurrency(upgradeValue.paidVsFree)}
                </div>
                <div className="text-[10px] opacity-60 mt-0.5">vs. Starter</div>
              </div>
            )}
          </div>
        </div>

        {/* Premium Tier */}
        <div className={`card bg-base-200 shadow border-2 border-accent ${currentTier === 'premium' ? 'ring-2 ring-primary' : ''}`}>
          <div className="card-body p-3 text-center">
            {currentTier === 'premium' && (
              <div className="badge badge-primary badge-xs mb-1">
                Your Plan
              </div>
            )}
            <div className="badge badge-accent badge-sm mb-1">{premiumPayout.tierName}</div>
            <div className="text-xs text-base-content/60">
              {formatCurrency(premiumPayout.monthlyPrice)}/mo
            </div>
            <div className="text-xl font-bold my-1">
              <AnimatedPayout value={premiumPayout.payout} highlightChange />
            </div>
            <div className="text-xs text-base-content/50">Your payout</div>
            {/* Upgrade Value Highlight */}
            {upgradeValue.premiumVsFree > 0 && (
              <div className="mt-1 pt-1 border-t border-base-300">
                <div className="badge badge-success badge-sm gap-1">
                  <i className="fa-duotone fa-regular fa-arrow-up text-[10px]"></i>
                  +{formatCurrency(upgradeValue.premiumVsFree)}
                </div>
                <div className="text-[10px] text-base-content/50 mt-0.5">vs. Starter</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROI Summary */}
      {effectiveFee > 0 && upgradeValue.premiumVsFree > 0 && (
        <div className="alert bg-success/10 border-success/30">
          <i className="fa-duotone fa-regular fa-lightbulb text-success text-lg"></i>
          <div>
            <div className="font-semibold text-sm">One placement pays for your upgrade</div>
            <div className="text-xs text-base-content/70">
              On a {formatCurrency(effectiveFee)} placement, upgrading to Partner earns you{' '}
              <span className="font-bold text-success">{formatCurrency(upgradeValue.premiumVsFree)}</span> more
              — that's {((upgradeValue.premiumVsFree / 249) * 100).toFixed(0)}% of the monthly cost recovered in one deal.
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Table */}
      <div className="bg-base-200 rounded-lg p-4">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Tier</th>
                <th className="text-right">Your Rate</th>
                <th className="text-right">Your Payout</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.tier} className={currentTier === payout.tier ? 'bg-primary/10 font-semibold' : ''}>
                  <td className="font-medium">
                    {payout.tierName}
                    {currentTier === payout.tier && (
                      <span className="badge badge-primary badge-xs ml-2">Current</span>
                    )}
                  </td>
                  <td className="text-right text-base-content/60">
                    {effectiveFee > 0 ? `${((payout.payout / effectiveFee) * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td className="text-right">{formatCurrency(payout.payout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

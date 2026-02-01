'use client';

import { TierPayout } from './types';
import { AnimatedPayout } from './animated-payout';

interface TierComparisonProps {
  payouts: TierPayout[];
  upgradeValue: {
    paidVsFree: number;
    premiumVsFree: number;
    premiumVsPaid: number;
  };
  effectiveFee: number;
}

export function TierComparison({ payouts, upgradeValue, effectiveFee }: TierComparisonProps) {
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
    <div className="space-y-6">
      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Free Tier */}
        <div className="card bg-base-200 shadow">
          <div className="card-body p-4 text-center">
            <div className="badge badge-ghost mb-2">{freePayout.tierName}</div>
            <div className="text-sm text-base-content/60 mb-1">
              {formatCurrency(freePayout.monthlyPrice)}/mo
            </div>
            <div className="text-3xl font-bold mb-2">
              <AnimatedPayout value={freePayout.payout} highlightChange />
            </div>
            <div className="text-xs text-base-content/50">Your payout</div>
          </div>
        </div>

        {/* Paid Tier - Highlighted */}
        <div className="card bg-primary text-primary-content shadow-lg scale-[1.02]">
          <div className="card-body p-4 text-center">
            <div className="badge badge-secondary mb-2">{paidPayout.tierName}</div>
            <div className="text-sm opacity-80 mb-1">
              {formatCurrency(paidPayout.monthlyPrice)}/mo
            </div>
            <div className="text-3xl font-bold mb-2">
              <AnimatedPayout value={paidPayout.payout} highlightChange />
            </div>
            <div className="text-xs opacity-70">Your payout</div>
            {/* Upgrade Value Highlight */}
            {upgradeValue.paidVsFree > 0 && (
              <div className="mt-2 pt-2 border-t border-primary-content/20">
                <div className="badge badge-success gap-1">
                  <i className="fa-duotone fa-regular fa-arrow-up text-xs"></i>
                  +{formatCurrency(upgradeValue.paidVsFree)}
                </div>
                <div className="text-xs opacity-60 mt-1">vs. Starter</div>
              </div>
            )}
          </div>
        </div>

        {/* Premium Tier */}
        <div className="card bg-base-200 shadow border-2 border-accent">
          <div className="card-body p-4 text-center">
            <div className="badge badge-accent mb-2">{premiumPayout.tierName}</div>
            <div className="text-sm text-base-content/60 mb-1">
              {formatCurrency(premiumPayout.monthlyPrice)}/mo
            </div>
            <div className="text-3xl font-bold mb-2">
              <AnimatedPayout value={premiumPayout.payout} highlightChange />
            </div>
            <div className="text-xs text-base-content/50">Your payout</div>
            {/* Upgrade Value Highlight */}
            {upgradeValue.premiumVsFree > 0 && (
              <div className="mt-2 pt-2 border-t border-base-300">
                <div className="badge badge-success gap-1">
                  <i className="fa-duotone fa-regular fa-arrow-up text-xs"></i>
                  +{formatCurrency(upgradeValue.premiumVsFree)}
                </div>
                <div className="text-xs text-base-content/50 mt-1">vs. Starter</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROI Summary */}
      {effectiveFee > 0 && upgradeValue.premiumVsFree > 0 && (
        <div className="alert bg-success/10 border-success/30">
          <i className="fa-duotone fa-regular fa-lightbulb text-success text-xl"></i>
          <div>
            <div className="font-semibold">One placement pays for your upgrade</div>
            <div className="text-sm text-base-content/70">
              On a {formatCurrency(effectiveFee)} placement, upgrading to Partner earns you{' '}
              <span className="font-bold text-success">{formatCurrency(upgradeValue.premiumVsFree)}</span> more
              — that's {((upgradeValue.premiumVsFree / 249) * 100).toFixed(0)}% of the monthly cost recovered in one deal.
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Details (Collapsible) */}
      <details className="collapse collapse-arrow bg-base-200">
        <summary className="collapse-title text-sm font-medium">
          <i className="fa-duotone fa-regular fa-chart-pie mr-2"></i>
          View breakdown details
        </summary>
        <div className="collapse-content">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th className="text-right">Your Payout</th>
                  <th className="text-right">Platform Take</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.tier}>
                    <td className="font-medium">{payout.tierName}</td>
                    <td className="text-right">{formatCurrency(payout.payout)}</td>
                    <td className="text-right text-base-content/60">
                      {formatCurrency(payout.platformTake)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}

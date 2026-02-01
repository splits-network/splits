'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { duration, easing } from '@/components/landing/shared/animation-utils';
import { useCalculator } from './use-calculator';
import { FeeInput } from './fee-input';
import { RoleSelector } from './role-selector';
import { TierComparison } from './tier-comparison';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface RTICalculatorProps {
  /** Optional: Enable scroll-triggered entrance animation */
  animate?: boolean;
  /** Optional: Custom class for the container */
  className?: string;
}

export function RTICalculator({ animate = false, className = '' }: RTICalculatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    state,
    effectiveFee,
    payouts,
    upgradeValue,
    setSalary,
    setFeePercentage,
    toggleRole,
  } = useCalculator();

  // Scroll-triggered entrance animation
  useGSAP(
    () => {
      if (!animate || !containerRef.current || !contentRef.current) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: duration.normal,
          ease: easing.smooth,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          },
        }
      );
    },
    { scope: containerRef, dependencies: [animate] }
  );

  return (
    <div ref={containerRef} className={className}>
      <div ref={contentRef} className={animate ? 'opacity-0' : ''}>
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section - Left side on desktop */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  <i className="fa-duotone fa-regular fa-calculator text-primary"></i>
                  Calculate Your Earnings
                </h3>
                <FeeInput
                  salary={state.salary}
                  feePercentage={state.feePercentage}
                  effectiveFee={effectiveFee}
                  onSalaryChange={setSalary}
                  onFeePercentageChange={setFeePercentage}
                />
                <div className="divider my-4"></div>
                <RoleSelector
                  selectedRoles={state.selectedRoles}
                  onToggleRole={toggleRole}
                />
              </div>
            </div>
          </div>

          {/* Results Section - Right side on desktop */}
          <div className="lg:col-span-7">
            <div className="card bg-base-100 shadow-lg h-full">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  <i className="fa-duotone fa-regular fa-chart-column text-secondary"></i>
                  Your Payout by Tier
                </h3>
                <TierComparison
                  payouts={payouts}
                  upgradeValue={upgradeValue}
                  effectiveFee={effectiveFee}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center mt-6 text-sm text-base-content/50">
          <i className="fa-duotone fa-regular fa-info-circle mr-1"></i>
          Payouts are illustrative and based on current commission rates. Actual payouts are finalized at hire time.
        </div>
      </div>
    </div>
  );
}

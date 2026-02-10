'use client';

import { useId } from 'react';

interface FeeInputProps {
  salary: number;
  feePercentage: number;
  effectiveFee: number;
  onSalaryChange: (salary: number) => void;
  onFeePercentageChange: (percentage: number) => void;
  /** Lock the fee percentage input (e.g. when it's set by the role) */
  feeReadOnly?: boolean;
}

export function FeeInput({
  salary,
  feePercentage,
  effectiveFee,
  onSalaryChange,
  onFeePercentageChange,
  feeReadOnly = false,
}: FeeInputProps) {
  const salaryId = useId();
  const percentageId = useId();

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
      {/* Salary + Percentage Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <fieldset className="form-control">
          <label htmlFor={salaryId} className="label">
            <span className="label-text font-medium">Annual Salary</span>
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <span className="text-base-content/60">$</span>
            <input
              id={salaryId}
              type="number"
              className="grow"
              placeholder="100000"
              value={salary || ''}
              onChange={(e) => onSalaryChange(Number(e.target.value))}
              min={0}
              step={5000}
            />
          </label>
        </fieldset>
        <fieldset className="form-control">
          <label htmlFor={percentageId} className="label">
            <span className="label-text font-medium">Fee %</span>
          </label>
          <label className={`input input-bordered flex items-center gap-2 ${feeReadOnly ? 'bg-base-200 cursor-not-allowed' : ''}`}>
            <input
              id={percentageId}
              type="number"
              className={`grow ${feeReadOnly ? 'cursor-not-allowed' : ''}`}
              placeholder="20"
              value={feePercentage || ''}
              onChange={(e) => !feeReadOnly && onFeePercentageChange(Number(e.target.value))}
              readOnly={feeReadOnly}
              tabIndex={feeReadOnly ? -1 : undefined}
              min={0}
              max={100}
              step={1}
            />
            <span className="text-base-content/60">%</span>
          </label>
        </fieldset>
      </div>

      {/* Calculated Fee Display */}
      <div className="text-sm text-base-content/70">
        Placement Fee: <span className="font-semibold">{formatCurrency(effectiveFee)}</span>
      </div>
    </div>
  );
}

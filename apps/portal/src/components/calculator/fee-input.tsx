'use client';

import { useId } from 'react';

interface FeeInputProps {
  inputMode: 'fee' | 'salary';
  placementFee: number;
  salary: number;
  feePercentage: number;
  effectiveFee: number;
  onInputModeChange: (mode: 'fee' | 'salary') => void;
  onPlacementFeeChange: (fee: number) => void;
  onSalaryChange: (salary: number) => void;
  onFeePercentageChange: (percentage: number) => void;
}

export function FeeInput({
  inputMode,
  placementFee,
  salary,
  feePercentage,
  effectiveFee,
  onInputModeChange,
  onPlacementFeeChange,
  onSalaryChange,
  onFeePercentageChange,
}: FeeInputProps) {
  const feeId = useId();
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
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          className={`btn btn-sm ${inputMode === 'fee' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onInputModeChange('fee')}
        >
          Direct Fee
        </button>
        <button
          type="button"
          className={`btn btn-sm ${inputMode === 'salary' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onInputModeChange('salary')}
        >
          Salary + %
        </button>
      </div>

      {inputMode === 'fee' ? (
        /* Direct Fee Input */
        <fieldset className="form-control">
          <label htmlFor={feeId} className="label">
            <span className="label-text font-medium">Placement Fee</span>
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <span className="text-base-content/60">$</span>
            <input
              id={feeId}
              type="number"
              className="grow"
              placeholder="20000"
              value={placementFee || ''}
              onChange={(e) => onPlacementFeeChange(Number(e.target.value))}
              min={0}
              step={1000}
            />
          </label>
        </fieldset>
      ) : (
        /* Salary + Percentage Inputs */
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
            <label className="input input-bordered flex items-center gap-2">
              <input
                id={percentageId}
                type="number"
                className="grow"
                placeholder="20"
                value={feePercentage || ''}
                onChange={(e) => onFeePercentageChange(Number(e.target.value))}
                min={0}
                max={100}
                step={1}
              />
              <span className="text-base-content/60">%</span>
            </label>
          </fieldset>
        </div>
      )}

      {/* Calculated Fee Display (salary mode only) */}
      {inputMode === 'salary' && (
        <div className="text-sm text-base-content/70">
          Placement Fee: <span className="font-semibold">{formatCurrency(effectiveFee)}</span>
        </div>
      )}
    </div>
  );
}

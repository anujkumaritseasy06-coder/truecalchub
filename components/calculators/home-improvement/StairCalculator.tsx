"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateStairs, 
  UnitSystem, 
  StairType
} from '@/lib/calculators/stairs';
import { AlertTriangle, CheckCircle, SplitSquareVertical } from 'lucide-react';

export function StairCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [stairType, setStairType] = useState<StairType>('standard');
  const [hasLanding, setHasLanding] = useState<boolean>(false);
  const [landingSplit, setLandingSplit] = useState<string>('');

  // Core Measurements
  const [totalRise, setTotalRise] = useState<string>(''); // 9 feet default
  const [targetRiser, setTargetRiser] = useState<string>('');
  const [targetTread, setTargetTread] = useState<string>('');
  const [stringerCount, setStringerCount] = useState<string>('');

  // Material Costs for Deck Stairs
  const [costStringer, setCostStringer] = useState<string>(''); // 2x12
  const [costTread, setCostTread] = useState<string>(''); // 5/4x6
  const [costRiser, setCostRiser] = useState<string>(''); // 1x8
  const [laborTotal, setLaborTotal] = useState<string>('');

  const { results, error } = useMemo(() => {
    const tRise = parseFloat(totalRise);
    const tgRiser = parseFloat(targetRiser);
    const tgTread = parseFloat(targetTread);
    const sCount = parseInt(stringerCount);
    const lSplit = parseFloat(landingSplit);

    if (isNaN(tRise) || isNaN(tgRiser) || isNaN(tgTread) || tRise <= 0 || tgRiser <= 0 || tgTread <= 0) {
      return { results: null, error: 'Please enter valid positive dimensions for the rise and tread.' };
    }

    const outputs = calculateStairs(
      {
        totalRise: tRise,
        targetRiserHeight: tgRiser,
        targetTreadDepth: tgTread,
        stringerWidth: isNaN(sCount) ? 3 : sCount,
        stairType,
        hasLanding,
        landingSplitPercentage: isNaN(lSplit) ? 50 : lSplit
      }, 
      unit
    );

    return { results: outputs, error: null };
  }, [totalRise, targetRiser, targetTread, stringerCount, stairType, hasLanding, landingSplit, unit]);

  const costValues = useMemo(() => {
    if (!results || !results.materialEstimate || stairType !== 'deck') return null;
    
    const stringerPrice = parseFloat(costStringer) || 0;
    const treadPrice = parseFloat(costTread) || 0;
    const riserPrice = parseFloat(costRiser) || 0;
    const labor = parseFloat(laborTotal) || 0;

    const materialsCost = 
      (results.materialEstimate.stringers2x12 * stringerPrice) +
      (results.materialEstimate.treadBoards * treadPrice) +
      (results.materialEstimate.riserBoards * riserPrice);

    return {
      materialsCost,
      laborCost: labor,
      grandTotal: materialsCost + labor
    };
  }, [results, costStringer, costTread, costRiser, laborTotal, stairType]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  const unitLabel = unit === 'imperial' ? 'in' : 'cm';

  const renderFlight = (flight: any, title: string) => (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-3">
        <SecondaryResultDisplay 
          label="Number of Steps (Risers)" 
          value={`${flight.numberOfSteps}`} 
          valueClassName="text-indigo-600 dark:text-indigo-400 font-bold"
        />
        <SecondaryResultDisplay 
          label="Exact Riser Height" 
          value={`${formatUnit(flight.actualRiserHeight, 3)}${unitLabel}`} 
        />
        <SecondaryResultDisplay 
          label="Exact Tread Depth" 
          value={`${formatUnit(flight.actualTreadDepth, 2)}${unitLabel}`} 
        />
        <div className="pt-3 mt-3 border-t border-border">
          <SecondaryResultDisplay 
            label="Total Horizontal Run" 
            value={`${formatUnit(flight.totalRun, 2)}${unitLabel}`} 
          />
          <SecondaryResultDisplay 
            label="Stringer Length (Hypotenuse)" 
            value={`${formatUnit(flight.stringerLength, 2)}${unitLabel}`} 
            valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
          />
          <SecondaryResultDisplay 
            label="Stringer Angle (Pitch)" 
            value={`${formatUnit(flight.stringerAngle, 1)}°`} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Project Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={stairType}
                onChange={(e) => setStairType(e.target.value as StairType)}
              >
                <option value="standard">Standard Interior / Framing</option>
                <option value="deck">Deck Stairs (Lumber Estimator)</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Measurement Unit</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitSystem)}
              >
                <option value="imperial">Imperial (Inches)</option>
                <option value="metric">Metric (Centimeters)</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-6">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Primary Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-indigo-900 dark:text-indigo-200">Total Rise (Height)</Label>
                <NumberInput value={totalRise} onChange={(e) => setTotalRise(e.target.value)} min="1" placeholder="108" suffixNode={<span>{unitLabel}</span>} className="border-indigo-200 focus-visible:ring-indigo-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-indigo-900 dark:text-indigo-200">Target Riser</Label>
                <NumberInput value={targetRiser} onChange={(e) => setTargetRiser(e.target.value)} min="1" placeholder="7.5" suffixNode={<span>{unitLabel}</span>} className="border-indigo-200 focus-visible:ring-indigo-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-indigo-900 dark:text-indigo-200">Target Tread</Label>
                <NumberInput value={targetTread} onChange={(e) => setTargetTread(e.target.value)} min="1" placeholder="10.5" suffixNode={<span>{unitLabel}</span>} className="border-indigo-200 focus-visible:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-secondary-50 dark:bg-secondary-900/30 p-4 rounded-xl border border-border">
            <input 
              type="checkbox" 
              id="hasLanding"
              checked={hasLanding} 
              onChange={(e) => setHasLanding(e.target.checked)}
              className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="hasLanding" className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2">
              <SplitSquareVertical size={18} className="text-secondary-500" />
              Include Mid-Point Landing (L-Shape or U-Shape Stairs)
            </label>
          </div>

          {hasLanding && (
            <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-2">
                <Label>Landing Split Percentage</Label>
                <NumberInput value={landingSplit} onChange={(e) => setLandingSplit(e.target.value)} min="10" max="90" placeholder="50" suffixNode={<span>%</span>} />
                <p className="text-xs text-secondary-500 mt-1">50% means the landing is exactly halfway up the total rise.</p>
              </div>
            </div>
          )}

          {stairType === 'deck' && (
            <div className="space-y-6 pt-6 border-t border-border animate-in fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Deck Material Estimation</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Stringers</Label>
                  <NumberInput value={stringerCount} onChange={(e) => setStringerCount(e.target.value)} min="2" step="1" />
                  <p className="text-xs text-secondary-500">Usually spaced 12" or 16" on center.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>2x12 Cost</Label>
                  <NumberInput value={costStringer} onChange={(e) => setCostStringer(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
                <div className="space-y-2">
                  <Label>5/4 Tread Cost</Label>
                  <NumberInput value={costTread} onChange={(e) => setCostTread(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
                <div className="space-y-2">
                  <Label>1x8 Riser Cost</Label>
                  <NumberInput value={costRiser} onChange={(e) => setCostRiser(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
                <div className="space-y-2">
                  <Label>Total Labor</Label>
                  <NumberInput value={laborTotal} onChange={(e) => setLaborTotal(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
              </div>
            </div>
          )}

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Code Compliance Alert */}
          {results && (
            <div className={`p-4 rounded-xl border ${results.codeCompliance.isCompliant ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'}`}>
              <div className="flex items-start gap-3">
                {results.codeCompliance.isCompliant ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h4 className={`font-semibold ${results.codeCompliance.isCompliant ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'}`}>
                    {results.codeCompliance.isCompliant ? 'IBC Code Compliant' : 'Building Code Warning'}
                  </h4>
                  {!results.codeCompliance.isCompliant && (
                    <ul className="mt-1 text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                      {results.codeCompliance.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {results && (
            <>
              {renderFlight(results.flight1, hasLanding ? 'Lower Flight Details' : 'Staircase Details')}
              {hasLanding && results.flight2 && renderFlight(results.flight2, 'Upper Flight Details')}

              {stairType === 'deck' && costValues && results.materialEstimate && (
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Deck Materials & Costs</h3>
                  <div className="space-y-3">
                    <SecondaryResultDisplay 
                      label="2x12 Stringers Required" 
                      value={`${results.materialEstimate.stringers2x12} Boards`} 
                    />
                    <SecondaryResultDisplay 
                      label="5/4 Decking (Treads)" 
                      value={`${results.materialEstimate.treadBoards} Boards`} 
                    />
                    <SecondaryResultDisplay 
                      label="1x8 Boards (Risers)" 
                      value={`${results.materialEstimate.riserBoards} Boards`} 
                    />
                    <div className="pt-4 mt-4 border-t border-border">
                      <SecondaryResultDisplay 
                        label="Materials Cost" 
                        value={`$${formatUnit(costValues.materialsCost)}`} 
                      />
                      <SecondaryResultDisplay 
                        label="Total Project Estimate" 
                        value={`$${formatUnit(costValues.grandTotal)}`} 
                        valueClassName="text-indigo-600 dark:text-indigo-400 font-bold text-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </CalculatorWrapper>
  );
}

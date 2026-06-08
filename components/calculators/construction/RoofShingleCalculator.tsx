"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  RoofingMaterial,
  RoofComplexity,
  calculateRoofing
} from '@/lib/calculators/roofing';

export function RoofShingleCalculator() {
  // Inputs
  const [houseLength, setHouseLength] = useState<string>('');
  const [houseWidth, setHouseWidth] = useState<string>('');
  
  const [pitchX, setPitchX] = useState<number>(6); // 6/12 pitch default
  const [complexity, setComplexity] = useState<RoofComplexity>('average');
  const [material, setMaterial] = useState<RoofingMaterial>('architectural');
  const [overhang, setOverhang] = useState<number>(1.5); // 18" standard eave

  // Cost Inputs
  const [costPerBundle, setCostPerBundle] = useState<string>(''); 
  const [costPerUnderlayment, setCostPerUnderlayment] = useState<string>(''); 

  const { results, error } = useMemo(() => {
    const len = parseFloat(houseLength);
    const wid = parseFloat(houseWidth);

    if ((houseLength !== '' && isNaN(len)) || (houseWidth !== '' && isNaN(wid))) {
      return { results: null, error: 'Please enter valid numerical dimensions.' };
    }

    if (len > 0 && wid > 0) {
      if (len > 1000 || wid > 1000) {
        return { results: null, error: 'Dimensions exceed maximum allowed for a residential footprint.' };
      }

      // Hardcode tearOffLayers=0 and reDecking=false for a simpler shingle-focused output
      const outputs = calculateRoofing(len, wid, pitchX, complexity, material, overhang, 0, false);
      return { results: outputs, error: null };
    }

    return { results: null, error: null };
  }, [houseLength, houseWidth, pitchX, complexity, material, overhang]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    
    const bundleCost = parseFloat(costPerBundle) || 0;
    const underlaymentCost = parseFloat(costPerUnderlayment) || 0;

    const primaryMaterialCost = results.shingleBundles * bundleCost;
    const totalUnderlaymentCost = results.underlaymentRolls * underlaymentCost;
    
    // Add estimated costs for accessories (Drip edge, nails, ridge caps, starter)
    const estimatedAccessoriesCost = (results.starterShingleBundles * 35) + (results.ridgeCapBundles * 45) + (results.roofingNailsPounds * 2);

    return {
      primary: primaryMaterialCost,
      underlayment: totalUnderlaymentCost,
      accessories: estimatedAccessoriesCost,
      total: primaryMaterialCost + totalUnderlaymentCost + estimatedAccessoriesCost
    };
  }, [results, costPerBundle, costPerUnderlayment]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <CalculatorWrapper className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">House Footprint (Base Area)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Length</Label>
                <NumberInput value={houseLength} onChange={(e) => setHouseLength(e.target.value)} min="0" placeholder="e.g. 50" suffixNode={<span>ft</span>} />
              </div>
              <div className="space-y-2">
                <Label>Width</Label>
                <NumberInput value={houseWidth} onChange={(e) => setHouseWidth(e.target.value)} min="0" placeholder="e.g. 30" suffixNode={<span>ft</span>} />
              </div>
            </div>
            <div className="pt-4 border-t border-border space-y-2">
               <div className="flex justify-between items-center">
                  <Label>Eave Overhang</Label>
                  <span className="text-xs text-secondary-500">Adds to footprint</span>
               </div>
               <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={overhang}
                  onChange={(e) => setOverhang(Number(e.target.value))}
                >
                  <option value={0}>No Overhang (Flat Walls)</option>
                  <option value={1}>12" Overhang</option>
                  <option value={1.5}>18" Overhang (Standard)</option>
                  <option value={2}>24" Overhang</option>
                </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <Label>Shingle Type</Label>
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-primary-500 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={material}
                onChange={(e) => setMaterial(e.target.value as RoofingMaterial)}
              >
                <option value="architectural">Architectural / Dimensional Shingles</option>
                <option value="3-tab">3-Tab Shingles (Flat)</option>
              </select>
              <p className="text-xs text-secondary-500">Determines bundle count rules (3 bundles per square is standard).</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Roof Pitch</Label>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {pitchX}/12
                </span>
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={pitchX}
                onChange={(e) => setPitchX(Number(e.target.value))}
              >
                <option value={2}>2/12 (Low Slope)</option>
                <option value={4}>4/12 (Standard Ranch)</option>
                <option value={6}>6/12 (Average Slope)</option>
                <option value={8}>8/12 (Steep Slope)</option>
                <option value={10}>10/12 (Very Steep)</option>
                <option value={12}>12/12 (45° Angle - Extreme)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Roof Complexity (Waste Factor)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as RoofComplexity)}
              >
                <option value="simple">Simple Gable (5% Waste)</option>
                <option value="average">Average Hip/Valleys (10% Waste)</option>
                <option value="complex">Complex Dormers (15% Waste)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Shingle Budget Estimator</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost per Bundle</Label>
                <NumberInput value={costPerBundle} onChange={(e) => setCostPerBundle(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Cost per Underlayment Roll</Label>
                <NumberInput value={costPerUnderlayment} onChange={(e) => setCostPerUnderlayment(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Shingle Requirements</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ResultDisplay 
                label="Shingle Bundles Needed"
                value={!results ? '--' : results.shingleBundles}
                subValue="At 3 bundles per square"
                className="bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-900 dark:to-orange-900 border-amber-800 shadow-lg [&>h3]:!text-amber-200 [&>p]:!text-amber-300"
                valueClassName="text-5xl md:text-6xl !text-white font-bold tracking-tight"
              />
              <ResultDisplay 
                label="Total Roofing Squares"
                value={!results ? '--' : results.totalSquares}
                subValue="1 Square = 100 Sq. Ft."
                className="bg-background border border-border shadow-sm p-4"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">Base Footprint</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.baseAreaSqFt, 0)} <span className="text-xs font-normal">sqft</span></p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center border-b-4 border-b-sky-500">
                <p className="text-[10px] text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1 font-bold">True Pitch Area</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.trueSurfaceAreaSqFt, 0)} <span className="text-xs font-normal">sqft</span></p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center border-b-4 border-b-amber-500">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 font-bold">Area w/ Waste</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.areaWithWasteSqFt, 0)} <span className="text-xs font-normal">sqft</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shingle Accessories */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Shingle Components</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="Starter Shingle Bundles" value={!results ? '--' : results.starterShingleBundles} />
                  <SecondaryResultDisplay label="Ridge Cap Bundles" value={!results ? '--' : results.ridgeCapBundles} />
                  <SecondaryResultDisplay label="Roofing Nails" value={!results ? '--' : `${results.roofingNailsPounds} lbs`} />
                  <div className="pt-2 border-t border-border"></div>
                  <SecondaryResultDisplay label="Underlayment Rolls" value={!results ? '--' : results.underlaymentRolls} />
                </div>
              </div>
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Shingle Budget Estimate</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay 
                    label="Primary Shingles" 
                    value={!costValues ? '--' : formatCurrency(costValues.primary)} 
                  />
                  <SecondaryResultDisplay 
                    label="Underlayment" 
                    value={!costValues ? '--' : formatCurrency(costValues.underlayment)} 
                  />
                  <SecondaryResultDisplay 
                    label="Accessories (Starter, Caps)" 
                    value={!costValues ? '--' : formatCurrency(costValues.accessories)} 
                  />
                  <div className="pt-2 border-t border-border">
                    <SecondaryResultDisplay 
                      label="Total Materials" 
                      value={!costValues ? '--' : formatCurrency(costValues.total)} 
                      valueClassName="text-foreground font-bold"
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-secondary-500 mt-4 leading-relaxed">
                Estimate strictly covers asphalt shingle materials and standard underlayment. Labor and tear-off not included.
              </p>
            </div>
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

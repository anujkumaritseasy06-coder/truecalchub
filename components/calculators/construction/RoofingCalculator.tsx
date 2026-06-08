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

export function RoofingCalculator() {
  // Inputs
  const [houseLength, setHouseLength] = useState<string>('');
  const [houseWidth, setHouseWidth] = useState<string>('');
  
  const [pitchX, setPitchX] = useState<number>(6); // 6/12 pitch default
  const [complexity, setComplexity] = useState<RoofComplexity>('average');
  const [material, setMaterial] = useState<RoofingMaterial>('architectural');
  const [overhang, setOverhang] = useState<number>(1.5); // 18" standard eave

  // V2 Upgrades
  const [tearOffLayers, setTearOffLayers] = useState<number>(1);
  const [reDecking, setReDecking] = useState<boolean>(false);

  // Cost Inputs
  const [costPerBundle, setCostPerBundle] = useState<string>(''); // standard architectural bundle
  const [costPerUnderlayment, setCostPerUnderlayment] = useState<string>(''); // synthetic roll
  const [costPerIceAndWater, setCostPerIceAndWater] = useState<string>(''); // roll

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

      const outputs = calculateRoofing(len, wid, pitchX, complexity, material, overhang, tearOffLayers, reDecking);
      return { results: outputs, error: null };
    }

    return { results: null, error: null };
  }, [houseLength, houseWidth, pitchX, complexity, material, overhang, tearOffLayers, reDecking]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    
    const bundleCost = parseFloat(costPerBundle) || 0;
    const underlaymentCost = parseFloat(costPerUnderlayment) || 0;
    const iceWaterCost = parseFloat(costPerIceAndWater) || 0;

    let primaryMaterialCost = 0;
    if (material === 'architectural' || material === '3-tab' || material === 'cedar') {
      primaryMaterialCost = results.shingleBundles * bundleCost;
    } else {
      // Rough estimation for metal if user inputs bundle cost as "panel cost"
      primaryMaterialCost = results.metalPanels * bundleCost;
    }

    const totalUnderlaymentCost = results.underlaymentRolls * underlaymentCost;
    const totalIceWaterCost = results.iceAndWaterShieldRolls * iceWaterCost;
    
    // Add estimated costs for accessories (Drip edge, nails, ridge caps)
    const estimatedAccessoriesCost = (results.dripEdgePieces * 10) + (results.roofingNailsPounds * 2) + (results.ridgeCapBundles * 40);

    return {
      primary: primaryMaterialCost,
      underlayment: totalUnderlaymentCost + totalIceWaterCost,
      accessories: estimatedAccessoriesCost,
      total: primaryMaterialCost + totalUnderlaymentCost + totalIceWaterCost + estimatedAccessoriesCost
    };
  }, [results, material, costPerBundle, costPerUnderlayment, costPerIceAndWater]);

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
                <Label>Roof Pitch (Slope)</Label>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {pitchX}/12
                </span>
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-primary-500 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={pitchX}
                onChange={(e) => setPitchX(Number(e.target.value))}
              >
                <option value={1}>1/12 (Flat / Very Low Slope)</option>
                <option value={2}>2/12 (Low Slope)</option>
                <option value={4}>4/12 (Standard Ranch)</option>
                <option value={6}>6/12 (Average Slope)</option>
                <option value={8}>8/12 (Steep Slope)</option>
                <option value={10}>10/12 (Very Steep)</option>
                <option value={12}>12/12 (45° Angle - Extreme)</option>
                <option value={18}>18/12 (Mansard / A-Frame)</option>
              </select>
              <p className="text-xs text-secondary-500">Steeper pitches drastically increase total surface area.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Roof Complexity</Label>
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
              <div className="space-y-3">
                <Label>Roofing Material</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as RoofingMaterial)}
                >
                  <option value="architectural">Architectural Asphalt</option>
                  <option value="3-tab">3-Tab Asphalt</option>
                  <option value="cedar">Cedar Shakes</option>
                  <option value="metal">Standing Seam Metal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-3">
                <Label>Tear-Off (Old Roof)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={tearOffLayers}
                  onChange={(e) => setTearOffLayers(Number(e.target.value))}
                >
                  <option value={0}>New Construction (No Tear-off)</option>
                  <option value={1}>Tear off 1 Layer</option>
                  <option value={2}>Tear off 2 Layers</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label>Replace Wood Decking?</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={reDecking ? "yes" : "no"}
                  onChange={(e) => setReDecking(e.target.value === "yes")}
                >
                  <option value="no">No (Wood is good)</option>
                  <option value="yes">Yes (Replace with OSB)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Material Cost Estimator</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Cost per {material === 'metal' ? 'Metal Panel' : 'Shingle Bundle'}</Label>
                <NumberInput value={costPerBundle} onChange={(e) => setCostPerBundle(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost / Underlayment Roll</Label>
                  <NumberInput value={costPerUnderlayment} onChange={(e) => setCostPerUnderlayment(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
                <div className="space-y-2">
                  <Label>Cost / Ice & Water Roll</Label>
                  <NumberInput value={costPerIceAndWater} onChange={(e) => setCostPerIceAndWater(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Geometric Breakdown</h3>
              {results && (
                <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800">
                  {results.pitchMultiplier}x Pitch Multiplier
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ResultDisplay 
                label="Total Roofing Squares"
                value={!results ? '--' : results.totalSquares}
                subValue="1 Square = 100 Sq. Ft."
                className="bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900/80 dark:to-stone-800/80 border-stone-300 dark:border-stone-700 shadow-sm [&>div>p]:text-stone-900 dark:[&>div>p]:text-stone-100"
              />
              <ResultDisplay 
                label={material === 'metal' ? 'Metal Panels (Est)' : 'Shingle Bundles'}
                value={!results ? '--' : material === 'metal' ? results.metalPanels : results.shingleBundles}
                subValue={material === 'metal' ? '16" wide panels' : '3 bundles per square typical'}
                className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800 shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">Base Footprint</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.baseAreaSqFt, 0)} sqft</p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center border-b-4 border-b-sky-500">
                <p className="text-[10px] text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1 font-bold">True Pitch Area</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.trueSurfaceAreaSqFt, 0)} sqft</p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center border-b-4 border-b-amber-500">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 font-bold">Area w/ Waste</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.areaWithWasteSqFt, 0)} sqft</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accessories */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Underlayment & Hardware</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="Underlayment Rolls" value={!results ? '--' : results.underlaymentRolls} />
                  <SecondaryResultDisplay label="Ice & Water Shield Rolls" value={!results ? '--' : results.iceAndWaterShieldRolls} />
                  <SecondaryResultDisplay label="Drip Edge (10ft pieces)" value={!results ? '--' : results.dripEdgePieces} />
                  
                  <div className="pt-2 border-t border-border"></div>
                  
                  <SecondaryResultDisplay label="Starter Shingle Bundles" value={!results ? '--' : results.starterShingleBundles} />
                  <SecondaryResultDisplay label="Ridge Cap Bundles" value={!results ? '--' : results.ridgeCapBundles} />
                  <SecondaryResultDisplay label="Roofing Nails" value={!results ? '--' : `${results.roofingNailsPounds} lbs`} />
                  
                  {results && results.stepFlashingPieces > 0 && (
                    <SecondaryResultDisplay label="Step Flashing Pieces" value={results.stepFlashingPieces} />
                  )}
                  {results && results.valleyFlashingFeet > 0 && (
                    <SecondaryResultDisplay label="Valley Flashing (ft)" value={results.valleyFlashingFeet} />
                  )}
                </div>
              </div>
            </div>

            {/* V2: Ventilation & Logistics */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Ventilation & Logistics</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay 
                    label="Ridge Vents (Exhaust) [1:300 Rule]" 
                    value={!results ? '--' : `${results.ridgeVentLinearFeet} ft`} 
                  />
                  <SecondaryResultDisplay 
                    label="Soffit Vents (Intake) [8x16]" 
                    value={!results ? '--' : results.soffitVents} 
                  />
                  <div className="pt-2 border-t border-border"></div>
                  
                  {reDecking && (
                    <SecondaryResultDisplay 
                      label="OSB Decking Sheets (4x8)" 
                      value={!results ? '--' : results.osbSheets} 
                    />
                  )}
                  {tearOffLayers > 0 && (
                    <>
                      <SecondaryResultDisplay 
                        label="Tear-Off Weight (Est.)" 
                        value={!results ? '--' : `${new Intl.NumberFormat().format(results.tearOffWeightLbs)} lbs`} 
                      />
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mt-2">
                        <p className="text-xs text-amber-800 dark:text-amber-400 font-bold mb-1">Recommended Dumpster:</p>
                        <p className="text-sm text-amber-900 dark:text-amber-300 font-semibold">{!results ? '--' : results.recommendedDumpster}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between md:col-span-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Materials Budget Estimate</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay 
                    label={material === 'metal' ? 'Metal Panels' : 'Shingles'} 
                    value={!costValues ? '--' : formatCurrency(costValues.primary)} 
                  />
                  <SecondaryResultDisplay 
                    label="Underlayment/Shield" 
                    value={!costValues ? '--' : formatCurrency(costValues.underlayment)} 
                  />
                  <SecondaryResultDisplay 
                    label="Accessories (Est.)" 
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
              <p className="text-xs text-secondary-500 mt-4 leading-relaxed">
                Estimate includes raw materials only. Professional labor and "tear-off" disposal fees can double or triple the final project cost.
              </p>
            </div>
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

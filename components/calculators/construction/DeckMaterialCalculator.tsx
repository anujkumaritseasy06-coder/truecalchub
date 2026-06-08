"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  DeckUnit, 
  DeckDimensions, 
  calculateDeck 
} from '@/lib/calculators/deck';

export function DeckMaterialCalculator() {
  const [unit, setUnit] = useState<DeckUnit>('feet');

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');

  // Spacing & Waste
  const [joistSpacing, setJoistSpacing] = useState<number>(16);
  const [wastePct, setWastePct] = useState<number>(10);

  // Cost Inputs
  const [costPerDeckingBoard, setCostPerDeckingBoard] = useState<string>(''); // e.g., 16ft treated
  const [costPerJoist, setCostPerJoist] = useState<string>(''); // e.g., 16ft 2x8
  const [costPerScrewBox, setCostPerScrewBox] = useState<string>(''); // box of 350

  const { results, error, formulaDesc } = useMemo(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);

    if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) {
      return { results: null, error: 'Please enter valid positive dimensions.', formulaDesc: '' };
    }

    if (l > 500 || w > 500) {
      return { results: null, error: 'Values exceed maximum realistic limits for a single deck (500 max).', formulaDesc: '' };
    }

    const dims: DeckDimensions = { length: l, width: w };
    const outputs = calculateDeck(dims, unit, joistSpacing, wastePct);

    const wasteText = wastePct > 0 ? ` × 1.${wastePct}` : '';
    const formulaStr = `Decking LF = (((L × W) × 12) ÷ 5.625" coverage)${wasteText}`;

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [unit, length, width, joistSpacing, wastePct]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const boardCost = parseFloat(costPerDeckingBoard) || 0;
    const joistCost = parseFloat(costPerJoist) || 0;
    const screwBoxCost = parseFloat(costPerScrewBox) || 0;

    // Assuming cost inputs are for 16ft lengths
    const totalDeckingCost = results.deckingBoards16ft * boardCost;
    const totalJoistCost = results.joists16ft * joistCost;
    
    // Assume a box of screws has 350 screws
    const boxesOfScrews = Math.ceil(results.totalScrews / 350);
    const totalScrewCost = boxesOfScrews * screwBoxCost;

    return {
      decking: totalDeckingCost,
      joists: totalJoistCost,
      screws: totalScrewCost,
      total: totalDeckingCost + totalJoistCost + totalScrewCost,
      boxesOfScrews: boxesOfScrews
    };
  }, [results, costPerDeckingBoard, costPerJoist, costPerScrewBox]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  return (
    <CalculatorWrapper className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="space-y-3">
            <Label>Measurement Unit</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              value={unit}
              onChange={(e) => setUnit(e.target.value as DeckUnit)}
            >
              <option value="feet">Feet</option>
              <option value="inches">Inches</option>
            </select>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Deck Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <Label>Length (Along House)</Label>
                <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 20" suffixNode={<span>{unit}</span>} />
              </div>
              <div className="space-y-2">
                <Label>Width (Away from House)</Label>
                <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 12" suffixNode={<span>{unit}</span>} />
              </div>

            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label>Joist Spacing (On Center)</Label>
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={joistSpacing}
                onChange={(e) => setJoistSpacing(Number(e.target.value))}
              >
                <option value={12}>12" O.C. (PVC / Composite Decking)</option>
                <option value={16}>16" O.C. (Standard Treated Wood)</option>
                <option value={24}>24" O.C. (Heavy Timber / 2x6 Decking)</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label>Waste Factor (Cutoffs)</Label>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-500">+{wastePct}%</span>
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={wastePct}
                onChange={(e) => setWastePct(Number(e.target.value))}
              >
                <option value={5}>5% (Simple Square Deck)</option>
                <option value={10}>10% (Standard / Recommended)</option>
                <option value={15}>15% (Diagonal Decking)</option>
                <option value={20}>20% (Complex Shape / Picture Framing)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimator (16ft Boards)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost per 16' Deck Board</Label>
                <NumberInput value={costPerDeckingBoard} onChange={(e) => setCostPerDeckingBoard(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Cost per 16' Joist</Label>
                <NumberInput value={costPerJoist} onChange={(e) => setCostPerJoist(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Cost per Box of Screws (350 ct)</Label>
                <NumberInput value={costPerScrewBox} onChange={(e) => setCostPerScrewBox(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Lumber Takeoff</h3>
              {results && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800">
                  Includes {wastePct}% Waste
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ResultDisplay 
                label="Decking (Surface)"
                value={!results ? '--' : formatUnit(results.deckingLinealFeet, 0)}
                subValue="Lineal Feet"
                className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800 shadow-sm"
              />
              <ResultDisplay 
                label="Substructure (Joists)"
                value={!results ? '--' : formatUnit(results.joistLinealFeet, 0)}
                subValue="Lineal Feet"
                className="bg-gradient-to-br from-stone-50 to-stone-200 dark:from-stone-900 dark:to-stone-950 border-stone-200 dark:border-stone-800 shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-background rounded-xl border border-border text-center">
                <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">16' Deck Boards</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : results.deckingBoards16ft}</p>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border text-center">
                <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">12' Deck Boards</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : results.deckingBoards12ft}</p>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border text-center">
                <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">16' Joists</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : results.joists16ft}</p>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border text-center">
                <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">12' Joists</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : results.joists12ft}</p>
              </div>
            </div>

            <div className="space-y-2 px-1">
              <SecondaryResultDisplay label="Total Deck Area" value={!results ? '--' : `${formatUnit(results.squareFeet)} sq ft`} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fasteners */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Fasteners Required</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="Total Deck Screws" value={!results ? '--' : formatUnit(results.totalScrews, 0)} />
                  <SecondaryResultDisplay label="Boxes (350 count)" value={!costValues ? '--' : costValues.boxesOfScrews} />
                </div>
              </div>
              {joistSpacing === 12 && (
                 <p className="text-xs text-amber-700 dark:text-amber-500 mt-4 leading-relaxed font-medium">
                   Note: 12" joist spacing requires significantly more screws to lock the boards down at every joist intersection.
                 </p>
              )}
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Material Estimate</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="Decking Boards (16ft)" value={!costValues ? '--' : `$${formatUnit(costValues.decking)}`} />
                  <SecondaryResultDisplay label="Joists & Rim (16ft)" value={!costValues ? '--' : `$${formatUnit(costValues.joists)}`} />
                  <SecondaryResultDisplay label="Screws (Boxes)" value={!costValues ? '--' : `$${formatUnit(costValues.screws)}`} />
                  <div className="pt-2 border-t border-border">
                    <SecondaryResultDisplay 
                      label="Total Materials" 
                      value={!costValues ? '--' : `$${formatUnit(costValues.total)}`} 
                      valueClassName="text-foreground font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-100 dark:bg-secondary-800/50 p-4 rounded-xl text-sm text-secondary-600 dark:text-secondary-400">
            <span className="font-semibold block mb-1">Calculation Mathematics:</span>
            <code className="bg-background px-2 py-1 rounded border border-border font-mono text-xs">{formulaDesc || 'Waiting for inputs...'}</code>
            <br/><br/>
            This calculator assumes standard 5/4x6 decking boards, which provide <strong>5.625 inches</strong> of actual coverage (accounting for a 1/8" water gap between boards). Joist lineal footage includes the internal field joists plus the perimeter rim joists (box frame). The waste factor is mathematically applied to all lineal totals prior to dividing into 12ft/16ft board counts.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

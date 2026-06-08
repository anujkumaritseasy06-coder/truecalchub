"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  ConcreteShape, 
  ConcreteUnit, 
  ConcreteDimensions, 
  calculateConcrete 
} from '@/lib/calculators/concrete';

type BagType = '40' | '50' | '60' | '80';

export function ConcreteBagCalculator() {
  const [shape, setShape] = useState<ConcreteShape>('rectangle');
  const [unit, setUnit] = useState<ConcreteUnit>('feet');
  const [wasteFactor, setWasteFactor] = useState<number>(10);
  const [bagType, setBagType] = useState<BagType>('80');

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');
  const [runs, setRuns] = useState<string>('');
  const [runDepth, setRunDepth] = useState<string>('');

  // Cost Inputs
  const [costPerBag, setCostPerBag] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<string>('');

  const { results, error, formulaDesc } = useMemo(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const dia = parseFloat(diameter);
    const r = parseFloat(runs);
    const rD = parseFloat(runDepth);

    // Dynamic Validation based on Shape
    let valid = true;
    switch (shape) {
      case 'rectangle':
      case 'footing':
      case 'wall':
        if (isNaN(l) || isNaN(w) || isNaN(d) || l <= 0 || w <= 0 || d <= 0) valid = false;
        break;
      case 'square':
        if (isNaN(l) || isNaN(d) || l <= 0 || d <= 0) valid = false;
        break;
      case 'circular':
      case 'column':
        if (isNaN(dia) || isNaN(d) || dia <= 0 || d <= 0) valid = false;
        break;
      case 'stairs':
        if (isNaN(w) || isNaN(rD) || isNaN(d) || isNaN(r) || w <= 0 || rD <= 0 || d <= 0 || r < 1) valid = false;
        break;
    }

    if (!valid) {
      return { results: null, error: 'Please enter valid positive project dimensions.', formulaDesc: '' };
    }

    if (l > 10000 || w > 10000 || d > 10000 || dia > 10000 || r > 1000) {
      return { results: null, error: 'Values exceed maximum realistic limits (10,000 max).', formulaDesc: '' };
    }

    const dims: ConcreteDimensions = {
      length: isNaN(l) ? 0 : l,
      width: isNaN(w) ? 0 : w,
      depth: isNaN(d) ? 0 : d,
      diameter: isNaN(dia) ? 0 : dia,
      runs: isNaN(r) ? 0 : Math.floor(r),
      runDepth: isNaN(rD) ? 0 : rD,
    };

    const outputs = calculateConcrete(shape, dims, unit, wasteFactor);

    let formulaStr = '';
    switch (shape) {
      case 'rectangle':
      case 'footing':
      case 'wall':
        formulaStr = `Volume = Length × Width × Depth`;
        break;
      case 'square':
        formulaStr = `Volume = Side² × Depth`;
        break;
      case 'circular':
      case 'column':
        formulaStr = `Volume = π × (Diameter ÷ 2)² × Depth`;
        break;
      case 'stairs':
        formulaStr = `Volume = Width × Run Depth × Riser Height × Steps`;
        break;
    }

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [shape, unit, wasteFactor, length, width, depth, diameter, runs, runDepth]);

  // Derived Properties
  const { primaryBagCount, primaryBagLabel, equivalentBags } = useMemo(() => {
    if (!results) return { primaryBagCount: 0, primaryBagLabel: '', equivalentBags: [] };
    
    let count = 0;
    let label = '';
    const equiv = [];

    if (bagType === '80') {
      count = results.bags80lb; label = '80 lb Bags Required';
      equiv.push({ label: '60 lb Bags', count: results.bags60lb, weight: results.bags60lb * 60 });
      equiv.push({ label: '50 lb Bags', count: results.bags50lb, weight: results.bags50lb * 50 });
      equiv.push({ label: '40 lb Bags', count: results.bags40lb, weight: results.bags40lb * 40 });
    } else if (bagType === '60') {
      count = results.bags60lb; label = '60 lb Bags Required';
      equiv.push({ label: '80 lb Bags', count: results.bags80lb, weight: results.bags80lb * 80 });
      equiv.push({ label: '50 lb Bags', count: results.bags50lb, weight: results.bags50lb * 50 });
      equiv.push({ label: '40 lb Bags', count: results.bags40lb, weight: results.bags40lb * 40 });
    } else if (bagType === '50') {
      count = results.bags50lb; label = '50 lb Bags Required';
      equiv.push({ label: '80 lb Bags', count: results.bags80lb, weight: results.bags80lb * 80 });
      equiv.push({ label: '60 lb Bags', count: results.bags60lb, weight: results.bags60lb * 60 });
      equiv.push({ label: '40 lb Bags', count: results.bags40lb, weight: results.bags40lb * 40 });
    } else {
      count = results.bags40lb; label = '40 lb Bags Required';
      equiv.push({ label: '80 lb Bags', count: results.bags80lb, weight: results.bags80lb * 80 });
      equiv.push({ label: '60 lb Bags', count: results.bags60lb, weight: results.bags60lb * 60 });
      equiv.push({ label: '50 lb Bags', count: results.bags50lb, weight: results.bags50lb * 50 });
    }

    return { primaryBagCount: count, primaryBagLabel: label, equivalentBags: equiv };
  }, [results, bagType]);

  const primaryWeight = primaryBagCount * parseInt(bagType);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const bagCost = parseFloat(costPerBag) || 0;
    const delivery = parseFloat(deliveryFee) || 0;

    const materialCost = primaryBagCount * bagCost;
    return {
      material: materialCost,
      delivery: delivery,
      total: materialCost + delivery,
    };
  }, [results, primaryBagCount, costPerBag, deliveryFee]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  return (
    <CalculatorWrapper className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-8">
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Project Shape</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={shape}
                onChange={(e) => {
                  setShape(e.target.value as ConcreteShape);
                  setLength(''); setWidth(''); setDepth(''); setDiameter(''); setRunDepth('');
                }}
              >
                <option value="rectangle">Rectangle / Slab</option>
                <option value="square">Square</option>
                <option value="circular">Circular Slab</option>
                <option value="column">Column</option>
                <option value="footing">Footing</option>
                <option value="stairs">Stairs</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Measurement Unit</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as ConcreteUnit)}
                >
                  <option value="feet">Feet</option>
                  <option value="inches">Inches</option>
                  <option value="yards">Yards</option>
                  <option value="meters">Meters</option>
                  <option value="centimeters">Centimeters</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label>Bag Size</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={bagType}
                  onChange={(e) => setBagType(e.target.value as BagType)}
                >
                  <option value="80">80 lb Bags (0.60 cu ft)</option>
                  <option value="60">60 lb Bags (0.45 cu ft)</option>
                  <option value="50">50 lb Bags (0.375 cu ft)</option>
                  <option value="40">40 lb Bags (0.30 cu ft)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Project Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {(shape === 'rectangle' || shape === 'footing' || shape === 'wall' || shape === 'square') && (
                <div className="space-y-2">
                  <Label>{shape === 'square' ? 'Side Length' : 'Length'}</Label>
                  <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 10" suffixNode={<span>{unit}</span>} />
                </div>
              )}
              
              {(shape === 'rectangle' || shape === 'footing' || shape === 'wall') && (
                <div className="space-y-2">
                  <Label>Width</Label>
                  <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 12" suffixNode={<span>{unit}</span>} />
                </div>
              )}

              {(shape === 'circular' || shape === 'column') && (
                <div className="space-y-2">
                  <Label>Diameter</Label>
                  <NumberInput value={diameter} onChange={(e) => setDiameter(e.target.value)} min="0" placeholder="e.g. 8" suffixNode={<span>{unit}</span>} />
                </div>
              )}

              {shape === 'stairs' && (
                <>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 4" suffixNode={<span>{unit}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Run Depth (Tread)</Label>
                    <NumberInput value={runDepth} onChange={(e) => setRunDepth(e.target.value)} min="0" placeholder="e.g. 11" suffixNode={<span>{unit}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Steps</Label>
                    <NumberInput value={runs} onChange={(e) => setRuns(e.target.value)} min="1" step="1" placeholder="e.g. 5" suffixNode={<span>steps</span>} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>{shape === 'column' ? 'Height' : shape === 'stairs' ? 'Riser Height' : 'Depth / Thickness'}</Label>
                <NumberInput value={depth} onChange={(e) => setDepth(e.target.value)} min="0" placeholder="e.g. 4" suffixNode={<span>{unit}</span>} />
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <Label>Waste Allowance</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={wasteFactor}
                onChange={(e) => setWasteFactor(Number(e.target.value))}
              >
                <option value={0}>0% (Exact)</option>
                <option value={5}>5%</option>
                <option value={10}>10% (Recommended)</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost per Bag</Label>
                <NumberInput value={costPerBag} onChange={(e) => setCostPerBag(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Fee</Label>
                <NumberInput value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          
          {/* Primary Material Summary */}
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <ResultDisplay 
              label={primaryBagLabel}
              value={!results ? '--' : primaryBagCount.toLocaleString()}
              subValue={`Using ${bagType} lb Bags`}
              className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
            />
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Total Volume</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.cubicFeet)} <span className="text-sm font-normal text-secondary-500">cu ft</span></p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Total Weight</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(primaryWeight, 0)} <span className="text-sm font-normal text-secondary-500">lbs</span></p>
              </div>
            </div>

            <div className="space-y-2 px-1">
              <SecondaryResultDisplay label="Cubic Yards" value={!results ? '--' : formatUnit(results.cubicYards)} />
              <SecondaryResultDisplay label="Cubic Meters" value={!results ? '--' : formatUnit(results.cubicMeters)} />
              {wasteFactor > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-500 italic px-2 py-2 text-right">
                  * Includes {wasteFactor}% waste allowance
                </div>
              )}
            </div>
          </div>

          {/* Best Purchase Recommendation */}
          {results && results.cubicYards > 1 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <svg className="w-24 h-24 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21.5,10.8L13.2,2.5C12.7,2,12,2,11.5,2.5L3.2,10.8C2.7,11.3 2.7,12 3.2,12.5L11.5,20.8C12,21.3 12.7,21.3 13.2,20.8L21.5,12.5C22,12 22,11.3 21.5,10.8Z" /></svg>
              </div>
              <h3 className="text-amber-800 dark:text-amber-300 font-bold mb-2 flex items-center">
                <span className="mr-2">⚠️</span> Purchase Recommendation
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed relative z-10">
                Your project requires <strong>{formatUnit(results.cubicYards)} cubic yards</strong> of concrete ({primaryBagCount} bags). 
                Mixing this much by hand is incredibly labor-intensive and risks creating weak "cold joints". 
                For any project over 1 cubic yard, the industry standard strongly recommends ordering a Ready-Mix truck delivery.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alternative Bag Sizes */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Bag Alternatives</h3>
              <div className="space-y-3">
                {equivalentBags.map((bag) => (
                  <div key={bag.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">{bag.label}</span>
                    <span className="font-semibold text-foreground">{!results ? '--' : bag.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Estimated Bag Costs</h3>
              <div className="space-y-3">
                <SecondaryResultDisplay label="Materials" value={!costValues ? '--' : `$${formatUnit(costValues.material)}`} />
                <SecondaryResultDisplay label="Delivery Fee" value={!costValues ? '--' : `$${formatUnit(costValues.delivery)}`} />
                <div className="pt-2 border-t border-border">
                  <SecondaryResultDisplay 
                    label="Total Bag Cost" 
                    value={!costValues ? '--' : `$${formatUnit(costValues.total)}`} 
                    valueClassName="text-foreground font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Material Transport Weight Matrix</h3>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-secondary-500 uppercase bg-secondary-50 dark:bg-secondary-900/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Bag Size</th>
                    <th className="px-4 py-3">Total Bags</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Total Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {results ? (
                    <>
                      <tr className={bagType === '80' ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}>
                        <td className="px-4 py-3 font-medium text-foreground">80 lb</td>
                        <td className="px-4 py-3">{results.bags80lb}</td>
                        <td className="px-4 py-3 text-right font-mono text-secondary-600">{(results.bags80lb * 80).toLocaleString()} lbs</td>
                      </tr>
                      <tr className={bagType === '60' ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}>
                        <td className="px-4 py-3 font-medium text-foreground">60 lb</td>
                        <td className="px-4 py-3">{results.bags60lb}</td>
                        <td className="px-4 py-3 text-right font-mono text-secondary-600">{(results.bags60lb * 60).toLocaleString()} lbs</td>
                      </tr>
                      <tr className={bagType === '50' ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}>
                        <td className="px-4 py-3 font-medium text-foreground">50 lb</td>
                        <td className="px-4 py-3">{results.bags50lb}</td>
                        <td className="px-4 py-3 text-right font-mono text-secondary-600">{(results.bags50lb * 50).toLocaleString()} lbs</td>
                      </tr>
                      <tr className={bagType === '40' ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}>
                        <td className="px-4 py-3 font-medium text-foreground">40 lb</td>
                        <td className="px-4 py-3">{results.bags40lb}</td>
                        <td className="px-4 py-3 text-right font-mono text-secondary-600">{(results.bags40lb * 40).toLocaleString()} lbs</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-secondary-400 italic">Enter dimensions to calculate weight</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-secondary-500 mt-4">
              Note: The total weight varies slightly between bag sizes because fractions of a bag are always rounded UP using Math.ceil() to prevent material shortages.
            </p>
          </div>

          <div className="bg-secondary-100 dark:bg-secondary-800/50 p-4 rounded-xl text-sm text-secondary-600 dark:text-secondary-400">
            <span className="font-semibold block mb-1">Calculation Process:</span>
            <code className="bg-background px-2 py-1 rounded border border-border font-mono text-xs">{formulaDesc || 'Waiting for inputs...'}</code>
            <br/><br/>
            The calculated volume is converted to cubic feet, increased by the waste factor, and then divided by the exact cubic yield of the selected bag size.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

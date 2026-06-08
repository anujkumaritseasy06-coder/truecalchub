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

export function ConcreteVolumeCalculator() {
  const [shape, setShape] = useState<ConcreteShape>('rectangle');
  const [unit, setUnit] = useState<ConcreteUnit>('feet');
  const [wasteFactor, setWasteFactor] = useState<number>(10);

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');
  const [runs, setRuns] = useState<string>('');
  const [runDepth, setRunDepth] = useState<string>('');

  // Cost Inputs
  const [costPerYard, setCostPerYard] = useState<string>('');
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

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const yardCost = parseFloat(costPerYard) || 0;
    const delivery = parseFloat(deliveryFee) || 0;

    const materialCost = results.cubicYards * yardCost;
    return {
      material: materialCost,
      delivery: delivery,
      total: materialCost + delivery,
    };
  }, [results, costPerYard, deliveryFee]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <option value="wall">Wall</option>
                <option value="stairs">Stairs</option>
              </select>
            </div>

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
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Geometric Dimensions</h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Volume Waste Factor</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={wasteFactor}
                onChange={(e) => setWasteFactor(Number(e.target.value))}
              >
                <option value={0}>0% (Exact Volume)</option>
                <option value={5}>5%</option>
                <option value={10}>10% (Recommended)</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Ready-Mix Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost per Cubic Yard</Label>
                <NumberInput value={costPerYard} onChange={(e) => setCostPerYard(e.target.value)} min="0" prefixNode={<span>$</span>} />
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
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <ResultDisplay 
              label="Volume Required"
              value={!results ? '--' : formatUnit(results.cubicYards)}
              subValue="Cubic Yards"
              className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
            />
            
            <div className="space-y-2 px-1">
              <SecondaryResultDisplay label="Cubic Feet" value={!results ? '--' : formatUnit(results.cubicFeet)} />
              <SecondaryResultDisplay label="Cubic Meters" value={!results ? '--' : formatUnit(results.cubicMeters)} />
              <SecondaryResultDisplay label="Liters" value={!results ? '--' : formatUnit(results.liters, 0)} />
              {results?.primaryArea && (
                <div className="pt-2 mt-2 border-t border-border">
                  <SecondaryResultDisplay label={results.primaryArea.label} value={`${formatUnit(results.primaryArea.sqFt)} sq ft`} />
                </div>
              )}
              {wasteFactor > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-500 italic px-2 py-2 text-right">
                  * Metric includes {wasteFactor}% waste allowance
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Transit Mix Logistics</h3>
            <div className="space-y-2">
              <SecondaryResultDisplay 
                label="Trucks Required (10 yd³ capacity)" 
                value={!results ? '--' : results.trucksRequired} 
                valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
              />
              <p className="text-xs text-secondary-500 mt-3 leading-relaxed">
                Standard ready-mix transit trucks hold between 9 to 11 cubic yards of concrete when fully loaded. We assume a 10-yard capacity for logistical planning.
              </p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Estimated Ready-Mix Cost</h3>
            <div className="space-y-3">
              <SecondaryResultDisplay label="Material Cost" value={!costValues ? '--' : `$${formatUnit(costValues.material)}`} />
              <SecondaryResultDisplay label="Delivery / Short Load Fee" value={!costValues ? '--' : `$${formatUnit(costValues.delivery)}`} />
              <div className="pt-2 border-t border-border">
                <SecondaryResultDisplay 
                  label="Total Estimated Cost" 
                  value={!costValues ? '--' : `$${formatUnit(costValues.total)}`} 
                  valueClassName="text-foreground font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-secondary-100 dark:bg-secondary-800/50 p-4 rounded-xl text-sm text-secondary-600 dark:text-secondary-400">
            <span className="font-semibold block mb-1">Geometric Calculation:</span>
            <code className="bg-background px-2 py-1 rounded border border-border font-mono text-xs">{formulaDesc || 'Waiting for inputs...'}</code>
            <br/><br/>
            The raw geometric volume is normalized to cubic feet, increased by the {wasteFactor}% waste multiplier, and divided by 27 to generate Cubic Yards.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

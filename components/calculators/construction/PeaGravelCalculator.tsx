"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  GravelShape, 
  GravelUnit, 
  GravelDimensions, 
  calculateGravel 
} from '@/lib/calculators/gravel';

export function PeaGravelCalculator() {
  const [shape, setShape] = useState<GravelShape>('rectangle');
  const [unit, setUnit] = useState<GravelUnit>('feet');

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');

  // Cost Inputs
  const [costPerTon, setCostPerTon] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<string>('');

  const { results, error, formulaDesc } = useMemo(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const dia = parseFloat(diameter);

    // Dynamic Validation based on Shape
    let valid = true;
    switch (shape) {
      case 'rectangle':
        if (isNaN(l) || isNaN(w) || isNaN(d) || l <= 0 || w <= 0 || d <= 0) valid = false;
        break;
      case 'square':
        if (isNaN(l) || isNaN(d) || l <= 0 || d <= 0) valid = false;
        break;
      case 'circular':
        if (isNaN(dia) || isNaN(d) || dia <= 0 || d <= 0) valid = false;
        break;
    }

    if (!valid) {
      return { results: null, error: 'Please enter valid positive project dimensions.', formulaDesc: '' };
    }

    if (l > 10000 || w > 10000 || d > 10000 || dia > 10000) {
      return { results: null, error: 'Values exceed maximum realistic limits (10,000 max).', formulaDesc: '' };
    }

    const dims: GravelDimensions = {
      length: isNaN(l) ? 0 : l,
      width: isNaN(w) ? 0 : w,
      depth: isNaN(d) ? 0 : d,
      diameter: isNaN(dia) ? 0 : dia,
    };

    // HARDCODED: 'pea_gravel' density, and 0 compaction (round stones don't compact)
    const outputs = calculateGravel(shape, dims, unit, 'pea_gravel', 0);

    let formulaStr = '';
    switch (shape) {
      case 'rectangle':
        formulaStr = `Volume = Length × Width × Depth`;
        break;
      case 'square':
        formulaStr = `Volume = Side² × Depth`;
        break;
      case 'circular':
        formulaStr = `Volume = π × (Diameter ÷ 2)² × Depth`;
        break;
    }

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [shape, unit, length, width, depth, diameter]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const tonCost = parseFloat(costPerTon) || 0;
    const delivery = parseFloat(deliveryFee) || 0;

    const materialCost = results.totalTons * tonCost;
    return {
      material: materialCost,
      delivery: delivery,
      total: materialCost + delivery,
    };
  }, [results, costPerTon, deliveryFee]);

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
                  setShape(e.target.value as GravelShape);
                  setLength(''); setWidth(''); setDepth(''); setDiameter('');
                }}
              >
                <option value="rectangle">Rectangle (Garden Bed / Dog Run)</option>
                <option value="square">Square</option>
                <option value="circular">Circular (Firepit / Planter)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Measurement Unit</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={unit}
                onChange={(e) => setUnit(e.target.value as GravelUnit)}
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
            <h3 className="font-semibold text-foreground">Project Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {(shape === 'rectangle' || shape === 'square') && (
                <div className="space-y-2">
                  <Label>{shape === 'square' ? 'Side Length' : 'Length'}</Label>
                  <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 10" suffixNode={<span>{unit}</span>} />
                </div>
              )}
              
              {shape === 'rectangle' && (
                <div className="space-y-2">
                  <Label>Width</Label>
                  <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 4" suffixNode={<span>{unit}</span>} />
                </div>
              )}

              {shape === 'circular' && (
                <div className="space-y-2">
                  <Label>Diameter</Label>
                  <NumberInput value={diameter} onChange={(e) => setDiameter(e.target.value)} min="0" placeholder="e.g. 8" suffixNode={<span>{unit}</span>} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Depth / Thickness</Label>
                <NumberInput value={depth} onChange={(e) => setDepth(e.target.value)} min="0" placeholder="e.g. 2" suffixNode={<span>{unit}</span>} />
              </div>

            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Bulk Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost per Ton</Label>
                <NumberInput value={costPerTon} onChange={(e) => setCostPerTon(e.target.value)} min="0" prefixNode={<span>$</span>} />
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
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <ResultDisplay 
              label="Bulk Pea Gravel Required"
              value={!results ? '--' : formatUnit(results.totalTons)}
              subValue="Tons"
              className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900 shadow-sm"
            />
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Total Weight</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.totalPounds, 0)} <span className="text-sm font-normal text-secondary-500">lbs</span></p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Volumetric Yield</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.cubicYards)} <span className="text-sm font-normal text-secondary-500">cu yd</span></p>
              </div>
            </div>

            <div className="space-y-2 px-1">
              <SecondaryResultDisplay label="Cubic Feet" value={!results ? '--' : formatUnit(results.cubicFeet)} />
              {results?.primaryArea && (
                <div className="pt-2 mt-2 border-t border-border">
                  <SecondaryResultDisplay label={results.primaryArea.label} value={`${formatUnit(results.primaryArea.sqFt)} sq ft`} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Retail Bags */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Retail Bag Alternatives</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="50 lb Bags" value={!results ? '--' : results.bags50lb} />
                  <SecondaryResultDisplay label="40 lb Bags" value={!results ? '--' : results.bags40lb} />
                </div>
              </div>
              {results && results.bags50lb > 40 && (
                 <p className="text-xs text-amber-600 dark:text-amber-500 mt-4 leading-relaxed font-medium">
                   ⚠️ Buying {results.bags50lb} bags individually is extremely expensive. Ordering bulk delivery by the ton is strongly recommended for this volume.
                 </p>
              )}
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Estimated Bulk Costs</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="Materials (Tons)" value={!costValues ? '--' : `$${formatUnit(costValues.material)}`} />
                  <SecondaryResultDisplay label="Delivery Fee" value={!costValues ? '--' : `$${formatUnit(costValues.delivery)}`} />
                  <div className="pt-2 border-t border-border">
                    <SecondaryResultDisplay 
                      label="Total Estimate" 
                      value={!costValues ? '--' : `$${formatUnit(costValues.total)}`} 
                      valueClassName="text-foreground font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-red-800 dark:text-red-400 mb-2 uppercase tracking-wide">⚠️ Application Warning</h3>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              Because pea gravel consists of smooth, round river stones, they cannot physically interlock or compact. They act like ball bearings under pressure. <strong>Never use pea gravel as a base for driveways, patios, or heavily trafficked walkways</strong> unless installed over a specialized commercial stabilization grid, or the stones will continuously roll out of place.
            </p>
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

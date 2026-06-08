"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  MulchShape, 
  MulchUnit, 
  MulchDimensions, 
  calculateMulch 
} from '@/lib/calculators/mulch';

export function MulchCalculator() {
  const [shape, setShape] = useState<MulchShape>('rectangle');
  const [unit, setUnit] = useState<MulchUnit>('feet');

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');

  // Cost Inputs
  const [costPerYard, setCostPerYard] = useState<string>('');
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

    const dims: MulchDimensions = {
      length: isNaN(l) ? 0 : l,
      width: isNaN(w) ? 0 : w,
      depth: isNaN(d) ? 0 : d,
      diameter: isNaN(dia) ? 0 : dia,
    };

    const outputs = calculateMulch(shape, dims, unit);

    let formulaStr = '';
    switch (shape) {
      case 'rectangle':
        formulaStr = `Cubic Yards = (Length × Width × Depth) ÷ 27`;
        break;
      case 'circular':
        formulaStr = `Cubic Yards = (π × (Diameter ÷ 2)² × Depth) ÷ 27`;
        break;
    }

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [shape, unit, length, width, depth, diameter]);

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
                  setShape(e.target.value as MulchShape);
                  setLength(''); setWidth(''); setDepth(''); setDiameter('');
                }}
              >
                <option value="rectangle">Rectangle (Garden Bed / Hedge)</option>
                <option value="circular">Circular (Tree Ring / Planter)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Measurement Unit</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={unit}
                onChange={(e) => setUnit(e.target.value as MulchUnit)}
              >
                <option value="feet">Feet</option>
                <option value="inches">Inches</option>
                <option value="yards">Yards</option>
                <option value="meters">Meters</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Project Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {shape === 'rectangle' && (
                <>
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 20" suffixNode={<span>{unit}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 4" suffixNode={<span>{unit}</span>} />
                  </div>
                </>
              )}

              {shape === 'circular' && (
                <div className="space-y-2">
                  <Label>Diameter</Label>
                  <NumberInput value={diameter} onChange={(e) => setDiameter(e.target.value)} min="0" placeholder="e.g. 6" suffixNode={<span>{unit}</span>} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Depth / Thickness</Label>
                <NumberInput value={depth} onChange={(e) => setDepth(e.target.value)} min="0" placeholder="e.g. 3" suffixNode={<span>{unit}</span>} />
              </div>

            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Bulk Cost Estimation (Optional)</h3>
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
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <ResultDisplay 
              label="Bulk Mulch Required"
              value={!results ? '--' : formatUnit(results.cubicYards)}
              subValue="Cubic Yards"
              className="mb-6 bg-gradient-to-br from-amber-900 to-amber-950 dark:from-amber-950 dark:to-black text-amber-50 border-amber-800 shadow-lg [&>div>p]:text-amber-50 [&>div>span]:text-amber-200/70 [&>p]:text-amber-400"
            />
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Cubic Feet</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.cubicFeet)} <span className="text-sm font-normal text-secondary-500">cu ft</span></p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Surface Area</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.areaSquareFeet)} <span className="text-sm font-normal text-secondary-500">sq ft</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Retail Bags */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Retail Bag Alternatives</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="2.0 cu ft Bags (Standard)" value={!results ? '--' : results.bags2_0} />
                  <SecondaryResultDisplay label="1.5 cu ft Bags" value={!results ? '--' : results.bags1_5} />
                  <SecondaryResultDisplay label="3.0 cu ft Bags (Premium Cedar)" value={!results ? '--' : results.bags3_0} />
                </div>
              </div>
              {results && results.bags2_0 > 27 && (
                 <p className="text-xs text-amber-600 dark:text-amber-500 mt-4 leading-relaxed font-medium">
                   ⚠️ Your project requires over a full Cubic Yard of mulch. Buying {results.bags2_0} bags individually is extremely expensive. Ordering bulk delivery is strongly recommended.
                 </p>
              )}
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Estimated Bulk Costs</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="Materials (Yards)" value={!costValues ? '--' : `$${formatUnit(costValues.material)}`} />
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

          <div className="bg-secondary-100 dark:bg-secondary-800/50 p-4 rounded-xl text-sm text-secondary-600 dark:text-secondary-400">
            <span className="font-semibold block mb-1">Calculation Mathematics:</span>
            <code className="bg-background px-2 py-1 rounded border border-border font-mono text-xs">{formulaDesc || 'Waiting for inputs...'}</code>
            <br/><br/>
            Mulch is sold exclusively by volume, not weight. Heavy aggregates (like gravel) are sold by the Ton, but because wood retains water like a sponge, a yard of wet mulch will weigh drastically more than a yard of dry mulch. Thus, it is always estimated in <strong>Cubic Yards</strong>.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

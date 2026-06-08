"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  TopsoilShape, 
  TopsoilUnit, 
  TopsoilDimensions, 
  calculateTopsoil 
} from '@/lib/calculators/topsoil';

export function TopsoilCalculator() {
  const [shape, setShape] = useState<TopsoilShape>('rectangle');
  const [unit, setUnit] = useState<TopsoilUnit>('feet');

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');

  // Settling Factor
  const [settlingPct, setSettlingPct] = useState<number>(15);

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

    const dims: TopsoilDimensions = {
      length: isNaN(l) ? 0 : l,
      width: isNaN(w) ? 0 : w,
      depth: isNaN(d) ? 0 : d,
      diameter: isNaN(dia) ? 0 : dia,
    };

    const outputs = calculateTopsoil(shape, dims, unit, settlingPct);

    let formulaStr = '';
    const settleText = settlingPct > 0 ? ` × 1.${settlingPct}` : '';
    switch (shape) {
      case 'rectangle':
        formulaStr = `Cubic Yards = ((Length × Width × Depth)${settleText}) ÷ 27`;
        break;
      case 'circular':
        formulaStr = `Cubic Yards = ((π × (Diameter ÷ 2)² × Depth)${settleText}) ÷ 27`;
        break;
    }

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [shape, unit, length, width, depth, diameter, settlingPct]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const yardCost = parseFloat(costPerYard) || 0;
    const delivery = parseFloat(deliveryFee) || 0;

    const materialCost = results.cubicYards * yardCost; // Often priced by Yard
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
                  setShape(e.target.value as TopsoilShape);
                  setLength(''); setWidth(''); setDepth(''); setDiameter('');
                }}
              >
                <option value="rectangle">Rectangle (Lawn / Grading)</option>
                <option value="circular">Circular (Planter / Tree Ring)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Measurement Unit</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={unit}
                onChange={(e) => setUnit(e.target.value as TopsoilUnit)}
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
                    <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 25" suffixNode={<span>{unit}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 10" suffixNode={<span>{unit}</span>} />
                  </div>
                </>
              )}

              {shape === 'circular' && (
                <div className="space-y-2">
                  <Label>Diameter</Label>
                  <NumberInput value={diameter} onChange={(e) => setDiameter(e.target.value)} min="0" placeholder="e.g. 8" suffixNode={<span>{unit}</span>} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Depth / Thickness</Label>
                <NumberInput value={depth} onChange={(e) => setDepth(e.target.value)} min="0" placeholder="e.g. 4" suffixNode={<span>{unit}</span>} />
              </div>

            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <Label>Settling / Shrinkage Factor</Label>
              <span className="text-sm font-medium text-green-700 dark:text-green-500">+{settlingPct}%</span>
            </div>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              value={settlingPct}
              onChange={(e) => setSettlingPct(Number(e.target.value))}
            >
              <option value={0}>0% (No Settling)</option>
              <option value={10}>10% (Light Watering)</option>
              <option value={15}>15% (Standard Rainfall Settling)</option>
              <option value={20}>20% (Heavy Rolling/Compaction)</option>
            </select>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ResultDisplay 
                label="Total Bulk Volume"
                value={!results ? '--' : formatUnit(results.cubicYards)}
                subValue="Cubic Yards"
                className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800 shadow-sm"
              />
              <ResultDisplay 
                label="Total Bulk Weight"
                value={!results ? '--' : formatUnit(results.totalTons)}
                subValue="Tons"
                className="bg-gradient-to-br from-stone-50 to-stone-200 dark:from-stone-900 dark:to-stone-950 border-stone-200 dark:border-stone-800 shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Cubic Feet</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.cubicFeet)} <span className="text-sm font-normal text-secondary-500">cu ft</span></p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Total Pounds</p>
                <p className="text-xl font-bold text-foreground">{!results ? '--' : formatUnit(results.totalPounds, 0)} <span className="text-sm font-normal text-secondary-500">lbs</span></p>
              </div>
            </div>

            <div className="space-y-2 px-1">
              <SecondaryResultDisplay label="Surface Area" value={!results ? '--' : `${formatUnit(results.areaSquareFeet)} sq ft`} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Retail Bags */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Retail Bag Alternatives</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="40 lb Bags (Standard)" value={!results ? '--' : results.bags40lb} />
                </div>
              </div>
              {results && results.bags40lb > 50 && (
                 <p className="text-xs text-green-700 dark:text-green-500 mt-4 leading-relaxed font-medium">
                   ⚠️ Your project requires over a Ton of dirt. Buying {results.bags40lb} bags individually is exhausting and expensive. Ordering bulk dump truck delivery is strongly recommended.
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
            Topsoil is sold by both the Yard and the Ton. The landscaping industry standard conversion is exactly <strong>1 Cubic Yard = 2,000 lbs (1 Ton)</strong>. The calculator computes your raw volume, applies your chosen Settling Factor to ensure you have enough dirt after rainfall, and outputs the identical Yardage/Tonnage payloads.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

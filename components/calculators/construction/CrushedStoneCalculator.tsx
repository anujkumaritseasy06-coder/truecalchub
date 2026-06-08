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

export function CrushedStoneCalculator() {
  const [shape, setShape] = useState<GravelShape>('rectangle');
  const [unit, setUnit] = useState<GravelUnit>('feet');

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');

  // Compaction Factor
  const [compactionPct, setCompactionPct] = useState<number>(10);

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
      case 'square':
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

    const dims: GravelDimensions = {
      length: isNaN(l) ? 0 : l,
      width: isNaN(w) ? 0 : w,
      depth: isNaN(d) ? 0 : d,
      diameter: isNaN(dia) ? 0 : dia,
    };

    // Use the exact 'crushed_stone' density profile (2,800 lbs/yd)
    const outputs = calculateGravel(shape, dims, unit, 'crushed_stone', compactionPct);

    let formulaStr = '';
    const compText = compactionPct > 0 ? ` × 1.${compactionPct}` : '';
    switch (shape) {
      case 'rectangle':
      case 'square':
        formulaStr = `Tons = (((Length × Width × Depth)${compText}) ÷ 27) × 1.4`;
        break;
      case 'circular':
        formulaStr = `Tons = (((π × (Diameter ÷ 2)² × Depth)${compText}) ÷ 27) × 1.4`;
        break;
    }

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [shape, unit, length, width, depth, diameter, compactionPct]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const tonCost = parseFloat(costPerTon) || 0;
    const delivery = parseFloat(deliveryFee) || 0;

    const materialCost = results.totalTons * tonCost; // Crushed stone is usually priced by Ton
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
                <option value="rectangle">Rectangle (Driveway / Patio Base)</option>
                <option value="circular">Circular (Fire Pit / Tank Base)</option>
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
              </select>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Project Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {(shape === 'rectangle' || shape === 'square') && (
                <>
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 20" suffixNode={<span>{unit}</span>} />
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
                  <NumberInput value={diameter} onChange={(e) => setDiameter(e.target.value)} min="0" placeholder="e.g. 12" suffixNode={<span>{unit}</span>} />
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
              <Label>Compaction / Waste Factor</Label>
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">+{compactionPct}%</span>
            </div>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              value={compactionPct}
              onChange={(e) => setCompactionPct(Number(e.target.value))}
            >
              <option value={0}>0% (Exact Volume - Not Recommended)</option>
              <option value={5}>5% (Light Tamping)</option>
              <option value={10}>10% (Standard Plate Compaction)</option>
              <option value={15}>15% (Heavy Roller Compaction)</option>
            </select>
            <p className="text-xs text-secondary-500 mt-1">Crushed stone is jagged and locks together, causing the volume to shrink when mechanically compacted.</p>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ResultDisplay 
                label="Total Bulk Weight"
                value={!results ? '--' : formatUnit(results.totalTons)}
                subValue="Tons"
                className="bg-gradient-to-br from-stone-100 to-stone-300 dark:from-stone-900/60 dark:to-stone-800/60 border-stone-300 dark:border-stone-700 shadow-sm [&>div>p]:text-stone-900 dark:[&>div>p]:text-stone-100"
              />
              <ResultDisplay 
                label="Total Bulk Volume"
                value={!results ? '--' : formatUnit(results.cubicYards)}
                subValue="Cubic Yards"
                className="bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-900/60 dark:to-zinc-800/60 border-zinc-300 dark:border-zinc-700 shadow-sm [&>div>p]:text-zinc-900 dark:[&>div>p]:text-zinc-100"
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
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Retail Bag Equivalents</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="50 lb Bags" value={!results ? '--' : results.bags50lb} />
                  <SecondaryResultDisplay label="40 lb Bags" value={!results ? '--' : results.bags40lb} />
                </div>
              </div>
              {results && results.bags50lb > 40 && (
                 <p className="text-xs text-stone-700 dark:text-stone-400 mt-4 leading-relaxed font-bold border-t border-border pt-4">
                   ⚠️ DO NOT BUY BAGS. Your project requires {formatUnit(results.totalTons)} Tons of crushed stone. Buying {results.bags50lb} bags at a hardware store is financially absurd. Call a local quarry for a dump truck delivery.
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

          <div className="bg-secondary-100 dark:bg-secondary-800/50 p-4 rounded-xl text-sm text-secondary-600 dark:text-secondary-400">
            <span className="font-semibold block mb-1">Calculation Mathematics:</span>
            <code className="bg-background px-2 py-1 rounded border border-border font-mono text-xs">{formulaDesc || 'Waiting for inputs...'}</code>
            <br/><br/>
            Unlike rounded pea gravel, crushed stone is jagged and heavily compacted for structural bases. The construction industry standard density for #57 crushed stone is <strong>2,800 lbs per Cubic Yard</strong> (1.4 Tons). The calculator uses this exact heavy-density metric to convert your geometric volume directly into quarry tonnage.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

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
  RockType,
  GravelDimensions, 
  calculateGravel 
} from '@/lib/calculators/gravel';

export function GravelCalculator() {
  const [shape, setShape] = useState<GravelShape>('rectangle');
  const [unit, setUnit] = useState<GravelUnit>('feet');
  const [rockType, setRockType] = useState<RockType>('crushed_stone');
  const [compactionFactor, setCompactionFactor] = useState<number>(10);

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

    const outputs = calculateGravel(shape, dims, unit, rockType, compactionFactor);

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
  }, [shape, unit, rockType, compactionFactor, length, width, depth, diameter]);

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
                <option value="rectangle">Rectangle (Driveway / Patio)</option>
                <option value="square">Square</option>
                <option value="circular">Circular (Firepit / Planter)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Rock / Aggregate Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={rockType}
                onChange={(e) => setRockType(e.target.value as RockType)}
              >
                <option value="crushed_stone">Crushed Stone (#57 Base) — 2,800 lbs/yd³</option>
                <option value="limestone">Dense Crushed Limestone — 2,750 lbs/yd³</option>
                <option value="river_rock">River Rock — 2,700 lbs/yd³</option>
                <option value="pea_gravel">Pea Gravel — 2,600 lbs/yd³</option>
                <option value="sand">Sand / Screenings — 2,600 lbs/yd³</option>
                <option value="drainage_rock">Large Clear Drainage Rock — 2,500 lbs/yd³</option>
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
                  <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 20" suffixNode={<span>{unit}</span>} />
                </div>
              )}
              
              {shape === 'rectangle' && (
                <div className="space-y-2">
                  <Label>Width</Label>
                  <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 10" suffixNode={<span>{unit}</span>} />
                </div>
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

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <Label>Compaction / Waste Factor</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={compactionFactor}
                onChange={(e) => setCompactionFactor(Number(e.target.value))}
              >
                <option value={0}>0% (Exact Volume, Uncompacted)</option>
                <option value={5}>5%</option>
                <option value={10}>10% (Recommended for Driveways)</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
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
              label="Bulk Gravel Required"
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
              {compactionFactor > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-500 italic px-2 py-2 text-right">
                  * Totals include {compactionFactor}% compaction/waste allowance
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Retail Bags */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Retail Bag Alternatives</h3>
              <div className="space-y-3">
                <SecondaryResultDisplay label="50 lb Bags" value={!results ? '--' : results.bags50lb} />
                <SecondaryResultDisplay label="40 lb Bags" value={!results ? '--' : results.bags40lb} />
              </div>
              {results && results.bags50lb > 40 && (
                 <p className="text-xs text-amber-600 dark:text-amber-500 mt-4 leading-relaxed font-medium">
                   ⚠️ Buying {results.bags50lb} bags individually is extremely expensive. Ordering bulk delivery by the ton is strongly recommended for this volume.
                 </p>
              )}
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border">
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

          <div className="bg-secondary-100 dark:bg-secondary-800/50 p-4 rounded-xl text-sm text-secondary-600 dark:text-secondary-400">
            <span className="font-semibold block mb-1">Density & Calculation Process:</span>
            <code className="bg-background px-2 py-1 rounded border border-border font-mono text-xs">{formulaDesc || 'Waiting for inputs...'}</code>
            <br/><br/>
            The raw volume is converted to cubic yards and multiplied by the specific density of your selected aggregate. For example, crushed stone weighs roughly 2,800 lbs per cubic yard, while pea gravel is slightly lighter at 2,600 lbs per cubic yard.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

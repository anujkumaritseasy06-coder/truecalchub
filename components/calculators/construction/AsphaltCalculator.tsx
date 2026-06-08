"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  AsphaltShape, 
  AsphaltUnit, 
  AsphaltDimensions, 
  calculateAsphalt 
} from '@/lib/calculators/asphalt';

export function AsphaltCalculator() {
  const [shape, setShape] = useState<AsphaltShape>('rectangle');
  const [unit, setUnit] = useState<AsphaltUnit>('feet');

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');

  // Cost Inputs
  const [costPerTon, setCostPerTon] = useState<string>('');
  const [laborPerSqFt, setLaborPerSqFt] = useState<string>('');

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

    const dims: AsphaltDimensions = {
      length: isNaN(l) ? 0 : l,
      width: isNaN(w) ? 0 : w,
      depth: isNaN(d) ? 0 : d,
      diameter: isNaN(dia) ? 0 : dia,
    };

    const outputs = calculateAsphalt(shape, dims, unit);

    let formulaStr = '';
    switch (shape) {
      case 'rectangle':
        formulaStr = `Tons = (Length × Width × Depth × 145) ÷ 2000`;
        break;
      case 'circular':
        formulaStr = `Tons = (π × (Diameter ÷ 2)² × Depth × 145) ÷ 2000`;
        break;
    }

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [shape, unit, length, width, depth, diameter]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const tonCost = parseFloat(costPerTon) || 0;
    const laborCost = parseFloat(laborPerSqFt) || 0;

    const materialCost = results.totalTons * tonCost;
    const totalLabor = results.areaSquareFeet * laborCost;
    
    return {
      material: materialCost,
      labor: totalLabor,
      total: materialCost + totalLabor,
    };
  }, [results, costPerTon, laborPerSqFt]);

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
                  setShape(e.target.value as AsphaltShape);
                  setLength(''); setWidth(''); setDepth(''); setDiameter('');
                }}
              >
                <option value="rectangle">Rectangle (Driveway / Parking Lot)</option>
                <option value="circular">Circular (Cul-de-sac / Turnaround)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Measurement Unit</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={unit}
                onChange={(e) => setUnit(e.target.value as AsphaltUnit)}
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
                    <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 50" suffixNode={<span>{unit}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 12" suffixNode={<span>{unit}</span>} />
                  </div>
                </>
              )}

              {shape === 'circular' && (
                <div className="space-y-2">
                  <Label>Diameter</Label>
                  <NumberInput value={diameter} onChange={(e) => setDiameter(e.target.value)} min="0" placeholder="e.g. 40" suffixNode={<span>{unit}</span>} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Depth / Thickness</Label>
                <NumberInput value={depth} onChange={(e) => setDepth(e.target.value)} min="0" placeholder="e.g. 2" suffixNode={<span>{unit}</span>} />
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Contractor Bid Estimator</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hot Mix Cost per Ton</Label>
                <NumberInput value={costPerTon} onChange={(e) => setCostPerTon(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Paving Labor per Sq Ft</Label>
                <NumberInput value={laborPerSqFt} onChange={(e) => setLaborPerSqFt(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <ResultDisplay 
              label="Hot Mix Asphalt Required"
              value={!results ? '--' : formatUnit(results.totalTons)}
              subValue="Tons"
              className="mb-6 bg-gradient-to-br from-neutral-800 to-neutral-900 dark:from-neutral-900 dark:to-black border-neutral-700 shadow-lg [&>h3]:!text-zinc-300 [&>p]:!text-zinc-400"
              valueClassName="text-4xl md:text-5xl !text-white font-bold tracking-tight"
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
              <SecondaryResultDisplay label="Surface Area" value={!results ? '--' : `${formatUnit(results.areaSquareFeet)} sq ft`} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tack Coat */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Prep Materials</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay 
                    label="Tack Coat Required" 
                    value={!results ? '--' : `${formatUnit(results.tackCoatGallons)} gal`} 
                    valueClassName="text-amber-600 dark:text-amber-500 font-bold"
                  />
                </div>
              </div>
              <p className="text-xs text-secondary-500 mt-4 leading-relaxed font-medium">
                * Based on an industry standard application rate of 0.05 gallons of liquid emulsion per square yard.
              </p>
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Estimated Project Bid</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="Hot Mix Materials" value={!costValues ? '--' : `$${formatUnit(costValues.material)}`} />
                  <SecondaryResultDisplay label="Installation Labor" value={!costValues ? '--' : `$${formatUnit(costValues.labor)}`} />
                  <div className="pt-2 border-t border-border">
                    <SecondaryResultDisplay 
                      label="Total Contractor Bid" 
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
            Standard Hot Mix Asphalt (HMA) weighs approximately 145 pounds per cubic foot when heavily compacted by a roller. To convert pure geometry into payload tonnage, we multiply cubic feet by 145, then divide by 2,000.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

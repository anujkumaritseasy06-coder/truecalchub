"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  ConcreteUnit, 
  ConcreteDimensions, 
  calculateConcrete 
} from '@/lib/calculators/concrete';

type SlabType = 'patio' | 'driveway' | 'garage' | 'foundation' | 'sidewalk' | 'custom';

export function ConcreteSlabCalculator() {
  const [slabType, setSlabType] = useState<SlabType>('patio');
  const [unit, setUnit] = useState<ConcreteUnit>('feet');
  const [wasteFactor, setWasteFactor] = useState<number>(10); // Standard

  // Dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [thickness, setThickness] = useState<string>(''); // Maps to depth

  // Cost Inputs
  const [costPerYard, setCostPerYard] = useState<string>('');
  const [costPerBag, setCostPerBag] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<string>('');

  // Handle Preset Clicks
  const setPresetThickness = (inches: number) => {
    let val = inches;
    if (unit === 'feet') val = inches / 12;
    if (unit === 'yards') val = inches / 36;
    if (unit === 'meters') val = inches * 0.0254;
    if (unit === 'centimeters') val = inches * 2.54;
    
    // Format nicely without trailing zeros
    setThickness(val.toFixed(3).replace(/\.?0+$/, ''));
  };

  const { results, error } = useMemo(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(thickness);

    if (isNaN(l) || isNaN(w) || isNaN(d) || l <= 0 || w <= 0 || d <= 0) {
      return { results: null, error: 'Please enter valid slab dimensions.' };
    }

    if (l > 10000 || w > 10000 || d > 10000) {
      return { results: null, error: 'Values exceed maximum realistic limits (10,000 max).' };
    }

    const dims: ConcreteDimensions = {
      length: l,
      width: w,
      depth: d,
    };

    const outputs = calculateConcrete('rectangle', dims, unit, wasteFactor);
    return { results: outputs, error: null };
  }, [unit, wasteFactor, length, width, thickness]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const yardCost = parseFloat(costPerYard) || 0;
    const bagCost = parseFloat(costPerBag) || 0;
    const delivery = parseFloat(deliveryFee) || 0;

    return {
      materialYard: results.cubicYards * yardCost,
      materialBags: results.bags80lb * bagCost,
      delivery: delivery,
      totalYard: (results.cubicYards * yardCost) + delivery,
    };
  }, [results, costPerYard, costPerBag, deliveryFee]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Slab Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={slabType}
                onChange={(e) => {
                  const type = e.target.value as SlabType;
                  setSlabType(type);
                  // Auto-preset thickness based on slab type
                  if (type === 'patio' || type === 'sidewalk') setPresetThickness(4);
                  if (type === 'driveway') setPresetThickness(6);
                  if (type === 'garage' || type === 'foundation') setPresetThickness(8);
                }}
              >
                <option value="patio">Patio Slab</option>
                <option value="driveway">Driveway Slab</option>
                <option value="garage">Garage Slab</option>
                <option value="foundation">Foundation Slab</option>
                <option value="sidewalk">Sidewalk Slab</option>
                <option value="custom">Custom Slab</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Measurement Unit</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value as ConcreteUnit);
                  // Clear thickness as its absolute value loses context when unit switches
                  setThickness('');
                }}
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
            <h3 className="font-semibold text-foreground">Slab Dimensions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Length</Label>
                <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 20" suffixNode={<span>{unit}</span>} />
              </div>
              
              <div className="space-y-2">
                <Label>Width</Label>
                <NumberInput value={width} onChange={(e) => setWidth(e.target.value)} min="0" placeholder="e.g. 15" suffixNode={<span>{unit}</span>} />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border/50">
              <div className="flex justify-between items-end">
                <Label>Thickness / Depth</Label>
              </div>
              <NumberInput value={thickness} onChange={(e) => setThickness(e.target.value)} min="0" placeholder="e.g. 4" suffixNode={<span>{unit}</span>} />
              
              <div className="pt-2">
                <Label className="text-xs text-secondary-500 mb-2 block">Quick Presets (Auto-converts to active unit):</Label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setPresetThickness(4)} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-border hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/30 transition-colors">4" (Patio)</button>
                  <button onClick={() => setPresetThickness(5)} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-border hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/30 transition-colors">5" (Driveway)</button>
                  <button onClick={() => setPresetThickness(6)} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-border hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/30 transition-colors">6" (Heavy Driveway)</button>
                  <button onClick={() => setPresetThickness(8)} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-border hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/30 transition-colors">8" (Foundation)</button>
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Waste Factor Allowance</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={wasteFactor}
                onChange={(e) => setWasteFactor(Number(e.target.value))}
              >
                <option value={0}>0% (Exact Match)</option>
                <option value={5}>5%</option>
                <option value={10}>10% (Recommended)</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost per Cubic Yard</Label>
                <NumberInput value={costPerYard} onChange={(e) => setCostPerYard(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Cost per 80lb Bag</Label>
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
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <ResultDisplay 
              label="Concrete Required"
              value={!results ? '--' : `${formatUnit(results.cubicYards)}`}
              subValue="Cubic Yards"
              className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
            />
            
            <div className="space-y-2 px-1">
              <SecondaryResultDisplay label="Cubic Feet" value={!results ? '--' : formatUnit(results.cubicFeet)} />
              <SecondaryResultDisplay label="Cubic Meters" value={!results ? '--' : formatUnit(results.cubicMeters)} />
              <SecondaryResultDisplay label="Liters" value={!results ? '--' : formatUnit(results.liters, 0)} />
              {wasteFactor > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-500 italic px-2 py-2 text-right">
                  * Includes {wasteFactor}% waste allowance
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Slab Properties</h3>
            <div className="space-y-2">
              <SecondaryResultDisplay label="Slab Area (Sq Ft)" value={!results ? '--' : formatUnit(results.areaSquareFeet)} />
              <SecondaryResultDisplay label="Slab Area (Sq Meters)" value={!results ? '--' : formatUnit(results.areaSquareMeters)} />
              <SecondaryResultDisplay label="Working Thickness" value={!thickness ? '--' : `${formatUnit(parseFloat(thickness))} ${unit}`} />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Material Equivalents</h3>
            <div className="space-y-2">
              <SecondaryResultDisplay label="80 lb Bags" value={!results ? '--' : results.bags80lb} />
              <SecondaryResultDisplay label="60 lb Bags" value={!results ? '--' : results.bags60lb} />
              <SecondaryResultDisplay label="50 lb Bags" value={!results ? '--' : results.bags50lb} />
              <SecondaryResultDisplay label="40 lb Bags" value={!results ? '--' : results.bags40lb} />
              <div className="pt-2 mt-2 border-t border-border">
                <SecondaryResultDisplay 
                  label="Estimated Truck Deliveries" 
                  value={!results ? '--' : results.trucksRequired} 
                  valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Estimated Costs</h3>
            <div className="space-y-2">
              <SecondaryResultDisplay label="Ready-Mix Material" value={!costValues ? '--' : `$${formatUnit(costValues.materialYard)}`} />
              <SecondaryResultDisplay label="Delivery Fee" value={!costValues ? '--' : `$${formatUnit(costValues.delivery)}`} />
              <div className="pt-2 mt-2 border-t border-border">
                <SecondaryResultDisplay 
                  label="Total Project Cost" 
                  value={!costValues ? '--' : `$${formatUnit(costValues.totalYard)}`} 
                  valueClassName="text-foreground font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-secondary-100 dark:bg-secondary-800/50 p-4 rounded-xl text-sm text-secondary-600 dark:text-secondary-400">
            <span className="font-semibold block mb-1">Calculation Formula:</span>
            <code className="bg-background px-2 py-1 rounded border border-border font-mono text-xs">Volume = Length × Width × Thickness</code>
            <br/><br/>
            Slab volume is determined by extracting the primary area (L × W) and multiplying it by the thickness. The final yield is then adjusted up by the {wasteFactor}% waste factor to ensure no shortages occur.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

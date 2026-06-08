"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  FenceUnit, 
  calculateFencePosts 
} from '@/lib/calculators/fence';

export function FencePostCalculator() {
  const [unit, setUnit] = useState<FenceUnit>('feet');

  // Core Inputs
  const [length, setLength] = useState<string>('');
  const [gates, setGates] = useState<string>('');

  // Structural Choices
  const [spacing, setSpacing] = useState<number>(8);
  const [holeDiameter, setHoleDiameter] = useState<number>(8);
  const [holeDepth, setHoleDepth] = useState<number>(24);
  const [postWidth, setPostWidth] = useState<number>(3.5);
  const [wastePct, setWastePct] = useState<number>(5);

  // Cost Inputs
  const [costPerPost, setCostPerPost] = useState<string>(''); 
  const [costPerConcrete, setCostPerConcrete] = useState<string>(''); 

  const { results, error, formulaDesc } = useMemo(() => {
    const l = parseFloat(length);
    const g = parseInt(gates, 10);

    if (isNaN(l) || l <= 0) {
      return { results: null, error: 'Please enter a valid positive length.', formulaDesc: '' };
    }
    
    const safeGates = isNaN(g) || g < 0 ? 0 : g;

    if (l > 5000) {
      return { results: null, error: 'Values exceed limits for a standard run.', formulaDesc: '' };
    }

    const outputs = calculateFencePosts(l, unit, spacing, safeGates, holeDiameter, holeDepth, postWidth, wastePct);

    let formulaStr = `Posts = ⌈Length ÷ Spacing⌉ + 1 Terminal + Gates`;

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [unit, length, gates, spacing, holeDiameter, holeDepth, postWidth, wastePct]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const postCost = parseFloat(costPerPost) || 0;
    const concreteCost = parseFloat(costPerConcrete) || 0;

    const totalPostCost = results.totalPosts * postCost;
    const totalConcreteCost = results.concrete80lbBags * concreteCost;

    return {
      posts: totalPostCost,
      concrete: totalConcreteCost,
      total: totalPostCost + totalConcreteCost
    };
  }, [results, costPerPost, costPerConcrete]);

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
              onChange={(e) => setUnit(e.target.value as FenceUnit)}
            >
              <option value="feet">Feet</option>
              <option value="meters">Meters</option>
            </select>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Fence Line Geometry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <Label>Total Length</Label>
                <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 150" suffixNode={<span>{unit}</span>} />
              </div>
              <div className="space-y-2">
                <Label>Number of Gates</Label>
                <NumberInput value={gates} onChange={(e) => setGates(e.target.value)} min="0" placeholder="0" />
                <p className="text-[10px] text-secondary-500 mt-1">Gates require extra terminal posts.</p>
              </div>

            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Post Spacing (O.C.)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                >
                  <option value={6}>6 ft</option>
                  <option value={8}>8 ft</option>
                  <option value={10}>10 ft</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label>Post Size</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={postWidth}
                  onChange={(e) => setPostWidth(Number(e.target.value))}
                >
                  <option value={3.5}>4x4 Wood (3.5" actual)</option>
                  <option value={5.5}>6x6 Wood (5.5" actual)</option>
                  <option value={5}>5x5 Vinyl Post</option>
                  <option value={2.375}>2 3/8" Steel Pipe</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Hole Diameter</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={holeDiameter}
                  onChange={(e) => setHoleDiameter(Number(e.target.value))}
                >
                  <option value={6}>6" Auger</option>
                  <option value={8}>8" Auger</option>
                  <option value={10}>10" Auger</option>
                  <option value={12}>12" Auger</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label>Frost Line (Hole Depth)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={holeDepth}
                  onChange={(e) => setHoleDepth(Number(e.target.value))}
                >
                  <option value={24}>24" Deep</option>
                  <option value={36}>36" Deep</option>
                  <option value={42}>42" Deep</option>
                  <option value={48}>48" Deep</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label>Waste Factor (Posts)</Label>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-500">+{wastePct}%</span>
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={wastePct}
                onChange={(e) => setWastePct(Number(e.target.value))}
              >
                <option value={0}>0% (Exact Count)</option>
                <option value={5}>5% (Minimal)</option>
                <option value={10}>10% (Standard)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimator</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost per Post</Label>
                <NumberInput value={costPerPost} onChange={(e) => setCostPerPost(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Cost per 80lb Concrete</Label>
                <NumberInput value={costPerConcrete} onChange={(e) => setCostPerConcrete(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Post Takeoff</h3>
              {results && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800">
                  Includes {wastePct}% Waste
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 mb-6">
              <ResultDisplay 
                label="Structural Posts"
                value={!results ? '--' : results.totalPosts}
                subValue="Total Posts Required"
                className="bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900/80 dark:to-stone-800/80 border-stone-300 dark:border-stone-700 shadow-sm [&>div>p]:text-stone-900 dark:[&>div>p]:text-stone-100"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="p-4 bg-background rounded-xl border border-border flex justify-between items-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wider font-bold">Linear Sections</p>
                <p className="text-2xl font-bold text-foreground">{!results ? '--' : results.totalSections}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Concrete & Earthwork */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Earthwork & Concrete</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="80 lb Concrete Bags" value={!results ? '--' : results.concrete80lbBags} />
                  <SecondaryResultDisplay label="50 lb Concrete Bags" value={!results ? '--' : results.concrete50lbBags} />
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">Dirt Displaced (To Haul Away)</span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{!results ? '--' : `${results.dirtDisplacedCuYards} Cu.Yds`}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-secondary-500 mt-4 leading-relaxed">
                Dirt volume includes a 30% "fluff factor" expansion from digging. Concrete is calculated by subtracting the post displacement from the cylindrical hole volume.
              </p>
            </div>

            {/* Estimated Costs */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Material Estimate</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay label="Posts" value={!costValues ? '--' : `$${formatUnit(costValues.posts)}`} />
                  <SecondaryResultDisplay label="Concrete" value={!costValues ? '--' : `$${formatUnit(costValues.concrete)}`} />
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

        </div>
      </div>
    </CalculatorWrapper>
  );
}

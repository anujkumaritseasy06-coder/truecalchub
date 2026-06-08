"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  FenceCostMaterial,
  FenceCostHeight,
  FenceCostTerrain,
  FenceCostInstall,
  calculateFenceCost
} from '@/lib/calculators/fence-cost';

export function FenceCostCalculator() {
  const [material, setMaterial] = useState<FenceCostMaterial>('pine');
  const [height, setHeight] = useState<FenceCostHeight>('6');
  const [terrain, setTerrain] = useState<FenceCostTerrain>('flat');
  const [install, setInstall] = useState<FenceCostInstall>('pro');

  const [length, setLength] = useState<string>('');
  const [gates, setGates] = useState<string>('');

  const { results, error } = useMemo(() => {
    const l = parseFloat(length);
    const g = parseInt(gates, 10);

    if (isNaN(l) || l <= 0) {
      return { results: null, error: 'Please enter a valid positive length.' };
    }
    
    const safeGates = isNaN(g) || g < 0 ? 0 : g;

    if (l > 5000) {
      return { results: null, error: 'Values exceed limits for a standard residential fence.' };
    }

    const outputs = calculateFenceCost(l, material, height, safeGates, terrain, install);

    return { results: outputs, error: null };
  }, [length, material, height, gates, terrain, install]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Project Scope</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label>Total Linear Feet</Label>
                <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 150" suffixNode={<span>ft</span>} />
              </div>
              <div className="space-y-2">
                <Label>Number of Gates</Label>
                <NumberInput value={gates} onChange={(e) => setGates(e.target.value)} min="0" placeholder="1" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Fence Material</Label>
              <select
                className="flex h-10 w-full rounded-md border border-primary-500 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 font-medium text-primary-700 dark:text-primary-400"
                value={material}
                onChange={(e) => setMaterial(e.target.value as FenceCostMaterial)}
              >
                <option value="pine">Pressure Treated Pine</option>
                <option value="cedar">Cedar (Premium Wood)</option>
                <option value="vinyl">Vinyl / PVC</option>
                <option value="chain-link">Chain Link</option>
                <option value="aluminum">Aluminum / Wrought Iron</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Fence Height</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={height}
                  onChange={(e) => setHeight(e.target.value as FenceCostHeight)}
                >
                  <option value="4">4 ft (Picket/Pool)</option>
                  <option value="6">6 ft (Standard Privacy)</option>
                  <option value="8">8 ft (Tall Privacy)</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label>Terrain Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={terrain}
                  onChange={(e) => setTerrain(e.target.value as FenceCostTerrain)}
                >
                  <option value="flat">Flat & Soft Soil</option>
                  <option value="sloped">Sloped / Hilly</option>
                  <option value="rocky">Rocky / Hard Clay</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Installation Method</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={install}
                onChange={(e) => setInstall(e.target.value as FenceCostInstall)}
              >
                <option value="pro">Hire a Professional</option>
                <option value="diy">DIY (Materials Only)</option>
              </select>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Estimated Project Cost</h3>
            </div>

            <div className="grid grid-cols-1 mb-6">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-900/80 dark:to-primary-800/80 p-6 rounded-xl border border-primary-500/30 shadow-sm text-center">
                <p className="text-xs text-primary-100 uppercase tracking-wider mb-2 font-bold">Total Estimated Range</p>
                <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  {!results ? '$0' : `${formatCurrency(results.totalCost.low)} - ${formatCurrency(results.totalCost.high)}`}
                </p>
                <p className="text-sm text-primary-200 mt-3">
                  {install === 'pro' ? 'Includes Materials & Professional Labor' : 'Materials Only (DIY)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultDisplay 
                label="Raw Materials"
                value={!results ? '--' : `${formatCurrency(results.materialCost.low)} - ${formatCurrency(results.materialCost.high)}`}
                className="bg-background border border-border shadow-sm"
              />
              <ResultDisplay 
                label="Professional Labor"
                value={!results ? '--' : install === 'diy' ? '$0 (DIY)' : `${formatCurrency(results.laborCost.low)} - ${formatCurrency(results.laborCost.high)}`}
                className="bg-background border border-border shadow-sm"
              />
              {parseInt(gates, 10) > 0 && (
                <ResultDisplay 
                  label="Gate(s) Cost"
                  value={!results ? '--' : `${formatCurrency(results.gateCost.low)} - ${formatCurrency(results.gateCost.high)}`}
                  className="bg-background border border-border shadow-sm sm:col-span-2"
                />
              )}
            </div>
            
            <p className="text-xs text-secondary-500 mt-6 leading-relaxed">
              * This is a generalized national average estimate. Local prices vary wildly based on lumber market fluctuations, your specific zip code, peak season demand, and the exact style of the fence. For an exact structural material list to take to the hardware store, use our <a href="/construction/fence-calculator" className="text-primary-600 underline">Fence Material Calculator</a>.
            </p>
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

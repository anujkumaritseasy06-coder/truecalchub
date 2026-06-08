"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateWindowReplacement, 
  WindowScope,
  WindowStyle,
  FrameMaterial,
  GlassType
} from '@/lib/calculators/windows';
import { Leaf, Flame, ShieldCheck, Zap } from 'lucide-react';

export function WindowCalculator() {
  const [scope, setScope] = useState<WindowScope>('full');
  
  // Empty states as requested
  const [windowCount, setWindowCount] = useState<string>('');
  const [monthlyBill, setMonthlyBill] = useState<string>('');
  
  // Options
  const [style, setStyle] = useState<WindowStyle>('double_hung');
  const [frameMaterial, setFrameMaterial] = useState<FrameMaterial>('vinyl');
  const [glassType, setGlassType] = useState<GlassType>('double');
  
  const [lowE, setLowE] = useState<boolean>(true);
  const [argonGas, setArgonGas] = useState<boolean>(true);
  const [tempered, setTempered] = useState<boolean>(false);

  // Custom Pricing Overrides
  const [customMaterialCost, setCustomMaterialCost] = useState<string>('');
  const [customLaborCost, setCustomLaborCost] = useState<string>('');

  const { results, error } = useMemo(() => {
    const count = parseInt(windowCount);
    const energyBill = parseFloat(monthlyBill) || 0;

    if (!windowCount) {
      return { results: null, error: null }; // Initial empty state
    }

    if (isNaN(count) || count <= 0) {
      return { results: null, error: 'Please enter a valid number of windows.' };
    }

    const outputs = calculateWindowReplacement({
      scope,
      windowCount: count,
      style,
      frameMaterial,
      glassType,
      options: { lowE, argonGas, tempered },
      currentMonthlyEnergyBill: energyBill,
      customMaterialCostPerWindow: parseFloat(customMaterialCost) || undefined,
      customLaborCostPerWindow: parseFloat(customLaborCost) || undefined
    });

    return { results: outputs, error: null };
  }, [windowCount, monthlyBill, scope, style, frameMaterial, glassType, lowE, argonGas, tempered, customMaterialCost, customLaborCost]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="space-y-3">
            <Label className="text-base font-semibold">Project Scope</Label>
            <div className="grid grid-cols-3 gap-2 bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1">
              <button
                onClick={() => setScope('full')}
                className={`py-2 text-sm font-medium rounded-md transition-all ${
                  scope === 'full' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                }`}
              >
                Full Replacement
              </button>
              <button
                onClick={() => setScope('glass')}
                className={`py-2 text-sm font-medium rounded-md transition-all ${
                  scope === 'glass' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                }`}
              >
                Glass Only
              </button>
              <button
                onClick={() => setScope('screen')}
                className={`py-2 text-sm font-medium rounded-md transition-all ${
                  scope === 'screen' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                }`}
              >
                Screens Only
              </button>
            </div>
            <p className="text-xs text-secondary-500 mt-1">
              {scope === 'full' && 'Complete removal of frame and glass. Most expensive but highest ROI.'}
              {scope === 'glass' && 'Replacing only the insulated glass unit (IGU). Frame remains intact.'}
              {scope === 'screen' && 'Replacing torn mesh and splines on existing frames.'}
            </p>
          </div>

          <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-6">
            <div className="space-y-2">
              <Label className="text-blue-900 dark:text-blue-200 font-semibold">Number of Windows</Label>
              <NumberInput 
                value={windowCount} 
                onChange={(e) => setWindowCount(e.target.value)} 
                min="1" 
                placeholder="e.g. 8" 
                className="border-blue-200 focus-visible:ring-blue-500 text-lg" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Window Style</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={style}
                onChange={(e) => setStyle(e.target.value as WindowStyle)}
              >
                <option value="single_hung">Single Hung</option>
                <option value="double_hung">Double Hung</option>
                <option value="casement">Casement (Crank)</option>
                <option value="sliding">Sliding / Glider</option>
                <option value="picture">Picture (Fixed)</option>
                <option value="bay_bow">Bay or Bow Window</option>
                <option value="custom">Custom Architectural</option>
              </select>
            </div>
            
            {scope === 'full' && (
              <div className="space-y-3 animate-in fade-in">
                <Label>Frame Material</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={frameMaterial}
                  onChange={(e) => setFrameMaterial(e.target.value as FrameMaterial)}
                >
                  <option value="vinyl">Vinyl (Most Common/Economical)</option>
                  <option value="aluminum">Aluminum</option>
                  <option value="fiberglass">Fiberglass (Premium/Durable)</option>
                  <option value="composite">Composite (Fibrex)</option>
                  <option value="wood">Wood (Luxury/Historic)</option>
                </select>
              </div>
            )}
          </div>

          {(scope === 'full' || scope === 'glass') && (
            <div className="space-y-4 pt-4 border-t border-border animate-in fade-in">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                Glass & Efficiency Upgrades
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Glass Panes</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none"
                    value={glassType}
                    onChange={(e) => setGlassType(e.target.value as GlassType)}
                  >
                    <option value="single">Single Pane (Not Recommended)</option>
                    <option value="double">Double Pane (Standard)</option>
                    <option value="triple">Triple Pane (Maximum Efficiency)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${lowE ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'border-border hover:bg-secondary-50 dark:hover:bg-secondary-900'}`}>
                  <input type="checkbox" checked={lowE} onChange={(e) => setLowE(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm font-medium">Low-E Coating</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${argonGas ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'border-border hover:bg-secondary-50 dark:hover:bg-secondary-900'}`}>
                  <input type="checkbox" checked={argonGas} onChange={(e) => setArgonGas(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm font-medium">Argon Gas Fill</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${tempered ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'border-border hover:bg-secondary-50 dark:hover:bg-secondary-900'}`}>
                  <input type="checkbox" checked={tempered} onChange={(e) => setTempered(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm font-medium">Tempered (Safety)</span>
                </label>
              </div>

              {/* ADVANCED FEATURE: Energy ROI Input */}
              <div className="pt-4 space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Average Monthly Heating/Cooling Bill (For ROI Estimate)
                </Label>
                <NumberInput 
                  value={monthlyBill} 
                  onChange={(e) => setMonthlyBill(e.target.value)} 
                  min="0" 
                  placeholder="e.g. 150" 
                  prefixNode={<span>$</span>} 
                />
              </div>

            </div>
          )}

          {/* Optional Overrides */}
          <div className="pt-6 border-t border-border animate-in fade-in">
            <h3 className="font-semibold text-secondary-600 dark:text-secondary-400 mb-4">Optional: Custom Pricing Overrides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Custom Material Cost (Per Window)</Label>
                <NumberInput 
                  value={customMaterialCost} 
                  onChange={(e) => setCustomMaterialCost(e.target.value)} 
                  min="0" 
                  placeholder="Leave blank for auto-calc" 
                  prefixNode={<span>$</span>} 
                />
              </div>
              <div className="space-y-2">
                <Label>Custom Labor Cost (Per Window)</Label>
                <NumberInput 
                  value={customLaborCost} 
                  onChange={(e) => setCustomLaborCost(e.target.value)} 
                  min="0" 
                  placeholder="Leave blank for auto-calc" 
                  prefixNode={<span>$</span>} 
                />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-6">
          {!results ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] shadow-sm">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Awaiting Project Details</h3>
              <p className="text-sm text-secondary-500">Enter the number of windows to generate a professional cost estimate instantly.</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-indigo-100 font-medium mb-1">Estimated Project Cost</h3>
                <div className="text-4xl font-bold tracking-tight mb-2">
                  {formatCurrency(results.totalCost.average)}
                </div>
                <p className="text-indigo-200 text-sm">
                  Typical Range: {formatCurrency(results.totalCost.low)} - {formatCurrency(results.totalCost.high)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Cost Breakdown (Average)</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay 
                    label="Materials & Windows" 
                    value={formatCurrency(results.materialCost.average)} 
                  />
                  <SecondaryResultDisplay 
                    label="Installation Labor" 
                    value={formatCurrency(results.laborCost.average)} 
                  />
                </div>
              </div>

              {/* ADVANCED FEATURE: Energy ROI Dashboard */}
              {results.energyROI && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider">Energy Return on Investment</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-emerald-200 dark:border-emerald-800/50 pb-3">
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">Efficiency Rating</p>
                        <p className="font-bold text-emerald-900 dark:text-emerald-100">{results.energyROI.efficiencyRating}</p>
                      </div>
                    </div>
                    
                    <SecondaryResultDisplay 
                      label="Est. Annual Savings" 
                      value={formatCurrency(results.energyROI.estimatedAnnualSavings)} 
                      valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
                    />
                    
                    <SecondaryResultDisplay 
                      label="Financial Payback Period" 
                      value={results.energyROI.estimatedAnnualSavings > 0 ? `${results.energyROI.paybackPeriodYears.toFixed(1)} Years` : 'N/A'} 
                    />
                    
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-2 italic">
                      *Estimates based on national averages. Upgrading from drafty single-pane windows to your selected configuration.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </CalculatorWrapper>
  );
}

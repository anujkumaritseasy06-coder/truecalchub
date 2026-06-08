"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateHomeAddition, 
  AdditionStructure,
  RoomType,
  FinishQuality
} from '@/lib/calculators/home-addition';
import { Home, TrendingUp, DollarSign, PenTool, LayoutDashboard } from 'lucide-react';

export function HomeAdditionCalculator() {
  const [structure, setStructure] = useState<AdditionStructure>('ground_level');
  const [roomType, setRoomType] = useState<RoomType>('bedroom_living');
  const [finishQuality, setFinishQuality] = useState<FinishQuality>('standard');
  
  // Empty states as requested
  const [squareFootage, setSquareFootage] = useState<string>('');
  
  // ROI Inputs
  const [currentValue, setCurrentValue] = useState<string>('');
  const [currentSqFt, setCurrentSqFt] = useState<string>('');

  const { results, error } = useMemo(() => {
    const sqFt = parseFloat(squareFootage);
    const value = parseFloat(currentValue) || 0;
    const existingSqFt = parseFloat(currentSqFt) || 0;

    if (!squareFootage) {
      return { results: null, error: null }; // Initial empty state
    }

    if (isNaN(sqFt) || sqFt <= 0) {
      return { results: null, error: 'Please enter a valid square footage for your planned addition.' };
    }

    const outputs = calculateHomeAddition({
      structure,
      roomType,
      finishQuality,
      squareFootage: sqFt,
      currentHomeValue: value,
      currentHomeSqFt: existingSqFt
    });

    return { results: outputs, error: null };
  }, [squareFootage, structure, roomType, finishQuality, currentValue, currentSqFt]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <CalculatorWrapper className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-6 space-y-8">
          
          <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-lg">
              <LayoutDashboard className="w-5 h-5 text-primary-500" />
              Addition Details
            </h3>
            
            <div className="space-y-3">
              <Label className="text-base">Planned Square Footage</Label>
              <NumberInput 
                value={squareFootage} 
                onChange={(e) => setSquareFootage(e.target.value)} 
                min="1" 
                placeholder="e.g. 500" 
                suffixNode={<span className="text-slate-500">sq ft</span>}
                className="text-lg" 
              />
            </div>

            <div className="space-y-3">
              <Label>Structural Type</Label>
              <select
                className="flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
                value={structure}
                onChange={(e) => setStructure(e.target.value as AdditionStructure)}
              >
                <option value="bump_out">Bump-out (Micro Addition)</option>
                <option value="ground_level">Standard Ground Level Addition</option>
                <option value="second_story">Second Story Addition (Build Up)</option>
                <option value="garage">Garage Addition</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Primary Room Type</Label>
              <select
                className="flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                disabled={structure === 'garage'}
              >
                <option value="bedroom_living">Bedroom / Living Room / Office (Dry)</option>
                <option value="sunroom">Sunroom / Four-Season Room</option>
                <option value="master_suite">Master Suite (Bedroom + Bathroom)</option>
                <option value="bathroom_only">Bathroom Only (Heavy Plumbing)</option>
                <option value="kitchen">Kitchen Expansion (Heavy MEP)</option>
              </select>
              {structure === 'garage' && <p className="text-xs text-amber-600">Room type is disabled for Garage additions.</p>}
            </div>

            <div className="space-y-3">
              <Label>Interior Finish Quality</Label>
              <div className="grid grid-cols-3 gap-2 bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1">
                <button
                  onClick={() => setFinishQuality('standard')}
                  className={`py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    finishQuality === 'standard' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setFinishQuality('premium')}
                  className={`py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    finishQuality === 'premium' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                  }`}
                >
                  Premium
                </button>
                <button
                  onClick={() => setFinishQuality('luxury')}
                  className={`py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    finishQuality === 'luxury' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                  }`}
                >
                  Luxury
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl space-y-6 shadow-sm">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Advanced: Real Estate ROI
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Enter your current home data to calculate how much equity this addition will instantly build.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-emerald-900 dark:text-emerald-200">Current Home Value</Label>
                <NumberInput 
                  value={currentValue} 
                  onChange={(e) => setCurrentValue(e.target.value)} 
                  min="0" 
                  placeholder="e.g. 450000" 
                  prefixNode={<span className="text-emerald-600">$</span>} 
                  className="border-emerald-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-900 dark:text-emerald-200">Current Sq Ft</Label>
                <NumberInput 
                  value={currentSqFt} 
                  onChange={(e) => setCurrentSqFt(e.target.value)} 
                  min="0" 
                  placeholder="e.g. 2000" 
                  suffixNode={<span className="text-emerald-600">sq ft</span>} 
                  className="border-emerald-200 focus-visible:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-6 space-y-6">
          {!results ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-sm">
              <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-6">
                <Home className="w-10 h-10 text-secondary-400" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Awaiting Square Footage</h3>
              <p className="text-secondary-500 max-w-sm mx-auto">
                Enter your planned addition size to instantly generate a comprehensive cost breakdown and real estate equity estimate.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary-500 opacity-20 blur-3xl rounded-full"></div>
                <h3 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary-400" />
                  Estimated Project Cost
                </h3>
                <div className="text-5xl font-bold tracking-tight mb-3">
                  {formatCurrency(results.cost.average)}
                </div>
                <div className="inline-block bg-slate-800 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
                  <p className="text-slate-300 text-sm font-medium">
                    Typical Range: <span className="text-white">{formatCurrency(results.cost.low)}</span> - <span className="text-white">{formatCurrency(results.cost.high)}</span>
                  </p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Budget Breakdown
                </h3>
                
                {/* Visual Bar */}
                <div className="w-full h-4 rounded-full flex overflow-hidden mb-6">
                  <div className="bg-amber-500" style={{ width: `${(results.cost.breakdown.foundation / results.cost.average) * 100}%` }}></div>
                  <div className="bg-blue-500" style={{ width: `${(results.cost.breakdown.framingExterior / results.cost.average) * 100}%` }}></div>
                  <div className="bg-emerald-500" style={{ width: `${(results.cost.breakdown.interiorFinishes / results.cost.average) * 100}%` }}></div>
                  <div className="bg-purple-500" style={{ width: `${(results.cost.breakdown.softCosts / results.cost.average) * 100}%` }}></div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="font-medium text-amber-900 dark:text-amber-100">Foundation & Prep</span>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400">{formatCurrency(results.cost.breakdown.foundation)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium text-blue-900 dark:text-blue-100">Framing & Exterior</span>
                    </div>
                    <span className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(results.cost.breakdown.framingExterior)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="font-medium text-emerald-900 dark:text-emerald-100">Interior Finishes & MEP</span>
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(results.cost.breakdown.interiorFinishes)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="font-medium text-purple-900 dark:text-purple-100">Soft Costs (Permits/Design)</span>
                    </div>
                    <span className="font-bold text-purple-700 dark:text-purple-400">{formatCurrency(results.cost.breakdown.softCosts)}</span>
                  </div>
                </div>
              </div>

              {/* ADVANCED FEATURE: Real Estate ROI Dashboard */}
              {results.roi && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Home className="w-24 h-24 text-emerald-500" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Value Added (ROI)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Instant Equity Built</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">+{formatCurrency(results.roi.estimatedValueAdded)}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Estimated ROI %</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{results.roi.roiPercentage}%</p>
                    </div>
                  </div>

                  <div className="bg-emerald-600 dark:bg-emerald-700 rounded-xl p-4 flex justify-between items-center shadow-inner">
                    <span className="text-emerald-50 font-medium">New Total Home Value:</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(results.roi.newHomeValue)}</span>
                  </div>
                  
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-3 text-center">
                    *Based on National Remodeling Cost vs. Value averages. Actual appraisal may vary by local market.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </CalculatorWrapper>
  );
}

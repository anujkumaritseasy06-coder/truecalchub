"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateBricks, 
  UnitSystem, 
  ProjectType,
  BrickType
} from '@/lib/calculators/brick';

export function BrickCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [projectType, setProjectType] = useState<ProjectType>('wall');
  const [brickType, setBrickType] = useState<BrickType>('standard');
  
  // Empty states as requested
  const [length, setLength] = useState<string>('');
  const [heightOrWidth, setHeightOrWidth] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');
  const [jointThickness, setJointThickness] = useState<string>('');
  const [waste, setWaste] = useState<string>('');
  
  // Costs
  const [costPerBrick, setCostPerBrick] = useState<string>('');
  const [costPerMortarBag, setCostPerMortarBag] = useState<string>('');
  const [laborPer1000, setLaborPer1000] = useState<string>('');

  const { results, error } = useMemo(() => {
    const l = parseFloat(length);
    const hw = parseFloat(heightOrWidth);
    const ded = parseFloat(deductions) || 0;
    const joint = parseFloat(jointThickness) || 0;
    const w = parseFloat(waste) || 0;

    if (!length && !heightOrWidth) {
      return { results: null, error: null }; // Initial empty state
    }

    if (isNaN(l) || isNaN(hw) || l <= 0 || hw <= 0) {
      return { results: null, error: 'Please enter valid dimensions for length and height/width.' };
    }

    const totalArea = l * hw;

    const outputs = calculateBricks(
      {
        projectType,
        brickType,
        mortarJointThickness: joint,
        wastePercentage: w,
        totalArea,
        deductionArea: ded
      }, 
      unit
    );

    return { results: outputs, error: null };
  }, [length, heightOrWidth, deductions, jointThickness, waste, projectType, brickType, unit]);

  const costValues = useMemo(() => {
    if (!results) return null;
    
    const brickPrice = parseFloat(costPerBrick) || 0;
    const mortarPrice = parseFloat(costPerMortarBag) || 0;
    const laborPrice = parseFloat(laborPer1000) || 0;

    const brickCost = results.totalBricksWithWaste * brickPrice;
    const mortarCost = results.mortarBagsRequired * mortarPrice;
    const totalMaterials = brickCost + mortarCost;
    
    const laborCost = (results.totalBricksWithWaste / 1000) * laborPrice;

    return {
      totalMaterials,
      laborCost,
      grandTotal: totalMaterials + laborCost
    };
  }, [results, costPerBrick, costPerMortarBag, laborPer1000]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  const lengthLabel = unit === 'imperial' ? 'ft' : 'm';
  const areaLabel = unit === 'imperial' ? 'sq ft' : 'sq m';
  const jointLabel = unit === 'imperial' ? 'in' : 'cm';

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="flex bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1">
            <button
              onClick={() => setProjectType('wall')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                projectType === 'wall'
                  ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
              }`}
            >
              Brick Wall Calculator
            </button>
            <button
              onClick={() => setProjectType('patio')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                projectType === 'patio'
                  ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
              }`}
            >
              Brick Pavers / Patio
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Brick Size Standard</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={brickType}
                onChange={(e) => setBrickType(e.target.value as BrickType)}
              >
                <option value="standard">Standard (8" x 2.25")</option>
                <option value="modular">Modular (7.625" x 2.25")</option>
                <option value="norman">Norman (11.625" x 2.25")</option>
                <option value="jumbo">Jumbo (8" x 2.75")</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Measurement Unit</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitSystem)}
              >
                <option value="imperial">Imperial (Feet/Inches)</option>
                <option value="metric">Metric (Meters/CM)</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl space-y-6">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Project Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-amber-900 dark:text-amber-200">Length</Label>
                <NumberInput value={length} onChange={(e) => setLength(e.target.value)} min="0" placeholder="e.g. 20" suffixNode={<span>{lengthLabel}</span>} className="border-amber-200 focus-visible:ring-amber-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-amber-900 dark:text-amber-200">
                  {projectType === 'wall' ? 'Height' : 'Width'}
                </Label>
                <NumberInput value={heightOrWidth} onChange={(e) => setHeightOrWidth(e.target.value)} min="0" placeholder="e.g. 8" suffixNode={<span>{lengthLabel}</span>} className="border-amber-200 focus-visible:ring-amber-500" />
              </div>
            </div>
            {projectType === 'wall' && (
              <div className="space-y-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
                <Label className="text-amber-900 dark:text-amber-200">Deductions (Doors / Windows)</Label>
                <NumberInput value={deductions} onChange={(e) => setDeductions(e.target.value)} min="0" placeholder="0" suffixNode={<span>{areaLabel}</span>} className="border-amber-200 focus-visible:ring-amber-500" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mortar Joint Thickness</Label>
              <NumberInput value={jointThickness} onChange={(e) => setJointThickness(e.target.value)} min="0" placeholder={projectType === 'wall' ? "0.375" : "0"} suffixNode={<span>{jointLabel}</span>} />
              <p className="text-xs text-secondary-500">{projectType === 'wall' ? 'Standard is 3/8" (0.375)' : 'Usually 0 for sand-swept pavers'}</p>
            </div>
            <div className="space-y-2">
              <Label>Waste Factor</Label>
              <NumberInput value={waste} onChange={(e) => setWaste(e.target.value)} min="0" placeholder="10" suffixNode={<span>%</span>} />
              <p className="text-xs text-secondary-500">Breakage and cutting waste (typically 5-10%)</p>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-border animate-in fade-in">
            <h3 className="font-semibold text-foreground">Material Costs & Labor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost per Brick</Label>
                <NumberInput value={costPerBrick} onChange={(e) => setCostPerBrick(e.target.value)} min="0" placeholder="0.85" prefixNode={<span>$</span>} />
              </div>
              {projectType === 'wall' && (
                <div className="space-y-2">
                  <Label>Mortar (per 80lb Bag)</Label>
                  <NumberInput value={costPerMortarBag} onChange={(e) => setCostPerMortarBag(e.target.value)} min="0" placeholder="8.50" prefixNode={<span>$</span>} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Labor (per 1000 bricks)</Label>
                <NumberInput value={laborPer1000} onChange={(e) => setLaborPer1000(e.target.value)} min="0" placeholder="900" prefixNode={<span>$</span>} />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Awaiting Dimensions</h3>
              <p className="text-sm text-secondary-500">Enter your project length and height to instantly calculate brick yields and mortar requirements.</p>
            </div>
          ) : (
            <>
              <ResultDisplay 
                label="Total Bricks Needed" 
                value={formatUnit(results.totalBricksWithWaste, 0)} 
              />
              <p className="text-xs text-secondary-500 mt-2 text-center">
                Includes {waste || 0}% waste factor. Exact raw count is {formatUnit(results.totalBricksExact, 0)}.
              </p>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Yield Mathematics</h3>
                <div className="space-y-3">
                  <SecondaryResultDisplay 
                    label="Net Project Area" 
                    value={`${formatUnit(results.netArea)} ${areaLabel}`} 
                  />
                  <SecondaryResultDisplay 
                    label="Bricks per Unit Area" 
                    value={`${formatUnit(results.bricksPerUnitArea, 2)} per ${areaLabel}`} 
                  />
                  {projectType === 'wall' ? (
                    <SecondaryResultDisplay 
                      label="Mortar Required (80lb Bags)" 
                      value={`${formatUnit(results.mortarBagsRequired, 0)} Bags`} 
                      valueClassName="text-amber-600 dark:text-amber-400 font-bold"
                    />
                  ) : (
                    <SecondaryResultDisplay 
                      label="Base & Joint Sand" 
                      value={`${formatUnit(results.sandRequiredTons, 2)} Tons`} 
                      valueClassName="text-amber-600 dark:text-amber-400 font-bold"
                    />
                  )}
                </div>
              </div>

              {costValues && costValues.grandTotal > 0 && (
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Financial Estimate</h3>
                  <div className="space-y-3">
                    <SecondaryResultDisplay 
                      label="Total Materials" 
                      value={`$${formatUnit(costValues.totalMaterials)}`} 
                    />
                    <SecondaryResultDisplay 
                      label="Estimated Labor" 
                      value={`$${formatUnit(costValues.laborCost)}`} 
                    />
                    <div className="pt-4 mt-4 border-t border-border">
                      <SecondaryResultDisplay 
                        label="Total Project Cost" 
                        value={`$${formatUnit(costValues.grandTotal)}`} 
                        valueClassName="text-emerald-600 dark:text-emerald-400 font-bold text-lg"
                      />
                    </div>
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

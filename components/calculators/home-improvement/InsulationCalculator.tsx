"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateInsulation, 
  UnitSystem, 
  InsulationMaterial,
  FramingSpacing,
  InsulationArea, 
  InsulationDeduction 
} from '@/lib/calculators/insulation';
import { Plus, Trash2, Leaf } from 'lucide-react';

interface AreaState {
  id: string;
  length: string;
  width: string;
}

export function InsulationCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [material, setMaterial] = useState<InsulationMaterial>('fiberglass_batt');
  const [framing, setFraming] = useState<FramingSpacing>('16_oc');
  
  // Specifications
  const [targetRValue, setTargetRValue] = useState<string>(''); // R-38 standard attic
  const [wasteFactor, setWasteFactor] = useState<string>('');
  const [useVaporBarrier, setUseVaporBarrier] = useState<boolean>(false);

  // Areas
  const [areas, setAreas] = useState<AreaState[]>([
    { id: '1', length: '', width: '' }
  ]);

  // Deductions
  const [deductions, setDeductions] = useState<AreaState[]>([]);

  // Costs
  const [costPerUnit, setCostPerUnit] = useState<string>(''); // Per Roll, Bag, Kit, or Sheet
  const [costVaporBarrier, setCostVaporBarrier] = useState<string>(''); // Per Roll
  const [laborTotal, setLaborTotal] = useState<string>(''); // Flat labor or hourly

  const addArea = () => setAreas([...areas, { id: Date.now().toString(), length: '', width: '' }]);
  const removeArea = (id: string) => { if (areas.length > 1) setAreas(areas.filter(a => a.id !== id)); };
  const updateArea = (id: string, field: keyof AreaState, value: string) => setAreas(areas.map(a => a.id === id ? { ...a, [field]: value } : a));

  const addDeduction = () => setDeductions([...deductions, { id: Date.now().toString(), length: '', width: '' }]);
  const removeDeduction = (id: string) => setDeductions(deductions.filter(d => d.id !== id));
  const updateDeduction = (id: string, field: keyof AreaState, value: string) => setDeductions(deductions.map(d => d.id === id ? { ...d, [field]: value } : d));

  const { results, error } = useMemo(() => {
    let valid = true;
    let hasData = false;
    
    const parsedAreas: InsulationArea[] = areas.map(a => {
      const l = parseFloat(a.length);
      const w = parseFloat(a.width);
      if (a.length || a.width) hasData = true;
      if (a.length && a.width && (isNaN(l) || isNaN(w) || l < 0 || w < 0)) valid = false;
      return { length: l || 0, width: w || 0 };
    });

    const parsedDeductions: InsulationDeduction[] = deductions.map(d => {
      const l = parseFloat(d.length);
      const w = parseFloat(d.width);
      if (d.length && d.width && (isNaN(l) || isNaN(w) || l < 0 || w < 0)) valid = false;
      return { length: l || 0, width: w || 0 };
    });

    const targetR = parseFloat(targetRValue) || 0;
    const waste = parseFloat(wasteFactor) || 0;

    if (!valid || targetR <= 0 || waste < 0) {
      return { results: null, error: 'Please enter valid positive numbers for dimensions and Target R-Value.' };
    }
    if (!hasData) {
      return { results: null, error: null };
    }

    const outputs = calculateInsulation(
      parsedAreas, 
      parsedDeductions, 
      {
        material,
        targetRValue: targetR,
        framingSpacing: framing,
        useVaporBarrier,
        wasteFactor: waste
      }, 
      unit
    );

    return { results: outputs, error: null };
  }, [areas, deductions, material, targetRValue, framing, useVaporBarrier, wasteFactor, unit]);

  const costValues = useMemo(() => {
    if (!results) return null;
    const unitPrice = parseFloat(costPerUnit) || 0;
    const vaporPrice = parseFloat(costVaporBarrier) || 0;
    const labor = parseFloat(laborTotal) || 0;

    let primaryMaterialQty = 0;
    switch (material) {
      case 'fiberglass_batt': primaryMaterialQty = results.battRolls; break;
      case 'blown_cellulose':
      case 'blown_fiberglass': primaryMaterialQty = results.blownBags; break;
      case 'spray_foam_closed':
      case 'spray_foam_open': primaryMaterialQty = results.sprayFoamKits; break;
      case 'rigid_foam': primaryMaterialQty = results.rigidFoamSheets; break;
    }

    const materialsCost = (primaryMaterialQty * unitPrice) + (results.vaporBarrierRolls * vaporPrice);

    return {
      materialsCost,
      laborCost: labor,
      grandTotal: materialsCost + labor,
      primaryMaterialQty
    };
  }, [results, material, costPerUnit, costVaporBarrier, laborTotal]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  const lengthLabel = unit === 'imperial' ? 'ft' : 'm';
  const areaLabel = unit === 'imperial' ? 'sq ft' : 'sq m';

  // Determine label for primary material cost input
  let unitCostLabel = 'Cost per Roll';
  if (material.includes('blown')) unitCostLabel = 'Cost per Bag';
  if (material.includes('spray_foam')) unitCostLabel = 'Cost per 600bf Kit';
  if (material === 'rigid_foam') unitCostLabel = 'Cost per Sheet';

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Insulation Material</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={material}
                onChange={(e) => setMaterial(e.target.value as InsulationMaterial)}
              >
                <option value="fiberglass_batt">Fiberglass Batts / Rolls</option>
                <option value="blown_cellulose">Blown-in Cellulose</option>
                <option value="blown_fiberglass">Blown-in Fiberglass</option>
                <option value="spray_foam_closed">Closed-Cell Spray Foam</option>
                <option value="spray_foam_open">Open-Cell Spray Foam</option>
                <option value="rigid_foam">Rigid Foam Board (XPS/EPS)</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Framing Spacing</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={framing}
                onChange={(e) => setFraming(e.target.value as FramingSpacing)}
              >
                <option value="16_oc">16" On-Center (10% cavity void)</option>
                <option value="24_oc">24" On-Center (7% cavity void)</option>
                <option value="none">No Framing / Open Surface</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
            <div className="space-y-2">
              <Label className="text-emerald-900 dark:text-emerald-100">Target R-Value</Label>
              <NumberInput value={targetRValue} onChange={(e) => setTargetRValue(e.target.value)} min="1" max="100" placeholder="e.g. 38 for attics" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">E.g., R-13 for walls, R-38 to R-60 for attics.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-emerald-900 dark:text-emerald-100">Waste Factor %</Label>
              <NumberInput value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} min="0" placeholder="10" suffixNode={<span>%</span>} />
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Project Areas (Attics, Walls, Crawlspaces)</h3>
              <button onClick={addArea} className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors">
                <Plus size={16} /> Add Area
              </button>
            </div>

            {areas.map((area, index) => (
              <div key={area.id} className="p-4 bg-background rounded-lg border border-border relative space-y-4">
                {areas.length > 1 && (
                  <button onClick={() => removeArea(area.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors" title="Remove Area">
                    <Trash2 size={16} />
                  </button>
                )}
                <h4 className="text-sm font-medium text-secondary-500">Area {index + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <NumberInput value={area.length} onChange={(e) => updateArea(area.id, 'length', e.target.value)} min="0" placeholder="e.g. 30" suffixNode={<span>{lengthLabel}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={area.width} onChange={(e) => updateArea(area.id, 'width', e.target.value)} min="0" placeholder="e.g. 20" suffixNode={<span>{lengthLabel}</span>} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Deductions (Windows, Doors, Uninsulated Voids)</h3>
              <button onClick={addDeduction} className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors">
                <Plus size={16} /> Add Deduction
              </button>
            </div>

            {deductions.map((deduction, index) => (
              <div key={deduction.id} className="p-4 bg-background rounded-lg border border-border relative space-y-4">
                <button onClick={() => removeDeduction(deduction.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors" title="Remove Deduction">
                  <Trash2 size={16} />
                </button>
                <h4 className="text-sm font-medium text-secondary-500">Deduction {index + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <NumberInput value={deduction.length} onChange={(e) => updateDeduction(deduction.id, 'length', e.target.value)} min="0" placeholder="e.g. 5" suffixNode={<span>{lengthLabel}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={deduction.width} onChange={(e) => updateDeduction(deduction.id, 'width', e.target.value)} min="0" placeholder="e.g. 3" suffixNode={<span>{lengthLabel}</span>} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
            <input 
              type="checkbox" 
              id="useVaporBarrier"
              checked={useVaporBarrier} 
              onChange={(e) => setUseVaporBarrier(e.target.checked)}
              className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="useVaporBarrier" className="text-sm font-medium text-indigo-900 dark:text-indigo-200 cursor-pointer">
              Include 6-mil Poly Vapor Barrier (Required for exterior walls in cold climates)
            </label>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{unitCostLabel}</Label>
                <NumberInput value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              {useVaporBarrier && (
                <div className="space-y-2">
                  <Label>Vapor Barrier (500 sqft)</Label>
                  <NumberInput value={costVaporBarrier} onChange={(e) => setCostVaporBarrier(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Total Contractor Labor Estimate</Label>
                <NumberInput value={laborTotal} onChange={(e) => setLaborTotal(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <ResultDisplay 
              label="Primary Material Required"
              value={!results ? '--' : costValues?.primaryMaterialQty}
              subValue={
                material === 'fiberglass_batt' ? 'Rolls/Batts (40 sqft avg)' :
                material.includes('blown') ? 'Bags of Insulation' :
                material.includes('spray_foam') ? '600bf Commercial Kits' :
                'Sheets of Rigid Foam (4x8)'
              }
              className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm transition-transform duration-300 hover:scale-[1.01]"
            />
            
            <div className="space-y-2 px-1 relative z-10">
              <SecondaryResultDisplay label="Required Application Depth" value={!results ? '--' : `${formatUnit(results.requiredThicknessInches, 1)} Inches`} />
              {material.includes('spray_foam') && (
                <SecondaryResultDisplay label="Total Board Feet" value={!results ? '--' : `${formatUnit(results.sprayFoamBoardFeet, 0)} bf`} />
              )}
              {useVaporBarrier && (
                <SecondaryResultDisplay label="Poly Vapor Barrier" value={!results ? '--' : `${results.vaporBarrierRolls} Rolls`} valueClassName="text-indigo-600 dark:text-indigo-400 font-medium" />
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Project Coverage Area</h3>
            <div className="space-y-3">
              <SecondaryResultDisplay 
                label="Gross Area" 
                value={!results ? '--' : `${formatUnit(results.grossAreaSqFt)} ${areaLabel}`} 
              />
              <SecondaryResultDisplay 
                label="Net Cavity Area (Minus Framing)" 
                value={!results ? '--' : `${formatUnit(results.netAreaSqFt)} ${areaLabel}`} 
              />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Financial & Energy Analysis</h3>
            <div className="space-y-3">
              <SecondaryResultDisplay 
                label="DIY Material Cost" 
                value={!costValues ? '--' : `$${formatUnit(costValues.materialsCost)}`} 
              />
              <SecondaryResultDisplay 
                label="Hiring Professional Installer" 
                value={!costValues ? '--' : `$${formatUnit(costValues.grandTotal)}`} 
                valueClassName="text-emerald-600 dark:text-emerald-400 font-medium"
              />
              
              <div className="pt-4 mt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-foreground">Advanced: Est. Energy Savings</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {!results ? '--' : `~$${formatUnit(results.estimatedEnergySavingsPerYear, 0)}`}
                  <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400 ml-1">/ year</span>
                </div>
                <p className="text-xs text-secondary-500 mt-1">Based on upgrading to R-{targetRValue}. Payback period: {!results || !costValues || results.estimatedEnergySavingsPerYear <= 0 ? '--' : formatUnit(costValues.materialsCost / results.estimatedEnergySavingsPerYear, 1)} years.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

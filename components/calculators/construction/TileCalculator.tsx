"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateTile, 
  UnitSystem, 
  TilePattern,
  TileArea, 
  TileDeduction 
} from '@/lib/calculators/tile';
import { Plus, Trash2 } from 'lucide-react';

interface AreaState {
  id: string;
  length: string;
  width: string;
}

export function TileCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [pattern, setPattern] = useState<TilePattern>('straight');

  // Tile Specs
  const [tileLength, setTileLength] = useState<string>('');
  const [tileWidth, setTileWidth] = useState<string>('');
  const [tileThickness, setTileThickness] = useState<string>(''); // 3/8 inch standard
  const [jointWidth, setJointWidth] = useState<string>(''); // 1/8 inch standard
  const [boxQuantity, setBoxQuantity] = useState<string>('');
  const [customWaste, setCustomWaste] = useState<string>('');
  const [useBackerboard, setUseBackerboard] = useState<boolean>(true);

  // Areas
  const [areas, setAreas] = useState<AreaState[]>([
    { id: '1', length: '', width: '' }
  ]);

  // Deductions
  const [deductions, setDeductions] = useState<AreaState[]>([]);

  // Costs
  const [costPerBox, setCostPerBox] = useState<string>('');
  const [costThinset, setCostThinset] = useState<string>('');
  const [costGrout, setCostGrout] = useState<string>('');
  const [costBackerboard, setCostBackerboard] = useState<string>('');
  const [laborPerSqFt, setLaborPerSqFt] = useState<string>('');

  const addArea = () => setAreas([...areas, { id: Date.now().toString(), length: '', width: '' }]);
  const removeArea = (id: string) => { if (areas.length > 1) setAreas(areas.filter(a => a.id !== id)); };
  const updateArea = (id: string, field: keyof AreaState, value: string) => setAreas(areas.map(a => a.id === id ? { ...a, [field]: value } : a));

  const addDeduction = () => setDeductions([...deductions, { id: Date.now().toString(), length: '', width: '' }]);
  const removeDeduction = (id: string) => setDeductions(deductions.filter(d => d.id !== id));
  const updateDeduction = (id: string, field: keyof AreaState, value: string) => setDeductions(deductions.map(d => d.id === id ? { ...d, [field]: value } : d));

  const { results, error } = useMemo(() => {
    let valid = true;
    let hasData = false;
    
    const parsedAreas: TileArea[] = areas.map(a => {
      const l = parseFloat(a.length);
      const w = parseFloat(a.width);
      if (a.length || a.width) hasData = true;
      if (a.length && a.width && (isNaN(l) || isNaN(w) || l < 0 || w < 0)) valid = false;
      return { length: l || 0, width: w || 0 };
    });

    const parsedDeductions: TileDeduction[] = deductions.map(d => {
      const l = parseFloat(d.length);
      const w = parseFloat(d.width);
      if (d.length && d.width && (isNaN(l) || isNaN(w) || l < 0 || w < 0)) valid = false;
      return { length: l || 0, width: w || 0 };
    });

    const tLength = parseFloat(tileLength) || 0;
    const tWidth = parseFloat(tileWidth) || 0;
    const tThick = parseFloat(tileThickness) || 0;
    const tJoint = parseFloat(jointWidth) || 0;
    const boxQty = parseInt(boxQuantity) || 0;

    if (!valid || tLength < 0 || tWidth < 0 || tThick < 0 || tJoint < 0) {
      return { results: null, error: 'Please enter valid positive dimensions.' };
    }
    if (!hasData) {
      return { results: null, error: null };
    }

    const outputs = calculateTile(
      parsedAreas, 
      parsedDeductions, 
      {
        tileLength: tLength,
        tileWidth: tWidth,
        tileThickness: tThick,
        jointWidth: tJoint,
        pattern,
        boxQuantity: boxQty,
        useBackerboard,
        customWasteFactor: customWaste !== '' ? parseFloat(customWaste) : undefined
      }, 
      unit
    );

    return { results: outputs, error: null };
  }, [areas, deductions, tileLength, tileWidth, tileThickness, jointWidth, boxQuantity, customWaste, pattern, useBackerboard, unit]);

  const costValues = useMemo(() => {
    if (!results) return null;
    const boxP = parseFloat(costPerBox) || 0;
    const thinsetP = parseFloat(costThinset) || 0;
    const groutP = parseFloat(costGrout) || 0;
    const backerP = parseFloat(costBackerboard) || 0;
    const labor = parseFloat(laborPerSqFt) || 0;

    const tilesCost = results.totalBoxes * boxP;
    const thinsetCost = results.thinsetBags * thinsetP;
    // Assuming grout comes in 10lb bags for the cost input context
    const groutBags = Math.ceil(results.groutPounds / 10);
    const groutCost = groutBags * groutP;
    const backerCost = results.backerboardSheets * backerP;
    
    const materialsTotal = tilesCost + thinsetCost + groutCost + backerCost;
    const laborTotal = results.grossAreaSqFt * labor;

    return {
      materialsTotal,
      laborTotal,
      grandTotal: materialsTotal + laborTotal
    };
  }, [results, costPerBox, costThinset, costGrout, costBackerboard, laborPerSqFt]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  const lengthLabel = unit === 'imperial' ? 'ft' : 'm';
  const tileLabel = unit === 'imperial' ? 'in' : 'cm';
  const areaLabel = unit === 'imperial' ? 'sq ft' : 'sq m';

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <div className="space-y-3">
              <Label>Layout Pattern</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={pattern}
                onChange={(e) => setPattern(e.target.value as TilePattern)}
              >
                <option value="straight">Straight / Grid (10% Waste)</option>
                <option value="brick">Staggered / Brick (10% Waste)</option>
                <option value="diagonal">Diagonal (15% Waste)</option>
                <option value="herringbone">Herringbone (20% Waste)</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Tile Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Length</Label>
                <NumberInput value={tileLength} onChange={(e) => setTileLength(e.target.value)} min="0" placeholder="12" suffixNode={<span>{tileLabel}</span>} />
              </div>
              <div className="space-y-2">
                <Label>Width</Label>
                <NumberInput value={tileWidth} onChange={(e) => setTileWidth(e.target.value)} min="0" placeholder="12" suffixNode={<span>{tileLabel}</span>} />
              </div>
              <div className="space-y-2">
                <Label>Thickness</Label>
                <NumberInput value={tileThickness} onChange={(e) => setTileThickness(e.target.value)} min="0" placeholder="0.375" suffixNode={<span>{unit === 'imperial' ? 'in' : 'mm'}</span>} />
              </div>
              <div className="space-y-2">
                <Label>Joint Size</Label>
                <NumberInput value={jointWidth} onChange={(e) => setJointWidth(e.target.value)} min="0" placeholder="0.125" suffixNode={<span>{unit === 'imperial' ? 'in' : 'mm'}</span>} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <Label>Tiles per Box</Label>
                <NumberInput value={boxQuantity} onChange={(e) => setBoxQuantity(e.target.value)} min="1" step="1" />
              </div>
              <div className="space-y-2">
                <Label>Custom Waste % (Optional)</Label>
                <NumberInput value={customWaste} onChange={(e) => setCustomWaste(e.target.value)} min="0" placeholder={`Auto: ${results ? results.recommendedWastePercent : 10}%`} suffixNode={<span>%</span>} />
              </div>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Project Areas</h3>
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
                    <NumberInput value={area.length} onChange={(e) => updateArea(area.id, 'length', e.target.value)} min="0" placeholder="e.g. 15" suffixNode={<span>{lengthLabel}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={area.width} onChange={(e) => updateArea(area.id, 'width', e.target.value)} min="0" placeholder="e.g. 12" suffixNode={<span>{lengthLabel}</span>} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Deductions (Tubs, Islands, Voids)</h3>
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
              id="useBackerboard"
              checked={useBackerboard} 
              onChange={(e) => setUseBackerboard(e.target.checked)}
              className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="useBackerboard" className="text-sm font-medium text-indigo-900 dark:text-indigo-200 cursor-pointer">
              Include Cement Backerboard / Underlayment sheets
            </label>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost per Box</Label>
                <NumberInput value={costPerBox} onChange={(e) => setCostPerBox(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Thinset (50lb bag)</Label>
                <NumberInput value={costThinset} onChange={(e) => setCostThinset(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Grout (10lb bag)</Label>
                <NumberInput value={costGrout} onChange={(e) => setCostGrout(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              {useBackerboard && (
                <div className="space-y-2">
                  <Label>Backerboard (3x5 Sheet)</Label>
                  <NumberInput value={costBackerboard} onChange={(e) => setCostBackerboard(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Labor / Sq Ft</Label>
                <NumberInput value={laborPerSqFt} onChange={(e) => setLaborPerSqFt(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <ResultDisplay 
              label="Total Boxes Required"
              value={!results ? '--' : results.totalBoxes}
              subValue={`${!results ? '--' : results.totalTiles} Individual Tiles`}
              className="mb-6 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/30 dark:to-cyan-950/30 border-indigo-100 dark:border-indigo-900 shadow-sm transition-transform duration-300 hover:scale-[1.01]"
            />
            
            <div className="space-y-2 px-1 relative z-10">
              <SecondaryResultDisplay label="Thinset Mortar" value={!results ? '--' : `${results.thinsetBags} Bags (50lb)`} />
              <SecondaryResultDisplay label="Tile Grout" value={!results ? '--' : `${results.groutPounds} lbs`} />
              {useBackerboard && (
                <SecondaryResultDisplay label="Backerboard" value={!results ? '--' : `${results.backerboardSheets} Sheets (3x5')`} valueClassName="text-indigo-600 dark:text-indigo-400 font-medium" />
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Project Area Details</h3>
            <div className="space-y-3">
              <SecondaryResultDisplay 
                label="Net Install Area" 
                value={!results ? '--' : `${formatUnit(results.netAreaSqFt)} ${areaLabel}`} 
              />
              <SecondaryResultDisplay 
                label="Gross Area (incl. Waste)" 
                value={!results ? '--' : `${formatUnit(results.grossAreaSqFt)} ${areaLabel}`} 
              />
              <SecondaryResultDisplay 
                label="Applied Waste Factor" 
                value={!results ? '--' : `${customWaste !== '' ? customWaste : results.recommendedWastePercent}%`} 
              />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Professional Cost Estimate</h3>
            <div className="space-y-3">
              <SecondaryResultDisplay 
                label="Materials Total" 
                value={!costValues ? '--' : `$${formatUnit(costValues.materialsTotal)}`} 
              />
              <SecondaryResultDisplay 
                label="Estimated Labor" 
                value={!costValues ? '--' : `$${formatUnit(costValues.laborTotal)}`} 
              />
              <div className="pt-3 mt-3 border-t border-border">
                <SecondaryResultDisplay 
                  label="Total Project Cost" 
                  value={!costValues ? '--' : `$${formatUnit(costValues.grandTotal)}`} 
                  valueClassName="text-indigo-600 dark:text-indigo-400 font-bold text-lg"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

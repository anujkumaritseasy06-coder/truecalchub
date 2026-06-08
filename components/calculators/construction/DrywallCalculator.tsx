"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateDrywall, 
  UnitSystem, 
  SheetSize, 
  RoomDimensions, 
  Exclusions 
} from '@/lib/calculators/drywall';
import { Plus, Trash2 } from 'lucide-react';

interface RoomState {
  id: string;
  length: string;
  width: string;
  height: string;
  includeCeiling: boolean;
}

export function DrywallCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [sheetSize, setSheetSize] = useState<SheetSize>('4x8');
  const [wasteFactor, setWasteFactor] = useState<number>(10);

  // Rooms
  const [rooms, setRooms] = useState<RoomState[]>([
    { id: '1', length: '', width: '', height: '', includeCeiling: true }
  ]);

  // Exclusions & Advanced
  const [doors, setDoors] = useState<string>('');
  const [doorWidth, setDoorWidth] = useState<string>('');
  const [doorHeight, setDoorHeight] = useState<string>('');
  
  const [windows, setWindows] = useState<string>('');
  const [windowWidth, setWindowWidth] = useState<string>('');
  const [windowHeight, setWindowHeight] = useState<string>('');
  
  const [customSqFt, setCustomSqFt] = useState<string>('');
  const [outsideCorners, setOutsideCorners] = useState<string>('');

  // Costs
  const [costPerSheet, setCostPerSheet] = useState<string>('');
  const [costPerMud, setCostPerMud] = useState<string>(''); // tub
  const [costPerTape, setCostPerTape] = useState<string>(''); // roll
  const [costPerScrews, setCostPerScrews] = useState<string>(''); // box
  const [laborPerHour, setLaborPerHour] = useState<string>('');

  const addRoom = () => {
    setRooms([...rooms, { id: Date.now().toString(), length: '', width: '', height: '', includeCeiling: true }]);
  };

  const removeRoom = (id: string) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const updateRoom = (id: string, field: keyof RoomState, value: string | boolean) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const { results, error } = useMemo(() => {
    let valid = true;
    
    const parsedRooms: RoomDimensions[] = rooms.map(r => {
      const l = parseFloat(r.length);
      const w = parseFloat(r.width);
      const h = parseFloat(r.height);
      if (isNaN(l) || isNaN(w) || isNaN(h) || l < 0 || w < 0 || h < 0) {
        valid = false;
      }
      return { length: l || 0, width: w || 0, height: h || 0, includeCeiling: r.includeCeiling };
    });

    if (!valid) {
      return { results: null, error: 'Please enter valid positive dimensions for all rooms.' };
    }

    const parsedExclusions: Exclusions = {
      doors: parseInt(doors) || 0,
      doorWidth: parseFloat(doorWidth) || 0,
      doorHeight: parseFloat(doorHeight) || 0,
      windows: parseInt(windows) || 0,
      windowWidth: parseFloat(windowWidth) || 0,
      windowHeight: parseFloat(windowHeight) || 0,
      customSqFt: parseFloat(customSqFt) || 0,
      outsideCorners: parseInt(outsideCorners) || 0
    };

    const outputs = calculateDrywall(parsedRooms, parsedExclusions, sheetSize, wasteFactor, unit);

    return { results: outputs, error: null };
  }, [rooms, doors, doorWidth, doorHeight, windows, windowWidth, windowHeight, customSqFt, outsideCorners, sheetSize, wasteFactor, unit]);

  const costValues = useMemo(() => {
    if (!results) return null;
    const sheetCost = parseFloat(costPerSheet) || 0;
    const mudCost = parseFloat(costPerMud) || 0;
    const tapeCost = parseFloat(costPerTape) || 0;
    const screwCost = parseFloat(costPerScrews) || 0;
    const labor = parseFloat(laborPerHour) || 0;

    // Approximate quantity conversions
    // Mud: ~60 lbs per 5-gal tub
    const tubsOfMud = Math.ceil(results.jointCompoundLbs / 60);
    // Tape: ~250 ft per roll
    const rollsOfTape = Math.ceil(results.jointTapeFeet / 250);
    // Screws: ~1 lb box has ~300 screws, let's say 5lb box has ~1500 screws. We'll assume user prices per 1 lb box (approx 300 screws)
    const boxesOfScrews = Math.ceil(results.screwsNeeded / 300);
    
    // Labor: rough estimate, 1 hr to hang and 1.5 hr to finish per 3 sheets (2.5 hours per 3 sheets = ~0.83 hrs per sheet)
    const estimatedHours = results.sheetsRequired * 0.83;

    const materialsTotal = (results.sheetsRequired * sheetCost) + 
                           (tubsOfMud * mudCost) + 
                           (rollsOfTape * tapeCost) + 
                           (boxesOfScrews * screwCost);

    const laborTotal = estimatedHours * labor;

    return {
      materialsTotal,
      laborTotal,
      grandTotal: materialsTotal + laborTotal,
      tubsOfMud,
      rollsOfTape,
      boxesOfScrews,
      estimatedHours
    };
  }, [results, costPerSheet, costPerMud, costPerTape, costPerScrews, laborPerHour]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

  const unitLabel = unit === 'imperial' ? 'ft' : 'm';
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
              <Label>Drywall Sheet Size</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={sheetSize}
                onChange={(e) => setSheetSize(e.target.value as SheetSize)}
              >
                <option value="4x8">4' x 8' (Standard)</option>
                <option value="4x10">4' x 10'</option>
                <option value="4x12">4' x 12' (Commercial)</option>
                <option value="4x14">4' x 14'</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Room Dimensions</h3>
              <button 
                onClick={addRoom}
                className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors"
              >
                <Plus size={16} /> Add Room
              </button>
            </div>

            {rooms.map((room, index) => (
              <div key={room.id} className="p-4 bg-background rounded-lg border border-border relative space-y-4">
                {rooms.length > 1 && (
                  <button 
                    onClick={() => removeRoom(room.id)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
                    title="Remove Room"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <h4 className="text-sm font-medium text-secondary-500">Room {index + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <NumberInput value={room.length} onChange={(e) => updateRoom(room.id, 'length', e.target.value)} min="0" placeholder="e.g. 12" suffixNode={<span>{unitLabel}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={room.width} onChange={(e) => updateRoom(room.id, 'width', e.target.value)} min="0" placeholder="e.g. 10" suffixNode={<span>{unitLabel}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <NumberInput value={room.height} onChange={(e) => updateRoom(room.id, 'height', e.target.value)} min="0" placeholder="e.g. 8" suffixNode={<span>{unitLabel}</span>} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id={`ceiling-${room.id}`}
                    checked={room.includeCeiling} 
                    onChange={(e) => updateRoom(room.id, 'includeCeiling', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor={`ceiling-${room.id}`} className="text-sm text-foreground cursor-pointer">
                    Include ceiling in calculation
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Deductions & Details (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="space-y-2">
                <Label>Number of Doors</Label>
                <NumberInput value={doors} onChange={(e) => setDoors(e.target.value)} min="0" step="1" />
              </div>
              <div className="space-y-2">
                <Label>Number of Windows</Label>
                <NumberInput value={windows} onChange={(e) => setWindows(e.target.value)} min="0" step="1" />
              </div>
              <div className="space-y-2">
                <Label>Outside Corners</Label>
                <NumberInput value={outsideCorners} onChange={(e) => setOutsideCorners(e.target.value)} min="0" step="1" placeholder="For corner bead" />
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Waste Allowance</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={wasteFactor}
                onChange={(e) => setWasteFactor(Number(e.target.value))}
              >
                <option value={5}>5% (Expert)</option>
                <option value={10}>10% (Recommended)</option>
                <option value={15}>15% (Complex Cuts)</option>
                <option value={20}>20%</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Cost / Sheet</Label>
                <NumberInput value={costPerSheet} onChange={(e) => setCostPerSheet(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Cost / Tub of Mud</Label>
                <NumberInput value={costPerMud} onChange={(e) => setCostPerMud(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Cost / Tape Roll</Label>
                <NumberInput value={costPerTape} onChange={(e) => setCostPerTape(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Labor / Hour</Label>
                <NumberInput value={laborPerHour} onChange={(e) => setLaborPerHour(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <ResultDisplay 
              label={`Drywall Sheets Required (${sheetSize})`}
              value={!results || results.sheetsRequired === 0 ? '--' : results.sheetsRequired}
              subValue="Total Sheets"
              className="mb-6 bg-gradient-to-br from-indigo-50 to-primary-50 dark:from-indigo-950/30 dark:to-primary-950/30 border-indigo-100 dark:border-indigo-900 shadow-sm transition-transform duration-300 hover:scale-[1.01]"
            />
            
            <div className="space-y-2 px-1 relative z-10">
              <SecondaryResultDisplay label="Net Area (Excl. Deductions)" value={!results ? '--' : `${formatUnit(results.netArea)} ${areaLabel}`} />
              <SecondaryResultDisplay label="Total Area (+ Waste)" value={!results ? '--' : `${formatUnit(results.totalAreaWithWaste)} ${areaLabel}`} />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Material Checklist</h3>
            <div className="space-y-3">
              <SecondaryResultDisplay 
                label="Screws / Fasteners" 
                value={!results ? '--' : `${formatUnit(results.screwsNeeded, 0)} pcs`} 
                valueClassName="text-foreground"
              />
              <SecondaryResultDisplay 
                label="Joint Tape (approx.)" 
                value={!results ? '--' : `${formatUnit(results.jointTapeFeet, 0)} ft`} 
              />
              <SecondaryResultDisplay 
                label="Joint Compound (Mud)" 
                value={!results ? '--' : `${formatUnit(results.jointCompoundLbs, 0)} lbs`} 
              />
              <SecondaryResultDisplay 
                label="Corner Beads" 
                value={!results ? '--' : `${results.cornerBeadsNeeded}`} 
              />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Project Cost Estimate</h3>
            <div className="space-y-3">
              <SecondaryResultDisplay 
                label="Materials Total" 
                value={!costValues ? '--' : `$${formatUnit(costValues.materialsTotal)}`} 
              />
              <SecondaryResultDisplay 
                label={`Estimated Labor (${!costValues ? '--' : formatUnit(costValues.estimatedHours, 1)} hrs)`} 
                value={!costValues ? '--' : `$${formatUnit(costValues.laborTotal)}`} 
              />
              <div className="pt-3 mt-3 border-t border-border">
                <SecondaryResultDisplay 
                  label="Total Project Cost" 
                  value={!costValues ? '--' : `$${formatUnit(costValues.grandTotal)}`} 
                  valueClassName="text-primary-600 dark:text-primary-400 font-bold text-lg"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

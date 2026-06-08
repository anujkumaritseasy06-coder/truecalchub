"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculatePaint, 
  UnitSystem, 
  SurfaceTexture, 
  ProjectMode,
  RoomDimensions, 
  Exclusions 
} from '@/lib/calculators/paint';
import { Plus, Trash2 } from 'lucide-react';

interface RoomState {
  id: string;
  length: string;
  width: string;
  height: string;
  paintCeiling: boolean;
  paintTrim: boolean;
}

export function PaintCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [mode, setMode] = useState<ProjectMode>('interior');
  const [texture, setTexture] = useState<SurfaceTexture>('smooth');
  const [coats, setCoats] = useState<number>(2);
  const [usePrimer, setUsePrimer] = useState<boolean>(true);
  const [wasteFactor, setWasteFactor] = useState<number>(10);

  // Rooms
  const [rooms, setRooms] = useState<RoomState[]>([
    { id: '1', length: '', width: '', height: '', paintCeiling: true, paintTrim: true }
  ]);

  // Exclusions
  const [doors, setDoors] = useState<string>('');
  const [doorWidth, setDoorWidth] = useState<string>('');
  const [doorHeight, setDoorHeight] = useState<string>('');
  
  const [windows, setWindows] = useState<string>('');
  const [windowWidth, setWindowWidth] = useState<string>('');
  const [windowHeight, setWindowHeight] = useState<string>('');

  // Costs
  const [costWallPaint, setCostWallPaint] = useState<string>('');
  const [costCeilingPaint, setCostCeilingPaint] = useState<string>('');
  const [costTrimPaint, setCostTrimPaint] = useState<string>('');
  const [costPrimer, setCostPrimer] = useState<string>('');
  const [costTape, setCostTape] = useState<string>(''); // per roll
  const [laborPerHour, setLaborPerHour] = useState<string>('');

  const addRoom = () => {
    setRooms([...rooms, { id: Date.now().toString(), length: '', width: '', height: '', paintCeiling: true, paintTrim: true }]);
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
    let hasRoomData = false;
    
    const parsedRooms: RoomDimensions[] = rooms.map(r => {
      const l = parseFloat(r.length);
      const w = parseFloat(r.width);
      const h = parseFloat(r.height);
      if (r.length || r.width || r.height) hasRoomData = true;
      if (r.length && r.width && r.height && (isNaN(l) || isNaN(w) || isNaN(h) || l < 0 || w < 0 || h < 0)) {
        valid = false;
      }
      return { length: l || 0, width: w || 0, height: h || 0, paintCeiling: r.paintCeiling, paintTrim: r.paintTrim };
    });

    if (!valid) {
      return { results: null, error: 'Please enter valid positive dimensions for all rooms.' };
    }
    if (!hasRoomData) {
      return { results: null, error: null };
    }

    const parsedExclusions: Exclusions = {
      doors: parseInt(doors) || 0,
      doorWidth: parseFloat(doorWidth) || 0,
      doorHeight: parseFloat(doorHeight) || 0,
      windows: parseInt(windows) || 0,
      windowWidth: parseFloat(windowWidth) || 0,
      windowHeight: parseFloat(windowHeight) || 0,
    };

    const outputs = calculatePaint(parsedRooms, parsedExclusions, { mode, texture, coats, usePrimer, wasteFactor }, unit);

    return { results: outputs, error: null };
  }, [rooms, doors, doorWidth, doorHeight, windows, windowWidth, windowHeight, mode, texture, coats, usePrimer, wasteFactor, unit]);

  const costValues = useMemo(() => {
    if (!results) return null;
    const wallP = parseFloat(costWallPaint) || 0;
    const ceilP = parseFloat(costCeilingPaint) || 0;
    const trimP = parseFloat(costTrimPaint) || 0;
    const primP = parseFloat(costPrimer) || 0;
    const tapeP = parseFloat(costTape) || 0;
    const labor = parseFloat(laborPerHour) || 0;

    const materialsTotal = (results.wallPaintGallons * wallP) + 
                           (results.ceilingPaintGallons * ceilP) + 
                           (results.trimPaintGallons * trimP) + 
                           (results.primerGallons * primP) +
                           (results.tapeRolls * tapeP);

    // Rough labor estimate: ~1 hour per 100 sq ft for prep and 1 coat. Multiply by coats.
    // Let's combine net wall and ceiling areas for labor
    let sqFtFactor = unit === 'metric' ? 10.7639 : 1;
    const totalSqFt = (results.netWallArea + results.netCeilingArea) * sqFtFactor;
    
    // Prep time: ~1 hr per 150 sq ft
    const prepHours = totalSqFt / 150;
    // Paint time: ~1 hr per 200 sq ft per coat
    const paintHours = (totalSqFt / 200) * coats;
    // Primer time: ~1 hr per 250 sq ft
    const primerHours = usePrimer ? (totalSqFt / 250) : 0;
    // Trim time: ~1 hr per 50 linear feet
    const trimHours = results.trimPaintGallons > 0 ? (results.trimLinearLength * (unit === 'metric' ? 3.28 : 1) / 50) : 0;

    const estimatedHours = prepHours + paintHours + primerHours + trimHours;
    const laborTotal = estimatedHours * labor;

    return {
      materialsTotal,
      laborTotal,
      grandTotal: materialsTotal + laborTotal,
      estimatedHours
    };
  }, [results, costWallPaint, costCeilingPaint, costTrimPaint, costPrimer, costTape, laborPerHour, coats, usePrimer, unit]);

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
              <Label>Project Scope</Label>
              <div className="flex bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1">
                <button
                  onClick={() => setMode('interior')}
                  className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${mode === 'interior' ? 'bg-white dark:bg-secondary-800 shadow-sm text-foreground' : 'text-secondary-500 hover:text-foreground'}`}
                >
                  Interior
                </button>
                <button
                  onClick={() => setMode('exterior')}
                  className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${mode === 'exterior' ? 'bg-white dark:bg-secondary-800 shadow-sm text-foreground' : 'text-secondary-500 hover:text-foreground'}`}
                >
                  Exterior
                </button>
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Surface Texture</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={texture}
                onChange={(e) => setTexture(e.target.value as SurfaceTexture)}
              >
                <option value="smooth">Smooth Drywall / Siding</option>
                <option value="light_texture">Light Texture (Orange Peel)</option>
                <option value="heavy_stucco">Heavy Stucco / Knockdown</option>
                <option value="bare_brick">Bare Brick / Masonry</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Number of Finish Coats</Label>
              <NumberInput value={coats.toString()} onChange={(e) => setCoats(parseInt(e.target.value) || 1)} min="1" max="5" step="1" />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
            <input 
              type="checkbox" 
              id="usePrimer"
              checked={usePrimer} 
              onChange={(e) => setUsePrimer(e.target.checked)}
              className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="usePrimer" className="text-sm font-medium text-indigo-900 dark:text-indigo-200 cursor-pointer">
              Apply Primer Coat (Recommended for new drywall or severe color changes)
            </label>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">{mode === 'interior' ? 'Room Dimensions' : 'Exterior Wall Dimensions'}</h3>
              <button 
                onClick={addRoom}
                className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors"
              >
                <Plus size={16} /> Add Area
              </button>
            </div>

            {rooms.map((room, index) => (
              <div key={room.id} className="p-4 bg-background rounded-lg border border-border relative space-y-4">
                {rooms.length > 1 && (
                  <button 
                    onClick={() => removeRoom(room.id)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
                    title="Remove Area"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <h4 className="text-sm font-medium text-secondary-500">Area {index + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <NumberInput value={room.length} onChange={(e) => updateRoom(room.id, 'length', e.target.value)} min="0" placeholder="e.g. 15" suffixNode={<span>{unitLabel}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <NumberInput value={room.width} onChange={(e) => updateRoom(room.id, 'width', e.target.value)} min="0" placeholder="e.g. 12" suffixNode={<span>{unitLabel}</span>} />
                  </div>
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <NumberInput value={room.height} onChange={(e) => updateRoom(room.id, 'height', e.target.value)} min="0" placeholder="e.g. 8" suffixNode={<span>{unitLabel}</span>} />
                  </div>
                </div>
                
                {mode === 'interior' && (
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`ceiling-${room.id}`}
                        checked={room.paintCeiling} 
                        onChange={(e) => updateRoom(room.id, 'paintCeiling', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={`ceiling-${room.id}`} className="text-sm text-foreground cursor-pointer">
                        Paint Ceiling
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`trim-${room.id}`}
                        checked={room.paintTrim} 
                        onChange={(e) => updateRoom(room.id, 'paintTrim', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={`trim-${room.id}`} className="text-sm text-foreground cursor-pointer">
                        Paint Baseboard/Trim
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Deductions (Doors & Windows)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Number of Doors</Label>
                <NumberInput value={doors} onChange={(e) => setDoors(e.target.value)} min="0" step="1" />
              </div>
              <div className="space-y-2">
                <Label>Number of Windows</Label>
                <NumberInput value={windows} onChange={(e) => setWindows(e.target.value)} min="0" step="1" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Wall Paint / Gal</Label>
                <NumberInput value={costWallPaint} onChange={(e) => setCostWallPaint(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              {mode === 'interior' && (
                <div className="space-y-2">
                  <Label>Ceiling Paint / Gal</Label>
                  <NumberInput value={costCeilingPaint} onChange={(e) => setCostCeilingPaint(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
              )}
              {usePrimer && (
                <div className="space-y-2">
                  <Label>Primer / Gal</Label>
                  <NumberInput value={costPrimer} onChange={(e) => setCostPrimer(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
              )}
              {mode === 'interior' && (
                <div className="space-y-2">
                  <Label>Trim Paint / Gal</Label>
                  <NumberInput value={costTrimPaint} onChange={(e) => setCostTrimPaint(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Tape Roll</Label>
                <NumberInput value={costTape} onChange={(e) => setCostTape(e.target.value)} min="0" prefixNode={<span>$</span>} />
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
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <ResultDisplay 
              label="Total Paint Required"
              value={!results ? '--' : (results.wallPaintGallons + results.ceilingPaintGallons + results.trimPaintGallons)}
              subValue="Gallons (Finish Coats)"
              className="mb-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-100 dark:border-rose-900 shadow-sm transition-transform duration-300 hover:scale-[1.01]"
            />
            
            <div className="space-y-2 px-1 relative z-10">
              <SecondaryResultDisplay label="Wall Paint" value={!results ? '--' : `${results.wallPaintGallons} Gallons`} />
              {mode === 'interior' && (
                <SecondaryResultDisplay label="Ceiling Paint" value={!results ? '--' : `${results.ceilingPaintGallons} Gallons`} />
              )}
              {mode === 'interior' && (
                <SecondaryResultDisplay label="Trim Paint" value={!results ? '--' : `${results.trimPaintGallons} Gallons`} />
              )}
              {usePrimer && (
                <SecondaryResultDisplay label="Primer (1 Coat)" value={!results ? '--' : `${results.primerGallons} Gallons`} valueClassName="text-indigo-600 dark:text-indigo-400 font-medium" />
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Project Details</h3>
            <div className="space-y-3">
              <SecondaryResultDisplay 
                label="Net Wall Area" 
                value={!results ? '--' : `${formatUnit(results.netWallArea)} ${areaLabel}`} 
              />
              {mode === 'interior' && (
                <SecondaryResultDisplay 
                  label="Net Ceiling Area" 
                  value={!results ? '--' : `${formatUnit(results.netCeilingArea)} ${areaLabel}`} 
                />
              )}
              <SecondaryResultDisplay 
                label="Painter's Tape (Approx)" 
                value={!results ? '--' : `${results.tapeRolls} Rolls`} 
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
                label={`Estimated Labor (${!costValues ? '--' : formatUnit(costValues.estimatedHours, 1)} hrs)`} 
                value={!costValues ? '--' : `$${formatUnit(costValues.laborTotal)}`} 
              />
              <div className="pt-3 mt-3 border-t border-border">
                <SecondaryResultDisplay 
                  label="Total Project Cost" 
                  value={!costValues ? '--' : `$${formatUnit(costValues.grandTotal)}`} 
                  valueClassName="text-rose-600 dark:text-rose-400 font-bold text-lg"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

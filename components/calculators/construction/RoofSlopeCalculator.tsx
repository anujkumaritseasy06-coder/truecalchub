"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  RoofPitchInputMode,
  calculateRoofPitch
} from '@/lib/calculators/roof-pitch';

export function RoofSlopeCalculator() {
  const [mode, setMode] = useState<RoofPitchInputMode>('rise-run');
  
  const [rise, setRise] = useState<string>('');
  const [run, setRun] = useState<string>('');
  const [angle, setAngle] = useState<string>('');
  const [pitchX, setPitchX] = useState<string>('');

  // Level 3 Upgrades
  const [buildingSpan, setBuildingSpan] = useState<string>('');
  const [overhang, setOverhang] = useState<string>('');

  const { results, error } = useMemo(() => {
    const r = parseFloat(rise);
    const ru = parseFloat(run);
    const ang = parseFloat(angle);
    const pX = parseFloat(pitchX);
    const spanFt = parseFloat(buildingSpan);
    const ohInches = parseFloat(overhang);

    if (mode === 'rise-run' && (isNaN(r) || isNaN(ru) || ru <= 0)) {
      return { results: null, error: 'Please enter a valid rise and positive run.' };
    }
    if (mode === 'angle' && (isNaN(ang) || ang < 0 || ang >= 90)) {
      return { results: null, error: 'Please enter a valid angle between 0 and 89 degrees.' };
    }
    if (mode === 'pitch' && (isNaN(pX) || pX < 0)) {
      return { results: null, error: 'Please enter a valid positive pitch.' };
    }

    const outputs = calculateRoofPitch(
      mode, 
      r, 
      ru, 
      ang, 
      pX, 
      isNaN(spanFt) ? null : spanFt, 
      isNaN(ohInches) ? 0 : ohInches
    );
    return { results: outputs, error: null };
  }, [mode, rise, run, angle, pitchX, buildingSpan, overhang]);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="space-y-3">
            <Label>Calculation Mode</Label>
            <div className="flex bg-secondary-100 dark:bg-secondary-800/50 p-1 rounded-lg">
              <button
                className={`flex-1 text-sm py-2 px-3 rounded-md transition-all font-medium ${mode === 'rise-run' ? 'bg-white dark:bg-secondary-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'}`}
                onClick={() => setMode('rise-run')}
              >
                Rise / Run
              </button>
              <button
                className={`flex-1 text-sm py-2 px-3 rounded-md transition-all font-medium ${mode === 'angle' ? 'bg-white dark:bg-secondary-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'}`}
                onClick={() => setMode('angle')}
              >
                Degrees
              </button>
              <button
                className={`flex-1 text-sm py-2 px-3 rounded-md transition-all font-medium ${mode === 'pitch' ? 'bg-white dark:bg-secondary-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'}`}
                onClick={() => setMode('pitch')}
              >
                Known Pitch
              </button>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Roof Dimensions</h3>
            
            {mode === 'rise-run' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rise</Label>
                  <NumberInput value={rise} onChange={(e) => setRise(e.target.value)} min="0" placeholder="e.g. 6" suffixNode={<span>in</span>} />
                  <p className="text-xs text-secondary-500">Vertical height</p>
                </div>
                <div className="space-y-2">
                  <Label>Run</Label>
                  <NumberInput value={run} onChange={(e) => setRun(e.target.value)} min="1" placeholder="e.g. 12" suffixNode={<span>in</span>} />
                  <p className="text-xs text-secondary-500">Horizontal depth</p>
                </div>
              </div>
            )}

            {mode === 'angle' && (
              <div className="space-y-2">
                <Label>Roof Angle (Degrees)</Label>
                <NumberInput value={angle} onChange={(e) => setAngle(e.target.value)} min="0" max="89" placeholder="e.g. 26.5" suffixNode={<span>deg</span>} />
                <p className="text-xs text-secondary-500">The geometric angle of the roof slope.</p>
              </div>
            )}

            {mode === 'pitch' && (
              <div className="space-y-2">
                <Label>Standard Roof Pitch (X / 12)</Label>
                <NumberInput value={pitchX} onChange={(e) => setPitchX(e.target.value)} min="0" placeholder="e.g. 6" suffixNode={<span>/ 12</span>} />
                <p className="text-xs text-secondary-500">How many inches the roof rises for every 12 inches it runs.</p>
              </div>
            )}
            
            <div className="pt-6 border-t border-border mt-6">
              <h3 className="font-semibold text-foreground mb-4">Optional: Framing Geometry</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Building Span</Label>
                  <NumberInput value={buildingSpan} onChange={(e) => setBuildingSpan(e.target.value)} min="0" placeholder="e.g. 24" suffixNode={<span>ft</span>} />
                  <p className="text-xs text-secondary-500">Outer wall to outer wall width.</p>
                </div>
                <div className="space-y-2">
                  <Label>Eave Overhang</Label>
                  <NumberInput value={overhang} onChange={(e) => setOverhang(e.target.value)} min="0" placeholder="e.g. 18" suffixNode={<span>in</span>} />
                  <p className="text-xs text-secondary-500">Horizontal eave extension.</p>
                </div>
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Slope Characteristics</h3>
              {results && (
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  results.roofCategory === 'Steep Slope' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800' :
                  results.roofCategory === 'Low Slope' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                  results.roofCategory === 'Flat' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' :
                  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                }`}>
                  {results.roofCategory}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-900/80 dark:to-primary-800/80 p-6 rounded-xl border border-primary-500/30 shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-xs text-primary-100 uppercase tracking-wider mb-2 font-bold">Slope Percentage</p>
                <div className="flex items-end space-x-1">
                   <p className="text-5xl font-bold text-white tracking-tight">
                     {!results ? '0' : results.slopePercentage}
                   </p>
                   <p className="text-2xl font-medium text-primary-200 mb-1">
                     %
                   </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-sky-600 to-sky-700 dark:from-sky-900/80 dark:to-sky-800/80 p-6 rounded-xl border border-sky-500/30 shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-xs text-sky-100 uppercase tracking-wider mb-2 font-bold">Roof Angle</p>
                <div className="flex items-end space-x-1">
                   <p className="text-5xl font-bold text-white tracking-tight">
                     {!results ? '0' : results.angleDegrees}
                   </p>
                   <p className="text-2xl font-medium text-sky-200 mb-1">
                     °
                   </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ResultDisplay 
                label="Ratio (Rise:Run)"
                value={!results ? '--' : `1 : ${(12 / results.pitchX).toFixed(2)}`}
                className="bg-background border border-border shadow-sm p-4"
                valueClassName="text-2xl lg:text-3xl"
              />
              <ResultDisplay 
                label="Standard Pitch"
                value={!results ? '--' : `${results.pitchX} / 12`}
                className="bg-background border border-border shadow-sm p-4"
                valueClassName="text-2xl lg:text-3xl"
              />
            </div>
            
            <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-border">
              <h4 className="text-sm font-bold text-foreground mb-2">Calculating Surface Area Multiplier</h4>
              <p className="text-xs text-secondary-600 dark:text-secondary-400 leading-relaxed mb-3">
                To find the true surface area of your roof, multiply the flat architectural footprint area by the slope multiplier: <strong>{!results ? '--' : results.pitchMultiplier}x</strong>.
              </p>
              <SecondaryResultDisplay 
                  label="Area Multiplier" 
                  value={!results ? '--' : `${results.pitchMultiplier}x`} 
                  valueClassName="text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>
          
          {/* V2: Structural Carpentry Details */}
          {results && results.rafterLengthFt !== null && (
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">Structural Framing Output</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <SecondaryResultDisplay 
                  label="Common Rafter Length (Hypotenuse)" 
                  value={`${results.rafterLengthFt} ft`} 
                />
                <SecondaryResultDisplay 
                  label="Attic Peak Height (Ridge Board)" 
                  value={`${results.peakHeightFt} ft`} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Top Plumb Cut</h4>
                  <p className="text-2xl font-bold text-foreground">{results.plumbCutAngle}°</p>
                  <p className="text-xs text-secondary-500 mt-1">Angle against the ridge board</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Bottom Level Cut</h4>
                  <p className="text-2xl font-bold text-foreground">{results.levelCutAngle}°</p>
                  <p className="text-xs text-secondary-500 mt-1">Birdsmouth seat angle on wall plate</p>
                </div>
              </div>
              
              {results.eaveDropInches !== null && results.eaveDropInches > 0 && (
                 <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-sm font-medium text-secondary-600">Eave Vertical Drop:</span>
                    <span className="text-sm font-bold text-foreground">{results.eaveDropInches} inches</span>
                 </div>
              )}
            </div>
          )}

        </div>
      </div>
    </CalculatorWrapper>
  );
}

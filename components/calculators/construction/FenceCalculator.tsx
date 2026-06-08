"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  FenceUnit, 
  FenceMaterialType,
  calculateFence 
} from '@/lib/calculators/fence';

export function FenceCalculator() {
  const [unit, setUnit] = useState<FenceUnit>('feet');
  const [materialType, setMaterialType] = useState<FenceMaterialType>('wood');

  // Core Inputs
  const [length, setLength] = useState<string>('');
  const [gates, setGates] = useState<string>('');

  // Structural Choices
  const [spacing, setSpacing] = useState<number>(8);
  const [holeDepth, setHoleDepth] = useState<number>(24);
  const [wastePct, setWastePct] = useState<number>(10);

  // Material-Specific Choices (Wood / Split-Rail)
  const [rails, setRails] = useState<number>(3); 
  const [picketWidth, setPicketWidth] = useState<number>(5.5); 

  // Cost Inputs
  const [costPerPost, setCostPerPost] = useState<string>(''); 
  const [costPerPrimary, setCostPerPrimary] = useState<string>(''); // Picket, Panel, or Mesh
  const [costPerRail, setCostPerRail] = useState<string>(''); 
  const [costPerConcrete, setCostPerConcrete] = useState<string>(''); 

  const { results, error, formulaDesc } = useMemo(() => {
    const l = parseFloat(length);
    const g = parseInt(gates, 10);

    if (isNaN(l) || l <= 0) {
      return { results: null, error: 'Please enter a valid positive length.', formulaDesc: '' };
    }
    
    const safeGates = isNaN(g) || g < 0 ? 0 : g;

    if (l > 5000) {
      return { results: null, error: 'Values exceed limits for a standard fence run (5,000 max).', formulaDesc: '' };
    }

    const outputs = calculateFence(l, unit, materialType, spacing, holeDepth, rails, picketWidth, safeGates, wastePct);

    let formulaStr = `Posts = ⌈Length ÷ Spacing⌉ + 1 Terminal + Gates`;
    if (materialType === 'wood') formulaStr += ` | Pickets = (Length × 12) ÷ Picket Width`;
    if (materialType === 'vinyl') formulaStr += ` | Vinyl Panels = Total Sections`;
    if (materialType === 'chain-link') formulaStr += ` | Mesh = Length ÷ 50ft Rolls`;

    return { results: outputs, error: null, formulaDesc: formulaStr };
  }, [unit, length, gates, materialType, spacing, holeDepth, rails, picketWidth, wastePct]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const postCost = parseFloat(costPerPost) || 0;
    const primaryCost = parseFloat(costPerPrimary) || 0;
    const railCost = parseFloat(costPerRail) || 0;
    const concreteCost = parseFloat(costPerConcrete) || 0;

    let totalPrimaryCost = 0;
    if (materialType === 'wood') totalPrimaryCost = results.totalPickets * primaryCost;
    if (materialType === 'vinyl') totalPrimaryCost = results.vinylPanels * primaryCost;
    if (materialType === 'split-rail') totalPrimaryCost = results.splitRailLogs * primaryCost;
    if (materialType === 'chain-link') totalPrimaryCost = results.chainLinkMeshRolls * primaryCost;

    const totalPostCost = results.totalPosts * postCost;
    
    let totalRailCost = 0;
    if (materialType === 'wood') totalRailCost = results.totalRails * railCost;
    if (materialType === 'chain-link') totalRailCost = results.chainLinkTopRail * railCost;

    const totalConcreteCost = results.concrete80lbBags * concreteCost;

    return {
      posts: totalPostCost,
      primary: totalPrimaryCost,
      rails: totalRailCost,
      concrete: totalConcreteCost,
      total: totalPostCost + totalPrimaryCost + totalRailCost + totalConcreteCost
    };
  }, [results, materialType, costPerPost, costPerPrimary, costPerRail, costPerConcrete]);

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
            <div className="space-y-3">
              <Label>Fence Material Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-primary-500 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 font-medium text-primary-700 dark:text-primary-400"
                value={materialType}
                onChange={(e) => {
                  const type = e.target.value as FenceMaterialType;
                  setMaterialType(type);
                  // Adjust defaults
                  if (type === 'chain-link' || type === 'split-rail') setSpacing(10);
                  else setSpacing(8);
                }}
              >
                <option value="wood">Wood Privacy / Picket</option>
                <option value="vinyl">Vinyl / PVC Panels</option>
                <option value="split-rail">Split Rail (Log)</option>
                <option value="chain-link">Chain Link</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border">
              <div className="space-y-2">
                <Label>Total Fence Length</Label>
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
                <Label>Frost Line (Hole Depth)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={holeDepth}
                  onChange={(e) => setHoleDepth(Number(e.target.value))}
                >
                  <option value={24}>24" Deep (Warm)</option>
                  <option value={36}>36" Deep (Midwest)</option>
                  <option value={42}>42" Deep (Northern)</option>
                  <option value={48}>48" Deep (Extreme)</option>
                </select>
              </div>
            </div>

            {materialType === 'wood' && (
              <>
                <div className="space-y-3">
                  <Label>Horizontal Rails</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    value={rails}
                    onChange={(e) => setRails(Number(e.target.value))}
                  >
                    <option value={3}>3 Rails (Standard 6ft Privacy)</option>
                    <option value={2}>2 Rails (Standard 4ft Picket)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <Label>Picket Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    value={picketWidth}
                    onChange={(e) => setPicketWidth(Number(e.target.value))}
                  >
                    <option value={5.5}>1x6 Pickets (5.5" actual)</option>
                    <option value={3.5}>1x4 Pickets (3.5" actual)</option>
                  </select>
                </div>
              </>
            )}

            {materialType === 'split-rail' && (
              <div className="space-y-3">
                <Label>Rail Configuration</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={rails}
                  onChange={(e) => setRails(Number(e.target.value))}
                >
                  <option value={2}>2-Hole Post (2 Rails)</option>
                  <option value={3}>3-Hole Post (3 Rails)</option>
                </select>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label>Waste Factor</Label>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-500">+{wastePct}%</span>
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={wastePct}
                onChange={(e) => setWastePct(Number(e.target.value))}
              >
                <option value={0}>0% (Exact Count)</option>
                <option value={5}>5% (Minimal Cuts)</option>
                <option value={10}>10% (Standard / Recommended)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Material Cost Estimator</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost per Post</Label>
                <NumberInput value={costPerPost} onChange={(e) => setCostPerPost(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>
                  {materialType === 'wood' ? 'Cost per Picket' : 
                   materialType === 'vinyl' ? 'Cost per Panel' :
                   materialType === 'split-rail' ? 'Cost per Log' : 'Cost per 50ft Mesh Roll'}
                </Label>
                <NumberInput value={costPerPrimary} onChange={(e) => setCostPerPrimary(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              {(materialType === 'wood' || materialType === 'chain-link') && (
                <div className="space-y-2">
                  <Label>{materialType === 'wood' ? 'Cost per 2x4 Rail' : 'Cost per Top Rail'}</Label>
                  <NumberInput value={costPerRail} onChange={(e) => setCostPerRail(e.target.value)} min="0" prefixNode={<span>$</span>} />
                </div>
              )}
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
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Fence Takeoff ({materialType})</h3>
              {results && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800">
                  Includes {wastePct}% Waste
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ResultDisplay 
                label="Structural Posts"
                value={!results ? '--' : results.totalPosts}
                subValue="Posts"
                className="bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900/80 dark:to-stone-800/80 border-stone-300 dark:border-stone-700 shadow-sm [&>div>p]:text-stone-900 dark:[&>div>p]:text-stone-100"
              />
              <ResultDisplay 
                label={
                  materialType === 'wood' ? 'Vertical Pickets' :
                  materialType === 'vinyl' ? 'Vinyl Panels' :
                  materialType === 'split-rail' ? 'Horizontal Logs' : 'Mesh Rolls (50ft)'
                }
                value={!results ? '--' : 
                  materialType === 'wood' ? formatUnit(results.totalPickets, 0) :
                  materialType === 'vinyl' ? formatUnit(results.vinylPanels, 0) :
                  materialType === 'split-rail' ? formatUnit(results.splitRailLogs, 0) :
                  formatUnit(results.chainLinkMeshRolls, 0)
                }
                subValue={
                  materialType === 'wood' ? 'Pickets' :
                  materialType === 'vinyl' ? 'Panels' :
                  materialType === 'split-rail' ? 'Logs' : 'Rolls'
                }
                className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800 shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {materialType === 'wood' && (
                <div className="p-4 bg-background rounded-xl border border-border text-center">
                  <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">2x4 Rails</p>
                  <p className="text-2xl font-bold text-foreground">{!results ? '--' : results.totalRails}</p>
                </div>
              )}
              {materialType === 'chain-link' && (
                <>
                  <div className="p-4 bg-background rounded-xl border border-border text-center">
                    <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">Top Rails</p>
                    <p className="text-2xl font-bold text-foreground">{!results ? '--' : results.chainLinkTopRail}</p>
                  </div>
                  <div className="p-4 bg-background rounded-xl border border-border text-center">
                    <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">Tension Bands</p>
                    <p className="text-2xl font-bold text-foreground">{!results ? '--' : results.chainLinkTensionBands}</p>
                  </div>
                </>
              )}
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">Fence Sections</p>
                <p className="text-2xl font-bold text-foreground">{!results ? '--' : results.totalSections}</p>
              </div>
              {parseInt(gates, 10) > 0 && (
                <div className="p-4 bg-background rounded-xl border border-border text-center">
                  <p className="text-[10px] text-secondary-500 uppercase tracking-wider mb-1 font-bold">Gate Hardware</p>
                  <p className="text-sm font-bold text-foreground mt-2">{!results ? '--' : `${results.gateHinges} Hinges, ${results.gateLatches} Latch`}</p>
                </div>
              )}
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
                  {materialType === 'wood' && (
                    <SecondaryResultDisplay label="Total Screws/Nails" value={!results ? '--' : formatUnit(results.totalScrews, 0)} />
                  )}
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
                  <SecondaryResultDisplay 
                    label={
                      materialType === 'wood' ? 'Pickets' : 
                      materialType === 'vinyl' ? 'Panels' :
                      materialType === 'split-rail' ? 'Logs' : 'Mesh Rolls'
                    } 
                    value={!costValues ? '--' : `$${formatUnit(costValues.primary)}`} 
                  />
                  {(materialType === 'wood' || materialType === 'chain-link') && (
                    <SecondaryResultDisplay label="Rails" value={!costValues ? '--' : `$${formatUnit(costValues.rails)}`} />
                  )}
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

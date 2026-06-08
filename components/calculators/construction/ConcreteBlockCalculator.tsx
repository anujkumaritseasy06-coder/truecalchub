"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  BlockUnit, 
  BlockDimensions, 
  calculateBlocks 
} from '@/lib/calculators/block';

type CMUPreset = '8x8x16' | '6x8x16' | '12x8x16' | 'custom';

export function ConcreteBlockCalculator() {
  const [unit, setUnit] = useState<BlockUnit>('feet');
  const [presetSize, setPresetSize] = useState<CMUPreset>('8x8x16');
  const [wasteFactor, setWasteFactor] = useState<number>(10);

  // Wall Dimensions
  const [wallLength, setWallLength] = useState<string>('');
  const [wallHeight, setWallHeight] = useState<string>('');

  // Block Dimensions (Actual size in inches, nominal is +3/8")
  const [blockLength, setBlockLength] = useState<string>('');
  const [blockHeight, setBlockHeight] = useState<string>('');
  const [mortarJoint, setMortarJoint] = useState<string>('');

  // Cost Inputs
  const [costPerBlock, setCostPerBlock] = useState<string>('');
  const [costPerMortar, setCostPerMortar] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<string>('');

  // Handle Presets
  const handlePresetChange = (preset: CMUPreset) => {
    setPresetSize(preset);
    if (preset !== 'custom') {
      // All standard 16"x8" blocks share the exact same face dimensions (15.625 x 7.625)
      setBlockLength('15.625');
      setBlockHeight('7.625');
      setMortarJoint('0.375');
    }
  };

  const { results, error } = useMemo(() => {
    const wL = parseFloat(wallLength);
    const wH = parseFloat(wallHeight);
    const bL = parseFloat(blockLength);
    const bH = parseFloat(blockHeight);
    const mJ = parseFloat(mortarJoint);

    if (isNaN(wL) || isNaN(wH) || isNaN(bL) || isNaN(bH) || isNaN(mJ) || wL <= 0 || wH <= 0 || bL <= 0 || bH <= 0 || mJ < 0) {
      return { results: null, error: 'Please enter valid wall and block dimensions.' };
    }

    if (wL > 10000 || wH > 10000) {
      return { results: null, error: 'Values exceed maximum realistic limits (10,000 max).' };
    }

    const dims: BlockDimensions = {
      wallLength: wL,
      wallHeight: wH,
      blockLengthInches: bL,
      blockHeightInches: bH,
      mortarJointInches: mJ,
    };

    const outputs = calculateBlocks(dims, unit, wasteFactor);
    return { results: outputs, error: null };
  }, [unit, wasteFactor, wallLength, wallHeight, blockLength, blockHeight, mortarJoint]);

  // Cost Computation
  const costValues = useMemo(() => {
    if (!results) return null;
    const blockCost = parseFloat(costPerBlock) || 0;
    const mortarCost = parseFloat(costPerMortar) || 0;
    const delivery = parseFloat(deliveryFee) || 0;

    const totalBlockCost = results.wasteAdjustedBlocks * blockCost;
    const totalMortarCost = results.estimatedMortarBags * mortarCost;

    return {
      materialBlocks: totalBlockCost,
      materialMortar: totalMortarCost,
      delivery: delivery,
      totalCost: totalBlockCost + totalMortarCost + delivery,
    };
  }, [results, costPerBlock, costPerMortar, deliveryFee]);

  const formatUnit = (val: number, maxDec: number = 2) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec }).format(val);

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
                onChange={(e) => setUnit(e.target.value as BlockUnit)}
              >
                <option value="feet">Feet</option>
                <option value="inches">Inches</option>
                <option value="yards">Yards</option>
                <option value="meters">Meters</option>
                <option value="centimeters">Centimeters</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <Label>Waste Factor Allowance</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={wasteFactor}
                onChange={(e) => setWasteFactor(Number(e.target.value))}
              >
                <option value={0}>0% (Exact Match)</option>
                <option value={5}>5%</option>
                <option value={10}>10% (Recommended)</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <h3 className="font-semibold text-foreground">Wall Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Total Wall Length</Label>
                <NumberInput value={wallLength} onChange={(e) => setWallLength(e.target.value)} min="0" placeholder="e.g. 50" suffixNode={<span>{unit}</span>} />
              </div>
              <div className="space-y-2">
                <Label>Total Wall Height</Label>
                <NumberInput value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} min="0" placeholder="e.g. 6" suffixNode={<span>{unit}</span>} />
              </div>
            </div>
          </div>

          <div className="p-5 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-border space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Block Properties</h3>
              <select
                className="h-8 rounded-md border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none"
                value={presetSize}
                onChange={(e) => handlePresetChange(e.target.value as CMUPreset)}
              >
                <option value="8x8x16">8" × 8" × 16" CMU</option>
                <option value="6x8x16">6" × 8" × 16" CMU</option>
                <option value="12x8x16">12" × 8" × 16" CMU</option>
                <option value="custom">Custom Size</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Actual Block Length</Label>
                <NumberInput 
                  value={blockLength} 
                  onChange={(e) => { setBlockLength(e.target.value); setPresetSize('custom'); }} 
                  min="0" 
                  disabled={presetSize !== 'custom'}
                  suffixNode={<span>inches</span>} 
                />
              </div>
              <div className="space-y-2">
                <Label>Actual Block Height</Label>
                <NumberInput 
                  value={blockHeight} 
                  onChange={(e) => { setBlockHeight(e.target.value); setPresetSize('custom'); }} 
                  min="0" 
                  disabled={presetSize !== 'custom'}
                  suffixNode={<span>inches</span>} 
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Mortar Joint Thickness</Label>
                <NumberInput 
                  value={mortarJoint} 
                  onChange={(e) => { setMortarJoint(e.target.value); setPresetSize('custom'); }} 
                  min="0" 
                  disabled={presetSize !== 'custom'}
                  placeholder="e.g. 0.375"
                  suffixNode={<span>inches</span>} 
                />
              </div>
            </div>
            {presetSize !== 'custom' && (
              <p className="text-xs text-secondary-500 mt-2">
                Standard CMU blocks have an actual dimension that is 3/8" smaller than their nominal size to perfectly accommodate the 3/8" mortar joint.
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Cost Estimation (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost per Block</Label>
                <NumberInput value={costPerBlock} onChange={(e) => setCostPerBlock(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Cost per Mortar Bag</Label>
                <NumberInput value={costPerMortar} onChange={(e) => setCostPerMortar(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Fee</Label>
                <NumberInput value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} min="0" prefixNode={<span>$</span>} />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondary-50/50 dark:bg-secondary-900/10 p-6 rounded-2xl border border-border">
            <ResultDisplay 
              label="Concrete Blocks Required"
              value={!results ? '--' : results.wasteAdjustedBlocks.toLocaleString()}
              subValue="Total CMU Blocks"
              className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
            />
            
            <div className="space-y-2 px-1">
              <SecondaryResultDisplay label="Raw Block Count" value={!results ? '--' : formatUnit(results.rawBlocksRequired, 1)} />
              {wasteFactor > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-500 italic px-2 py-2 text-right">
                  * Includes {wasteFactor}% waste allowance
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Material Equivalents</h3>
            <div className="space-y-2">
              <SecondaryResultDisplay 
                label="Estimated Pallets" 
                value={!results ? '--' : results.estimatedPallets} 
                valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
              />
              <p className="text-[10px] text-right text-secondary-400 mb-4 pb-2 border-b border-border/50">(Based on standard 90-block pallets)</p>

              <SecondaryResultDisplay 
                label="Required Mortar Bags" 
                value={!results ? '--' : results.estimatedMortarBags} 
                valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
              />
              <p className="text-[10px] text-right text-secondary-400">(Based on 3 bags per 100 blocks)</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Wall Properties</h3>
            <div className="space-y-2">
              <SecondaryResultDisplay label="Wall Surface Area (Sq Ft)" value={!results ? '--' : formatUnit(results.wallAreaSqFt)} />
              <SecondaryResultDisplay label="Wall Surface Area (Sq M)" value={!results ? '--' : formatUnit(results.wallAreaSqMeters)} />
              <SecondaryResultDisplay label="Single Block Face Area" value={!results ? '--' : `${formatUnit(results.blockFaceAreaSqFt)} Sq Ft`} />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Estimated Costs</h3>
            <div className="space-y-2">
              <SecondaryResultDisplay label="CMU Blocks" value={!costValues ? '--' : `$${formatUnit(costValues.materialBlocks)}`} />
              <SecondaryResultDisplay label="Mortar Mix" value={!costValues ? '--' : `$${formatUnit(costValues.materialMortar)}`} />
              <SecondaryResultDisplay label="Delivery Fee" value={!costValues ? '--' : `$${formatUnit(costValues.delivery)}`} />
              <div className="pt-2 mt-2 border-t border-border">
                <SecondaryResultDisplay 
                  label="Total Project Cost" 
                  value={!costValues ? '--' : `$${formatUnit(costValues.totalCost)}`} 
                  valueClassName="text-foreground font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-secondary-100 dark:bg-secondary-800/50 p-4 rounded-xl text-sm text-secondary-600 dark:text-secondary-400">
            <span className="font-semibold block mb-1">Calculation Formula:</span>
            <code className="bg-background px-2 py-1 rounded border border-border font-mono text-xs">Block Count = Wall Area ÷ Block Face Area</code>
            <br/><br/>
            The block face area is calculated by adding the mortar joint thickness to the block's actual height and length. The final count is increased by {wasteFactor}% to account for breakages, end-cuts, and waste.
          </div>

        </div>
      </div>
    </CalculatorWrapper>
  );
}

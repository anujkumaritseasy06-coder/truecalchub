"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

export function BodyFatCalculator() {
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  // Imperial State
  const [feet, setFeet] = useState<string>('');
  const [inches, setInches] = useState<string>('');
  const [pounds, setPounds] = useState<string>('');
  const [neckInches, setNeckInches] = useState<string>('');
  const [waistInches, setWaistInches] = useState<string>('');
  const [hipInches, setHipInches] = useState<string>(''); // Female only

  // Metric State
  const [cm, setCm] = useState<string>('');
  const [kg, setKg] = useState<string>('');
  const [neckCm, setNeckCm] = useState<string>('');
  const [waistCm, setWaistCm] = useState<string>('');
  const [hipCm, setHipCm] = useState<string>(''); // Female only

  const {
    bodyFatPercent,
    category,
    fatMass,
    leanMass,
    healthyRange,
    error,
    categoryColor
  } = useMemo(() => {
    let wKg = 0;
    let hCm = 0;
    let nCm = 0;
    let waCm = 0;
    let hiCm = 0;

    if (unitSystem === 'imperial') {
      const f = parseFloat(feet) || 0;
      const i = parseFloat(inches) || 0;
      const lbs = parseFloat(pounds);
      const neck = parseFloat(neckInches);
      const waist = parseFloat(waistInches);
      const hip = parseFloat(hipInches);

      if (isNaN(lbs) || isNaN(neck) || isNaN(waist) || (gender === 'female' && isNaN(hip))) {
        return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Please fill out all measurements.', categoryColor: '' };
      }
      
      const totalInches = (f * 12) + i;
      if (totalInches < 20 || totalInches > 120) return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Please enter a realistic height.', categoryColor: '' };
      if (lbs <= 0 || lbs > 1500) return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Please enter a realistic weight.', categoryColor: '' };

      wKg = lbs * 0.453592;
      hCm = totalInches * 2.54;
      nCm = neck * 2.54;
      waCm = waist * 2.54;
      hiCm = hip * 2.54;
    } else {
      const c = parseFloat(cm);
      const k = parseFloat(kg);
      const neck = parseFloat(neckCm);
      const waist = parseFloat(waistCm);
      const hip = parseFloat(hipCm);

      if (isNaN(c) || isNaN(k) || isNaN(neck) || isNaN(waist) || (gender === 'female' && isNaN(hip))) {
        return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Please fill out all measurements.', categoryColor: '' };
      }
      
      if (c < 50 || c > 300) return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Please enter a realistic height.', categoryColor: '' };
      if (k <= 0 || k > 600) return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Please enter a realistic weight.', categoryColor: '' };

      wKg = k;
      hCm = c;
      nCm = neck;
      waCm = waist;
      hiCm = hip;
    }

    if (nCm <= 0 || waCm <= 0 || hCm <= 0 || (gender === 'female' && hiCm <= 0)) {
        return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Measurements must be greater than zero.', categoryColor: '' };
    }

    let bf = 0;

    if (gender === 'male') {
      if (waCm <= nCm) {
        return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Waist circumference must be larger than neck circumference to calculate.', categoryColor: '' };
      }
      const d = 1.0324 - 0.19077 * Math.log10(waCm - nCm) + 0.15456 * Math.log10(hCm);
      bf = (495 / d) - 450;
    } else {
      if ((waCm + hiCm) <= nCm) {
        return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'Waist + Hip circumference must be larger than neck circumference to calculate.', categoryColor: '' };
      }
      const d = 1.29579 - 0.35004 * Math.log10(waCm + hiCm - nCm) + 0.22100 * Math.log10(hCm);
      bf = (495 / d) - 450;
    }

    if (isNaN(bf) || !isFinite(bf) || bf <= 0 || bf >= 100) {
        return { bodyFatPercent: 0, category: '', fatMass: 0, leanMass: 0, healthyRange: '', error: 'These measurements generated an impossible body fat percentage. Please check your inputs.', categoryColor: '' };
    }

    // Determine Categories based on ACE (American Council on Exercise) guidelines
    let cat = '';
    let range = '';
    let color = '';

    if (gender === 'male') {
      range = '14% - 17%';
      if (bf < 2) { cat = 'Dangerously Low'; color = 'text-rose-600 dark:text-rose-400'; }
      else if (bf >= 2 && bf < 6) { cat = 'Essential Fat'; color = 'text-amber-600 dark:text-amber-400'; }
      else if (bf >= 6 && bf < 14) { cat = 'Athletes'; color = 'text-emerald-600 dark:text-emerald-400'; }
      else if (bf >= 14 && bf < 18) { cat = 'Fitness'; color = 'text-emerald-600 dark:text-emerald-400'; }
      else if (bf >= 18 && bf < 25) { cat = 'Acceptable'; color = 'text-teal-600 dark:text-teal-400'; }
      else { cat = 'Obese'; color = 'text-rose-600 dark:text-rose-400'; }
    } else {
      range = '21% - 24%';
      if (bf < 10) { cat = 'Dangerously Low'; color = 'text-rose-600 dark:text-rose-400'; }
      else if (bf >= 10 && bf < 14) { cat = 'Essential Fat'; color = 'text-amber-600 dark:text-amber-400'; }
      else if (bf >= 14 && bf < 21) { cat = 'Athletes'; color = 'text-emerald-600 dark:text-emerald-400'; }
      else if (bf >= 21 && bf < 25) { cat = 'Fitness'; color = 'text-emerald-600 dark:text-emerald-400'; }
      else if (bf >= 25 && bf < 32) { cat = 'Acceptable'; color = 'text-teal-600 dark:text-teal-400'; }
      else { cat = 'Obese'; color = 'text-rose-600 dark:text-rose-400'; }
    }

    const fMassKg = wKg * (bf / 100);
    const lMassKg = wKg - fMassKg;

    // Convert Mass outputs back to correct units
    let fMassDisplay = 0;
    let lMassDisplay = 0;
    
    if (unitSystem === 'imperial') {
      fMassDisplay = fMassKg * 2.20462;
      lMassDisplay = lMassKg * 2.20462;
    } else {
      fMassDisplay = fMassKg;
      lMassDisplay = lMassKg;
    }

    return {
      bodyFatPercent: bf,
      category: cat,
      fatMass: fMassDisplay,
      leanMass: lMassDisplay,
      healthyRange: range,
      error: null,
      categoryColor: color
    };
  }, [unitSystem, gender, feet, inches, pounds, neckInches, waistInches, hipInches, cm, kg, neckCm, waistCm, hipCm]);

  const formatUnit = (val: number) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Unit System</Label>
              <div className="flex bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1 w-full">
                <button
                  onClick={() => setUnitSystem('imperial')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    unitSystem === 'imperial' 
                      ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' 
                      : 'text-secondary-500 hover:text-foreground'
                  }`}
                >
                  US / Imperial
                </button>
                <button
                  onClick={() => setUnitSystem('metric')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    unitSystem === 'metric' 
                      ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' 
                      : 'text-secondary-500 hover:text-foreground'
                  }`}
                >
                  Metric
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Biological Sex</Label>
              <div className="flex bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1 w-full">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    gender === 'male' 
                      ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' 
                      : 'text-secondary-500 hover:text-foreground'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    gender === 'female' 
                      ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' 
                      : 'text-secondary-500 hover:text-foreground'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4 mb-4">
            {unitSystem === 'imperial' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="feet">Height (Feet)</Label>
                    <NumberInput 
                      id="feet"
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                      min="1"
                      max="9"
                      step="1"
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inches">Height (Inches)</Label>
                    <NumberInput 
                      id="inches"
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                      min="0"
                      max="11"
                      step="1"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="pounds">Weight (Pounds)</Label>
                  <NumberInput 
                    id="pounds"
                    value={pounds}
                    onChange={(e) => setPounds(e.target.value)}
                    min="1"
                    max="1500"
                    step="1"
                    suffixNode={<span className="font-medium">lbs</span>}
                    placeholder="175"
                  />
                </div>
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="neckInches">Neck Circumference</Label>
                  <NumberInput 
                    id="neckInches"
                    value={neckInches}
                    onChange={(e) => setNeckInches(e.target.value)}
                    min="5"
                    max="30"
                    step="0.1"
                    suffixNode={<span className="font-medium">in</span>}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="waistInches">Waist Circumference (At Navel)</Label>
                  <NumberInput 
                    id="waistInches"
                    value={waistInches}
                    onChange={(e) => setWaistInches(e.target.value)}
                    min="10"
                    max="100"
                    step="0.1"
                    suffixNode={<span className="font-medium">in</span>}
                    placeholder="34"
                  />
                </div>
                {gender === 'female' && (
                  <div className="space-y-2 max-w-sm transition-all">
                    <Label htmlFor="hipInches">Hip Circumference (Widest Point)</Label>
                    <NumberInput 
                      id="hipInches"
                      value={hipInches}
                      onChange={(e) => setHipInches(e.target.value)}
                      min="10"
                      max="100"
                      step="0.1"
                      suffixNode={<span className="font-medium">in</span>}
                      placeholder="40"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="cm">Height (Centimeters)</Label>
                  <NumberInput 
                    id="cm"
                    value={cm}
                    onChange={(e) => setCm(e.target.value)}
                    min="50"
                    max="300"
                    step="1"
                    suffixNode={<span className="font-medium">cm</span>}
                    placeholder="178"
                  />
                </div>
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="kg">Weight (Kilograms)</Label>
                  <NumberInput 
                    id="kg"
                    value={kg}
                    onChange={(e) => setKg(e.target.value)}
                    min="1"
                    max="600"
                    step="1"
                    suffixNode={<span className="font-medium">kg</span>}
                    placeholder="79"
                  />
                </div>
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="neckCm">Neck Circumference</Label>
                  <NumberInput 
                    id="neckCm"
                    value={neckCm}
                    onChange={(e) => setNeckCm(e.target.value)}
                    min="15"
                    max="80"
                    step="0.1"
                    suffixNode={<span className="font-medium">cm</span>}
                    placeholder="38"
                  />
                </div>
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="waistCm">Waist Circumference (At Navel)</Label>
                  <NumberInput 
                    id="waistCm"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    min="30"
                    max="250"
                    step="0.1"
                    suffixNode={<span className="font-medium">cm</span>}
                    placeholder="86"
                  />
                </div>
                {gender === 'female' && (
                  <div className="space-y-2 max-w-sm transition-all">
                    <Label htmlFor="hipCm">Hip Circumference (Widest Point)</Label>
                    <NumberInput 
                      id="hipCm"
                      value={hipCm}
                      onChange={(e) => setHipCm(e.target.value)}
                      min="30"
                      max="250"
                      step="0.1"
                      suffixNode={<span className="font-medium">cm</span>}
                      placeholder="101"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 flex flex-col justify-center bg-secondary-50/50 dark:bg-secondary-900/10 p-6 sm:p-8 rounded-2xl border border-border">
          <ResultDisplay 
            label="Estimated Body Fat"
            value={error ? '--' : `${formatUnit(bodyFatPercent)}%`}
            subValue={<span className={categoryColor}>{category}</span>}
            className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
          />
          
          <div className="space-y-3 px-1">
            <SecondaryResultDisplay 
              label="Lean Body Mass" 
              value={error ? '--' : `${formatUnit(leanMass)} ${unitSystem === 'imperial' ? 'lbs' : 'kg'}`} 
            />
            <SecondaryResultDisplay 
              label="Fat Mass" 
              value={error ? '--' : `${formatUnit(fatMass)} ${unitSystem === 'imperial' ? 'lbs' : 'kg'}`} 
            />
            <SecondaryResultDisplay 
              label="ACE Fitness Goal Range" 
              value={error ? '--' : healthyRange} 
            />
            <p className="text-xs text-secondary-500 mt-4 px-2 leading-relaxed italic">
              * Note: The U.S. Navy Method provides a scientifically sound estimate. For clinical precision, a DEXA scan or hydrostatic weighing is required.
            </p>
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
}

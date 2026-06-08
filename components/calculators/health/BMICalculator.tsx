"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

export function BMICalculator() {
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');
  
  // Imperial State
  const [feet, setFeet] = useState<string>('');
  const [inches, setInches] = useState<string>('');
  const [pounds, setPounds] = useState<string>('');

  // Metric State
  const [cm, setCm] = useState<string>('');
  const [kg, setKg] = useState<string>('');

  const {
    bmi,
    category,
    healthyRangeStr,
    differenceStr,
    error
  } = useMemo(() => {
    let finalBmi = 0;
    let minHealthyWeight = 0;
    let maxHealthyWeight = 0;
    let currentWeight = 0;

    if (unitSystem === 'imperial') {
      const f = parseFloat(feet) || 0;
      const i = parseFloat(inches) || 0;
      const lbs = parseFloat(pounds);

      if (isNaN(lbs)) return { bmi: 0, category: '', healthyRangeStr: '', differenceStr: '', error: 'Please enter a valid weight.' };
      
      const totalInches = (f * 12) + i;
      
      if (totalInches < 20 || totalInches > 120) return { bmi: 0, category: '', healthyRangeStr: '', differenceStr: '', error: 'Please enter a realistic human height (between 20 and 120 inches).' };
      if (lbs <= 0 || lbs > 1500) return { bmi: 0, category: '', healthyRangeStr: '', differenceStr: '', error: 'Please enter a realistic human weight.' };

      finalBmi = (lbs / (totalInches * totalInches)) * 703;
      minHealthyWeight = (18.5 * totalInches * totalInches) / 703;
      maxHealthyWeight = (24.9 * totalInches * totalInches) / 703;
      currentWeight = lbs;

    } else {
      const c = parseFloat(cm);
      const k = parseFloat(kg);

      if (isNaN(c) || isNaN(k)) return { bmi: 0, category: '', healthyRangeStr: '', differenceStr: '', error: 'Please enter valid numerical values.' };
      
      if (c < 50 || c > 300) return { bmi: 0, category: '', healthyRangeStr: '', differenceStr: '', error: 'Please enter a realistic human height (between 50cm and 300cm).' };
      if (k <= 0 || k > 600) return { bmi: 0, category: '', healthyRangeStr: '', differenceStr: '', error: 'Please enter a realistic human weight.' };

      const m = c / 100;
      finalBmi = k / (m * m);
      minHealthyWeight = 18.5 * m * m;
      maxHealthyWeight = 24.9 * m * m;
      currentWeight = k;
    }

    let cat = '';
    let categoryColor = '';
    if (finalBmi < 18.5) {
      cat = 'Underweight';
    } else if (finalBmi >= 18.5 && finalBmi <= 24.9) {
      cat = 'Normal Weight';
    } else if (finalBmi >= 25 && finalBmi <= 29.9) {
      cat = 'Overweight';
    } else {
      cat = 'Obesity';
    }

    const unitLabel = unitSystem === 'imperial' ? 'lbs' : 'kg';
    const rangeStr = `${minHealthyWeight.toFixed(1)} - ${maxHealthyWeight.toFixed(1)} ${unitLabel}`;
    
    let diffStr = 'You are within a healthy range.';
    if (finalBmi < 18.5) {
      diffStr = `Gain ${(minHealthyWeight - currentWeight).toFixed(1)} ${unitLabel} to reach normal weight.`;
    } else if (finalBmi > 24.9) {
      diffStr = `Lose ${(currentWeight - maxHealthyWeight).toFixed(1)} ${unitLabel} to reach normal weight.`;
    }

    return {
      bmi: finalBmi,
      category: cat,
      healthyRangeStr: rangeStr,
      differenceStr: diffStr,
      error: null,
    };
  }, [unitSystem, feet, inches, pounds, cm, kg]);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <Label>Unit System</Label>
            <div className="flex bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1 w-full max-w-sm">
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

          <div className="pt-4 border-t border-border">
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
              </div>
            )}
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 flex flex-col justify-center bg-secondary-50/50 dark:bg-secondary-900/10 p-6 sm:p-8 rounded-2xl border border-border">
          <ResultDisplay 
            label="Your BMI Score"
            value={bmi ? bmi.toFixed(1) : '0.0'}
            subValue={`Category: ${category}`}
            className={`mb-8 shadow-sm border ${
              category === 'Normal Weight' 
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900' 
                : category === 'Underweight' || category === 'Overweight'
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900/50'
                : category === 'Obesity'
                ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-900/50'
                : 'bg-zinc-50 border-zinc-200'
            }`}
          />
          
          <div className="space-y-3 px-1">
            <SecondaryResultDisplay 
              label="Healthy Weight Range" 
              value={healthyRangeStr} 
              valueClassName="font-bold text-foreground"
            />
            <SecondaryResultDisplay 
              label="Weight Goal" 
              value={differenceStr} 
              valueClassName={
                category === 'Normal Weight' 
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold text-right' 
                  : 'text-amber-600 dark:text-amber-400 font-semibold text-right'
              }
            />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
}

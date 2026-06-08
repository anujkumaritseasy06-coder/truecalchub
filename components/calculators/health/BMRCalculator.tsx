"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

export function BMRCalculator() {
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('');
  
  // Imperial State
  const [feet, setFeet] = useState<string>('');
  const [inches, setInches] = useState<string>('');
  const [pounds, setPounds] = useState<string>('');

  // Metric State
  const [cm, setCm] = useState<string>('');
  const [kg, setKg] = useState<string>('');

  const {
    mifflinBmr,
    harrisBmr,
    error
  } = useMemo(() => {
    let weightKg = 0;
    let heightCm = 0;

    const a = parseFloat(age);
    if (isNaN(a)) return { mifflinBmr: 0, harrisBmr: 0, error: 'Please enter a valid age.' };
    if (a < 15 || a > 120) return { mifflinBmr: 0, harrisBmr: 0, error: 'Age must be between 15 and 120 years.' };

    if (unitSystem === 'imperial') {
      const f = parseFloat(feet) || 0;
      const i = parseFloat(inches) || 0;
      const lbs = parseFloat(pounds);

      if (isNaN(lbs)) return { mifflinBmr: 0, harrisBmr: 0, error: 'Please enter a valid weight.' };
      
      const totalInches = (f * 12) + i;
      if (totalInches < 20 || totalInches > 120) return { mifflinBmr: 0, harrisBmr: 0, error: 'Please enter a realistic human height (between 20 and 120 inches).' };
      if (lbs <= 0 || lbs > 1500) return { mifflinBmr: 0, harrisBmr: 0, error: 'Please enter a realistic human weight.' };

      weightKg = lbs * 0.453592;
      heightCm = totalInches * 2.54;
    } else {
      const c = parseFloat(cm);
      const k = parseFloat(kg);

      if (isNaN(c) || isNaN(k)) return { mifflinBmr: 0, harrisBmr: 0, error: 'Please enter valid numerical values.' };
      if (c < 50 || c > 300) return { mifflinBmr: 0, harrisBmr: 0, error: 'Please enter a realistic human height (between 50cm and 300cm).' };
      if (k <= 0 || k > 600) return { mifflinBmr: 0, harrisBmr: 0, error: 'Please enter a realistic human weight.' };

      weightKg = k;
      heightCm = c;
    }

    // Mifflin-St Jeor Equation
    let mifflin = (10 * weightKg) + (6.25 * heightCm) - (5 * a);
    mifflin = gender === 'male' ? mifflin + 5 : mifflin - 161;

    // Harris-Benedict Equation (Revised 1984)
    let harris = 0;
    if (gender === 'male') {
      harris = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * a);
    } else {
      harris = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * a);
    }

    return {
      mifflinBmr: Math.round(mifflin),
      harrisBmr: Math.round(harris),
      error: null,
    };
  }, [unitSystem, gender, age, feet, inches, pounds, cm, kg]);

  const formatCalories = (val: number) => 
    new Intl.NumberFormat('en-US').format(val);

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
              <Label>Biological Sex (For Hormonal Math)</Label>
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

          <div className="space-y-2 max-w-sm">
            <Label htmlFor="age">Age (Years)</Label>
            <NumberInput 
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="15"
              max="120"
              step="1"
              placeholder="30"
            />
          </div>

          <div className="pt-4 border-t border-border mt-4">
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
            label="Daily Calories Burned At Rest"
            value={`${formatCalories(mifflinBmr)}`}
            subValue="Mifflin-St Jeor Equation"
            className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
          />
          
          <div className="space-y-3 px-1">
            <SecondaryResultDisplay 
              label="Harris-Benedict Equation" 
              value={`${formatCalories(harrisBmr)} kcal/day`} 
            />
            <p className="text-sm text-secondary-500 mt-4 px-2 leading-relaxed">
              Your Basal Metabolic Rate (BMR) is the exact number of calories your body needs to maintain basic life-sustaining functions if you rested in bed all day.
            </p>
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
}

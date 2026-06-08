"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

export function SalaryCalculator() {
  const [annualSalary, setAnnualSalary] = useState<string>('');
  const [weeklyHours, setWeeklyHours] = useState<string>('');
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState<string>('');
  const [vacationDays, setVacationDays] = useState<string>('');
  const [holidays, setHolidays] = useState<string>('');

  const {
    hourly,
    daily,
    weekly,
    biWeekly,
    monthly,
    annual,
    error
  } = useMemo(() => {
    const A = parseFloat(annualSalary);
    const H = parseFloat(weeklyHours);
    const D = parseFloat(workDaysPerWeek);
    const V = parseFloat(vacationDays) || 0;
    const Hol = parseFloat(holidays) || 0;

    if (isNaN(A) || isNaN(H) || isNaN(D)) {
      return { hourly: 0, daily: 0, weekly: 0, biWeekly: 0, monthly: 0, annual: 0, error: 'Please enter valid numerical values.' };
    }

    if (A <= 0 || A > 100000000) return { error: 'Annual salary must be between $1 and $100,000,000.', hourly: 0, daily: 0, weekly: 0, biWeekly: 0, monthly: 0, annual: 0 };
    if (H <= 0 || H > 168) return { error: 'Weekly hours must be between 1 and 168.', hourly: 0, daily: 0, weekly: 0, biWeekly: 0, monthly: 0, annual: 0 };
    if (D <= 0 || D > 7) return { error: 'Work days per week must be between 1 and 7.', hourly: 0, daily: 0, weekly: 0, biWeekly: 0, monthly: 0, annual: 0 };
    if (V < 0 || V > 365) return { error: 'Invalid vacation days.', hourly: 0, daily: 0, weekly: 0, biWeekly: 0, monthly: 0, annual: 0 };
    if (Hol < 0 || Hol > 365) return { error: 'Invalid holidays.', hourly: 0, daily: 0, weekly: 0, biWeekly: 0, monthly: 0, annual: 0 };

    const totalWeeks = 365 / 7; // 52.142857
    const hoursPerDay = H / D;
    const standardAnnualWorkDays = D * totalWeeks;
    
    const actualWorkDays = standardAnnualWorkDays - V - Hol;
    if (actualWorkDays <= 0) return { error: 'Vacation and holidays exceed total working days.', hourly: 0, daily: 0, weekly: 0, biWeekly: 0, monthly: 0, annual: 0 };

    const actualWorkHours = actualWorkDays * hoursPerDay;

    const hourlyRate = A / actualWorkHours;
    const dailyRate = hourlyRate * hoursPerDay;
    const weeklyRate = A / totalWeeks;
    const biWeeklyRate = A / (totalWeeks / 2);
    const monthlyRate = A / 12;

    return {
      hourly: hourlyRate,
      daily: dailyRate,
      weekly: weeklyRate,
      biWeekly: biWeeklyRate,
      monthly: monthlyRate,
      annual: A,
      error: null,
    };
  }, [annualSalary, weeklyHours, workDaysPerWeek, vacationDays, holidays]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="annualSalary">Annual Salary</Label>
            <NumberInput 
              id="annualSalary"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              min="1"
              max="100000000"
              step="1000"
              prefixNode={<span className="font-medium">$</span>}
              placeholder="75000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weeklyHours">Hours Worked Per Week</Label>
              <NumberInput 
                id="weeklyHours"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                min="1"
                max="168"
                step="1"
                placeholder="40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workDaysPerWeek">Work Days Per Week</Label>
              <NumberInput 
                id="workDaysPerWeek"
                value={workDaysPerWeek}
                onChange={(e) => setWorkDaysPerWeek(e.target.value)}
                min="1"
                max="7"
                step="1"
                placeholder="5"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6 mb-4">
            <h3 className="font-medium text-foreground mb-4">Time Off (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vacationDays">Paid Vacation Days / PTO</Label>
                <NumberInput 
                  id="vacationDays"
                  value={vacationDays}
                  onChange={(e) => setVacationDays(e.target.value)}
                  min="0"
                  max="365"
                  step="1"
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holidays">Paid Holidays</Label>
                <NumberInput 
                  id="holidays"
                  value={holidays}
                  onChange={(e) => setHolidays(e.target.value)}
                  min="0"
                  max="365"
                  step="1"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 flex flex-col justify-center bg-secondary-50/50 dark:bg-secondary-900/10 p-6 sm:p-8 rounded-2xl border border-border">
          <ResultDisplay 
            label="Hourly Equivalent"
            value={formatCurrency(hourly)}
            className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
          />
          
          <div className="space-y-3 px-1">
            <SecondaryResultDisplay 
              label="Daily Earnings" 
              value={formatCurrency(daily)} 
            />
            <SecondaryResultDisplay 
              label="Weekly Pay (52/yr)" 
              value={formatCurrency(weekly)} 
            />
            <SecondaryResultDisplay 
              label="Bi-Weekly Pay (26/yr)" 
              value={formatCurrency(biWeekly)} 
            />
            <SecondaryResultDisplay 
              label="Monthly Pay (12/yr)" 
              value={formatCurrency(monthly)} 
            />
            <SecondaryResultDisplay 
              label="Annual Salary" 
              value={formatCurrency(annual)} 
              valueClassName="font-bold text-foreground"
            />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
}

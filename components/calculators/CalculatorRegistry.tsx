import dynamic from 'next/dynamic';
import React from 'react';
import { Calculator, Calculator as CalculatorIcon, PiggyBank, HeartPulse, Stethoscope, Hammer } from 'lucide-react';

export type CalculatorConfig = {
  id: string;
  component: React.ComponentType<any>;
};

// Centralized registry for all interactive calculator widgets
export const CALCULATOR_REGISTRY: Record<string, CalculatorConfig> = {
  'compound-interest-calculator': {
    id: 'compound-interest-calculator',
    component: dynamic(() => import('./finance/CompoundInterestCalculator').then(mod => mod.CompoundInterestCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'mortgage-calculator': {
    id: 'mortgage-calculator',
    component: dynamic(() => import('./finance/MortgageCalculator').then(mod => mod.MortgageCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'loan-calculator': {
    id: 'loan-calculator',
    component: dynamic(() => import('./finance/LoanCalculator').then(mod => mod.LoanCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'apr-calculator': {
    id: 'apr-calculator',
    component: dynamic(() => import('./finance/APRCalculator').then(mod => mod.APRCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'salary-calculator': {
    id: 'salary-calculator',
    component: dynamic(() => import('./salary-tax/SalaryCalculator').then(mod => mod.SalaryCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'paycheck-calculator': {
    id: 'paycheck-calculator',
    component: dynamic(() => import('./salary-tax/PaycheckCalculator').then(mod => mod.PaycheckCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'bmi-calculator': {
    id: 'bmi-calculator',
    component: dynamic(() => import('./health/BMICalculator').then(mod => mod.BMICalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'bmr-calculator': {
    id: 'bmr-calculator',
    component: dynamic(() => import('./health/BMRCalculator').then(mod => mod.BMRCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'calorie-calculator': {
    id: 'calorie-calculator',
    component: dynamic(() => import('./health/CalorieCalculator').then(mod => mod.CalorieCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'body-fat-calculator': {
    id: 'body-fat-calculator',
    component: dynamic(() => import('./health/BodyFatCalculator').then(mod => mod.BodyFatCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'concrete-calculator': {
    id: 'concrete-calculator',
    component: dynamic(() => import('./construction/ConcreteCalculator').then(mod => mod.ConcreteCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'concrete-slab-calculator': {
    id: 'concrete-slab-calculator',
    component: dynamic(() => import('./construction/ConcreteSlabCalculator').then(mod => mod.ConcreteSlabCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'concrete-block-calculator': {
    id: 'concrete-block-calculator',
    component: dynamic(() => import('./construction/ConcreteBlockCalculator').then(mod => mod.ConcreteBlockCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'concrete-bag-calculator': {
    id: 'concrete-bag-calculator',
    component: dynamic(() => import('./construction/ConcreteBagCalculator').then(mod => mod.ConcreteBagCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'concrete-volume-calculator': {
    id: 'concrete-volume-calculator',
    component: dynamic(() => import('./construction/ConcreteVolumeCalculator').then(mod => mod.ConcreteVolumeCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'gravel-calculator': {
    id: 'gravel-calculator',
    component: dynamic(() => import('./construction/GravelCalculator').then(mod => mod.GravelCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'pea-gravel-calculator': {
    id: 'pea-gravel-calculator',
    component: dynamic(() => import('./construction/PeaGravelCalculator').then(mod => mod.PeaGravelCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'asphalt-calculator': {
    id: 'asphalt-calculator',
    component: dynamic(() => import('./construction/AsphaltCalculator').then(mod => mod.AsphaltCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'sand-calculator': {
    id: 'sand-calculator',
    component: dynamic(() => import('./construction/SandCalculator').then(mod => mod.SandCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'mulch-calculator': {
    id: 'mulch-calculator',
    component: dynamic(() => import('./construction/MulchCalculator').then(mod => mod.MulchCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'topsoil-calculator': {
    id: 'topsoil-calculator',
    component: dynamic(() => import('./construction/TopsoilCalculator').then(mod => mod.TopsoilCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'fill-dirt-calculator': {
    id: 'fill-dirt-calculator',
    component: dynamic(() => import('./construction/FillDirtCalculator').then(mod => mod.FillDirtCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'crushed-stone-calculator': {
    id: 'crushed-stone-calculator',
    component: dynamic(() => import('./construction/CrushedStoneCalculator').then(mod => mod.CrushedStoneCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'deck-material-calculator': {
    id: 'deck-material-calculator',
    component: dynamic(() => import('./construction/DeckMaterialCalculator').then(mod => mod.DeckMaterialCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'fence-calculator': {
    id: 'fence-calculator',
    component: dynamic(() => import('./construction/FenceCalculator').then(mod => mod.FenceCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'fence-post-calculator': {
    id: 'fence-post-calculator',
    component: dynamic(() => import('./construction/FencePostCalculator').then(mod => mod.FencePostCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'fence-cost-calculator': {
    id: 'fence-cost-calculator',
    component: dynamic(() => import('./construction/FenceCostCalculator').then(mod => mod.FenceCostCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'roofing-calculator': {
    id: 'roofing-calculator',
    component: dynamic(() => import('./construction/RoofingCalculator').then(mod => mod.RoofingCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'roof-pitch-calculator': {
    id: 'roof-pitch-calculator',
    component: dynamic(() => import('./construction/RoofPitchCalculator').then(mod => mod.RoofPitchCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'roof-slope-calculator': {
    id: 'roof-slope-calculator',
    component: dynamic(() => import('./construction/RoofSlopeCalculator').then(mod => mod.RoofSlopeCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'roof-shingle-calculator': {
    id: 'roof-shingle-calculator',
    component: dynamic(() => import('./construction/RoofShingleCalculator').then(mod => mod.RoofShingleCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'drywall-calculator': {
    id: 'drywall-calculator',
    component: dynamic(() => import('./construction/DrywallCalculator').then(mod => mod.DrywallCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'paint-calculator': {
    id: 'paint-calculator',
    component: dynamic(() => import('./construction/PaintCalculator').then(mod => mod.PaintCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'tile-calculator': {
    id: 'tile-calculator',
    component: dynamic(() => import('./construction/TileCalculator').then(mod => mod.TileCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'insulation-calculator': {
    id: 'insulation-calculator',
    component: dynamic(() => import('./home-improvement/InsulationCalculator').then(mod => mod.InsulationCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'stair-calculator': {
    id: 'stair-calculator',
    component: dynamic(() => import('./home-improvement/StairCalculator').then(mod => mod.StairCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'brick-calculator': {
    id: 'brick-calculator',
    component: dynamic(() => import('./construction/BrickCalculator').then(mod => mod.BrickCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'window-replacement-cost-calculator': {
    id: 'window-replacement-cost-calculator',
    component: dynamic(() => import('./home-improvement/WindowCalculator').then(mod => mod.WindowCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'home-addition-cost-calculator': {
    id: 'home-addition-cost-calculator',
    component: dynamic(() => import('./home-improvement/HomeAdditionCalculator').then(mod => mod.HomeAdditionCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'time-and-half-calculator': {
    id: 'time-and-half-calculator',
    component: dynamic(() => import('./salary-tax/TimeAndHalfCalculator').then(mod => mod.TimeAndHalfCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'inflation-calculator': {
    id: 'inflation-calculator',
    component: dynamic(() => import('./utility/InflationCalculator').then(mod => mod.InflationCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  // ===== NEW HIGH-VOLUME CALCULATORS =====
  'percentage-calculator': {
    id: 'percentage-calculator',
    component: dynamic(() => import('./utility/PercentageCalculator').then(mod => mod.PercentageCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'age-calculator': {
    id: 'age-calculator',
    component: dynamic(() => import('./utility/AgeCalculator').then(mod => mod.AgeCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'gpa-calculator': {
    id: 'gpa-calculator',
    component: dynamic(() => import('./utility/GPACalculator').then(mod => mod.GPACalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'auto-loan-calculator': {
    id: 'auto-loan-calculator',
    component: dynamic(() => import('./finance/AutoLoanCalculator').then(mod => mod.AutoLoanCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'tax-calculator-2025': {
    id: 'tax-calculator-2025',
    component: dynamic(() => import('./salary-tax/TaxCalculator2025').then(mod => mod.TaxCalculator2025), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  'tip-calculator': {
    id: 'tip-calculator',
    component: dynamic(() => import('./utility/TipCalculator').then(mod => mod.TipCalculator), {
      loading: () => <div className="p-12 text-center text-secondary-500 animate-pulse bg-card rounded-xl border border-border">Loading calculator interface...</div>,
      ssr: true,
    }),
  },
  // Future calculators will be registered here
};

export function getCalculatorComponent(slug: string) {
  return CALCULATOR_REGISTRY[slug]?.component || null;
}

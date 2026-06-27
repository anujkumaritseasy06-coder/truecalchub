"use client";
import React, { useState, useMemo } from "react";

function calculateAge(birthDate: Date, refDate: Date) {
  const now = refDate;
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalMs = now.getTime() - birthDate.getTime();
  const totalDays = Math.floor(totalMs / msPerDay);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(totalMs / (1000 * 60));
  const totalMonths = years * 12 + months;

  // Days until next birthday
  const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday <= now) {
    nextBirthday.setFullYear(now.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / msPerDay);

  // Day of week born
  const days_of_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const birthDayOfWeek = days_of_week[birthDate.getDay()];

  return {
    years, months, days,
    totalDays, totalWeeks, totalHours, totalMinutes, totalMonths,
    daysUntilBirthday,
    birthDayOfWeek,
  };
}

const today = new Date().toISOString().split("T")[0];

export function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [refDate, setRefDate] = useState(today);

  const result = useMemo(() => {
    if (!dob) return null;
    const birth = new Date(dob);
    const ref = new Date(refDate || today);
    if (isNaN(birth.getTime()) || isNaN(ref.getTime())) return null;
    if (birth > ref) return null;
    return calculateAge(birth, ref);
  }, [dob, refDate]);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6">
        <h2 className="text-white font-bold text-xl mb-1">Age Calculator</h2>
        <p className="text-white/80 text-sm">Calculate exact age in years, months, days, and more</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={today}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Age At Date (optional)</label>
            <input
              type="date"
              value={refDate}
              onChange={(e) => setRefDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>
        </div>

        {result ? (
          <>
            {/* Primary Age Result */}
            <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border border-violet-200 dark:border-violet-800 p-6 text-center">
              <p className="text-sm font-medium text-secondary-500 mb-2">Your Age</p>
              <p className="text-5xl font-black text-violet-600 dark:text-violet-400">
                {result.years}
                <span className="text-xl font-bold"> yr</span>
                {" "}{result.months}
                <span className="text-xl font-bold"> mo</span>
                {" "}{result.days}
                <span className="text-xl font-bold"> d</span>
              </p>
              <p className="text-sm text-secondary-500 mt-2">You were born on a <strong className="text-foreground">{result.birthDayOfWeek}</strong></p>
            </div>

            {/* Detail Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Total Months", value: result.totalMonths.toLocaleString(), icon: "📅" },
                { label: "Total Weeks", value: result.totalWeeks.toLocaleString(), icon: "🗓️" },
                { label: "Total Days", value: result.totalDays.toLocaleString(), icon: "☀️" },
                { label: "Total Hours", value: result.totalHours.toLocaleString(), icon: "⏰" },
                { label: "Total Minutes", value: result.totalMinutes.toLocaleString(), icon: "⏱️" },
                { label: "Days to Birthday 🎂", value: result.daysUntilBirthday === 0 ? "TODAY! 🎉" : result.daysUntilBirthday.toLocaleString(), icon: "🎁" },
              ].map((stat) => (
                <div key={stat.label} className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-3 text-center border border-border">
                  <p className="text-xl mb-1">{stat.icon}</p>
                  <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{stat.value}</p>
                  <p className="text-xs text-secondary-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-border p-8 text-center">
            <p className="text-4xl mb-3">🎂</p>
            <p className="text-secondary-500">Enter your date of birth to calculate your exact age</p>
          </div>
        )}
      </div>
    </div>
  );
}

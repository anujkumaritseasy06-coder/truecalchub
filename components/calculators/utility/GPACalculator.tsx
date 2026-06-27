"use client";
import React, { useState, useCallback } from "react";

interface Course {
  id: number;
  name: string;
  grade: string;
  credits: string;
  isWeighted: boolean;
}

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

const WEIGHTED_BONUS: Record<string, number> = {
  "A+": 1.0, "A": 1.0, "A-": 1.0,
  "B+": 1.0, "B": 1.0, "B-": 1.0,
  "C+": 1.0, "C": 1.0, "C-": 1.0,
  "D+": 0, "D": 0, "D-": 0, "F": 0,
};

function getLetterGrade(gpa: number): string {
  if (gpa >= 3.7) return "A";
  if (gpa >= 3.3) return "B+";
  if (gpa >= 3.0) return "B";
  if (gpa >= 2.7) return "B-";
  if (gpa >= 2.3) return "C+";
  if (gpa >= 2.0) return "C";
  if (gpa >= 1.7) return "C-";
  if (gpa >= 1.3) return "D+";
  if (gpa >= 1.0) return "D";
  return "F";
}

function getHonors(gpa: number): string {
  if (gpa >= 3.9) return "Summa Cum Laude";
  if (gpa >= 3.7) return "Magna Cum Laude";
  if (gpa >= 3.5) return "Cum Laude";
  if (gpa >= 3.0) return "Good Standing";
  if (gpa >= 2.0) return "Satisfactory";
  return "Academic Probation Risk";
}

let nextId = 4;

export function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "Course 1", grade: "A", credits: "3", isWeighted: false },
    { id: 2, name: "Course 2", grade: "B+", credits: "4", isWeighted: false },
    { id: 3, name: "Course 3", grade: "A-", credits: "3", isWeighted: false },
  ]);

  const addCourse = useCallback(() => {
    setCourses(prev => [...prev, { id: nextId++, name: `Course ${nextId - 1}`, grade: "A", credits: "3", isWeighted: false }]);
  }, []);

  const removeCourse = useCallback((id: number) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCourse = useCallback((id: number, field: keyof Course, value: string | boolean) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }, []);

  const { gpa, weightedGpa, totalCredits, totalPoints } = React.useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    let totalWeightedPoints = 0;

    for (const course of courses) {
      const credits = parseFloat(course.credits);
      const gp = GRADE_POINTS[course.grade] ?? 0;
      const bonus = course.isWeighted ? (WEIGHTED_BONUS[course.grade] ?? 0) : 0;
      if (!isNaN(credits) && credits > 0) {
        totalPoints += gp * credits;
        totalWeightedPoints += (gp + bonus) * credits;
        totalCredits += credits;
      }
    }

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const weightedGpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
    return { gpa, weightedGpa, totalCredits, totalPoints };
  }, [courses]);

  const gpaColor = gpa >= 3.5 ? "text-emerald-600 dark:text-emerald-400"
    : gpa >= 3.0 ? "text-primary-600 dark:text-primary-400"
    : gpa >= 2.0 ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  const hasWeighted = courses.some(c => c.isWeighted);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
        <h2 className="text-white font-bold text-xl mb-1">GPA Calculator</h2>
        <p className="text-white/80 text-sm">Add your courses, grades, and credit hours</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Course rows */}
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-secondary-500 px-1 hidden sm:grid">
            <div className="col-span-4">Course Name</div>
            <div className="col-span-3">Letter Grade</div>
            <div className="col-span-2">Credits</div>
            <div className="col-span-2">AP/Honors?</div>
            <div className="col-span-1"></div>
          </div>

          {courses.map((course) => (
            <div key={course.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                value={course.name}
                onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                className="col-span-4 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                placeholder="Course name"
              />
              <select
                value={course.grade}
                onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                className="col-span-3 rounded-lg border border-border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              >
                {Object.keys(GRADE_POINTS).map(g => (
                  <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(1)})</option>
                ))}
              </select>
              <input
                type="number"
                value={course.credits}
                onChange={(e) => updateCourse(course.id, "credits", e.target.value)}
                min="0.5"
                max="6"
                step="0.5"
                className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
              <div className="col-span-2 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={course.isWeighted}
                  onChange={(e) => updateCourse(course.id, "isWeighted", e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                  title="Weighted (AP/IB/Honors adds 1.0)"
                />
              </div>
              <button
                onClick={() => removeCourse(course.id)}
                className="col-span-1 text-secondary-400 hover:text-red-500 transition text-lg font-bold"
                aria-label="Remove course"
              >×</button>
            </div>
          ))}
        </div>

        <button
          onClick={addCourse}
          className="w-full rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 py-2.5 text-sm font-semibold hover:bg-amber-50 dark:hover:bg-amber-950 transition"
        >
          + Add Course
        </button>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800 p-5 text-center">
            <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-1">Unweighted GPA</p>
            <p className={`text-5xl font-black ${gpaColor}`}>{totalCredits > 0 ? gpa.toFixed(2) : "—"}</p>
            {totalCredits > 0 && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{getHonors(gpa)}</p>
            )}
          </div>
          {hasWeighted && (
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border border-purple-200 dark:border-purple-800 p-5 text-center">
              <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-1">Weighted GPA</p>
              <p className="text-5xl font-black text-purple-600 dark:text-purple-400">{weightedGpa.toFixed(2)}</p>
              <p className="text-xs text-secondary-500 mt-1">AP/Honors +1.0 bonus</p>
            </div>
          )}
        </div>

        <div className="flex justify-between text-sm text-secondary-500 border-t border-border pt-3">
          <span>Total Credit Hours: <strong className="text-foreground">{totalCredits}</strong></span>
          <span>Quality Points: <strong className="text-foreground">{totalPoints.toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
}

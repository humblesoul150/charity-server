const STAGES = new Set([
  "kindergarten",
  "primary",
  "secondary-o",
  "secondary-a",
  "vocational",
  "university",
]);

const MONTHS_PER_YEAR = 12;

function normalizeStage(value = "") {
  const normalized = String(value).trim().toLowerCase();
  const aliases = {
    nursery: "kindergarten",
    elementary: "primary",
    secondary: "secondary-o",
    "o-level": "secondary-o",
    "a-level": "secondary-a",
    college: "university",
    tertiary: "university",
  };
  const stage = aliases[normalized] || normalized;
  return STAGES.has(stage) ? stage : "";
}

function parseClassNumber(value = "") {
  const match = String(value).trim().toLowerCase().match(/(?:p|primary|s|senior)\s*-?(\d+)/);
  return match ? Number(match[1]) : null;
}

function getStageAndCompletedMonths(education) {
  const stage = normalizeStage(education.educationStage || education.currentLevel);
  const classValue = education.currentClass || education.classGrade || "";
  const classNumber = parseClassNumber(classValue);
  const resolvedStage = stage === "secondary-o" && classNumber >= 5
    ? "secondary-a"
    : stage;

  if (resolvedStage === "kindergarten") {
    const kindergartenClass = String(classValue).toLowerCase();
    const completedYears = kindergartenClass.includes("top")
      ? 2
      : kindergartenClass.includes("middle")
        ? 1
        : 0;
    return { stage: resolvedStage, completedMonths: completedYears * MONTHS_PER_YEAR };
  }

  if (resolvedStage === "primary" && classNumber >= 1 && classNumber <= 7) {
    return { stage: resolvedStage, completedMonths: (classNumber - 1) * MONTHS_PER_YEAR };
  }

  if (resolvedStage === "secondary-o" && classNumber >= 1 && classNumber <= 4) {
    return { stage: resolvedStage, completedMonths: (classNumber - 1) * MONTHS_PER_YEAR };
  }

  if (resolvedStage === "secondary-a" && classNumber >= 5 && classNumber <= 6) {
    return { stage: resolvedStage, completedMonths: (classNumber - 5) * MONTHS_PER_YEAR };
  }

  if (resolvedStage === "vocational" || resolvedStage === "university") {
    if (!String(education.courseName || "").trim()) return null;
    const durationValue = Number(education.courseDurationValue);
    const durationUnit = education.courseDurationUnit;
    if (!Number.isFinite(durationValue) || durationValue <= 0) return null;
    if (durationUnit !== "months" && durationUnit !== "years") return null;

    return {
      stage: resolvedStage,
      completedMonths: 0,
      durationMonths: Math.round(durationUnit === "years" ? durationValue * MONTHS_PER_YEAR : durationValue),
    };
  }

  return null;
}

function addMonths(date, months) {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, lastDay));
  return result;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function calculateGraduation(education = {}) {
  if (!education.isStudying) return null;

  const startDate = new Date(education.enrollmentDate);
  if (!education.enrollmentDate || Number.isNaN(startDate.getTime())) return null;

  const details = getStageAndCompletedMonths(education);
  if (!details) return null;

  const totalMonths = details.durationMonths || (
    details.stage === "kindergarten" ? 3 * MONTHS_PER_YEAR
      : details.stage === "primary" ? 7 * MONTHS_PER_YEAR
        : details.stage === "secondary-o" ? 4 * MONTHS_PER_YEAR
          : details.stage === "secondary-a" ? 2 * MONTHS_PER_YEAR
            : 0
  );
  const remainingMonths = Math.max(0, totalMonths - details.completedMonths);
  const expectedGraduationDate = addMonths(startDate, remainingMonths);
  const graduationStage = details.stage === "kindergarten"
    ? "kindergarten-to-primary"
    : details.stage === "primary"
      ? "primary-to-secondary"
      : details.stage === "secondary-o" || details.stage === "secondary-a"
        ? "secondary-to-tertiary"
        : "tertiary-completion";

  return {
    expectedGraduationDate: formatDate(expectedGraduationDate),
    expectedGraduationYear: String(expectedGraduationDate.getUTCFullYear()),
    graduationStage,
  };
}

module.exports = {
  calculateGraduation,
  normalizeStage,
};

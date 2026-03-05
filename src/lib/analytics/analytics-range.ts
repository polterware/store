import type {
  AnalyticsRange,
  AnalyticsRangeKey,
  AnalyticsRangeOption,
} from "@/types/analytics";

export const DEFAULT_ANALYTICS_RANGE: AnalyticsRangeKey = "30d";
export const DEFAULT_ANALYTICS_TIMEZONE = "America/Sao_Paulo";

const RANGE_DAYS: Record<Exclude<AnalyticsRangeKey, "all">, number> = {
  "7d": 6,
  "30d": 29,
  "90d": 89,
};

const RANGE_LABELS: Record<AnalyticsRangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

export const ANALYTICS_RANGE_OPTIONS: Array<AnalyticsRangeOption> = [
  { key: "7d", label: RANGE_LABELS["7d"] },
  { key: "30d", label: RANGE_LABELS["30d"] },
  { key: "90d", label: RANGE_LABELS["90d"] },
  { key: "all", label: RANGE_LABELS.all },
];

function formatDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subtractDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() - days);
  return next;
}

export function resolveAnalyticsRange(
  key: AnalyticsRangeKey,
  timezone = DEFAULT_ANALYTICS_TIMEZONE,
): AnalyticsRange {
  const safeTimezone =
    timezone.trim().length > 0 ? timezone : DEFAULT_ANALYTICS_TIMEZONE;

  if (key === "all") {
    return {
      key,
      startDate: null,
      endDate: null,
      bucket: "month",
      timezone: safeTimezone,
      label: RANGE_LABELS[key],
    };
  }

  const end = new Date();
  const start = subtractDays(end, RANGE_DAYS[key]);

  return {
    key,
    startDate: formatDate(start),
    endDate: formatDate(end),
    bucket: "day",
    timezone: safeTimezone,
    label: RANGE_LABELS[key],
  };
}

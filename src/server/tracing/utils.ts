import { trace, context } from "@opentelemetry/api";

export const JOKES_APP_TRACER_NAME = "jokes-app";

export function getActiveTraceId() {
  const activeSpan = trace.getSpan(context.active());
  if (activeSpan) {
    return activeSpan.spanContext().traceId;
  }
  return null;
}

import { env } from "~/env";

export function getTraceLink(traceId: string) {
  if (env.NODE_ENV === "development") {
    let res = `https://app.axiom.co/${env.AXIOM_ORG_NAME}/trace?traceId=${traceId}`;
    const traceDataset = process.env.AXIOM_DATASET;
    if (traceDataset) {
      res += `&traceDataset=${traceDataset}`;
    }
    return res;
  }

  return `TRACE CONFIG MISSING - ${traceId}`;
}

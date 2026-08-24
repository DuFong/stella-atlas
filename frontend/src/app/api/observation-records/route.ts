import {
  createServerObservationRecord,
  getServerObservationRecords,
} from "@/features/record/api/server-observation-records";
import type { CreateServerObservationRecord } from "@/features/record/types/server-observation-record";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const result = await getServerObservationRecords(cookieHeader(request));
  return result.ok ? NextResponse.json(result.data) : errorResponse(result.status);
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(400);
  }
  if (!isCreateRecord(payload)) {
    return errorResponse(400);
  }
  const result = await createServerObservationRecord(cookieHeader(request), payload);
  return result.ok
    ? NextResponse.json(result.data, { status: 201 })
    : errorResponse(result.status);
}

function cookieHeader(request: NextRequest): string {
  return request.headers.get("cookie") ?? "";
}

function isCreateRecord(payload: unknown): payload is CreateServerObservationRecord {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const record = payload as Partial<CreateServerObservationRecord>;
  return (
    typeof record.observedAt === "string" &&
    typeof record.timezone === "string" &&
    (record.latitude === undefined || typeof record.latitude === "number") &&
    (record.longitude === undefined || typeof record.longitude === "number") &&
    typeof record.comment === "string"
  );
}

function errorResponse(status: number) {
  return NextResponse.json({ code: "OBSERVATION_RECORD_REQUEST_FAILED" }, { status });
}

import { deleteServerObservationRecord } from "@/features/record/api/server-observation-records";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await deleteServerObservationRecord(
    request.headers.get("cookie") ?? "",
    id,
  );
  return result.ok
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(
        { code: "OBSERVATION_RECORD_REQUEST_FAILED" },
        { status: result.status },
      );
}

import { cookies } from "next/headers";
import { getAuthSession } from "@/features/auth/api/get-auth-session";
import type { AuthSession } from "@/features/auth/types/auth";
import { getFavoriteLocations } from "@/features/location/api/favorite-locations";
import { getRecentLocations } from "@/features/location/api/recent-locations";
import { getObservation } from "@/features/observation/api/get-observation";
import { HomeContent } from "@/features/observation/components/home-content";
import type {
  ObservationQuery,
} from "@/features/observation/types/observation";

type HomeSearchParams = Promise<{
  latitude?: string | string[];
  longitude?: string | string[];
  date?: string | string[];
  auth?: string | string[];
  rememberLocation?: string | string[];
}>;

export default async function Home({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const params = await searchParams;
  const query = toQuery(params);
  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const authEnabled = process.env.AUTH_ENABLED === "true";
  const session = authEnabled
    ? await getAuthSession(cookieHeader)
    : ({ status: "disabled" } satisfies AuthSession);
  const rememberLocation = firstValue(params.rememberLocation) === "true";
  const observationPromise = isCompleteQuery(query)
    ? getObservation(query, cookieHeader, rememberLocation)
    : Promise.resolve(undefined);
  const favoritePromise = session.status === "authenticated"
    ? getFavoriteLocations(cookieHeader)
    : Promise.resolve(undefined);
  const result = await observationPromise;
  const [favoriteResult, recentResult] = await Promise.all([
    favoritePromise,
    session.status === "authenticated"
      ? getRecentLocations(cookieHeader)
      : undefined,
  ]);

  return (
    <HomeContent
      query={query}
      result={result}
      session={session}
      favoriteLocations={favoriteResult?.ok ? favoriteResult.data : []}
      recentLocations={recentResult?.ok ? recentResult.data : []}
      rememberLocation={rememberLocation}
      authNotice={toAuthNotice(firstValue(params.auth))}
    />
  );
}

function toQuery(params: Awaited<HomeSearchParams>): ObservationQuery {
  return {
    latitude: firstValue(params.latitude) ?? "",
    longitude: firstValue(params.longitude) ?? "",
    date: firstValue(params.date) ?? currentDate(),
  };
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function isCompleteQuery(query: ObservationQuery): boolean {
  return Boolean(query.latitude && query.longitude && query.date);
}

function toAuthNotice(
  value: string | undefined,
): "logout-error" | "oauth-pending" | undefined {
  return value === "logout-error" || value === "oauth-pending"
    ? value
    : undefined;
}

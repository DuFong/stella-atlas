export type CurrentUser = {
  name: string | null;
  email: string | null;
  pictureUrl: string | null;
};

export type AuthSession =
  | { status: "authenticated"; user: CurrentUser }
  | { status: "anonymous" }
  | { status: "disabled" }
  | { status: "unavailable" };

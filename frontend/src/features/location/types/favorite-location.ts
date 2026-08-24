export type FavoriteLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  createdAt: string;
};

export type CreateFavoriteLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

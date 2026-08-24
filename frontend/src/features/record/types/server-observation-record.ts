export type ServerObservationRecord = {
  id: string;
  observedAt: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  comment: string;
  hashtags: string[];
  mediaStatus: "NOT_ATTACHED";
  createdAt: string;
};

export type CreateServerObservationRecord = {
  observedAt: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  comment: string;
};

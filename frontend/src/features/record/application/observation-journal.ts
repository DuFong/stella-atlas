import type {
  ObservationPost,
  SaveObservationPost,
} from "@/features/record/domain/observation-post";

export interface ObservationPostRepository {
  list(): Promise<ObservationPost[]>;
  save(input: SaveObservationPost): Promise<ObservationPost>;
  delete(id: string): Promise<void>;
}

export interface MediaStore {
  get(imageId: string): Promise<Blob | undefined>;
}

export type ObservationJournalPort = ObservationPostRepository & MediaStore;

export class JournalStorageError extends Error {
  constructor(
    readonly reason: "unsupported" | "quota" | "unavailable",
    options?: ErrorOptions,
  ) {
    super(reason, options);
    this.name = "JournalStorageError";
  }
}

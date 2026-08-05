import {
  JournalStorageError,
  type ObservationJournalPort,
} from "@/features/record/application/observation-journal";
import {
  LOCAL_POST_SCHEMA_VERSION,
  extractHashtags,
  type ObservationPost,
  type SaveObservationPost,
} from "@/features/record/domain/observation-post";

const DATABASE_NAME = "stella-atlas-journal";
const DATABASE_VERSION = 1;
const POST_STORE = "posts";
const MEDIA_STORE = "media";

type StoredMedia = { id: string; blob: Blob };

export class IndexedDbObservationJournal implements ObservationJournalPort {
  constructor(
    private readonly databaseFactory: IDBFactory = globalThis.indexedDB,
    private readonly now: () => Date = () => new Date(),
    private readonly createId: () => string = () => crypto.randomUUID(),
  ) {}

  async list(): Promise<ObservationPost[]> {
    const database = await this.openDatabase();
    const transaction = database.transaction(POST_STORE, "readonly");
    const completion = transactionComplete(transaction);
    try {
      const posts = await requestResult<ObservationPost[]>(
        transaction.objectStore(POST_STORE).getAll(),
      );
      await completion;
      return posts.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    } catch (error) {
      await completion.catch(() => undefined);
      throw mapStorageError(error);
    } finally {
      database.close();
    }
  }

  async get(imageId: string): Promise<Blob | undefined> {
    const database = await this.openDatabase();
    const transaction = database.transaction(MEDIA_STORE, "readonly");
    const completion = transactionComplete(transaction);
    try {
      const media = await requestResult<StoredMedia | undefined>(
        transaction.objectStore(MEDIA_STORE).get(imageId),
      );
      await completion;
      return media?.blob;
    } catch (error) {
      await completion.catch(() => undefined);
      throw mapStorageError(error);
    } finally {
      database.close();
    }
  }

  async save(input: SaveObservationPost): Promise<ObservationPost> {
    const database = await this.openDatabase();
    const transaction = database.transaction([POST_STORE, MEDIA_STORE], "readwrite");
    const completion = transactionComplete(transaction);
    try {
      const postStore = transaction.objectStore(POST_STORE);
      const mediaStore = transaction.objectStore(MEDIA_STORE);
      const id = input.id ?? this.createId();
      const existing = await requestResult<ObservationPost | undefined>(postStore.get(id));
      const imageId = existing?.image.id ?? this.createId();

      if (!existing && !input.image) {
        throw new Error("A new observation post requires an image.");
      }

      if (input.image) {
        await requestResult(mediaStore.put({ id: imageId, blob: input.image.blob }));
      }

      const timestamp = this.now().toISOString();
      const post: ObservationPost = {
        id,
        image: input.image
          ? {
              id: imageId,
              name: input.image.name,
              type: input.image.blob.type,
              size: input.image.blob.size,
            }
          : existing!.image,
        capturedAt: input.capturedAt,
        timeZone: input.timeZone,
        latitude: input.latitude,
        longitude: input.longitude,
        comment: input.comment,
        hashtags: extractHashtags(input.comment),
        sources: input.sources,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
        schemaVersion: LOCAL_POST_SCHEMA_VERSION,
      };
      await requestResult(postStore.put(post));
      await completion;
      return post;
    } catch (error) {
      abortIfActive(transaction);
      await completion.catch(() => undefined);
      throw mapStorageError(error);
    } finally {
      database.close();
    }
  }

  async delete(id: string): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction([POST_STORE, MEDIA_STORE], "readwrite");
    const completion = transactionComplete(transaction);
    try {
      const postStore = transaction.objectStore(POST_STORE);
      const post = await requestResult<ObservationPost | undefined>(postStore.get(id));
      if (post) {
        await requestResult(transaction.objectStore(MEDIA_STORE).delete(post.image.id));
        await requestResult(postStore.delete(id));
      }
      await completion;
    } catch (error) {
      abortIfActive(transaction);
      await completion.catch(() => undefined);
      throw mapStorageError(error);
    } finally {
      database.close();
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (!this.databaseFactory) {
      return Promise.reject(new JournalStorageError("unsupported"));
    }
    return new Promise((resolve, reject) => {
      const request = this.databaseFactory.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(POST_STORE)) {
          database.createObjectStore(POST_STORE, { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains(MEDIA_STORE)) {
          database.createObjectStore(MEDIA_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(mapStorageError(request.error));
      request.onblocked = () => reject(new JournalStorageError("unavailable"));
    });
  }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function abortIfActive(transaction: IDBTransaction): void {
  try {
    transaction.abort();
  } catch {
    // The browser may already have aborted or completed the transaction.
  }
}

function mapStorageError(error: unknown): Error {
  if (error instanceof JournalStorageError) {
    return error;
  }
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return new JournalStorageError("quota", { cause: error });
  }
  return new JournalStorageError("unavailable", { cause: error });
}

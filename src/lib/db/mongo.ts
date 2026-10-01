import 'server-only';
import { setDefaultResultOrder } from 'node:dns';
import net from 'node:net';
import { MongoClient, type Db } from 'mongodb';

setDefaultResultOrder('ipv4first');
(
  net as { setDefaultAutoSelectFamily?: (value: boolean) => void }
).setDefaultAutoSelectFamily?.(false);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'bksr';

declare global {
  // eslint-disable-next-line no-var
  var __bksrMongoClientPromise: Promise<MongoClient> | undefined;
}

/** Drop a connection cached by an older module instance after a failed DNS lookup. */
global.__bksrMongoClientPromise = undefined;

function createClient(): MongoClient {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  return new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    family: 4,
  });
}

function connectClient(): Promise<MongoClient> {
  const connecting = createClient()
    .connect()
    .catch((error: unknown) => {
      if (global.__bksrMongoClientPromise === connecting) {
        global.__bksrMongoClientPromise = undefined;
      }
      throw error;
    });
  return connecting;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global.__bksrMongoClientPromise) {
      global.__bksrMongoClientPromise = connectClient();
    }
    return global.__bksrMongoClientPromise;
  }

  if (!global.__bksrMongoClientPromise) {
    global.__bksrMongoClientPromise = connectClient();
  }
  return global.__bksrMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(dbName);
}

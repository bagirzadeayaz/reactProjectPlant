import { AppError } from '../../domain/errors.js';

export const encodeValue = (value) => {
  if (value === null) return { nullValue: null };
  if (Buffer.isBuffer(value)) return { bytesValue: value.toString('base64') };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'object') return { mapValue: { fields: encodeFields(value) } };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  throw new TypeError('Unsupported Firestore value');
};

export const encodeFields = (data) =>
  Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]));

export const decodeValue = (value) => {
  if ('nullValue' in value) return null;
  if ('bytesValue' in value) return Buffer.from(value.bytesValue, 'base64');
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields ?? {});
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  throw new TypeError('Unsupported Firestore response value');
};

export const decodeFields = (fields) =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));

export class FirestoreRest {
  constructor({ projectId, databaseId = '(default)', fetchImpl = fetch }) {
    if (!projectId) throw new TypeError('Firestore projectId is required');
    this.resource = `projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(databaseId)}/documents`;
    this.root = `https://firestore.googleapis.com/v1/${this.resource}`;
    this.fetchImpl = fetchImpl;
  }

  name(collection, id) {
    return `${this.resource}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`;
  }

  async request(path, { method = 'GET', token, body, query, missingOkay = false } = {}) {
    const url = new URL(`${this.root}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
    const response = await this.fetchImpl(url, {
      method,
      signal: AbortSignal.timeout(15_000),
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (response.status === 404 && missingOkay) return null;
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      if (response.status === 403)
        throw new AppError(
          'UNAVAILABLE',
          'Firestore access denied. Publish the project security rules.',
        );
      if (
        response.status === 409 ||
        response.status === 412 ||
        error?.error?.status === 'FAILED_PRECONDITION'
      )
        throw new AppError('CONFLICT', 'Firestore document conflict');
      throw new AppError('UPSTREAM', `Firestore request failed (${response.status})`);
    }
    return response.json();
  }

  async get(collection, id, token) {
    const document = await this.request(
      `/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
      {
        token,
        missingOkay: true,
      },
    );
    return document ? this.fromDocument(document) : null;
  }

  async list(collection, token) {
    const documents = [];
    let pageToken;
    do {
      const page = await this.request(`/${encodeURIComponent(collection)}`, {
        token,
        query: { pageSize: '100', ...(pageToken ? { pageToken } : {}) },
      });
      documents.push(...(page.documents ?? []).map((document) => this.fromDocument(document)));
      pageToken = page.nextPageToken;
    } while (pageToken);
    return documents;
  }

  async create(collection, id, data, token) {
    return this.request(`/${encodeURIComponent(collection)}`, {
      method: 'POST',
      token,
      query: { documentId: id },
      body: { fields: encodeFields(data) },
    });
  }

  fromDocument(document) {
    return {
      id: decodeURIComponent(document.name.split('/').at(-1)),
      data: decodeFields(document.fields ?? {}),
      updateTime: document.updateTime,
    };
  }

  updateWrite(collection, id, data, precondition = { exists: false }) {
    return {
      update: { name: this.name(collection, id), fields: encodeFields(data) },
      currentDocument: precondition,
    };
  }

  deleteWrite(collection, id, precondition) {
    return { delete: this.name(collection, id), currentDocument: precondition };
  }

  async commit(writes, token) {
    if (!token) throw new AppError('UNAUTHENTICATED', 'Sign in required');
    return this.request(':commit', { method: 'POST', token, body: { writes } });
  }
}

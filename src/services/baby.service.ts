// ─────────────────────────────────────────────
//  LULLABY — Baby Service
//
//  Endpoint: /api/children
//  All requests require Bearer token (handled
//  by apiRequest automatically)
//
//  addBaby uses multipart/form-data because
//  the avatar is an image file.
//  All other endpoints use JSON.
//
//  USE_MOCK = true  → offline dev
//  USE_MOCK = false → real backend
// ─────────────────────────────────────────────

import { apiRequest, tokenStorage, BASE_URL, ENDPOINTS } from './api';
import { getLocale } from '../store/localeStore';
import { MOCK_BABIES, mockDelay }  from '../constants/mockData';
import { Baby, AddBabyPayload }    from '../types';

const USE_MOCK = false;

// ── Backend error message mapper ─────────────
// Backend returns Arabic validation messages —
// we map them to clean English for the UI
const mapBackendError = (raw: string): string => {
  const msg = raw.toLowerCase();
  if (msg.includes('name'))       return 'Name must be between 3 and 20 characters';
  if (msg.includes('date') || msg.includes('birth')) return 'Please enter a valid date of birth';
  if (msg.includes('gender'))     return 'Please select a gender';
  if (msg.includes('height'))     return 'Please enter a valid height';
  if (msg.includes('weight') || msg.includes('wight')) return 'Please enter a valid weight';
  if (msg.includes('blood'))      return 'Please enter a valid blood type';
  if (msg.includes('avatar') || msg.includes('image')) return 'Please upload a valid image';
  if (msg.includes('unauthorized') || msg.includes('401')) return 'Session expired. Please log in again.';
  return raw; // fallback — show original if unknown
};




// ── Normalize baby from backend response ─────
// Maps backend field names to our app's shape
const normalizeBaby = (raw: any): Baby => ({
  ...raw,
  id:         raw.id   ?? raw._id,
  _id:        raw._id  ?? raw.id,
  identity:   raw.identity,
  name:       raw.name,
  gender:     raw.gender,
  dateBirth:  raw.dateBirth,
  height:     raw.height    ?? undefined,
  weight:     raw.weight    ?? raw.wight  ?? undefined,  // GET=weight, normalise both
  wight:      raw.wight     ?? raw.weight ?? undefined,  // keep for PATCH payload
  bloodType:  raw.bloodType ?? undefined,
  avatar:     raw.avatar    ?? undefined,
  predictions: raw.predictions ?? [],
  createdAt:  raw.createdAt,
  updatedAt:  raw.updatedAt,
});

export const babyService = {

  // ── GET ALL BABIES ────────────────────────
  // GET /api/children
  // Response: { success, data: Baby | Baby[] }
  // Backend returns single object when user has one child,
  // we always normalize to array for consistency
  getBabies: async (): Promise<Baby[]> => {
    if (USE_MOCK) { await mockDelay(500); return MOCK_BABIES; }

    const res = await apiRequest<Baby | Baby[]>(ENDPOINTS.BABIES);

    // Normalize: backend may return object, array, or empty {}
    const raw = res.data;
    const list: any[] = Array.isArray(raw) ? raw : (raw && typeof raw === 'object') ? [raw] : [];

    // Filter out empty objects (backend returns {} when no baby exists)
    const valid = list.filter(b => b?.id || b?._id);

    return valid.map(normalizeBaby);
  },

  // ── GET BABY BY ID ────────────────────────
  // GET /api/children/:id
  getBabyById: async (id: string): Promise<Baby> => {
    if (USE_MOCK) {
      await mockDelay(400);
      const baby = MOCK_BABIES.find(b => b.id === id);
      if (!baby) throw new Error('Baby not found');
      return baby;
    }
    const res = await apiRequest<Baby>(ENDPOINTS.BABY_BY_ID(id));
    return normalizeBaby(res.data);
  },

  // ── ADD BABY ──────────────────────────────
  // POST /api/children
  // multipart/form-data (because avatar is a file)
  //
  // Fields:
  //   name       string  required
  //   dateBirth  string  required  YYYY-MM-DD
  //   gender     string  required  'male' | 'female'
  //   height     number  optional
  //   wight      number  optional  (backend typo — must match)
  //   bloodType  string  optional
  //   avatar     File    optional  image file
  addBaby: async (
    payload: Omit<AddBabyPayload, 'avatar'>,
    avatarUri?: string | null,
  ): Promise<Baby> => {
    if (USE_MOCK) {
      await mockDelay(700);
      const newBaby: Baby = {
        id:        `baby_${Date.now()}`,
        name:      payload.name,
        gender:    payload.gender,
        dateBirth: payload.dateBirth,
        weight:    payload.weight,
        height:    payload.height,
        bloodType: payload.bloodType as any,
        avatar:    avatarUri ?? undefined,
        createdAt: new Date().toISOString(),
      };
      MOCK_BABIES.push(newBaby);
      return newBaby;
    }

    const token = await tokenStorage.get();
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    let response: Response;

    if (avatarUri) {
      // ── Multipart (with avatar image) ──────────
      // Numbers must come LAST after the file so NestJS
      // ParseFilePipe processes them in correct order
      const form = new FormData();
      form.append('name',      payload.name);
      form.append('dateBirth', payload.dateBirth);
      form.append('gender',    payload.gender);
      if (payload.bloodType) form.append('bloodType', payload.bloodType);
      // Append numbers as strings — NestJS @Transform decorator
      // on DTO should handle the conversion, but if not,
      // backend team needs to add @Transform(() => Number)
      if (payload.height != null) form.append('height', String(payload.height));
      if (payload.weight  != null) form.append('weight',  String(payload.weight));

      const filename  = avatarUri.split('/').pop() ?? 'avatar.jpg';
      const extension = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      form.append('avatar', {
        uri:  avatarUri,
        name: filename,
        type: extension === 'png' ? 'image/png' : 'image/jpeg',
      } as any);

      response = await fetch(`${BASE_URL}/children`, {
        method:  'POST',
        headers: { 'Accept': 'application/json', lang: getLocale(), ...authHeader },
        body:    form,
      });
    } else {
      // ── JSON (no avatar) ───────────────────────
      // Numbers are sent as actual numbers — no coercion issues
      const body: Record<string, any> = {
        name:      payload.name,
        dateBirth: payload.dateBirth,
        gender:    payload.gender,
      };
      if (payload.height    != null) body.height    = Number(payload.height);
      if (payload.weight     != null) body.weight     = Number(payload.weight);
      if (payload.bloodType)         body.bloodType = payload.bloodType;

      response = await fetch(`${BASE_URL}/children`, {
        method:  'POST',
        headers: {
          'Accept':       'application/json',
          'Content-Type': 'application/json',
          lang:           getLocale(),
          ...authHeader,
        },
        body: JSON.stringify(body),
      });
    }

    const json = await response.json();
    if (!response.ok) {
      const raw = Array.isArray(json?.message) ? json.message[0] : json?.message ?? `Error ${response.status}`;
      throw new Error(mapBackendError(raw));
    }
    return normalizeBaby(json.data);
  },

  // ── UPDATE BABY ───────────────────────────
  // PATCH /api/children  (no ID — backend uses Bearer token)
  // multipart when avatar provided, JSON otherwise
  updateBaby: async (
    id: string,                                          // kept for store compat
    payload: Partial<Omit<AddBabyPayload, 'avatar'>>,
    avatarUri?: string | null,
  ): Promise<Baby> => {
    if (USE_MOCK) {
      await mockDelay(600);
      const index = MOCK_BABIES.findIndex(b => b.id === id);
      if (index === -1) throw new Error('Baby not found');
      MOCK_BABIES[index] = { ...MOCK_BABIES[index], ...payload };
      return MOCK_BABIES[index];
    }

    const token      = await tokenStorage.get();
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
    let   response: Response;

    if (avatarUri) {
      // ── Multipart (avatar included) ─────────
      const form = new FormData();
      if (payload.name)      form.append('name',      payload.name);
      if (payload.dateBirth) form.append('dateBirth', payload.dateBirth);
      if (payload.gender)    form.append('gender',    payload.gender);
      if (payload.bloodType) form.append('bloodType', payload.bloodType);
      if (payload.height != null) form.append('height', String(payload.height));
      if (payload.weight  != null) form.append('weight',  String(payload.weight));

      const filename = avatarUri.split('/').pop() ?? 'avatar.jpg';
      const ext      = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      form.append('avatar', {
        uri:  avatarUri,
        name: filename,
        type: ext === 'png' ? 'image/png' : 'image/jpeg',
      } as any);

      response = await fetch(`${BASE_URL}/children`, {
        method:  'PATCH',
        headers: { 'Accept': 'application/json', lang: getLocale(), ...authHeader },
        body:    form,
      });
    } else {
      // ── JSON (no avatar) — numbers stay numbers ─
      const body: Record<string, any> = {};
      if (payload.name)           body.name       = payload.name;
      if (payload.dateBirth)      body.dateBirth  = payload.dateBirth;
      if (payload.gender)         body.gender     = payload.gender;
      if (payload.bloodType)      body.bloodType  = payload.bloodType;
      if (payload.height != null) body.height     = Number(payload.height);
      if (payload.weight  != null) body.weight      = Number(payload.weight);

      response = await fetch(`${BASE_URL}/children`, {
        method:  'PATCH',
        headers: {
          'Accept':       'application/json',
          'Content-Type': 'application/json',
          lang:           getLocale(),
          ...authHeader,
        },
        body: JSON.stringify(body),
      });
    }

    const json = await response.json();
    if (!response.ok) {
      const raw = Array.isArray(json?.message) ? json.message[0] : json?.message ?? `Error ${response.status}`;
      throw new Error(mapBackendError(raw));
    }

    // PATCH returns data: {} — keep optimistic local update
    // Re-fetch to get fresh data from backend
    const babies = await babyService.getBabies();
    return babies.find(b => b.id === id) ?? normalizeBaby(json.data ?? {});
  },

  // ── DELETE BABY ───────────────────────────
  // DELETE /api/children/:id
  deleteBaby: async (id: string): Promise<void> => {
    if (USE_MOCK) { await mockDelay(400); return; }
    await apiRequest(ENDPOINTS.BABY_BY_ID(id), { method: 'DELETE' });
  },
};
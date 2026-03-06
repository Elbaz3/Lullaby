// ─────────────────────────────────────────────
//  LULLABY — Baby Care Assistant Service
//  USE_MOCK = true → smart keyword matching
//  USE_MOCK = false → your backend AI endpoint
// ─────────────────────────────────────────────

import { apiRequest } from './api';
import { MOCK_ASSISTANT_RESPONSES, AssistantMessage } from '../constants/mockData';

const USE_MOCK = true;

const findMockResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.match(/cry|crying|cries|sobbing/)) return MOCK_ASSISTANT_RESPONSES.cry;
  if (lower.match(/sleep|nap|tired|bedtime|night/)) return MOCK_ASSISTANT_RESPONSES.sleep;
  if (lower.match(/hungry|hunger|feed|feeding|milk|breast|formula|solid|food/)) return MOCK_ASSISTANT_RESPONSES.feeding;
  if (lower.match(/vaccin|shot|immuniz|inject/)) return MOCK_ASSISTANT_RESPONSES.vaccination;
  if (lower.match(/fever|temperature|hot|sick/)) return MOCK_ASSISTANT_RESPONSES.fever;
  if (lower.match(/grow|weight|height|develop/)) return MOCK_ASSISTANT_RESPONSES.growth;
  if (lower.match(/colic|colicky/)) return MOCK_ASSISTANT_RESPONSES.colic;
  return MOCK_ASSISTANT_RESPONSES.default;
};

export const assistantService = {
  sendMessage: async (
    message: string,
    history: AssistantMessage[]
  ): Promise<string> => {
    if (USE_MOCK) {
      // Simulate thinking delay
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      return findMockResponse(message);
    }
    // TODO: Replace with your backend AI endpoint
    const res = await apiRequest<{ data: { reply: string } }>(
      '/assistant/chat',
      {
        method: 'POST',
        body: {
          message,
          history: history.map(m => ({ role: m.role, content: m.content })),
        },
      }
    );
    return res.data.reply;
  },
};

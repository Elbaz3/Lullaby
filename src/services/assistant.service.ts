import { apiRequest, BASE_URL, STORAGE_KEYS } from './api'
import * as SecureStore from 'expo-secure-store'
import { getLocale } from '../store/localeStore'

// ── Types ─────────────────────────────────────

export interface ChatbotResponse {
  success: boolean
  answer: string
  session_id: string
  language: string
}

// ── Service ───────────────────────────────────

export const assistantService = {
  /**
   * POST /api/chatbot/ask
   * Body: { question: string }
   * Returns the assistant's answer as a plain string.
   */
  sendMessage: async (question: string): Promise<string> => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN)

    const response = await fetch(`${BASE_URL}/chatbot/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        lang: getLocale(),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ question })
    })

    let json: ChatbotResponse
    try {
      json = await response.json()
    } catch {
      throw new Error('Server returned an unexpected response.')
    }

    if (!response.ok || !json.success) {
      throw new Error(json.answer ?? 'Something went wrong. Please try again.')
    }

    return json.answer
  },

  /**
   * DELETE /api/chatbot/memory
   * Clears the server-side session memory for the current user.
   * Only the Bearer token is needed — no body.
   */
  clearMemory: async (): Promise<void> => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN)

    const response = await fetch(`${BASE_URL}/chatbot/memory`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        lang: getLocale(),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (!response.ok) {
      throw new Error('Failed to clear chat memory.')
    }
  }
}

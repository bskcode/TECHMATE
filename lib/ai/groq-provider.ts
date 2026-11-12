// ====================================================================
// ADAPTIVELEARN AI — Groq AI Provider
// Fast, reliable structured inference using Groq API
// ====================================================================

import Groq from 'groq-sdk';

export interface GroqChatOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export class GroqService {
  private client: Groq | null = null;
  private model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (apiKey && apiKey !== 'mock_or_user_key' && apiKey.trim() !== '') {
      this.client = new Groq({ apiKey });
    }
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Sends a structured completion request to Groq with automatic retry logic.
   */
  public async complete(options: GroqChatOptions): Promise<string> {
    const { systemPrompt, userPrompt, temperature = 0.2, maxTokens = 4096, jsonMode = true } = options;

    if (!this.client) {
      throw new Error(
        'GROQ_NOT_CONFIGURED: Please set GROQ_API_KEY in your environment or use the grounded generation engine.'
      );
    }

    let attempts = 0;
    const maxRetries = 2;

    while (attempts <= maxRetries) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: jsonMode ? { type: 'json_object' } : undefined,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Groq returned an empty response.');
        }

        return content;
      } catch (err: any) {
        attempts++;
        if (attempts > maxRetries) {
          throw new Error(`Groq inference failed after ${maxRetries + 1} attempts: ${err.message}`);
        }
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }

    throw new Error('Groq inference terminated unexpectedly.');
  }
}

export const groqService = new GroqService();


const API_BASE_URL = 'http://localhost:3000/v1';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: any[];
}

export interface ChatResponse {
  success: boolean;
  responseObject?: {
    response: string;
    conversationHistory: any[];
  };
  message?: string;
}

export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send message');
  }

  return response.json();
};

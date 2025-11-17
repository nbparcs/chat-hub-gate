
const API_BASE_URL = 'https://message-app-backend-t3-2025-v2-one.vercel.app/';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  sender: number;
  receiver: number[];
  content: string;
  chat_room: number;
  created_at: string;
}

export interface SendMessageData {
  sender: number;
  receiver: number[];
  content: string;
  chat_room: number;
}

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authToken = token || this.getStoredToken();
    if (authToken) {
      headers['Authorization'] = `token ${authToken}`;
    }
    
    return headers;
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setStoredToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private clearStoredToken(): void {
    localStorage.removeItem('authToken');
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.setStoredToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    this.clearStoredToken();
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat rooms');
    }

    return response.json();
  }

  async getChatRoomDetail(roomId: number): Promise<ChatRoom> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/${roomId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat room detail');
    }

    return response.json();
  }

  async createChatRoom(name: string): Promise<ChatRoom> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat room');
    }

    return response.json();
  }

  async updateChatRoom(roomId: number, name: string): Promise<ChatRoom> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/${roomId}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to update chat room');
    }

    return response.json();
  }

  async deleteChatRoom(roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/${roomId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat room');
    }
  }

  async sendMessage(messageData: SendMessageData): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/send_message/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  getToken(): string | null {
    return this.getStoredToken();
  }
}

export const api = new ApiService();

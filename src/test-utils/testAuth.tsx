import { AuthContext, AuthContextType } from '@/contexts/AuthContext';

type MockAuthProviderProps = {
  children: React.ReactNode;
  authState?: Partial<AuthContextType>;
};

export const createMockAuthProvider = (initialState: Partial<AuthContextType> = {}) => {
  const mockAuth: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    ...initialState,
  };

  return {
    mockAuth,
    MockAuthProvider: ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuth}>
        {children}
      </AuthContext.Provider>
    ),
  };
};

export const mockLoginResponse = {
  token: 'test-token',
  user_id: 1,
  username: 'testuser',
};

export const mockLoginCredentials = {
  username: 'testuser',
  password: 'testpass123',
};

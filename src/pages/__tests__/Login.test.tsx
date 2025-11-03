import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { useAuth } from '@/contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock the useAuth hook
const mockLogin = jest.fn();

// Mock the react-router-dom module
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Navigated to {to}</div>,
}));

// Mock the auth context
const mockUseAuth = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('should render login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should call login function with form data', async () => {
    renderLogin();

    const username = 'admin';
    const password = 'admin123';

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: username } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username, password });
    });
  });


  it('should show loading state on form submission', async () => {
    // Mock a pending login
    mockLogin.mockImplementationOnce(() => new Promise(() => {}));
    
    renderLogin();
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByRole('button', { name: /signing in.../i })).toBeInTheDocument();
  });
  
  it('should redirect to /chat when user is already authenticated', () => {
    // Mock authenticated state
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
    });
    
    renderLogin();
    
    expect(screen.getByTestId('navigate')).toHaveTextContent('Navigated to /chat');
  });
  
  it('should show demo credentials', () => {
    renderLogin();
    expect(screen.getByText('Demo credentials: Endra / admin123')).toBeInTheDocument();
  });
  
  it('should show app name and logo', () => {
    renderLogin();
    expect(screen.getByText('ChatSpace')).toBeInTheDocument();
    expect(screen.getByText('Connect and communicate seamlessly')).toBeInTheDocument();
  });
});

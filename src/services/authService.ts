import { API_URL } from '../config';
import type { User } from '../types';

export const login = async (email: string, password: string): Promise<User> => {
  // For demo purposes, mock the API call
  // In a real app, this would be a fetch to your backend
  console.log('Login attempt with:', { email });
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock successful login
      const user: User = {
        id: '12345',
        name: 'Demo User',
        email: email
      };
      
      // Store in localStorage for persistent session
      localStorage.setItem('user', JSON.stringify(user));
      
      resolve(user);
    }, 800); // Simulate network delay
  });
  
  /* In a real implementation:
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important for cookies
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to login');
  }
  
  return await response.json();
  */
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  // For demo purposes, mock the API call
  console.log('Register attempt with:', { name, email });
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock successful registration
      const user: User = {
        id: '12345',
        name: name,
        email: email
      };
      
      // Store in localStorage for persistent session
      localStorage.setItem('user', JSON.stringify(user));
      
      resolve(user);
    }, 800); // Simulate network delay
  });
  
  /* In a real implementation:
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
    credentials: 'include', // Important for cookies
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to register');
  }
  
  return await response.json();
  */
};

export const logout = async (): Promise<void> => {
  // For demo purposes, just clear localStorage
  localStorage.removeItem('user');
  
  /* In a real implementation:
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // Important for cookies
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to logout');
  }
  */
};

export const checkAuth = async (): Promise<User | null> => {
  // For demo purposes, check localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
  
  /* In a real implementation:
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include', // Important for cookies
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
  */
};
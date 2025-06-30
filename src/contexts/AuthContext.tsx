import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api/auth';

interface User {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  points_profile: {
    balance: number;
    vicoins: number;
    total_earned: number;
    total_spent: number;
  };
}

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        // Cria um usuário anônimo quando não há autenticação
        setUser(authService.createAnonymousUser());
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Em caso de erro, cria um usuário anônimo
      setUser(authService.createAnonymousUser());
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  const login = async (userData: User, authToken: string) => {
    try {
      await AsyncStorage.setItem('userToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Erro ao salvar dados de autenticação');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      setToken(null);
      setUser(authService.createAnonymousUser());
      setIsAuthenticated(false);
    } catch (error) {
      // Em caso de erro no logout, garante que o usuário fique como anônimo
      setUser(authService.createAnonymousUser());
      setIsAuthenticated(false);
      throw new Error('Erro ao remover dados de autenticação');
    }
  };

  const refreshUserData = async () => {
    try {
      if (user?.id) {
        const updatedUserData = await authService.refreshUserData(user.id.toString());
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUser(updatedUserData);
      }
    } catch (error) {
      throw new Error('Erro ao atualizar dados do usuário');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        token,
        loading,
        login, 
        logout,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
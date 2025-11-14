import React from 'react';
import { useAppStore } from './index';

interface ProviderProps {
  children: React.ReactNode;
}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return <>{children}</>;
};
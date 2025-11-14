import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Device, 
  DeviceStatus, 
  Password, 
  Fingerprint,
  CommandResponse 
} from '../types';

interface AppState {
  // 用户相关
  user: User | null;
  isAuthenticated: boolean;
  
  // 设备相关
  devices: Device[];
  currentDevice: Device | null;
  deviceStatus: DeviceStatus | null;
  
  // 密码相关
  passwords: Password[];
  tempPasswords: Password[];
  
  // 指纹相关
  fingerprints: Fingerprint[];
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  
  // MQTT状态
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
}

interface AppActions {
  // 用户操作
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  
  // 设备操作
  setDevices: (devices: Device[]) => void;
  setCurrentDevice: (device: Device | null) => void;
  setDeviceStatus: (status: DeviceStatus | null) => void;
  updateDeviceStatus: (updates: Partial<DeviceStatus>) => void;
  
  // 密码操作
  setPasswords: (passwords: Password[]) => void;
  setTempPasswords: (passwords: Password[]) => void;
  addPassword: (password: Password) => void;
  removePassword: (passwordId: string) => void;
  
  // 指纹操作
  setFingerprints: (fingerprints: Fingerprint[]) => void;
  addFingerprint: (fingerprint: Fingerprint) => void;
  removeFingerprint: (fingerprintId: string) => void;
  
  // UI操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // MQTT操作
  setConnectionStatus: (status: AppState['connectionStatus']) => void;
  setConnected: (connected: boolean) => void;
  
  // 重置状态
  resetState: () => void;
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  devices: [],
  currentDevice: null,
  deviceStatus: null,
  passwords: [],
  tempPasswords: [],
  fingerprints: [],
  isLoading: false,
  error: null,
  isConnected: false,
  connectionStatus: 'disconnected',
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 用户操作
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      // 设备操作
      setDevices: (devices) => set({ devices }),
      setCurrentDevice: (currentDevice) => set({ currentDevice }),
      setDeviceStatus: (deviceStatus) => set({ deviceStatus }),
      updateDeviceStatus: (updates) => {
        const currentStatus = get().deviceStatus;
        if (currentStatus) {
          set({ 
            deviceStatus: { ...currentStatus, ...updates } 
          });
        }
      },
      
      // 密码操作
      setPasswords: (passwords) => set({ passwords }),
      setTempPasswords: (tempPasswords) => set({ tempPasswords }),
      addPassword: (password) => {
        const passwords = get().passwords;
        set({ passwords: [...passwords, password] });
      },
      removePassword: (passwordId) => {
        const passwords = get().passwords;
        set({ 
          passwords: passwords.filter(p => p.id !== passwordId) 
        });
      },
      
      // 指纹操作
      setFingerprints: (fingerprints) => set({ fingerprints }),
      addFingerprint: (fingerprint) => {
        const fingerprints = get().fingerprints;
        set({ fingerprints: [...fingerprints, fingerprint] });
      },
      removeFingerprint: (fingerprintId) => {
        const fingerprints = get().fingerprints;
        set({ 
          fingerprints: fingerprints.filter(f => f.id !== fingerprintId) 
        });
      },
      
      // UI操作
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // MQTT操作
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setConnected: (isConnected) => set({ isConnected }),
      
      // 重置状态
      resetState: () => set({ ...initialState }),
    }),
    {
      name: 'esp-lock-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        devices: state.devices,
        currentDevice: state.currentDevice,
        passwords: state.passwords,
        tempPasswords: state.tempPasswords,
        fingerprints: state.fingerprints,
      }),
    }
  )
);
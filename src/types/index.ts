export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  devices: Device[];
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  firmwareVersion: string;
  macAddress: string;
  status: DeviceStatus;
  batteryLevel?: number;
  wifiSignal?: number;
  lastSeen: Date;
  isOnline: boolean;
  settings: DeviceSettings;
}

export interface DeviceStatus {
  deviceId: string;
  isLocked: boolean;
  lockMethod: LockMethod;
  lastAction: LockAction;
  lastActionAt: Date;
  batteryLevel: number;
  isOnline: boolean;
  errorCode?: string;
}

export interface DeviceSettings {
  autoLockDelay: number; // 秒
  notificationEnabled: boolean;
  soundEnabled: boolean;
  language: string;
}

export type LockMethod = 'password' | 'fingerprint' | 'remote' | 'key';

export interface LockAction {
  type: 'lock' | 'unlock';
  method: LockMethod;
  userId?: string;
  timestamp: Date;
}

export interface Password {
  id: string;
  type: PasswordType;
  value: string; // 加密存储
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
  maxUses?: number;
  usedCount: number;
  createdBy: string;
  createdAt: Date;
}

export type PasswordType = 'master' | 'temp' | 'guest';

export interface Fingerprint {
  id: string;
  name: string;
  fingerprintId: number;
  isActive: boolean;
  enrolledAt: Date;
  lastUsedAt?: Date;
  useCount: number;
  quality: number;
}

export interface MQTTMessage {
  command: CommandType;
  deviceId: string;
  userId: string;
  timestamp: number;
  requestId: string;
  params: any;
  signature?: string;
}

export type CommandMessage = MQTTMessage;

export interface CommandResponse {
  requestId: string;
  deviceId: string;
  status: ResponseStatus;
  timestamp: number;
  data?: any;
  error?: ErrorInfo;
}

export type CommandType = 
  | 'unlock' 
  | 'lock' 
  | 'set_password' 
  | 'get_status' 
  | 'enroll_fingerprint' 
  | 'delete_fingerprint' 
  | 'start_stream' 
  | 'take_snapshot';

export type ResponseStatus = 'success' | 'error' | 'pending';

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
}
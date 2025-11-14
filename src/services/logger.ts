import { DeviceStatus, LockAction } from '../types';

export class DeviceLogger {
  private logs: LockAction[] = [];
  private maxLogs: number = 100;

  constructor(maxLogs: number = 100) {
    this.maxLogs = maxLogs;
  }

  logAction(action: LockAction): void {
    const logEntry = {
      ...action,
      timestamp: new Date(),
    };
    
    this.logs.unshift(logEntry);
    
    // 保持日志数量在限制范围内
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(limit?: number): LockAction[] {
    if (limit) {
      return this.logs.slice(0, limit);
    }
    return [...this.logs];
  }

  getLogsByMethod(method: string): LockAction[] {
    return this.logs.filter(log => log.method === method);
  }

  getLogsByUser(userId: string): LockAction[] {
    return this.logs.filter(log => log.userId === userId);
  }

  getLogsByDateRange(startDate: Date, endDate: Date): LockAction[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const deviceLogger = new DeviceLogger();
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { CommandMessage, CommandResponse, DeviceStatus } from '../types';
import { useAppStore } from '../store';

export class MQTTService {
  private client: MqttClient | null = null;
  private brokerUrl: string = '';
  private deviceId: string = '';
  private userId: string = '';
  private messageCallbacks: Map<string, (message: any) => void> = new Map();

  constructor() {
    // 从store获取状态
    const { setConnected, setConnectionStatus } = useAppStore.getState();
    this.setConnected = setConnected;
    this.setConnectionStatus = setConnectionStatus;
  }

  private setConnected: (connected: boolean) => void;
  private setConnectionStatus: (status: any) => void;

  async connect(brokerUrl: string, options: IClientOptions = {}): Promise<void> {
    try {
      this.setConnectionStatus('connecting');
      this.brokerUrl = brokerUrl;

      const defaultOptions: IClientOptions = {
        clientId: `esp-lock-app-${Date.now()}`,
        username: options.username,
        password: options.password,
        keepalive: 60,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        will: {
          topic: 'app/status',
          payload: JSON.stringify({ status: 'offline', timestamp: Date.now() }),
          qos: 1,
          retain: true
        },
        ...options
      };

      this.client = mqtt.connect(brokerUrl, defaultOptions);

      this.client.on('connect', this.handleConnect.bind(this));
      this.client.on('disconnect', this.handleDisconnect.bind(this));
      this.client.on('error', this.handleError.bind(this));
      this.client.on('message', this.handleMessage.bind(this));
      this.client.on('reconnect', this.handleReconnect.bind(this));

    } catch (error) {
      this.setConnectionStatus('error');
      throw new Error(`MQTT连接失败: ${error}`);
    }
  }

  private handleConnect(): void {
    console.log('MQTT连接成功');
    this.setConnected(true);
    this.setConnectionStatus('connected');
    
    // 订阅设备状态主题
    if (this.deviceId) {
      this.subscribe(`lock/status/${this.deviceId}`, (message) => {
        this.handleDeviceStatus(message);
      });
      
      this.subscribe(`lock/response/${this.deviceId}`, (message) => {
        this.handleDeviceResponse(message);
      });
    }
  }

  private handleDisconnect(): void {
    console.log('MQTT连接断开');
    this.setConnected(false);
    this.setConnectionStatus('disconnected');
  }

  private handleError(error: Error): void {
    console.error('MQTT错误:', error);
    this.setConnectionStatus('error');
  }

  private handleReconnect(): void {
    console.log('MQTT重新连接中...');
    this.setConnectionStatus('connecting');
  }

  private handleMessage(topic: string, payload: Buffer): void {
    try {
      const message = JSON.parse(payload.toString());
      console.log(`收到消息 - 主题: ${topic}`, message);
      
      const callback = this.messageCallbacks.get(topic);
      if (callback) {
        callback(message);
      }
    } catch (error) {
      console.error('消息解析错误:', error);
    }
  }

  private handleDeviceStatus(message: any): void {
    const { setDeviceStatus } = useAppStore.getState();
    const deviceStatus: DeviceStatus = {
      deviceId: message.deviceId,
      isLocked: message.isLocked,
      lockMethod: message.lockMethod,
      lastAction: message.lastAction,
      lastActionAt: new Date(message.lastActionAt),
      batteryLevel: message.batteryLevel,
      isOnline: message.isOnline,
      errorCode: message.errorCode
    };
    setDeviceStatus(deviceStatus);
  }

  private handleDeviceResponse(message: CommandResponse): void {
    // 处理设备响应消息
    console.log('设备响应:', message);
  }

  async publish(topic: string, message: any, qos: 0 | 1 | 2 = 1): Promise<void> {
    if (!this.client || !this.isConnected()) {
      throw new Error('MQTT客户端未连接');
    }

    const messageStr = JSON.stringify(message);
    return new Promise((resolve, reject) => {
      this.client!.publish(topic, messageStr, { qos }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
    if (!this.client || !this.isConnected()) {
      throw new Error('MQTT客户端未连接');
    }

    this.messageCallbacks.set(topic, callback);
    return new Promise((resolve, reject) => {
      this.client!.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async unsubscribe(topic: string): Promise<void> {
    if (!this.client || !this.isConnected()) {
      throw new Error('MQTT客户端未连接');
    }

    this.messageCallbacks.delete(topic);
    return new Promise((resolve, reject) => {
      this.client!.unsubscribe(topic, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  isConnected(): boolean {
    return this.client ? this.client.connected : false;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(true, {}, () => {
          this.client = null;
          resolve();
        });
      });
    }
  }

  // 门锁控制命令
  async sendLockCommand(command: 'lock' | 'unlock', params: any = {}): Promise<void> {
    const { user } = useAppStore.getState();
    if (!user || !this.deviceId) {
      throw new Error('用户或设备未设置');
    }

    const message: CommandMessage = {
      command,
      deviceId: this.deviceId,
      userId: user.id,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}`,
      params
    };

    await this.publish(`lock/control/${this.deviceId}`, message);
  }

  // 设置设备ID
  setDeviceId(deviceId: string): void {
    this.deviceId = deviceId;
  }

  // 设置用户ID
  setUserId(userId: string): void {
    this.userId = userId;
  }
}

// 创建单例实例
export const mqttService = new MQTTService();
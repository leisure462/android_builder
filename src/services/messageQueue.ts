import { CommandMessage, CommandResponse, DeviceStatus } from '../types';

export class MessageQueue {
  private queue: CommandMessage[] = [];
  private pendingResponses: Map<string, (response: CommandResponse) => void> = new Map();
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1秒

  constructor(maxRetries: number = 3, retryDelay: number = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async sendMessage(message: CommandMessage): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      // 添加消息到队列
      this.queue.push(message);
      
      // 注册响应回调
      this.pendingResponses.set(message.requestId, resolve);
      
      // 设置超时
      setTimeout(() => {
        if (this.pendingResponses.has(message.requestId)) {
          this.pendingResponses.delete(message.requestId);
          reject(new Error('消息发送超时'));
        }
      }, 30000); // 30秒超时
    });
  }

  handleResponse(response: CommandResponse): void {
    const callback = this.pendingResponses.get(response.requestId);
    if (callback) {
      callback(response);
      this.pendingResponses.delete(response.requestId);
      
      // 从队列中移除对应的消息
      this.queue = this.queue.filter(msg => msg.requestId !== response.requestId);
    }
  }

  retryMessage(requestId: string): boolean {
    const message = this.queue.find(msg => msg.requestId === requestId);
    if (message && message.params?.retryCount < this.maxRetries) {
      message.params.retryCount = (message.params.retryCount || 0) + 1;
      
      setTimeout(() => {
        // 重发消息逻辑
        console.log(`重发消息 (第${message.params.retryCount}次):`, requestId);
      }, this.retryDelay * message.params.retryCount);
      
      return true;
    }
    return false;
  }

  getQueueStatus(): { queued: number; pending: number } {
    return {
      queued: this.queue.length,
      pending: this.pendingResponses.size
    };
  }

  clear(): void {
    this.queue = [];
    this.pendingResponses.clear();
  }
}

export const messageQueue = new MessageQueue();
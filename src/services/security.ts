import CryptoJS from 'crypto-js';

export class SecurityService {
  private static readonly ENCRYPTION_KEY = 'ESP32_LOCK_APP_SECRET_KEY_2024';
  private static readonly IV = '1234567890123456'; // 16字节初始化向量

  // 加密敏感数据
  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY, {
        iv: CryptoJS.enc.Utf8.parse(this.IV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return encrypted.toString();
    } catch (error) {
      console.error('加密失败:', error);
      throw new Error('数据加密失败');
    }
  }

  // 解密敏感数据
  static decrypt(encryptedData: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY, {
        iv: CryptoJS.enc.Utf8.parse(this.IV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('数据解密失败');
    }
  }

  // 生成消息签名
  static generateSignature(message: any): string {
    try {
      const messageStr = JSON.stringify(message);
      const hash = CryptoJS.HmacSHA256(messageStr, this.ENCRYPTION_KEY);
      return hash.toString();
    } catch (error) {
      console.error('签名生成失败:', error);
      throw new Error('消息签名生成失败');
    }
  }

  // 验证消息签名
  static verifySignature(message: any, signature: string): boolean {
    try {
      const expectedSignature = this.generateSignature(message);
      return expectedSignature === signature;
    } catch (error) {
      console.error('签名验证失败:', error);
      return false;
    }
  }

  // 生成随机密码
  static generateRandomPassword(length: number = 8): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  // 验证密码强度
  static validatePasswordStrength(password: string): { 
    isValid: boolean; 
    score: number; 
    feedback: string[] 
  } {
    const feedback: string[] = [];
    let score = 0;

    // 长度检查
    if (password.length >= 8) {
      score += 2;
    } else {
      feedback.push('密码长度至少为8位');
    }

    // 包含数字
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('密码应包含数字');
    }

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('密码应包含小写字母');
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('密码应包含大写字母');
    }

    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 2;
    } else {
      feedback.push('密码应包含特殊字符');
    }

    return {
      isValid: score >= 5,
      score,
      feedback
    };
  }

  // 安全存储密钥
  static async secureStore(key: string, value: string): Promise<void> {
    try {
      // 这里应该使用Expo SecureStore或其他安全存储方式
      // 为演示目的，使用简单的加密
      const encrypted = this.encrypt(value);
      // 在实际应用中，这里应该使用SecureStore.setItemAsync(key, encrypted);
      console.log(`安全存储: ${key} = ${encrypted}`);
    } catch (error) {
      console.error('安全存储失败:', error);
      throw new Error('数据安全存储失败');
    }
  }

  // 安全读取密钥
  static async secureRetrieve(key: string): Promise<string | null> {
    try {
      // 在实际应用中，这里应该使用SecureStore.getItemAsync(key);
      // 为演示目的，返回模拟数据
      console.log(`安全读取: ${key}`);
      return null; // 模拟返回null
    } catch (error) {
      console.error('安全读取失败:', error);
      return null;
    }
  }

  // 生成设备指纹
  static generateDeviceFingerprint(): string {
    try {
      const timestamp = new Date().getTime().toString();
      const random = Math.random().toString(36).substr(2, 9);
      const deviceInfo = `${timestamp}-${random}`;
      
      const hash = CryptoJS.SHA256(deviceInfo);
      return hash.toString().substr(0, 16); // 返回16位指纹
    } catch (error) {
      console.error('设备指纹生成失败:', error);
      return 'default_device_fingerprint';
    }
  }

  // 时间戳验证（防重放攻击）
  static validateTimestamp(timestamp: number, maxAge: number = 300000): boolean { // 默认5分钟
    const now = Date.now();
    const age = now - timestamp;
    return age >= 0 && age <= maxAge;
  }
}
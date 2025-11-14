import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { useAppStore } from '../store';
import { useNavigation } from '@react-navigation/native';
import { Lock, User, Eye, EyeOff } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { setUser, setAuthenticated, setLoading } = useAppStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 检查是否已保存登录信息
    checkSavedCredentials();
  }, []);

  const checkSavedCredentials = async () => {
    try {
      const savedUsername = await SecureStore.getItemAsync('username');
      const savedPassword = await SecureStore.getItemAsync('password');
      
      if (savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
      }
    } catch (error) {
      console.error('检查保存的凭据失败:', error);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('错误', '请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      // 模拟登录验证（实际项目中这里应该调用真实的API）
      await simulateLogin(username, password);
      
      // 保存登录凭据
      await SecureStore.setItemAsync('username', username);
      await SecureStore.setItemAsync('password', password);
      
      // 创建用户数据
      const user = {
        id: 'user_' + Date.now(),
        username: username,
        email: username + '@example.com',
        devices: [],
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
      };
      
      setUser(user);
      setAuthenticated(true);
      setLoading(false);
      
      // 导航到设备设置或主界面
      if (user.devices.length === 0) {
        navigation.navigate('DeviceSetup' as never);
      } else {
        navigation.navigate('Main' as never);
      }
      
    } catch (error) {
      Alert.alert('登录失败', '用户名或密码错误');
      setLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateLogin = async (username: string, password: string): Promise<void> => {
    // 模拟网络请求延迟
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 简单的验证逻辑（实际项目中应该调用真实API）
        if (username.length >= 3 && password.length >= 6) {
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const handleRegister = () => {
    Alert.alert(
      '注册',
      '注册功能暂未开放，请联系管理员',
      [{ text: '确定' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo区域 */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Lock size={48} color="#4F46E5" />
          </View>
          <Text style={styles.title}>ESP智能门锁</Text>
          <Text style={styles.subtitle}>手机端控制软件</Text>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <User size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="用户名"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '登录中...' : '登录'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>注册新账户</Text>
          </TouchableOpacity>
        </View>

        {/* 底部信息 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            毕业设计项目 - ESP32智能门锁系统
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
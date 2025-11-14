import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { useAppStore } from '../store';
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Volume2, 
  Globe, 
  Shield, 
  LogOut,
  Trash2,
  Info,
  Wifi
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

export const SettingsScreen = () => {
  const { 
    user, 
    currentDevice, 
    setUser, 
    setAuthenticated, 
    setCurrentDevice,
    setDevices 
  } = useAppStore();
  
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [language, setLanguage] = useState('中文');

  const handleLogout = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              // 清除保存的凭据
              await SecureStore.deleteItemAsync('username');
              await SecureStore.deleteItemAsync('password');
              
              // 重置状态
              setUser(null);
              setAuthenticated(false);
              setCurrentDevice(null);
              setDevices([]);
              
              // 这里应该导航到登录页面
              // navigation.navigate('Login');
            } catch (error) {
              Alert.alert('错误', '退出登录失败');
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      '清除数据',
      '此操作将清除所有本地数据，包括设备信息和设置。确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              // 清除所有存储的数据
              await SecureStore.deleteItemAsync('username');
              await SecureStore.deleteItemAsync('password');
              
              // 重置所有状态
              setUser(null);
              setAuthenticated(false);
              setCurrentDevice(null);
              setDevices([]);
              
              Alert.alert('成功', '数据已清除');
            } catch (error) {
              Alert.alert('错误', '清除数据失败');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      '关于',
      'ESP32智能门锁控制软件\n\n版本: 1.0.0\n开发者: 毕业设计项目\n\n功能特点:\n• 远程门锁控制\n• 密码管理\n• 指纹识别\n• 视频监控\n• MQTT通信',
      [{ text: '确定' }]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    hasSwitch = false, 
    switchValue = false, 
    onSwitchChange 
  }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingLeft}>
        {icon}
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
            thumbColor={switchValue ? '#FFFFFF' : '#F3F4F6'}
          />
        ) : (
          <>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            <Text style={styles.settingArrow}>›</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 用户信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>用户信息</Text>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <User size={24} color="#4F46E5" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.username || '未知用户'}</Text>
              <Text style={styles.userEmail}>{user?.email || '未设置邮箱'}</Text>
            </View>
          </View>
          
          <SettingItem
            icon={<User size={20} color="#6B7280" />}
            title="个人资料"
            onPress={() => Alert.alert('提示', '个人资料功能开发中...')}
          />
        </View>

        {/* 设备设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设备设置</Text>
          
          <SettingItem
            icon={<Lock size={20} color="#6B7280" />}
            title="当前设备"
            value={currentDevice?.name || '未连接'}
            onPress={() => Alert.alert('提示', '设备管理功能开发中...')}
          />
          
          <SettingItem
            icon={<Wifi size={20} color="#6B7280" />}
            title="网络设置"
            onPress={() => Alert.alert('提示', '网络设置功能开发中...')}
          />
        </View>

        {/* 通知设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知设置</Text>
          
          <SettingItem
            icon={<Bell size={20} color="#6B7280" />}
            title="推送通知"
            hasSwitch={true}
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          
          <SettingItem
            icon={<Volume2 size={20} color="#6B7280" />}
            title="声音提示"
            hasSwitch={true}
            switchValue={sound}
            onSwitchChange={setSound}
          />
        </View>

        {/* 安全设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>安全设置</Text>
          
          <SettingItem
            icon={<Lock size={20} color="#6B7280" />}
            title="自动锁定"
            hasSwitch={true}
            switchValue={autoLock}
            onSwitchChange={setAutoLock}
          />
          
          <SettingItem
            icon={<Shield size={20} color="#6B7280" />}
            title="隐私设置"
            onPress={() => Alert.alert('提示', '隐私设置功能开发中...')}
          />
        </View>

        {/* 通用设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通用设置</Text>
          
          <SettingItem
            icon={<Globe size={20} color="#6B7280" />}
            title="语言"
            value={language}
            onPress={() => Alert.alert('提示', '语言设置功能开发中...')}
          />
        </View>

        {/* 其他 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他</Text>
          
          <SettingItem
            icon={<Info size={20} color="#6B7280" />}
            title="关于"
            onPress={handleAbout}
          />
          
          <SettingItem
            icon={<Trash2 size={20} color="#EF4444" />}
            title="清除数据"
            onPress={handleClearData}
          />
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>退出登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  settingArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
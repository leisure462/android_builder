import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { Device } from '../types';
import { Plus, Wifi, Settings, Save } from 'lucide-react-native';

export const DeviceSetupScreen = () => {
  const navigation = useNavigation();
  const { user, setCurrentDevice, setDevices, devices } = useAppStore();
  
  const [deviceName, setDeviceName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [mqttBroker, setMqttBroker] = useState('mqtt://broker.hivemq.com');
  const [mqttPort, setMqttPort] = useState('1883');
  const [mqttUsername, setMqttUsername] = useState('');
  const [mqttPassword, setMqttPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddDevice = async () => {
    if (!deviceName.trim() || !deviceId.trim()) {
      Alert.alert('错误', '请输入设备名称和设备ID');
      return;
    }

    setIsLoading(true);

    try {
      // 创建设备配置
      const device: Device = {
        id: deviceId,
        name: deviceName,
        model: 'ESP32-Lock-v1',
        firmwareVersion: '1.0.0',
        macAddress: '00:00:00:00:00:00', // 实际项目中应该从设备获取
        status: {
          deviceId: deviceId,
          isLocked: true,
          lockMethod: 'password',
          lastAction: { type: 'lock', method: 'password', timestamp: new Date() },
          lastActionAt: new Date(),
          batteryLevel: 100,
          isOnline: false,
        },
        batteryLevel: 100,
        wifiSignal: -50,
        lastSeen: new Date(),
        isOnline: false,
        settings: {
          autoLockDelay: 30,
          notificationEnabled: true,
          soundEnabled: true,
          language: 'zh-CN',
        },
      };

      // 更新设备列表
      const updatedDevices = [...devices, device];
      setDevices(updatedDevices);
      setCurrentDevice(device);

      Alert.alert(
        '成功',
        '设备添加成功',
        [
          {
            text: '确定',
            onPress: () => navigation.navigate('Main' as never),
          },
        ]
      );

    } catch (error) {
      Alert.alert('添加失败', '设备添加失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSetup = () => {
    // 快速设置默认值
    setDeviceName('我的智能门锁');
    setDeviceId('esp32_lock_' + Math.random().toString(36).substr(2, 8));
    setMqttBroker('mqtt://broker.hivemq.com');
    setMqttPort('1883');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>添加设备</Text>
          <Text style={styles.subtitle}>配置您的ESP32智能门锁</Text>
        </View>

        {/* 快速设置按钮 */}
        <TouchableOpacity style={styles.quickSetupButton} onPress={handleQuickSetup}>
          <Plus size={20} color="#4F46E5" />
          <Text style={styles.quickSetupButtonText}>快速设置</Text>
        </TouchableOpacity>

        {/* 设备信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设备信息</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>设备名称</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：我的智能门锁"
              value={deviceName}
              onChangeText={setDeviceName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>设备ID</Text>
            <TextInput
              style={styles.input}
              placeholder="输入设备唯一标识"
              value={deviceId}
              onChangeText={setDeviceId}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* MQTT配置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Wifi size={20} color="#6B7280" /> MQTT配置
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>MQTT服务器地址</Text>
            <TextInput
              style={styles.input}
              placeholder="mqtt://broker.hivemq.com"
              value={mqttBroker}
              onChangeText={setMqttBroker}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>端口</Text>
            <TextInput
              style={styles.input}
              placeholder="1883"
              value={mqttPort}
              onChangeText={setMqttPort}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>用户名（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="MQTT用户名"
              value={mqttUsername}
              onChangeText={setMqttUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>密码（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="MQTT密码"
              value={mqttPassword}
              onChangeText={setMqttPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* 添加按钮 */}
        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
          onPress={handleAddDevice}
          disabled={isLoading}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            {isLoading ? '添加中...' : '添加设备'}
          </Text>
        </TouchableOpacity>
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
  header: {
    marginBottom: 24,
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
  quickSetupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  quickSetupButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
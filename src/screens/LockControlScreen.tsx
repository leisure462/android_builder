import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAppStore } from '../store';
import { useNavigation } from '@react-navigation/native';
import { mqttService } from '../services/mqtt';
import { Lock, Unlock, Power, Battery, Wifi, AlertTriangle } from 'lucide-react-native';

export const LockControlScreen = () => {
  const navigation = useNavigation();
  const { 
    currentDevice, 
    deviceStatus, 
    isConnected, 
    connectionStatus,
    setDeviceStatus,
    setLoading 
  } = useAppStore();
  
  const [isOperating, setIsOperating] = useState(false);

  useEffect(() => {
    // 连接MQTT服务器
    connectToMQTT();
    
    return () => {
      // 组件卸载时断开连接
      mqttService.disconnect();
    };
  }, []);

  const connectToMQTT = async () => {
    if (!currentDevice) return;

    try {
      setLoading(true);
      
      // 设置设备ID
      mqttService.setDeviceId(currentDevice.id);
      
      // 连接到MQTT服务器
      await mqttService.connect('mqtt://broker.hivemq.com', {
        username: '',
        password: '',
      });
      
      // 订阅设备状态主题
      await mqttService.subscribe(`lock/status/${currentDevice.id}`, (message) => {
        handleDeviceStatusUpdate(message);
      });
      
      // 订阅设备响应主题
      await mqttService.subscribe(`lock/response/${currentDevice.id}`, (message) => {
        handleDeviceResponse(message);
      });
      
      // 请求当前状态
      await requestDeviceStatus();
      
    } catch (error) {
      console.error('MQTT连接失败:', error);
      Alert.alert('连接失败', '无法连接到设备，请检查网络设置');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceStatusUpdate = (message: any) => {
    const status = {
      deviceId: message.deviceId,
      isLocked: message.isLocked,
      lockMethod: message.lockMethod,
      lastAction: message.lastAction,
      lastActionAt: new Date(message.lastActionAt),
      batteryLevel: message.batteryLevel,
      isOnline: message.isOnline,
      errorCode: message.errorCode,
    };
    setDeviceStatus(status);
  };

  const handleDeviceResponse = (message: any) => {
    setIsOperating(false);
    
    if (message.status === 'success') {
      // 请求最新状态
      requestDeviceStatus();
    } else {
      Alert.alert('操作失败', message.error?.message || '设备操作失败');
    }
  };

  const requestDeviceStatus = async () => {
    if (!currentDevice || !isConnected) return;

    try {
      await mqttService.publish(`lock/control/${currentDevice.id}`, {
        command: 'get_status',
        deviceId: currentDevice.id,
        userId: 'user123',
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
        params: {},
      });
    } catch (error) {
      console.error('请求设备状态失败:', error);
    }
  };

  const handleLock = async () => {
    if (!currentDevice || !isConnected || isOperating) return;

    setIsOperating(true);
    try {
      await mqttService.sendLockCommand('lock', {
        method: 'remote',
        userId: 'user123',
      });
    } catch (error) {
      console.error('发送锁门命令失败:', error);
      setIsOperating(false);
      Alert.alert('操作失败', '无法发送锁门命令');
    }
  };

  const handleUnlock = async () => {
    if (!currentDevice || !isConnected || isOperating) return;

    setIsOperating(true);
    try {
      await mqttService.sendLockCommand('unlock', {
        method: 'remote',
        userId: 'user123',
      });
    } catch (error) {
      console.error('发送开门命令失败:', error);
      setIsOperating(false);
      Alert.alert('操作失败', '无法发送开门命令');
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10B981';
      case 'connecting': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '已连接';
      case 'connecting': return '连接中...';
      case 'error': return '连接失败';
      default: return '未连接';
    }
  };

  const getBatteryColor = () => {
    if (!deviceStatus?.batteryLevel) return '#6B7280';
    if (deviceStatus.batteryLevel > 50) return '#10B981';
    if (deviceStatus.batteryLevel > 20) return '#F59E0B';
    return '#EF4444';
  };

  if (!currentDevice) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <AlertTriangle size={64} color="#6B7280" />
          <Text style={styles.emptyText}>请先添加设备</Text>
          <TouchableOpacity
            style={styles.addDeviceButton}
            onPress={() => navigation.navigate('DeviceSetup' as never)}
          >
            <Text style={styles.addDeviceButtonText}>添加设备</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 连接状态 */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Wifi size={20} color={getConnectionStatusColor()} />
            <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
              {getConnectionStatusText()}
            </Text>
          </View>
          
          {deviceStatus && (
            <View style={styles.statusRow}>
              <Battery size={20} color={getBatteryColor()} />
              <Text style={[styles.statusText, { color: getBatteryColor() }]}>
                电量: {deviceStatus.batteryLevel}%
              </Text>
            </View>
          )}
        </View>

        {/* 门锁状态 */}
        <View style={styles.lockStatusCard}>
          <View style={styles.lockIconContainer}>
            {deviceStatus?.isLocked ? (
              <Lock size={80} color="#EF4444" />
            ) : (
              <Unlock size={80} color="#10B981" />
            )}
          </View>
          
          <Text style={styles.lockStatusText}>
            {deviceStatus?.isLocked ? '门锁已锁定' : '门锁已开启'}
          </Text>
          
          {deviceStatus?.lastAction && (
            <Text style={styles.lastActionText}>
              最后操作: {deviceStatus.lastAction.type === 'lock' ? '锁定' : '开启'} 
              ({new Date(deviceStatus.lastActionAt).toLocaleString()})
            </Text>
          )}
        </View>

        {/* 控制按钮 */}
        <View style={styles.controlButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.unlockButton,
              (!isConnected || isOperating) && styles.controlButtonDisabled
            ]}
            onPress={handleUnlock}
            disabled={!isConnected || isOperating || !deviceStatus?.isLocked}
          >
            {isOperating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Unlock size={32} color="#FFFFFF" />
            )}
            <Text style={styles.controlButtonText}>开启门锁</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.lockButton,
              (!isConnected || isOperating) && styles.controlButtonDisabled
            ]}
            onPress={handleLock}
            disabled={!isConnected || isOperating || deviceStatus?.isLocked}
          >
            {isOperating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Lock size={32} color="#FFFFFF" />
            )}
            <Text style={styles.controlButtonText}>锁定门锁</Text>
          </TouchableOpacity>
        </View>

        {/* 设备信息 */}
        <View style={styles.deviceInfoCard}>
          <Text style={styles.deviceInfoTitle}>设备信息</Text>
          <View style={styles.deviceInfoRow}>
            <Text style={styles.deviceInfoLabel}>设备名称:</Text>
            <Text style={styles.deviceInfoValue}>{currentDevice.name}</Text>
          </View>
          <View style={styles.deviceInfoRow}>
            <Text style={styles.deviceInfoLabel}>设备ID:</Text>
            <Text style={styles.deviceInfoValue}>{currentDevice.id}</Text>
          </View>
          <View style={styles.deviceInfoRow}>
            <Text style={styles.deviceInfoLabel}>固件版本:</Text>
            <Text style={styles.deviceInfoValue}>{currentDevice.firmwareVersion}</Text>
          </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  addDeviceButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addDeviceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  lockStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lockIconContainer: {
    marginBottom: 20,
  },
  lockStatusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  lastActionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  controlButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  unlockButton: {
    backgroundColor: '#10B981',
  },
  lockButton: {
    backgroundColor: '#EF4444',
  },
  controlButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  deviceInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  deviceInfoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});
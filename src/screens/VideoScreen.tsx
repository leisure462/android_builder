import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Camera } from 'expo-camera';
import { useAppStore } from '../store';
import { Video, Camera as CameraIcon, Circle, Square, Download } from 'lucide-react-native';

export const VideoScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
  const { currentDevice } = useAppStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakeSnapshot = async () => {
    if (!currentDevice) {
      Alert.alert('错误', '请先添加设备');
      return;
    }

    try {
      // 模拟拍照功能
      const mockImage = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;
      
      setLastSnapshot(mockImage);
      Alert.alert('成功', '照片已保存');
      
    } catch (error) {
      Alert.alert('拍照失败', '无法拍摄照片');
    }
  };

  const handleStartRecording = async () => {
    if (!currentDevice) {
      Alert.alert('错误', '请先添加设备');
      return;
    }

    try {
      setIsRecording(true);
      Alert.alert('开始录像', '正在录制视频...');
      
      // 模拟录制过程
      setTimeout(() => {
        setIsRecording(false);
        Alert.alert('录制完成', '视频已保存');
      }, 5000);
      
    } catch (error) {
      setIsRecording(false);
      Alert.alert('录制失败', '无法开始录制');
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleStartStream = async () => {
    if (!currentDevice) {
      Alert.alert('错误', '请先添加设备');
      return;
    }

    try {
      setIsStreaming(true);
      Alert.alert('开始直播', '正在连接视频流...');
      
    } catch (error) {
      setIsStreaming(false);
      Alert.alert('连接失败', '无法开始视频流');
    }
  };

  const handleStopStream = () => {
    setIsStreaming(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>请求摄像头权限中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>需要摄像头权限才能使用监控功能</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => {
              // 重新请求权限
              Camera.requestCameraPermissionsAsync();
            }}
          >
            <Text style={styles.permissionButtonText}>授予权限</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 视频流显示区域 */}
        <View style={styles.videoContainer}>
          {isStreaming ? (
            <View style={styles.videoStream}>
              <Text style={styles.videoStreamText}>视频流连接中...</Text>
              <Text style={styles.videoStreamSubText}>
                设备: {currentDevice?.name || '未连接设备'}
              </Text>
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Video size={64} color="#9CA3AF" />
              <Text style={styles.videoPlaceholderText}>视频流未连接</Text>
              <Text style={styles.videoPlaceholderSubText}>
                点击"开始直播"按钮连接设备摄像头
              </Text>
            </View>
          )}
        </View>

        {/* 控制按钮 */}
        <View style={styles.controlButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.snapshotButton,
              !currentDevice && styles.controlButtonDisabled
            ]}
            onPress={handleTakeSnapshot}
            disabled={!currentDevice}
          >
            <CameraIcon size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>抓拍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              isRecording ? styles.stopButton : styles.recordButton,
              !currentDevice && styles.controlButtonDisabled
            ]}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            disabled={!currentDevice}
          >
            {isRecording ? (
              <Square size={24} color="#FFFFFF" />
            ) : (
              <Circle size={24} color="#FFFFFF" />
            )}
            <Text style={styles.controlButtonText}>
              {isRecording ? '停止' : '录像'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              isStreaming ? styles.stopButton : styles.streamButton,
              !currentDevice && styles.controlButtonDisabled
            ]}
            onPress={isStreaming ? handleStopStream : handleStartStream}
            disabled={!currentDevice}
          >
            <Video size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>
              {isStreaming ? '断开' : '直播'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 最近抓拍 */}
        {lastSnapshot && (
          <View style={styles.snapshotSection}>
            <Text style={styles.sectionTitle}>最近抓拍</Text>
            <View style={styles.snapshotContainer}>
              <Image
                source={{ uri: lastSnapshot }}
                style={styles.snapshotImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => {
                  Alert.alert('下载', '照片已保存到相册');
                }}
              >
                <Download size={16} color="#FFFFFF" />
                <Text style={styles.downloadButtonText}>下载</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 录制历史 */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>录制历史</Text>
          <View style={styles.historyItem}>
            <Text style={styles.historyItemText}>2024-01-15 14:30 - 15秒</Text>
            <TouchableOpacity
              style={styles.historyItemButton}
              onPress={() => {
                Alert.alert('播放', '视频播放功能开发中...');
              }}
            >
              <Text style={styles.historyItemButtonText}>播放</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyItemText}>2024-01-14 09:15 - 23秒</Text>
            <TouchableOpacity
              style={styles.historyItemButton}
              onPress={() => {
                Alert.alert('播放', '视频播放功能开发中...');
              }}
            >
              <Text style={styles.historyItemButtonText}>播放</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 设备状态 */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>设备状态</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>摄像头状态:</Text>
            <Text style={[
              styles.statusValue,
              { color: currentDevice?.isOnline ? '#10B981' : '#EF4444' }
            ]}>
              {currentDevice?.isOnline ? '在线' : '离线'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>存储空间:</Text>
            <Text style={styles.statusValue}>2.1GB / 8GB</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>录制模式:</Text>
            <Text style={styles.statusValue}>
              {isRecording ? '录制中' : '待机'}
            </Text>
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 240,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  videoStream: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoStreamText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoStreamSubText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  videoPlaceholderSubText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  controlButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  snapshotButton: {
    backgroundColor: '#8B5CF6',
  },
  recordButton: {
    backgroundColor: '#EF4444',
  },
  streamButton: {
    backgroundColor: '#3B82F6',
  },
  stopButton: {
    backgroundColor: '#6B7280',
  },
  controlButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0.1,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  snapshotSection: {
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
  snapshotContainer: {
    position: 'relative',
  },
  snapshotImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  downloadButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  historySection: {
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
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyItemText: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyItemButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  historyItemButtonText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '500',
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});
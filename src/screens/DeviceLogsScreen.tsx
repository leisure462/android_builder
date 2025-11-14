import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '../store';
import { Clock, User, Lock, Unlock } from 'lucide-react-native';
import { deviceLogger } from '../services/logger';

export const DeviceLogsScreen = () => {
  const { deviceStatus } = useAppStore();
  const logs = deviceLogger.getLogs(20); // 获取最近20条日志

  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    return action === 'lock' ? (
      <Lock size={16} color="#EF4444" />
    ) : (
      <Unlock size={16} color="#10B981" />
    );
  };

  const getActionText = (action: string) => {
    return action === 'lock' ? '锁定' : '开启';
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'password': return '密码';
      case 'fingerprint': return '指纹';
      case 'remote': return '远程';
      case 'key': return '钥匙';
      default: return method;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 设备状态摘要 */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>设备状态</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>当前状态:</Text>
            <Text style={[
              styles.statusValue,
              { color: deviceStatus?.isLocked ? '#EF4444' : '#10B981' }
            ]}>
              {deviceStatus?.isLocked ? '已锁定' : '已开启'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>最后操作:</Text>
            <Text style={styles.statusValue}>
              {deviceStatus?.lastAction ? getActionText(deviceStatus.lastAction.type) : '无记录'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>操作方式:</Text>
            <Text style={styles.statusValue}>
              {deviceStatus?.lastAction ? getMethodText(deviceStatus.lastAction.method) : '无记录'}
            </Text>
          </View>
          {deviceStatus?.lastActionAt && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>操作时间:</Text>
              <Text style={styles.statusValue}>
                {formatDate(deviceStatus.lastActionAt)}
              </Text>
            </View>
          )}
        </View>

        {/* 操作日志 */}
        <View style={styles.logsCard}>
          <Text style={styles.logsTitle}>最近操作记录</Text>
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>暂无操作记录</Text>
          ) : (
            <View>
              {logs.map((log, index) => (
                <View key={index} style={styles.logItem}>
                  <View style={styles.logHeader}>
                    {getActionIcon(log.type)}
                    <Text style={styles.logAction}>
                      {getActionText(log.type)}
                    </Text>
                    <Text style={styles.logMethod}>
                      ({getMethodText(log.method)})
                    </Text>
                  </View>
                  <View style={styles.logDetails}>
                    <View style={styles.logDetailRow}>
                      <Clock size={12} color="#9CA3AF" />
                      <Text style={styles.logTime}>
                        {formatDate(log.timestamp)}
                      </Text>
                    </View>
                    {log.userId && (
                      <View style={styles.logDetailRow}>
                        <User size={12} color="#9CA3AF" />
                        <Text style={styles.logUser}>
                          用户: {log.userId}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 统计信息 */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>统计信息</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>今日开锁</Text>
              <Text style={styles.statValue}>12次</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>今日上锁</Text>
              <Text style={styles.statValue}>8次</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>本周总计</Text>
              <Text style={styles.statValue}>156次</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>异常记录</Text>
              <Text style={styles.statValue}>0次</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
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
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  logsCard: {
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
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
  },
  logItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  logMethod: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  logDetails: {
    marginTop: 8,
  },
  logDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  logUser: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
});
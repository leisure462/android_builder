import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useAppStore } from '../store';
import { Fingerprint, Plus, Trash2, User, Clock } from 'lucide-react-native';
import { Fingerprint as FingerprintType } from '../types';

export const FingerprintScreen = () => {
  const { fingerprints, addFingerprint, removeFingerprint } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [fingerprintName, setFingerprintName] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleStartEnrollment = async () => {
    if (!fingerprintName.trim()) {
      Alert.alert('错误', '请输入指纹名称');
      return;
    }

    setIsEnrolling(true);

    try {
      // 模拟指纹录入过程
      await simulateFingerprintEnrollment();
      
      const fingerprint: FingerprintType = {
        id: 'fp_' + Date.now(),
        name: fingerprintName,
        fingerprintId: fingerprints.length + 1,
        isActive: true,
        enrolledAt: new Date(),
        useCount: 0,
        quality: Math.floor(Math.random() * 30) + 70, // 模拟质量分数
      };

      addFingerprint(fingerprint);
      
      // 重置表单
      setFingerprintName('');
      setShowAddModal(false);
      
      Alert.alert('成功', '指纹录入成功');
      
    } catch (error) {
      Alert.alert('录入失败', '指纹录入失败，请重试');
    } finally {
      setIsEnrolling(false);
    }
  };

  const simulateFingerprintEnrollment = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟录入过程（实际项目中应该调用真实的指纹模块API）
        const success = Math.random() > 0.2; // 80%成功率
        if (success) {
          resolve();
        } else {
          reject(new Error('Fingerprint enrollment failed'));
        }
      }, 3000); // 模拟3秒的录入过程
    });
  };

  const handleDeleteFingerprint = (fingerprint: FingerprintType) => {
    Alert.alert(
      '删除指纹',
      `确定要删除指纹 "${fingerprint.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            removeFingerprint(fingerprint.id);
            Alert.alert('成功', '指纹已删除');
          },
        },
      ]
    );
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return '#10B981';
    if (quality >= 70) return '#F59E0B';
    return '#EF4444';
  };

  const getQualityText = (quality: number) => {
    if (quality >= 90) return '优秀';
    if (quality >= 70) return '良好';
    return '一般';
  };

  const renderFingerprintItem = (fingerprint: FingerprintType) => (
    <View key={fingerprint.id} style={styles.fingerprintItem}>
      <View style={styles.fingerprintInfo}>
        <View style={styles.fingerprintHeader}>
          <Fingerprint size={20} color="#4F46E5" />
          <Text style={styles.fingerprintName}>{fingerprint.name}</Text>
          <View style={[
            styles.qualityBadge,
            { backgroundColor: getQualityColor(fingerprint.quality) }
          ]}>
            <Text style={styles.qualityText}>
              {getQualityText(fingerprint.quality)}
            </Text>
          </View>
        </View>
        
        <View style={styles.fingerprintDetails}>
          <View style={styles.detailRow}>
            <User size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>
              ID: {fingerprint.fingerprintId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>
              录入时间: {fingerprint.enrolledAt.toLocaleDateString('zh-CN')}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.useCountText}>
              使用次数: {fingerprint.useCount}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteFingerprint(fingerprint)}
      >
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 指纹录入说明 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>指纹录入说明</Text>
          <Text style={styles.infoText}>
            1. 点击"添加指纹"按钮开始录入{'\n'}
            2. 将手指放在指纹传感器上{'\n'}
            3. 按照提示重复按压多次{'\n'}
            4. 等待录入完成提示
          </Text>
        </View>

        {/* 已录入指纹 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>已录入指纹</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
              disabled={isEnrolling}
            >
              <Plus size={16} color="#4F46E5" />
              <Text style={styles.addButtonText}>
                {isEnrolling ? '录入中...' : '添加指纹'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {fingerprints.length === 0 ? (
            <Text style={styles.emptyText}>暂无录入的指纹</Text>
          ) : (
            <View>
              {fingerprints.map(renderFingerprintItem)}
            </View>
          )}
        </View>

        {/* 指纹容量信息 */}
        <View style={styles.capacityCard}>
          <Text style={styles.capacityTitle}>指纹容量</Text>
          <View style={styles.capacityInfo}>
            <Text style={styles.capacityText}>
              已录入: {fingerprints.length}/100
            </Text>
            <View style={styles.capacityBar}>
              <View style={[
                styles.capacityFill,
                { width: `${(fingerprints.length / 100) * 100}%` }
              ]} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 添加指纹模态框 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isEnrolling && setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加指纹</Text>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>指纹名称</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="例如：右手拇指"
                value={fingerprintName}
                onChangeText={setFingerprintName}
                editable={!isEnrolling}
              />
            </View>
            
            {isEnrolling && (
              <View style={styles.enrollingInfo}>
                <Fingerprint size={48} color="#4F46E5" />
                <Text style={styles.enrollingText}>正在录入指纹...</Text>
                <Text style={styles.enrollingSubText}>
                  请将手指放在指纹传感器上
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButtonCancel,
                  isEnrolling && styles.modalButtonDisabled
                ]}
                onPress={() => setShowAddModal(false)}
                disabled={isEnrolling}
              >
                <Text style={styles.modalButtonTextCancel}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButtonConfirm,
                  isEnrolling && styles.modalButtonDisabled
                ]}
                onPress={handleStartEnrollment}
                disabled={isEnrolling}
              >
                <Text style={styles.modalButtonTextConfirm}>
                  {isEnrolling ? '录入中...' : '开始录入'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  fingerprintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  fingerprintInfo: {
    flex: 1,
  },
  fingerprintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fingerprintName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
    marginRight: 12,
  },
  qualityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  fingerprintDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  useCountText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  capacityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  capacityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacityText: {
    fontSize: 14,
    color: '#6B7280',
  },
  capacityBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginLeft: 16,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  enrollingInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  enrollingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F46E5',
    marginTop: 12,
  },
  enrollingSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalButtonTextCancel: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
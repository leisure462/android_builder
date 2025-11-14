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
  Modal,
} from 'react-native';
import { useAppStore } from '../store';
import { Plus, Key, Trash2, Clock, User } from 'lucide-react-native';
import { Password, PasswordType } from '../types';

export const PasswordScreen = () => {
  const { passwords, tempPasswords, addPassword, removePassword } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordType, setPasswordType] = useState<PasswordType>('temp');
  const [validDays, setValidDays] = useState('7');
  const [maxUses, setMaxUses] = useState('10');

  const handleAddPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('错误', '密码长度至少为6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致');
      return;
    }

    const password: Password = {
      id: 'pwd_' + Date.now(),
      type: passwordType,
      value: newPassword, // 实际项目中应该加密存储
      isActive: true,
      validFrom: new Date(),
      validUntil: passwordType === 'temp' ? 
        new Date(Date.now() + parseInt(validDays) * 24 * 60 * 60 * 1000) : undefined,
      maxUses: passwordType === 'temp' ? parseInt(maxUses) : undefined,
      usedCount: 0,
      createdBy: 'user123',
      createdAt: new Date(),
    };

    addPassword(password);
    
    // 重置表单
    setNewPassword('');
    setConfirmPassword('');
    setShowAddModal(false);
    
    Alert.alert('成功', '密码添加成功');
  };

  const handleDeletePassword = (password: Password) => {
    Alert.alert(
      '删除密码',
      `确定要删除密码 "${password.value}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            removePassword(password.id);
            Alert.alert('成功', '密码已删除');
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN');
  };

  const isPasswordExpired = (password: Password) => {
    if (password.validUntil && new Date() > password.validUntil) {
      return true;
    }
    if (password.maxUses && password.usedCount >= password.maxUses) {
      return true;
    }
    return false;
  };

  const renderPasswordItem = (password: Password) => (
    <View key={password.id} style={styles.passwordItem}>
      <View style={styles.passwordInfo}>
        <View style={styles.passwordHeader}>
          <Key size={16} color="#6B7280" />
          <Text style={styles.passwordValue}>{password.value}</Text>
          <View style={[
            styles.passwordTypeBadge,
            password.type === 'master' && styles.masterBadge,
            password.type === 'temp' && styles.tempBadge,
            password.type === 'guest' && styles.guestBadge,
          ]}>
            <Text style={styles.passwordTypeText}>
              {password.type === 'master' ? '主密码' : 
               password.type === 'temp' ? '临时密码' : '访客密码'}
            </Text>
          </View>
        </View>
        
        <View style={styles.passwordDetails}>
          {password.validUntil && (
            <View style={styles.detailRow}>
              <Clock size={14} color="#9CA3AF" />
              <Text style={[
                styles.detailText,
                isPasswordExpired(password) && styles.expiredText
              ]}>
                有效期至: {formatDate(password.validUntil)}
              </Text>
            </View>
          )}
          
          {password.maxUses && (
            <View style={styles.detailRow}>
              <User size={14} color="#9CA3AF" />
              <Text style={styles.detailText}>
                使用次数: {password.usedCount}/{password.maxUses}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.createdText}>
              创建时间: {formatDate(password.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePassword(password)}
      >
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 主密码区域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主密码</Text>
          {passwords.filter(p => p.type === 'master').length === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setPasswordType('master');
                setShowAddModal(true);
              }}
            >
              <Plus size={20} color="#4F46E5" />
              <Text style={styles.addButtonText}>设置主密码</Text>
            </TouchableOpacity>
          ) : (
            <View>
              {passwords.filter(p => p.type === 'master').map(renderPasswordItem)}
            </View>
          )}
        </View>

        {/* 临时密码区域 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>临时密码</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setPasswordType('temp');
                setShowAddModal(true);
              }}
            >
              <Plus size={16} color="#4F46E5" />
              <Text style={styles.addButtonText}>添加</Text>
            </TouchableOpacity>
          </View>
          
          {tempPasswords.filter(p => p.type === 'temp').length === 0 ? (
            <Text style={styles.emptyText}>暂无临时密码</Text>
          ) : (
            <View>
              {tempPasswords.filter(p => p.type === 'temp').map(renderPasswordItem)}
            </View>
          )}
        </View>

        {/* 访客密码区域 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>访客密码</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setPasswordType('guest');
                setShowAddModal(true);
              }}
            >
              <Plus size={16} color="#4F46E5" />
              <Text style={styles.addButtonText}>添加</Text>
            </TouchableOpacity>
          </View>
          
          {passwords.filter(p => p.type === 'guest').length === 0 ? (
            <Text style={styles.emptyText}>暂无访客密码</Text>
          ) : (
            <View>
              {passwords.filter(p => p.type === 'guest').map(renderPasswordItem)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 添加密码模态框 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {passwordType === 'master' ? '设置主密码' :
               passwordType === 'temp' ? '添加临时密码' : '添加访客密码'}
            </Text>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>密码</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="请输入密码（至少6位）"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>确认密码</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            {passwordType === 'temp' && (
              <>
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalLabel}>有效天数</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="请输入有效天数"
                    value={validDays}
                    onChangeText={setValidDays}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalLabel}>最大使用次数</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="请输入最大使用次数"
                    value={maxUses}
                    onChangeText={setMaxUses}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleAddPassword}
              >
                <Text style={styles.modalButtonTextConfirm}>确定</Text>
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
  passwordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  passwordInfo: {
    flex: 1,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
    marginRight: 12,
  },
  passwordTypeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  masterBadge: {
    backgroundColor: '#EF4444',
  },
  tempBadge: {
    backgroundColor: '#F59E0B',
  },
  guestBadge: {
    backgroundColor: '#8B5CF6',
  },
  passwordTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  passwordDetails: {
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
  expiredText: {
    color: '#EF4444',
  },
  createdText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
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
  modalButtonTextCancel: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
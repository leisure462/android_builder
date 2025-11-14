import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Lock, Key, Fingerprint, Video, Settings, History } from 'lucide-react-native';
import { View } from 'react-native';

// 导入页面组件
import { LockControlScreen } from '../screens/LockControlScreen';
import { PasswordScreen } from '../screens/PasswordScreen';
import { FingerprintScreen } from '../screens/FingerprintScreen';
import { VideoScreen } from '../screens/VideoScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DeviceLogsScreen } from '../screens/DeviceLogsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { DeviceSetupScreen } from '../screens/DeviceSetupScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 底部导航栏组件
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#F9FAFB',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tab.Screen 
        name="LockControl" 
        component={LockControlScreen}
        options={{
          title: '门锁控制',
          tabBarLabel: '控制',
          tabBarIcon: ({ color, size }) => (
            <Lock size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Password" 
        component={PasswordScreen}
        options={{
          title: '密码管理',
          tabBarLabel: '密码',
          tabBarIcon: ({ color, size }) => (
            <Key size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Fingerprint" 
        component={FingerprintScreen}
        options={{
          title: '指纹管理',
          tabBarLabel: '指纹',
          tabBarIcon: ({ color, size }) => (
            <Fingerprint size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Video" 
        component={VideoScreen}
        options={{
          title: '视频监控',
          tabBarLabel: '监控',
          tabBarIcon: ({ color, size }) => (
            <Video size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="DeviceLogs" 
        component={DeviceLogsScreen}
        options={{
          title: '设备日志',
          tabBarLabel: '日志',
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: '设置',
          tabBarLabel: '设置',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 主导航器组件
export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DeviceSetup" component={DeviceSetupScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};
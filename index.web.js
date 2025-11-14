import { AppRegistry, Platform } from 'react-native';
import App from './App';

if (Platform.OS === 'web') {
  // Web平台特定的初始化代码
  const rootTag = document.getElementById('root') || document.getElementById('main');
  if (rootTag) {
    AppRegistry.runApplication('ESP32LockControl', { rootTag });
  }
} else {
  AppRegistry.registerComponent('main', () => App);
}
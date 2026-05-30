/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import {name as appName} from './app.json';
import App from './App';

// Native modules emit results-only events; suppress benign capability warnings.
LogBox.ignoreLogs([
  'Sensor TYPE_GYROSCOPE not available',
  '[ImuModule]',
  '[SignalModule]',
  '[CameraModule]',
]);

AppRegistry.registerComponent(appName, () => App);

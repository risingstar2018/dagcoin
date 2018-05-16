import { AppRegistry } from 'react-native';
import Main from './app/main';
import './shim.js'

AppRegistry.registerComponent('dagcoin', () => Main);

AppRegistry.runApplication('dagcoin', {
    rootTag: document.getElementById('react-root')
});

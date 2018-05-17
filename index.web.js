import { AppRegistry } from 'react-native';
import Main from './app/main';

AppRegistry.registerComponent('dagcoin', () => Main);

AppRegistry.runApplication('dagcoin', {
    rootTag: document.getElementById('react-root')
});

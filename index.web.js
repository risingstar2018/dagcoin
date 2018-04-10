import { AppRegistry } from 'react-native';
import Main from './app/mainWeb';

AppRegistry.registerComponent('dagcoin', () => Main);

AppRegistry.runApplication('dagcoin', {
    rootTag: document.getElementById('react-root')
});

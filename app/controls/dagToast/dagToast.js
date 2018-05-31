import React, { Component } from 'react';
import Toast from 'react-native-easy-toast';
import DagToastManager from './dagToastManager';

class DagToast extends Component {
  constructor() {
    super();

    this.state = {
      position: null,
      style: null,
    };

    DagToastManager.registerToast(this);
  }

  show(content, position, duration, style) {
    this.setState({
      position,
      style,
    });

    this.refs.toast.show(content, duration);
  }

  render() {
    return (<Toast style={this.state.style} position={this.state.position} ref="toast" />);
  }
}

export default DagToast;

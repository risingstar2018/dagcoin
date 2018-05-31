import React, { PureComponent } from 'react';
import DagSideMenuContent from './dagSideMenuContent';
import SideMenu from 'react-native-side-menu';
import DagSideMenuManager from './dagSideMenuManager';
import { Platform } from 'react-native';

class DagSideMenu extends PureComponent {
  constructor() {
    super();

    this.state = {
      isMenuOpen: false,
      disabled: false,
    };

    DagSideMenuManager.registerSideMenu(this);
  }

  toggle() {
    if (this.state.disabled) {
      return;
    }

    this.setState({
      isMenuOpen: !this.state.isMenuOpen,
    });
  }

  disable() {
    if (this.state.disabled) {
      return;
    }
    this.setState({ disabled: true });
  }

  enable() {
    if (!this.state.disabled) {
      return;
    }
    this.setState({ disabled: false });
  }

  render() {
    return (
      <SideMenu
        menu={<DagSideMenuContent />}
        disableGestures={Platform.OS === 'web' || this.state.disabled}
        isOpen={this.state.isMenuOpen}
        onChange={value => this.setState({ isMenuOpen: value })}
      >
        {this.props.children}
      </SideMenu>
    );
  }
}

export default DagSideMenu;

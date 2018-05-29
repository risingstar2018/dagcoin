import React, { Component } from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { container, text, font } from '../styles/main';

import DagButton from '../controls/dagButton';
import Navigator from '../navigator/navigationManager';
import { routes } from '../navigator/routes';
import BasePageLayout from '../general/basePageLayout';
import DagCheckBox from '../controls/dagCheckBox';

class ConfirmationScreen extends Component {
  constructor() {
    super();

    this.state = {
      activeSlide: 0,
      checkbox1: false,
      checkbox2: false,
      checkbox3: false,
    };
  }

  onConfirmClick() {
    Navigator.to(this, routes.SplashRegistration, { permanent: true, sideMenu: false });
  }

  renderTermsContainer() {
    if (!this.state.checkbox1 || !this.state.checkbox2) {
      return null;
    }

    return (
      <View style={StyleSheet.flatten([styles.termsContainer])}>
        <View style={StyleSheet.flatten([styles.checkboxContainer])}>
          <DagCheckBox
            label="I have read, understood and agree to terms of use."
            labelStyle={StyleSheet.flatten([container.m15l])}
            value={this.state.checkbox3}
            onValueChange={value => this.setState({ checkbox3: value })}
          />
        </View>
        <View>
          <DagButton
            onClick={this.onConfirmClick.bind(this)}
            disabled={!this.state.checkbox1 || !this.state.checkbox2 || !this.state.checkbox3}
            text="CONFIRM & FINISH"
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <BasePageLayout style={container.p0}>
        <View style={container.p40}>
          <Text style={StyleSheet.flatten([font.size24, text.textCenter])}>Almost done!</Text>
          <Text style={StyleSheet.flatten([text.textCenter, container.m10t])}>As a security precaution we would like to go over some major points</Text>
        </View>
        <View style={StyleSheet.flatten([styles.checkboxContainer, container.p40l, container.p40r])}>
          <DagCheckBox
            label="I understand that my funds are held securely on this device, not by a company."
            labelStyle={StyleSheet.flatten([container.m15l])}
            value={this.state.checkbox1}
            onValueChange={value => this.setState({ checkbox1: value })}
          />
          <DagCheckBox
            label="I understand that if this app is moved to another device or deleted, my dagcoin can only be recovered with the backup phrase."
            labelStyle={StyleSheet.flatten([container.m15l])}
            containerStyle={container.m40b}
            value={this.state.checkbox2}
            onValueChange={value => this.setState({ checkbox2: value })}
          />
        </View>
        {this.renderTermsContainer()}
      </BasePageLayout>
    );
  }
}

const styles = StyleSheet.create({
  termsContainer: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 20,
    backgroundColor: '#e4e4e4',
    borderStyle: 'solid',
    borderTopColor: '#ddd',
  },
});

export default ConfirmationScreen;

import React, { Component } from 'react';

import { StyleSheet, Text, Platform, View } from 'react-native';

import { container, font, text } from '../../../styles/main';
import BasePageLayout from '../../../general/basePageLayout';
import { validators } from '../../../controls/dagForm';
import DagPassword from '../../../controls/dagPassword';
import DagButton from '../../../controls/dagButton';
import DagForm from '../../../controls/dagForm';
import DagFileInput from '../../../controls/dagFileInput/dagFileInput';
import SotorageService from '../../../services/storage/index';

class RecoverBackup extends Component {
  constructor() {
    super();

    this.state = {
      password: '',
      result: '',
    };
  }

  onPasswordChange(value) {
    this.setState({
      password: value,
    });
  }

  onImportClick() {
    console.log('Import');
    console.log(this.state);
    this.state.file.getStream().then((x) => {
    });
  }

  onFileSelected(file) {
    this.setState({
      file,
    });

    const ss = new SotorageService();

    ss.set('testprop', 'testvalue').then(() => {
      ss.get('testprop').then((result) => {
        this.setState({ result });
      }, (err1) => {
        this.setState({ result: 'err read' });
      });
    }, (err2) => {
      this.setState({ result: 'err write: ' });
    });
  }

  render() {
    return (
      <BasePageLayout style={StyleSheet.flatten([container.p40, container.m40t])}>
        <DagForm style={container.m5b}>
          <View><Text>{this.state.result}</Text></View>

          <DagFileInput
            onValueChange={this.onFileSelected.bind(this)}
            validators={[validators.required()]}
            value={this.state.file}
            label="Your wallet file"
            style={container.m20b}
          />

          <DagPassword
            style={container.m20b}
            label="Password"
            validators={[
                                     validators.required(),
                                 ]}
            value={this.state.password}
            placeholder="Password"
            onValueChange={this.onPasswordChange.bind(this)}
          />

          <DagButton
            onClick={this.onImportClick.bind(this)}
            type="submit"
            text={'Import'.toUpperCase()}
          />
        </DagForm>
        <Text style={StyleSheet.flatten([font.size12, text.textRed, text.textCenter])}>WARNING: This will permanently delete all your existing wallets!</Text>
      </BasePageLayout>
    );
  }
}

const styles = StyleSheet.create({
  compressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compressControl: {
    position: 'absolute',
    right: 0,
  },
});

export default RecoverBackup;

import React, { Component } from 'react';

import { StyleSheet, View, Text, TextInput, Platform } from 'react-native';
import { font } from '../styles/main';
import DagFormControl from './dagFormControl';

class DagTextInput extends Component {
  constructor() {
    super();

    this.state = {
      isDirty: false,
      focused: false,
    };

    this.isInvalid = this.isInvalid.bind(this);
  }

  onValueChange(value) {
    this.setState({ isDirty: true });
    this.props.onValueChange(value);
  }

  onLabelClick() {
    this.refs.input.focus();
  }

  isInvalid() {
    return this.props.invalid && (this.state.isDirty || this.props.isSubmitted);
  }

  getInputStyles() {
    if (Platform.OS === 'web') {
      return {
        outline: 'none',
      };
    }
    return null;
  }

  render() {
    return (
      <DagFormControl {...this.props} onLabelClick={this.onLabelClick.bind(this)} isDirty={this.state.isDirty}>
        <View style={StyleSheet.flatten([styles.inputContainer, this.props.inputContainerStyle])}>
          <TextInput
            ref="input"
            underlineColorAndroid="rgba(0,0,0,0)"
            onFocus={() => this.setState({ focused: true })}
            onBlur={() => this.setState({ focused: false })}
            multiline={this.props.multiline}
            style={StyleSheet.flatten([
                            styles.input,
                            font.size14,
                            this.getInputStyles(),
                            this.props.style,
                            this.isInvalid() ? styles.invalid : null,
                            this.state.focused ? styles.focused : null,
                        ])}
            onChangeText={this.onValueChange.bind(this)}
            value={this.props.value}
            secureTextEntry={this.props.password}
            placeholder={this.props.placeholder}
            placeholderTextColor={this.props.placeholderTextColor || '#8597a7'}
            maxLength={this.props.maxLength}
          />
          {this.props.children}
        </View>
      </DagFormControl>
    );
  }
}

DagTextInput.defaultProps = {
  onValueChange: (value) => {},
  disabled: false,
  required: false,
};

const styles = StyleSheet.create({
  inputContainer: {
  },
  input: {
    borderRadius: 5,
    borderColor: '#eee',
    borderStyle: 'solid',
    borderWidth: 2,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 22,
    paddingRight: 22,
    color: '#666',
    backgroundColor: '#fff',
  },
  focused: {
    borderColor: '#999',
    backgroundColor: '#fafafa',
  },
  invalid: {
    borderColor: '#d51f26',
  },
});

export default DagTextInput;

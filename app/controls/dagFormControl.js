import React, { Component } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { container, font, text, controls } from '../styles/main';
import DagSimpleButton from './dagSimpleButton';

const LABEL_POSITION = {
  TOP: 'TOP',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
};

class DagFormControl extends Component {
  constructor() {
    super();

    this.renderLabel = this.renderLabel.bind(this);
    this.renderDescription = this.renderDescription.bind(this);
    this.renderErrors = this.renderErrors.bind(this);
    this.isInvalid = this.isInvalid.bind(this);
  }

  isInvalid() {
    return this.props.invalid && (this.props.isDirty || this.props.isSubmitted);
  }

  renderLabel(position) {
    if (position !== this.props.labelPosition) {
      return;
    }

    if (this.props.renderLabel) {
      return this.props.renderLabel(this.props.label);
    }

    const renderAsterisk = () => {
      if (this.props.required) {
        return (<Text style={text.textRed}>*</Text>);
      }
      return null;
    };

    if (this.props.label) {
      return (<DagSimpleButton style={[styles.labelContainer, this.props.labelContainerStyle]} onClick={this.props.onLabelClick}>
        <Text style={StyleSheet.flatten([controls.label, container.m5b, this.props.labelStyle])}>
          {this.props.label.toUpperCase()} {renderAsterisk()}
        </Text>
      </DagSimpleButton>);
    }

    return null;
  }

  renderDescription() {
    if (this.props.renderDescription) {
      return this.props.renderDescription(this.props.description);
    }

    if (this.props.description) {
      return (<DagSimpleButton style={[styles.descriptionContainer, this.props.descriptionContainerStyle]} onClick={this.props.onDescriptionClick}>
        <Text style={StyleSheet.flatten([controls.description, container.m5t, this.props.descriptionStyle])}>
          {this.props.description}
        </Text>
              </DagSimpleButton>);
    }

    return null;
  }

  renderErrors() {
    if (this.props.renderErrors) {
      return this.props.renderErrors(this.props.errors);
    }

    if (this.isInvalid() && this.props.errors.length) {
      return (<View>
        {this.props.errors.map((err, i) => (
          <Text
            key={`error-${i}`}
            style={StyleSheet.flatten([
                                text.textRed,
                                font.size10,
                                font.weight700,
                                container.m5t,
                                this.props.errorStyle,
                            ])}
          >
            {err}
          </Text>
                        ))}
      </View>);
    }

    return null;
  }

  render() {
    if (this.props.labelPosition === LABEL_POSITION.LEFT || this.props.labelPosition === LABEL_POSITION.RIGHT) {
      return (
        <View style={StyleSheet.flatten([this.props.containerStyle])}>
          <View style={[styles.inlineContainer, this.props.inlineContainerStyle]}>
            {this.renderLabel(LABEL_POSITION.LEFT)}
            {this.props.children}
            {this.renderLabel(LABEL_POSITION.RIGHT)}
          </View>
          {this.renderDescription()}
          {this.renderErrors()}
        </View>
      );
    }

    return (
      <View style={StyleSheet.flatten([this.props.containerStyle])}>
        {this.renderLabel(LABEL_POSITION.TOP)}
        {this.props.children}
        {this.renderDescription()}
        {this.renderErrors()}
      </View>
    );
  }
}

DagFormControl.defaultProps = {
  onLabelClick: () => {},
  onDescriptionClick: () => {},
  containerStyle: null,
  inlineContainerStyle: null,
  renderLabel: null,
  label: null,
  labelContainerStyle: null,
  labelStyle: null,
  labelPosition: LABEL_POSITION.TOP,
  renderDescription: null,
  description: null,
  descriptionStyle: null,
  descriptionContainerStyle: null,
  renderErrors: null,
  errors: [],
  errorStyle: null,
  invalid: false,
  isDirty: false,
  isSubmitted: false,
};

const styles = StyleSheet.create({
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelContainer: {
    flexGrow: 1,
    flex: 1,
  },
  descriptionContainer: {

  },
});

export default DagFormControl;
export { LABEL_POSITION };


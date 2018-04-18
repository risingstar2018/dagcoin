import React, {Component} from 'react';

import {
    StyleSheet, View
} from 'react-native';

const validators = {
    required: (error) => (text) => {
        return {isValid: !!text, error: error};
    },
    maxLength: (length, error) => (text) => {
        return {isValid: (text || '').length <= length, error: error};
    },
    minLength: (length, error) => (text) => {
        return {isValid: (text || '').length >= length, error: error};
    }
};

const validate = (value, validators) => {
    if (validators) {
        const validationResults = validators.map(v => v(value));
        const result = {
            isValid: validationResults.filter(r => r.isValid).length === validators.length,
            errors: validationResults.filter(r => !r.isValid && r.error).map(r => r.error)
        };
        return result;
    }

    return {
        isValid: true,
        errors: []
    };
};

const validateChilds = (children) => {
    if (children.props && children.props.validators) {
        const validationResult = validate(children.props.value, children.props.validators);
        return validationResult.isValid;
    } else if (children.length) {
        const validationResult = children.filter((c) => validateChilds(c)).length === children.length;
        return validationResult;
    } else {
        return true;
    }
};

class DagForm extends Component {
    constructor() {
        super();

        this.state = {
            isSubmitted: false
        };

        this.validate = this.validate.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.submit = this.submit.bind(this);
        this.renderWrappedComponents = this.renderWrappedComponents.bind(this);
    }

    submit(onSubmit) {
        this.setState({
            isSubmitted: true
        });

        const isValid = this.validate();

        if (!isValid) {
            return;
        }

        if (onSubmit) {
            onSubmit();
        }
    }

    onFormChange() {
        this.validate();
    }

    validate() {
        return validateChilds(this.props.children);
    }

    renderWrappedComponents() {
        const isValid = validateChilds(this.props.children);

        const wrappedControls = React.Children.map(this.props.children, (child) => {
            if (child.props.validators) {
                const validationResult = validate(child.props.value, child.props.validators);

                return React.cloneElement(child, {
                    errors: validationResult.errors,
                    invalid: !validationResult.isValid,
                    isSubmitted: this.state.isSubmitted
                });
            }

            if (child.props.type === 'submit') {
                return React.cloneElement(child, {
                    onClick: () => {
                        this.submit(child.props.onClick);
                    },
                    disabled: !isValid
                });
            }

            return child;
        });

        return wrappedControls;
    }

    render() {
        return (
            <View style={StyleSheet.flatten([styles.container, this.props.style])}>
                {this.renderWrappedComponents()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {}
});

export default DagForm;
export {validators, validate};

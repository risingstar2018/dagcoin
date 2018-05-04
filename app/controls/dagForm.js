import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';
import {container, font, text} from "../styles/main";

const validators = {
    required: (error) => (text) => {
        return {isValid: !!text, error: error};
    },
    maxLength: (length, error) => (text) => {
        return {isValid: (text || '').length <= length, error: error};
    },
    minLength: (length, error) => (text) => {
        return {isValid: (text || '').length >= length, error: error};
    },
    validWalletAddress: (error) => (text) => { //todo byteballcore
        return {isValid: true, error: error};
    },
    validEmail: (error) => (text) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let isValid = true;

        if (text){
            isValid = re.test(text.toLowerCase());
        }

        return {isValid: isValid, error: error};
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
    if (children.props && children.props.validators) { //check validators
        const validationResult = validate(children.props.value, children.props.validators);
        return validationResult.isValid;
    } else if (children.props && children.props.children && children.props.children.filter) { //nested childrens
        const validationResult = children.props.children.filter((c) => validateChilds(c)).length === children.props.children.length;
        return validationResult;
    } else if (children.length) { //root childrens
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
        this.renderErrors = this.renderErrors.bind(this);
        this.renderWrappedComponents = this.renderWrappedComponents.bind(this);
    }

    submit(onSubmit) {
        this.setState({
            isSubmitted: true
        });

        const isValid = this.validate(true);

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

    validate(isSubmitted) {
        const isFormValid = !isSubmitted || validate(null, this.props.validators).isValid;
        const isChildrenValid = validateChilds(this.props.children);
        return isFormValid && isChildrenValid;
    }

    renderErrors() {
        if (!this.state.isSubmitted){
            return null;
        }

        const formValidationResult = validate(null, this.props.validators);

        if (formValidationResult.isValid || !(formValidationResult.errors && formValidationResult.errors.length)) {
            return null;
        }

        return (
            <View style={container.m15b}>
                {formValidationResult.errors.map((err, i) => {
                    return (
                        <Text key={'form-error-'+i} style={StyleSheet.flatten([text.textRed, font.size10, font.weight700, container.m5t, this.props.errorStyle])}>
                            {err}
                        </Text>
                    );
                })}
            </View>);
    }

    renderWrappedComponents() {
        const isValid = this.validate(this.state.isSubmitted);

        const wrappedControls = (child) => {
            if (!child) {
                return null;
            }

            if (!child.props) {
                return child;
            }

            if (child.props.validators) {
                const validationResult = validate(child.props.value, child.props.validators);

                return React.cloneElement(child, {
                    errors: validationResult.errors,
                    invalid: !validationResult.isValid,
                    isSubmitted: this.state.isSubmitted,
                    children: React.Children.map(child.props.children, (c) => {
                        return wrappedControls(c);
                    })
                });
            }

            if (child.props.type === 'submit') {
                return React.cloneElement(child, {
                    onClick: () => {
                        this.submit(child.props.onClick);
                    },
                    disabled: !isValid,
                    children: React.Children.map(child.props.children, (c) => {
                        return wrappedControls(c);
                    })
                });
            }

            return React.cloneElement(child, {
                children: React.Children.map(child.props.children, (c) => {
                    return wrappedControls(c);
                })
            });
        };

        return React.Children.map(this.props.children, (c) => {
            return wrappedControls(c);
        });
    }

    render() {
        return (
            <View style={StyleSheet.flatten([styles.container, this.props.style])}>
                {this.renderErrors()}
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

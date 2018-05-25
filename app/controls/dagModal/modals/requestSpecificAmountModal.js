import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';
import DagButton from "../../dagButton";

import {container, font, heading, text} from "../../../styles/main";
import DagModal from "../dagModal";
import DagTextInput from "../../dagTextInput";
import DagForm, {validators} from "../../dagForm";
import DagModalManager from "../dagModalManager";
import RequestSpecificAmountDetailsModal from "./requestSpecificAmountDetailsModal";

class RequestSpecificAmountModal extends Component {
    constructor() {
        super();

        this.state = {
            amount: ''
        };
    }

    onGenerateClick() {
        DagModalManager.show(<RequestSpecificAmountDetailsModal
            amount={this.state.amount}
            address={this.props.address}
            onCancel={this.props.onCancel} />);
    }

    render() {
        return (
            <DagModal onClose={this.props.onCancel}
                      style={StyleSheet.flatten([container.p30, container.m20t])}>
                <View style={[styles.container]}>
                    <DagForm>
                        <Image source={require('../../../../img/dag-symbol.png')}
                               style={[styles.dagSymbol, container.m10b]} />

                        <Text style={StyleSheet.flatten([heading.h3, container.m20b])}>
                            Request specific amount
                        </Text>

                        <DagTextInput value={this.state.amount}
                                      validators={[validators.required()]}
                                      style={[container.p40r]}
                                      placeholder={'Amount'}
                                      onValueChange={(value) => this.setState({amount: value})}>
                            <View style={styles.dIconContainer}>
                                <Image source={require('../../../../img/icon-d.png')}
                                       style={[styles.dIcon]} />
                            </View>
                        </DagTextInput>

                        <DagButton text={'Generate qr code'.toUpperCase()}
                                   type={'submit'}
                                   style={container.m20t}
                                   onClick={this.onGenerateClick.bind(this)} />
                    </DagForm>
                </View>
            </DagModal>
        );
    }
}

RequestSpecificAmountModal.defaultProps = {
    onCancel: () => {},
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    dagSymbol: {
        width: 40,
        height: 40,
        alignSelf: 'center'
    },
    dIconContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 15,
        justifyContent: 'center'
    },
    dIcon: {
        width: 15,
        height: 15
    }
});

export default RequestSpecificAmountModal;


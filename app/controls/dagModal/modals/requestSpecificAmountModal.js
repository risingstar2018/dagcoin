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
import DagSvg from "../../dagSvg/dagSvg";

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
                        <DagSvg width={40}
                                height={40}
                                source={require('../../../../svg/dag-symbol.svg')}
                                fill={'#3e4042'}
                                style={[styles.dagSymbol, container.m10b]}
                        />
                        <Text style={StyleSheet.flatten([heading.h3, container.m20b])}>
                            Request specific amount
                        </Text>

                        <DagTextInput value={this.state.amount}
                                      validators={[validators.required()]}
                                      style={[container.p40r]}
                                      placeholder={'Amount'}
                                      onValueChange={(value) => this.setState({amount: value})}>
                            <View style={styles.dIconContainer}>
                                <DagSvg width={15}
                                        height={15}
                                        source={require('../../../../svg/dag-symbol.svg')}
                                        fill={'#bbbbbb'}
                                />
                            </View>
                        </DagTextInput>

                        <DagButton text={'Generate qr code'.toUpperCase()}
                                   type={'submit'}
                                   style={container.m20t}
                                   textStyle={font.size16}
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
        alignSelf: 'center'
    },
    dIconContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 15,
        justifyContent: 'center'
    }
});

export default RequestSpecificAmountModal;


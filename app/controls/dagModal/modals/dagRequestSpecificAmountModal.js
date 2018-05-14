import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';
import DagButton from "../../dagButton";

import {container, font, text} from "../../../styles/main";
import DagModal from "../dagModal";
import DagTextInput from "../../dagTextInput";
import DagForm, {validators} from "../../dagForm";
import DagModalManager from "../dagModalManager";
import DagRequestSpecificAmountDetailsModal from "./dagRequestSpecificAmountDetailsModal";

class DagRequestSpecificAmountModal extends Component {
    constructor() {
        super();

        this.state = {
            amount: ''
        };
    }

    onGenerateClick() {
        DagModalManager.show(<DagRequestSpecificAmountDetailsModal
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

                        <Text style={StyleSheet.flatten([font.size16, font.weight600, styles.header, text.textCenter, container.m20b])}>
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
                                   textStyle={font.size16}
                                   onClick={this.onGenerateClick.bind(this)} />
                    </DagForm>
                </View>
            </DagModal>
        );
    }
}

DagRequestSpecificAmountModal.defaultProps = {
    onCancel: () => {},
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        color: 'rgb(52, 73, 94)'
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

export default DagRequestSpecificAmountModal;


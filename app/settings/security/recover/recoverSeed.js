import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';
import BasePageLayout from "../../../general/basePageLayout";
import {container, font, text} from "../../../styles/main";
import DagButton from "../../../controls/dagButton";
import DagForm, {validators} from "../../../controls/dagForm";
import DagTextInput from "../../../controls/dagTextInput";

class RecoverSeed extends Component {
    constructor() {
        super();

        this.state = {
            seed: ''
        }
    }

    onRecoverClick() {
        console.log('recover');
        console.log(this.state.seed);
    }

    render() {
        return (
            <BasePageLayout style={StyleSheet.flatten([container.p30, container.p15t])}>
                <DagForm>
                    <DagTextInput value={this.state.seed}
                                  label={'Your wallet seed:'}
                                  multiline={true}
                                  style={container.m20b}
                                  onValueChange={(value) => this.setState({seed: value})}
                                  validators={[validators.required()]}
                    />
                    <DagButton text={'Recover'.toUpperCase()}
                               style={container.m20b}
                               type={'submit'}
                               onClick={this.onRecoverClick.bind(this)}
                            />
                    <Text style={StyleSheet.flatten([font.size14, text.textRed, text.textCenter])}>WARNINGS:</Text>
                    <Text style={StyleSheet.flatten([font.size14, text.textRed, text.textCenter])}>This will permanently delete all your existing wallets!</Text>
                    <Text style={StyleSheet.flatten([font.size14, text.textRed, text.textCenter])}>Only single-sig wallets can be recovered.</Text>
                    <Text style={StyleSheet.flatten([font.size14, text.textRed, text.textCenter])}>Correspondents are not restored.</Text>
                    <Text style={StyleSheet.flatten([font.size14, text.textRed, text.textCenter])}>Do not clone wallets, stop using the original wallet with this seed.</Text>
                </DagForm>
            </BasePageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

export default RecoverSeed;

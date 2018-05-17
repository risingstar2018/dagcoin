import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';

import DagSvg from '../../../controls/dagSvg/dagSvg';
import {container, text} from "../../../styles/main";

class NoContacts extends Component {
    constructor() {
        super();
    }

    render() {
        return (<View style={StyleSheet.flatten([container.p30, container.p40t, styles.container])}>
            <View style={StyleSheet.flatten([styles.contentContainer, container.p30, container.p40b])}>
                <DagSvg width={100}
                        height={100}
                        source={require('../../../../svg/agenda.svg')}
                        style={container.m20b}
                />
                <Text style={StyleSheet.flatten([container.m20b, text.textGray, text.textCenter])}>Search result is empty or you don't have any contacts in your address book.</Text>
                <Text style={StyleSheet.flatten([text.textGray, text.textCenter])}>Press "+" in the right upper corner to add new contact.</Text>
            </View>
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f1f1'
    },
    contentContainer: {
        backgroundColor: '#ffffff',
        alignItems: 'center',
        borderRadius: 10
    }
});

export default NoContacts;

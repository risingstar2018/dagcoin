import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';
import {container} from "../../../styles/main";
import BasePageLayout from "../../../general/basePageLayout";

class FullBackup extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <BasePageLayout style={container.p20}>
                <Text>Full Backup</Text>
            </BasePageLayout>
        );
    }
}

const styles = StyleSheet.create({
});

export default FullBackup;

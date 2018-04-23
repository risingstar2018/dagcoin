import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import DagTabView from "../../../controls/dagTabView";
import BackupSeed from "./backupSeed";
import FullBackup from "./fullBackup";
import GeneralLayout from "../../../general/generalLayout";
import PageHeader from "../../../general/pageHeader";

class BackupSettings extends Component {
    constructor() {
        super();
    }

    render() {
        const tabs = [{
            title: 'Backup Seed',
            view: (<BackupSeed/>)
        }, {
            title: 'Full Backup',
            view: (<FullBackup/>)
        }];

        return (
            <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
                <PageHeader canBack={true} title={'Backup'.toUpperCase()}></PageHeader>
                <DagTabView tabs={tabs}/>
            </GeneralLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default BackupSettings;

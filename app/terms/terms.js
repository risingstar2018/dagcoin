import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';

import DagButton from '../controls/dagButton';
import DagRadioGroup from '../controls/dagRadioGroup';
import { container, text, font } from "../styles/main";
import MainPageLayout from "../general/mainPageLayout";
import PageHeader from "../general/pageHeader";

class Terms extends Component {
    constructor(){
        super();
    }

    render() {
        return (
            <MainPageLayout>
                <PageHeader title={'Terms of Use'.toUpperCase()} canBack={true} style={StyleSheet.flatten(container.p0)} ></PageHeader>
                <View style={container.p30t}>
                    <Text style={styles.paragraph}>Dagcoin wallet is a free, open source, multi-signature digital wallet.</Text>
                    <Text style={styles.paragraph}>The software does not constitute an account where the developer of this software or any third party serves as a financial intermediary or a custodian of the coins, bytes or other valuables.</Text>
                    <Text style={styles.paragraph}>While the software has undergone beta testing and continues to be improved and further developed, we cannot guarantee that there will be no bugs in the software.</Text>
                    <Text style={styles.paragraph}>You acknowledge that Your use of this software is at Your discretion and in compliance with all applicable laws.</Text>
                    <Text style={styles.paragraph}>You are responsible for safekeeping Your passwords, private key pairs, PINs and any other codes You use to access the software.</Text>
                    <Text style={styles.paragraph}>If You lose access to Your Dagcoin wallet, You acknowledge and agree that any coins, bytes or other valuables You have associated with that Dagcoin wallet will become inaccessible.</Text>
                    <Text style={styles.paragraph}>If this device gets replaced or this app deleted, the funds in the wallet can be recovered only with a backup, which should be created right after installation.</Text>
                    <Text style={styles.paragraph}>All transaction requests are irreversible.</Text>
                    <Text style={styles.paragraph}>The authors of the software cannot retrieve your private keys or passwords if you lose or forget them and cannot guarantee transaction confirmation as they do not have control over the Dagcoin network.</Text>
                    <Text style={styles.paragraph}>To the fullest extent permitted by law, this software is provided “as is” and no representations or warranties can be made of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.</Text>
                    <Text style={styles.paragraph}>The funds are held securely on this device, not by the company.</Text>
                    <Text style={styles.paragraph}>In no event shall the developers of the software be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use of the software.</Text>
                    <Text style={styles.paragraph}>You assume any and all risks associated with the use of the software.</Text>
                    <Text style={styles.paragraph}>We reserve the right to modify these terms from time to time.</Text>
                </View>
            </MainPageLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
    },
    header: {

    },
    paragraph: StyleSheet.flatten([container.m20b, font.size16])
});

export default Terms;

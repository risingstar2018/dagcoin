import React, {Component} from 'react';
import LinearGradient from 'react-native-linear-gradient';

import {
    StyleSheet, Text, View, Platform, Linking, Image
} from 'react-native';

import DagButton from "../../controls/dagButton";
import DagSimpleButton from "../../controls/dagSimpleButton";
import {routes} from "../../navigator/routes";
import Navigator from "../../navigator/navigationManager";
import externalUrlService from "../../services/externalUrlService";
import {container, font, text} from "../../styles/main";
import BasePageLayout from "../../general/basePageLayout";

class BuyDags extends Component {
    onBuyClick() {
        externalUrlService.open('https://daguniversity.com/');
    }

    onShowWalletClick() {
        Navigator.to(this, routes.Receive);
    }

    render() {
        return (
            <BasePageLayout style={[container.p0]}>
                <View style={container.center}>
                    <LinearGradient style={[styles.imageContainer, container.p50]}
                        colors={['#d51f26', '#a8191e']}>
                        <Image style={styles.image} source={require('../../../img/paperplane-buy.png')} />
                    </LinearGradient>
                    <View style={[styles.contentContainer]}>
                        <Text style={[font.weight600, font.size22, container.m30t, container.m20b, text.textCenter]}>Start sending Dagcoin</Text>
                        <Text style={[font.size16, font.weight400, text.textGray, container.m20b, text.textCenter]}>To get started, buy Dagcoin or share your address. You can receive Dagcoin from other Dagcoin wallets.</Text>
                        <DagButton style={[container.m20b, container.flex]} text={'Buy Dagcoin'.toUpperCase()} onClick={this.onBuyClick.bind(this)} />
                        <DagSimpleButton onClick={this.onShowWalletClick.bind(this)}>
                            <Text style={[font.size16, font.weight400, text.textGray, text.textCenter]}>Show wallet address</Text>
                        </DagSimpleButton>
                    </View>
                </View>
            </BasePageLayout>
        );
    }
}

const styles = StyleSheet.create({
    imageContainer: {
        alignSelf: 'stretch',
        alignItems: 'center'
    },
    image: {
        width: 90,
        height: 90
    },
    contentContainer: {
        width: 280
    }
});

export default BuyDags;

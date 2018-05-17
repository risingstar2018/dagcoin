import React, {Component} from 'react';
import Navigator from '../navigator/navigationManager';
import { routes } from '../navigator/routes';

import {
    StyleSheet, View, Text
} from 'react-native';

import { container } from "../styles/main";

import Button from "./button";
import DagButton from "../controls/dagButton";
import DagSvg from "../controls/dagSvg/dagSvg";
import BasePageLayout from "../general/basePageLayout";

const SLIDES_COUNT = 3;

class IntroScreen extends Component {
    constructor() {
        super();

        this.state = {
            activeSlide: 0
        };
    }

    getButtons() {
        const { activeSlide } = this.state;

        const slides = [];

        for (let i = 0; i < SLIDES_COUNT; i++) {
            slides.push(
                <Button
                    onClick={this.changeSlide.bind(this, i)}
                    style={StyleSheet.flatten([container.m15l, styles.dot, i === activeSlide ? styles.enabled : null])}
                    key={i}
                />
            )
        }

        return (
            <View style={StyleSheet.flatten([styles.buttonsContainer, container.m40t])}>
                {slides}
            </View>
        );
    }

    render() {
        const slides = [
            <View style={styles.slide}>
                <DagSvg width={150}
                        height={150}
                        source={require('../../svg/safe.svg')}
                />
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <DagSvg width={119}
                            height={22}
                            source={require('../../svg/dagcoin_logo.svg')}
                    />
                    <Text>is secure</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Text>This app stores your dagcoins</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer])}>
                    <Text>with cutting-edge state of the art security</Text>
                </View>
                {this.getButtons()}
                <View style={StyleSheet.flatten([container.m40t, container.m40t])}>
                    <DagButton onClick={this.changeSlide.bind(this, 1)}
                               style={StyleSheet.flatten([container.transparent, container.noBorder, styles.nextButton])}
                               textStyle={styles.nextButtonText}
                               text={"GOT IT"} />
                </View>
            </View>,
            <View style={styles.slide}>
                <DagSvg width={150}
                        height={150}
                        source={require('../../svg/transfer.svg')}
                />
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <DagSvg width={119}
                            height={22}
                            source={require('../../svg/dagcoin_logo.svg')}
                    />
                    <Text>is darn fast.</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Text>Up to 300x faster</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer])}>
                    <Text>than most alternative solutions!</Text>
                </View>
                {this.getButtons()}
                <View style={StyleSheet.flatten([container.m40t, container.m40t])}>
                    <DagButton onClick={this.changeSlide.bind(this, 2)}
                               style={StyleSheet.flatten([container.transparent, container.noBorder, styles.nextButton])}
                               textStyle={styles.nextButtonText}
                               text={"AWESOME"} />
                </View>
            </View>,
            <View style={styles.slide}>
                <DagSvg width={150}
                        height={150}
                        source={require('../../svg/business.svg')}
                />
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <DagSvg width={119}
                            height={22}
                            source={require('../../svg/dagcoin_logo.svg')}
                    />
                    <Text>is right for you.</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Text>We listen to our community</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer])}>
                    <Text>to deliver the best product on the market!</Text>
                </View>
                {this.getButtons()}
                <View style={StyleSheet.flatten([container.m40t, container.m40t])}>
                    <DagButton onClick={this.navigate.bind(this)} text={"CREATE WALLET"} />
                </View>
            </View>
        ];
        return (
            <BasePageLayout>
                <View style={StyleSheet.flatten([styles.container])}>
                    <View style={StyleSheet.flatten([styles.skipContainer, container.m20b])}>
                        <DagButton onClick={this.navigate.bind(this)}
                                   style={StyleSheet.flatten([container.transparent, container.noBorder, styles.skipButton])}
                                   textStyle={styles.skipButtonText}
                                   text={"SKIP"} />
                    </View>
                    <View style={container.m40t}>
                        {slides[this.state.activeSlide]}
                    </View>
                </View>
            </BasePageLayout>
        );
    }

    changeSlide(idx) {
        this.setState({
            activeSlide: idx
        })
    }

    navigate() {
        Navigator.to(this, routes.ConfirmationScreen, { sideMenu: false });
    }
}

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    skipContainer: {
        flex: 1,
        alignItems: 'flex-end'
    },
    textContainer: {
        marginTop: 5,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10
    },
    nextButtonContainer: {
        width: 200,
    },
    nextButton: {
        width: 250,
        shadowRadius: 0
    },
    nextButtonText: {
        color: "#a8191e"
    },
    skipButton: {
        width: 70,
        shadowRadius: 0
    },
    skipButtonText: {
        color: "#a8191e",
    },
    enabled: {
        width: 20,
        height: 10
    },
    dot: {
        width: 10,
        height: 10
    }
});

export default IntroScreen;

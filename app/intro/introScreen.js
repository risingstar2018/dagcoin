import React, {Component} from 'react';

import {
    StyleSheet, View, Image, Text
} from 'react-native';

import { container } from "../styles/main";

import MainPageLayout from "../general/mainPageLayout";
import Button from "./button";
import DagButton from "../controls/dagButton";

import Navigator from 'Navigator';

class IntroScreen extends Component {
    constructor() {
        super();

        this.state = {
            activeSlide: 0
        }
    }

    render() {
        const slides = [
            <View style={styles.slide}>
                <Image style={styles.image} source={require('../../img/safe.png')} />
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Image style={styles.imageLogo} source={require('../../img/Dagcoin_logo.png')} />
                    <Text>is secure</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Text>This app stores your dagcoins</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text>with cutting-edge state of the art security</Text>
                </View>
                <View style={StyleSheet.flatten([styles.buttonsContainer, container.m40t])}>
                    <Button onClick={this.changeSlide.bind(this, 0)} style={StyleSheet.flatten([container.m15l, styles.enabled])}/>
                    <Button onClick={this.changeSlide.bind(this, 1)} style={container.m15l}/>
                    <Button onClick={this.changeSlide.bind(this, 2)} style={container.m15l}/>
                </View>
                <View style={StyleSheet.flatten([container.m40t, container.m40t])}>
                    <DagButton onClick={this.changeSlide.bind(this, 1)} style={styles.nextButton} buttonText={"GOT IT"}></DagButton>
                </View>
            </View>,
            <View style={styles.slide}>
                <Image style={styles.image} source={require('../../img/transfer.png')} />
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Image style={styles.imageLogo} source={require('../../img/Dagcoin_logo.png')} />
                    <Text>is darn fast.</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Text>Up to 300x faster</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text>than most alternative solutions!</Text>
                </View>
                <View style={StyleSheet.flatten([styles.buttonsContainer, container.m40t])}>
                    <Button onClick={this.changeSlide.bind(this, 0)} style={container.m15l}/>
                    <Button onClick={this.changeSlide.bind(this, 1)} style={StyleSheet.flatten([container.m15l, styles.enabled])}/>
                    <Button onClick={this.changeSlide.bind(this, 2)} style={container.m15l}/>
                </View>
                <View style={StyleSheet.flatten([container.m40t, container.m40t])}>
                    <DagButton onClick={this.changeSlide.bind(this, 2)} style={styles.nextButton} buttonText={"AWESOME"}></DagButton>
                </View>
            </View>,
            <View style={styles.slide}>
                <Image style={styles.image} source={require('../../img/business.png')} />
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Image style={styles.imageLogo} source={require('../../img/Dagcoin_logo.png')} />
                    <Text>is right for you.</Text>
                </View>
                <View style={StyleSheet.flatten([styles.textContainer, container.m20t])}>
                    <Text>We listen to our community</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text>to deliver the best product on the market!</Text>
                </View>
                <View style={StyleSheet.flatten([styles.buttonsContainer, container.m40t])}>
                    <Button onClick={this.changeSlide.bind(this, 0)} style={container.m15l}/>
                    <Button onClick={this.changeSlide.bind(this, 1)} style={container.m15l}/>
                    <Button onClick={this.changeSlide.bind(this, 2)} style={StyleSheet.flatten([container.m15l, styles.enabled])}/>
                </View>
                <View style={StyleSheet.flatten([container.m40t, container.m40t])}>
                    <DagButton onClick={this.navigate.bind(this)} buttonText={"CREATE WALLET"}></DagButton>
                </View>
            </View>
        ];
        return (
            <MainPageLayout>
                <View style={StyleSheet.flatten([styles.container])}>
                    <View style={StyleSheet.flatten([styles.skipContainer, container.m20b])}>
                        <DagButton onClick={this.changeSlide.bind(this, 2)} style={styles.skipButton} buttonText={"SKIP"}></DagButton>
                    </View>
                    {slides[this.state.activeSlide]}
                </View>
            </MainPageLayout>
        );
    }

    changeSlide(idx) {
        this.setState({
            activeSlide: idx
        })
    }

    navigate() {
        Navigator.to('/confirmation');
    }
}

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    skipContainer: {
        flex: 1,
        alignItems: 'flex-end'
    },
    image: {
        width: 150,
        height: 150
    },
    imageLogo: {
        width: 119,
        height: 22
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
        color: "#a8191e",
        backgroundColor: "transparent",
        shadowRadius: 0
    },
    skipButton: {
        width: 70,
        color: "#a8191e",
        backgroundColor: "transparent",
        shadowRadius: 0
    },
    enabled: {
        width: 20,
        height: 10
    }
});

export default IntroScreen;

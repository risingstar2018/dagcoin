import React, {Component} from 'react';

import {
    StyleSheet, View, Text, TouchableWithoutFeedback, Image, Platform, Dimensions
} from 'react-native';
import { toggleVisibility } from '../../actions/generalActions';
import {connect} from "react-redux";
import DagSimpleButton from "../../controls/dagSimpleButton";

class BalanceAmount extends Component {

    walletAmount() {
        if (this.props.visibility)
            return (
                <View style={styles.mainContainer}>
                    <View style={styles.balanceContainer}>
                        <Image source={require('../../../img/dag-home.png')} style={styles.dagIcon}/>
                        <Text style={styles.bigNum}>{this.props.balance.toString().split(".")[0]}</Text>
                        <Text style={styles.smallNum}>{this.props.balance.toString().split(".")[1]}</Text>
                    </View>
                    <Text style={styles.walletText}>Wallet balance</Text>
                    <Text style={styles.textHint}>TAP AND HOLD BALANCE TO HIDE IT</Text>
                </View>
            );
        else
            return (
                <View style={styles.mainContainer}>
                    <View style={styles.circle}>
                        <Image source={require('../../../img/eye.png')} style={styles.icon}/>
                    </View>
                    <Text style={styles.balanceHiddenText}>Balance Hidden</Text>
                    <Text style={styles.textHint}>TAP AND HOLD BALANCE TO MAKE IT VISIBLE</Text>
                </View>
            );
    }

    onVisibilityChange() {
        this.props.toggleVisibility();
    }

    render() {
        return (
            <DagSimpleButton activeOpacity={1} onLongPress={this.onVisibilityChange.bind(this)} style={styles.banner} >
                {this.walletAmount()}
            </DagSimpleButton>
        );
    }
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'column',
        height: 300,
        backgroundColor: '#d51f26',
        alignItems: 'center',
        justifyContent:  'center',
        width:'100%',
        top: 50,
        position: 'absolute',
        zIndex: 100
    },
    icon: {
        resizeMode: 'contain',
        height: 40,
        width: 40,
    },
    circle: {
        backgroundColor: '#fff',
        borderRadius: 60,
        height: 70,
        width: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    walletText: {
        marginTop: 5,
        alignSelf: 'center',
        color: '#fff',
        fontWeight: '500',
        fontFamily: 'sans-serif',
        fontSize: 10,
        opacity: 0.6
    },
    balanceHiddenText: {
        marginTop: 5,
        alignSelf: 'center',
        color: '#fff',
        fontWeight: '500'
    },
    textHint: {
        fontWeight: '100',
        marginTop: 10,
        color: '#fff',
        alignSelf: 'center',
        opacity: 0.6
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width:'100%'
    },
    mainContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    dagIcon: {
        width: 50,
        height: 30,
        resizeMode: 'contain',
        left: 15,
        bottom: Platform.OS === 'android' ? -4 : 5
    },
    bigNum: {
        textAlign: 'center',
        width: 50,
        fontSize: 70,
        marginLeft: 7,
        color: '#fff',
        textShadowColor: '#a8191e',
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 2,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial'
    },
    smallNum: {
        textAlign: 'center',
        width: Platform.OS === 'android' ? 143 : 117,
        marginRight: Platform.OS === 'android' ? -85  : -66,
        alignSelf: 'flex-start',
        fontSize: 35,
        paddingTop: Platform.OS === 'android' ? 11 : 2,
        marginLeft: 2,
        color: '#fff',
        textShadowColor: '#a8191e',
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 2,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial',
        fontStyle: 'italic'
    }
});

function mapStateToProps(state) {
    return {
        visibility: state.general.visibility,
        balance: state.general.focusedWallet.balance
    }
}

const mapDispatchToProps = {
    toggleVisibility
};
export default BalanceAmount = connect(mapStateToProps, mapDispatchToProps)(BalanceAmount);

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
                        <Image source={require('../../../img/icon-d-home.png')} style={styles.dagIcon}/>
                        <Text style={styles.bigNum}>{this.props.balance.toString().split(".")[0]}</Text>
                        <Text style={styles.smallNum}>{this.props.balance.toString().split(".")[1]}</Text>
                    </View>
                    <Text style={styles.invisibleText}>Wallet Balance</Text>
                    <Text style={styles.textHint}>TAP AND HOLD TO HIDE IT</Text>
                </View>
            );
        else
            return (
                <View style={styles.mainContainer}>
                    <View style={styles.circle}>
                        <Image source={require('../../../img/hidden.png')} style={styles.icon}/>
                    </View>
                    <Text style={styles.invisibleText}>Balance Hidden</Text>
                    <Text style={styles.textHint}>TAP AND HOLD TO MAKE VISIBLE</Text>
                </View>
            );
    }

    onVisibilityChange() {
        this.props.toggleVisibility();
    }

    render() {
        return (
            <DagSimpleButton onLongPress={this.onVisibilityChange.bind(this)} style={styles.banner} >
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
        width: 80,
        height: 80,
        alignSelf: 'flex-end',
        margin: 20
    },
    circle: {
        backgroundColor: '#fff',
        borderRadius: 60,
        alignSelf: 'center',
    },
    invisibleText: {
        marginTop: 15,
        alignSelf: 'center',
        color: '#fff',
        fontWeight: '900'
    },
    textHint: {
        fontWeight: '100',
        marginTop: 20,
        color: '#fff',
        alignSelf: 'center',
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        left: Platform.OS === 'android' ? '35%' : '25%',
        // width:'100%',
        // left: (Dimensions.get('window').width / 2) - '500%'
    },
    mainContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dagIcon: {
        width: 30,
        height: 30,
    },
    bigNum: {
        fontSize: 70,
        marginLeft: 15,
        color: '#fff',
        textShadowColor: '#a8191e',
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 2,
        fontWeight: '900'
    },
    smallNum: {
        alignSelf: 'flex-start',
        fontSize: 35,
        paddingTop: 5,
        marginLeft: 10,
        color: '#fff',
        textShadowColor: '#a8191e',
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 2,
        fontWeight: '900'
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

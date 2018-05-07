import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';

import SideMenu from "react-native-side-menu";

import DagModalContainer from "../controls/dagModal/dagModalContainer";

import { getMenu } from '../sideMenu';

class GeneralLayout extends Component {
    constructor() {
        super();

        this.state = {
            isMenuOpen: false
        }
    }

    toggleMenu() {
        this.setState({
            isMenuOpen: !this.state.isMenuOpen
        });
    }

    render() {
        const { children } = this.props;

        const childrenWithProps = React.Children.map(children, child =>
            React.cloneElement(child, { toggleMenu: this.toggleMenu.bind(this) })
        );

        return (
            <SideMenu menu={getMenu()} isOpen={this.state.isMenuOpen}>
                <View style={StyleSheet.flatten([styles.container, this.props.style])}>
                    <DagModalContainer />
                    {childrenWithProps}
                </View>
            </SideMenu>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
});

export default GeneralLayout;

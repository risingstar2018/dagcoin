import React, { Component } from 'react';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';

import {
    StyleSheet
} from 'react-native';
import {font} from "../styles/main";

class DagTabView extends Component {
    constructor() {
        super();

        this.state = {
            index: 0,
            routes: null
        };

        this.onIndexChange = this.onIndexChange.bind(this);
        this.getNavigationState = this.getNavigationState.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderPager = this.renderPager.bind(this);
    }

    onIndexChange(index){
        this.setState({ index });
    }

    renderPager(props) {
        props.swipeEnabled = false;

        return (
            TabViewAnimated.defaultProps.renderPager(props)
        )
    }

    renderScene = ({ route }) => this.props.tabs[route.key].view;

    renderHeader(props) {
        return (
            <TabBar {...props}
                    style={styles.tabBar}
                    labelStyle={StyleSheet.flatten([styles.tabBarLabel, font.size12, font.weight700])}
                    indicatorStyle={StyleSheet.flatten([styles.tabBarIndicator])} />
        );
    }

    getNavigationState() {
        let routes = [];

        if (!this.props.tabs) {
            this.props.tabs = [];
        }

        this.props.tabs.forEach((tab, i) => {
            routes.push({
                key: i.toString(),
                title: tab.title
            });
        });

        return {
            index: this.state.index,
            routes: routes
        };
    }

    render() {
        const navigationState = this.getNavigationState();

        return (
            <TabViewAnimated
                navigationState={navigationState}
                renderScene={this.renderScene}
                renderHeader={this.renderHeader}
                onIndexChange={this.onIndexChange}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        backgroundColor: '#fff',
        borderBottomColor: '#eeeeee',
        borderStyle: 'solid',
        borderBottomWidth: 1
    },
    tabBarLabel: {
        color: '#000'
    },
    tabBarIndicator: {
        backgroundColor: '#d51f26'
    }
});

export default DagTabView;

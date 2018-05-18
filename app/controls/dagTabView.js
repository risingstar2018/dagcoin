import React, {Component} from 'react';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';

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
        this.renderHeader = this.renderHeader.bind(this);
    }

    onIndexChange(index) {
        this.setState({index});
        this.props.onTabChange(index);
    }

    renderHeader(props) {
        const tabBarStyles = getTabBarStyles(this.props.color);

        return (
            <TabBar {...props}
                    style={tabBarStyles.tabBar}
                    labelStyle={StyleSheet.flatten([tabBarStyles.tabBarLabel, font.size12, font.weight700])}
                    indicatorStyle={StyleSheet.flatten([tabBarStyles.tabBarIndicator])}/>
        );
    }

    componentWillMount() {
        let routes = [];
        let scene = {};

        if (!this.props.tabs) {
            this.props.tabs = [];
        }

        this.props.tabs.forEach((tab, i) => {
            routes.push({
                key: i.toString(),
                title: tab.title,
                view: tab.view
            });

            scene[i.toString()] = () => tab.view;
        });

        this.setState({
            routes: routes,
            scene: SceneMap(scene)
        });
    }

    render() {
        return (
            <TabViewAnimated
                navigationState={this.state}
                renderScene={this.state.scene}
                renderHeader={this.renderHeader}
                onIndexChange={this.onIndexChange}
            />
        );
    }
}

DagTabView.defaultProps = {
    color: 'white',
    tabs: [],
    onTabChange: (index) => {
    }
};

function getTabBarStyles(color) {
    if (color === 'red') {
        return StyleSheet.create({
            tabBar: {
                backgroundColor: '#d51f26',
                borderBottomColor: '#ffffff',
                borderStyle: 'solid',
                borderBottomWidth: 1
            },
            tabBarLabel: {
                color: '#ffffff'
            },
            tabBarIndicator: {
                backgroundColor: '#ffffff'
            }
        });
    }

    return StyleSheet.create({
        tabBar: {
            backgroundColor: '#ffffff',
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
}

export default DagTabView;

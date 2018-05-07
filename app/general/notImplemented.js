import React, {Component} from 'react';

import {
    View, Text, Platform
} from 'react-native';
import {container, font, text} from "../styles/main";

class NotImplemented extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <View>
                <Text style={[container.p20t, container.p20b, font.weight700, text.textCenter, text.textRed]}>The '{this.props.componentName}' not implemented for {Platform.OS} platform.</Text>
            </View>
        );
    }
}

NotImplemented.defaultProps = {
    componentName: ''
};

export default NotImplemented;

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

class DagView extends Component {
    render() {
        return (<View
            style={StyleSheet.flatten([
                this.props.style,
                this.props.inline ? styles.inline : null,
                this.props.wrap ? styles.wrap : null
            ])}>{this.props.children}</View>);
    }
}

DagView.defaultProps = {
    inline: false,
    wrap: false
};

const styles = StyleSheet.create({
   inline: {
       flexDirection: 'row'
   },
   wrap: {
       flexWrap: 'wrap'
   }
});

export default DagView;

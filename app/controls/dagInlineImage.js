import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    Platform,
    PixelRatio,
} from 'react-native';

class DagInlineImage extends Component {
    render() {
        let style = this.props.style;
        if (style && Platform.OS === 'android') {
            style = Object.assign({}, StyleSheet.flatten(this.props.style));
            ['width', 'height', 'marginLeft', 'marginTop', 'marginBottom', 'marginRight', 'margin'].forEach((propName) => {
                if (style[propName]) {
                    style[propName] *= PixelRatio.get();
                }
            });
        }

        return (
            <Image
                {...this.props}
                style={style}
            />
        );
    }
}

DagInlineImage.propTypes = Image.propTypes;

export default DagInlineImage;

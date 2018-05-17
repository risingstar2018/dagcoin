import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';

import {container, font, text} from "../../../styles/main";
import DagInlineImage from "../../../controls/dagInlineImage";
import DagSvg from "../../../controls/dagSvg/dagSvg";

class NoFavorites extends Component {
    constructor() {
        super();
    }

    render() {
        return (<View style={StyleSheet.flatten([container.m30, styles.container])}>
            <DagSvg width={100}
                    height={100}
                    source={require('../../../../svg/favorite_star.svg')}
                    style={StyleSheet.flatten([container.m20b, container.m15t, styles.favoriteStarImage])}
            />
            <Text style={StyleSheet.flatten([container.m20b, text.textCenter, text.textGray])}>You don't have any favorite contacts selected.</Text>
            <Text style={StyleSheet.flatten([text.textCenter, text.textGray])}>To select a favorite contact press <DagInlineImage style={styles.starIcon} source={require("../../../../img/star_border.png")}/> next to contact's name.</Text>
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    starIcon: {
        width: 18,
        height: 18
    }
});

export default NoFavorites;

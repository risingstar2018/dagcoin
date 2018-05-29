import React, { Component } from 'react';

import { StyleSheet, View, Text, Image } from 'react-native';

import { container, font, text } from '../../../styles/main';
import DagSimpleButton from '../../../controls/dagSimpleButton';

class ContactListItem extends Component {
  constructor() {
    super();

    this.renderStartIcon = this.renderStartIcon.bind(this);
  }

  renderStartIcon() {
    if (this.props.contact.isFavorite) {
      return (<DagSimpleButton
        onClick={() => this.props.onRemoveFavoriteClick(this.props.contact)}
        style={container.m20r}
      >
        <Image style={styles.starIcon} source={require('../../../../img/star.png')} />
              </DagSimpleButton>);
    }
    return (<DagSimpleButton
      onClick={() => this.props.onSetFavoriteClick(this.props.contact)}
      style={container.m20r}
    >
      <Image style={styles.starIcon} source={require('../../../../img/star_border.png')} />
            </DagSimpleButton>);
  }

  render() {
    return (
      <View style={StyleSheet.flatten([styles.container, this.props.last ? styles.last : null])}>
        <View style={StyleSheet.flatten([styles.avatarContainer, container.m15l, container.m15r])}>
          <Image source={require('../../../../img/avatar.png')} style={StyleSheet.flatten([styles.avatar])} />
        </View>
        <DagSimpleButton style={container.flex} onClick={() => this.props.onContactClick(this.props.contact)}>
          <Text style={StyleSheet.flatten([text.textRed, font.weight700])}>
            {this.props.contact.firstName} {this.props.contact.lastName}
          </Text>
        </DagSimpleButton>
        {this.renderStartIcon()}
      </View>
    );
  }
}

ContactListItem.defaultProps = {
  contact: {},
  onContactClick: (contact) => {},
  onSetFavoriteClick: (contact) => {},
  onRemoveFavoriteClick: (contact) => {},
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopColor: '#eeeeee',
    borderTopWidth: 1,
    borderStyle: 'solid',
    alignItems: 'center',
    paddingTop: 3,
    paddingBottom: 3,
  },
  starIcon: {
    width: 24,
    height: 24,
  },
  avatarContainer: {
    borderRadius: 40,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#c2c6ca',
  },
  avatar: {
    borderRadius: 40,
    width: 40,
    height: 40,
  },
  last: {
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 1,
  },
});

export default ContactListItem;

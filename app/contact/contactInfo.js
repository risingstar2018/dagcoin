import React, { Component } from 'react';
import { connect } from 'react-redux';

import { StyleSheet, Image, View, Text } from 'react-native';

import GeneralLayout from '../general/generalLayout';
import PageHeader from '../general/pageHeader';
import BasePageLayout from '../general/basePageLayout';
import DagButton from '../controls/dagButton';

import { container, font, text } from '../styles/main';
import DagSimpleButton from '../controls/dagSimpleButton';
import DagModalManager from '../controls/dagModal/dagModalManager';
import ActionsModal from '../controls/dagModal/modals/actionsModal';
import { deleteContact } from '../actions/contactsActions';
import Navigator from '../navigator/navigationManager';
import routes from '../navigator/routes';

class ContactInfo extends Component {
  constructor() {
    super();

    this.state = {
      contact: null,
    };
  }

  onSendClick() {
    console.log(this.state);
  }

  componentWillMount() {
    const contact = this.props.contacts.find(c => c.address === this.props.navParams.contact.address);

    this.setState({
      contact,
    });
  }

  onMoreButtonClick() {
    DagModalManager.show(<ActionsModal actions={[
            {
                label: 'Edit',
                action: () => {
                    DagModalManager.hide();
                    Navigator.to(this, routes.EditContact, { contact: this.state.contact });
                },
            },
            {
                label: 'Delete',
                action: () => {
                    DagModalManager.hide();
                    this.props.deleteContact(this.state.contact);
                    Navigator.back();
                },
            },
        ]}
    />);
  }

  renderMoreButton() {
    return (
      <DagSimpleButton style={container.p20} onClick={this.onMoreButtonClick.bind(this)}>
        <Image style={styles.image} source={require('../../img/more_horiz-red.png')} />
      </DagSimpleButton>
    );
  }

  render() {
    return (
      <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
        <PageHeader canBack title={'Contact'.toUpperCase()} renderCustomAction={this.renderMoreButton.bind(this)} />
        <BasePageLayout style={StyleSheet.flatten([container.p40, container.p15t, container.p15b])}>
          <View style={StyleSheet.flatten([container.m20b, container.m20t, container.center])}>
            <View style={StyleSheet.flatten([container.m10b, styles.avatarContainer])}>
              <Image style={StyleSheet.flatten([styles.avatar])} source={require('../../img/avatar.png')} />
            </View>
            <Text style={StyleSheet.flatten([font.size16, font.weight700])}>{this.state.contact.firstName} {this.state.contact.lastName}</Text>
          </View>

          <View style={StyleSheet.flatten([container.m30b, container.p15t, container.p15b, styles.infoContainer])}>
            <Text style={StyleSheet.flatten([text.textGray, font.size12, container.m5b])}>Address</Text>
            <Text>{this.state.contact.address}</Text>
          </View>

          <DagButton text="SEND" onClick={this.onSendClick.bind(this)} />
        </BasePageLayout>
      </GeneralLayout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: 30,
    height: 30,
  },
  avatarContainer: {
    borderRadius: 80,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#c2c6ca',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 80,
  },
  infoContainer: {
    borderStyle: 'solid',
    borderTopColor: '#eeeeee',
    borderBottomColor: '#eeeeee',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
});

function mapStateToProps(state) {
  return {
    contacts: state.contacts,
  };
}

const mapDispatchToProps = {
  deleteContact,
};

export default ContactInfoWrapper = connect(mapStateToProps, mapDispatchToProps)(ContactInfo);

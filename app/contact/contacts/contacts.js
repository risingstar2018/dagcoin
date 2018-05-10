import React, {Component} from 'react';
import Navigator from '../../navigator/navigationManager';
import { routes } from '../../navigator/routes';

import {
    StyleSheet, Image
} from 'react-native';

import DagTabView from "../../controls/dagTabView";
import GeneralLayout from "../../general/generalLayout";
import PageHeader from "../../general/pageHeader";
import NoContacts from "./components/noContacts";
import DagSimpleButton from "../../controls/dagSimpleButton";
import ContactsList from "./contactsList";
import FavoriteList from "./favoriteList";
import {connect} from "react-redux";
import {container} from "../../styles/main";
import { addFavoriteContact, removeFavoriteContact } from '../../actions/contactsActions';

class Contacts extends Component {
    constructor() {
        super();

        this.renderContent = this.renderContent.bind(this);
        this.renderNoContent = this.renderNoContent.bind(this);
        this.renderTabs = this.renderTabs.bind(this);
    }

    onNewContactClick() {
        Navigator.to(this, routes.NewContact);
    }

    onSetFavoriteClick(contact) {
        this.props.addFavoriteContact(contact);
    }

    onRemoveFavoriteClick(contact) {
        this.props.removeFavoriteContact(contact);
    }

    onContactClick(contact) {
        Navigator.to(this, routes.ContactInfo, { contact: contact });
    }

    renderTabs() {
        const contacts = this.props.contacts;
        const favorite = contacts.filter(c => c.isFavorite);

        const tabs = [{
            title: 'Contacts',
            view: (<ContactsList contacts={contacts}
                                 onSetFavoriteClick={this.onSetFavoriteClick.bind(this)}
                                 onRemoveFavoriteClick={this.onRemoveFavoriteClick.bind(this)}
                                 onContactClick={this.onContactClick.bind(this)}/>)
        }, {
            title: 'Favorites',
            view: (<FavoriteList contacts={favorite}
                                 onSetFavoriteClick={this.onSetFavoriteClick.bind(this)}
                                 onRemoveFavoriteClick={this.onRemoveFavoriteClick.bind(this)}
                                 onContactClick={this.onContactClick.bind(this)}/>)
        }];

        return (<DagTabView color={'red'} tabs={tabs}/>);
    }

    renderNoContent() {
        return (<NoContacts/>);
    }

    renderContent() {
        if (this.props.contacts.length) {
            return this.renderTabs();
        }
        else {
            return this.renderNoContent();
        }
    }

    renderNewContactButton() {
        return (
            <DagSimpleButton style={StyleSheet.flatten([container.p20])} onClick={this.onNewContactClick.bind(this)}>
                <Image source={require('../../../img/add.png')} style={styles.addIcon} />
            </DagSimpleButton>
        );
    }

    render() {
        return (
            <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
                <PageHeader hasMenu={true}
                            color={'red'}
                            title={'Address book'.toUpperCase()}
                            renderCustomAction={this.renderNewContactButton.bind(this)} />
                {this.renderContent()}
            </GeneralLayout>
        );
    }
}

Contacts.defaultProps = {
    contacts: []
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bookImage: {},
    addIcon: {
        width: 16,
        height: 16,
        alignSelf: 'flex-end'
    }
});

function mapStateToProps(state) {
    return {
        contacts: state.contacts
    }
}
const mapDispatchToProps = {
    addFavoriteContact,
    removeFavoriteContact
};

export default ContactsWrapper = connect(mapStateToProps, mapDispatchToProps)(Contacts);

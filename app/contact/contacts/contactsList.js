import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import BasePageLayout from "../../general/basePageLayout";
import DagGroupList from "../../controls/dagGroupList";
import DagTextInput from "../../controls/dagTextInput";
import ContactListItem from "./contactListItem";
import ContactListGroup from "./contactListGroup";

import {container} from "../../styles/main";

class ContactsList extends Component {
    constructor() {
        super();

        this.state = {
            search: ""
        };
    }

    onSearchChange(value) {
        this.setState({
            search: value
        });
    }

    render() {
        const contacts = this.props.contacts.filter(c => (c.firstName + " " + c.lastName).toLowerCase().indexOf(this.state.search.toLowerCase()) >=0);

        return (
            <BasePageLayout style={StyleSheet.flatten([styles.container, container.p20])}>
                <DagTextInput onValueChange={this.onSearchChange.bind(this)}
                              placeholder={'Search'}
                              value={this.props.search} />

                <DagGroupList items={contacts}
                              groupContainerStyle={StyleSheet.flatten([container.p20t, container.p20b])}
                              getGroupKey={(item) => (item.firstName || "")[0].toUpperCase()}
                              renderGroup={(group, index) => (<ContactListGroup key={index}
                                                                                title={group.key} />)}
                              renderItem={(item, index, total) => (<ContactListItem key={index}
                                                                             contact={item}
                                                                             last={index===(total - 1)}
                                                                             onSetFavoriteClick={this.props.onSetFavoriteClick}
                                                                             onContactClick={this.props.onContactClick}
                                                                             onRemoveFavoriteClick={this.props.onRemoveFavoriteClick} />)}
                />
            </BasePageLayout>
        );
    }
}

ContactsList.defaultProps = {
    contacts: [],
    onContactClick: (contact) => {},
    onSetFavoriteClick: (contact) => {},
    onRemoveFavoriteClick: (contact) => {},
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default ContactsList;

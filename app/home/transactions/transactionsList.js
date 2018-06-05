import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import DagGroupList from "../../controls/dagGroupList";
import TransactionListItem from "./components/transactionListItem";
import TransactionsListGroup from "./components/transactionsListGroup";
import {connect} from "react-redux";

class TransactionsList extends Component {
    render() {
        const transactions = this.props.transactions;

        return (
            <DagGroupList
                items={transactions}
                containerStyle={[styles.container]}
                groupContainerStyle={StyleSheet.flatten([])}
                getGroupKey={item => item.date}
                renderGroup={(group, index) => (<TransactionsListGroup key={index} title={group.key} />)}
                renderItem={(item, index, total) => (
                    <TransactionListItem
                        key={index}
                        transaction={item}
                        last={index === (total - 1)}
                    />
                )}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        transactions: state.transactions
    }
}

export default TransactionsListWrapper = connect(mapStateToProps)(TransactionsList);

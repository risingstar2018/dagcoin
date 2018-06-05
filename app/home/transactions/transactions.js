import React, {Component} from 'react';

import NoTransactions from "./components/noTransactions";
import TransactionsList from "./transactionsList";
import {connect} from "react-redux";
import { initTransactions } from '../../actions/transactionsActions';

class Transactions extends Component {
    render() {
        return this.props.transactions.length ? <TransactionsList /> : <NoTransactions />
    }
}

Transactions.defaultProps = {
    transactions: []
};

function mapStateToProps(state) {
    return {
        transactions: state.transactions
    }
}
const mapDispatchToProps = {
    initTransactions
};

export default TransactionsWrapper = connect(mapStateToProps, mapDispatchToProps)(Transactions);

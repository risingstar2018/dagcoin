import * as types from './actionTypes';

export const initTransactions = () => {
    const transactions = [
        {
            id: 1,
            type: 'receive',
            date: '2018-05-17',
            time: '05:09:00',
            sum: 5,
            address: '123123123123',
        },
        {
            id: 2,
            type: 'send',
            date: '2018-05-17',
            time: '05:24:00',
            sum: 22.3,
            address: '123123123123',
        },
        {
            id: 3,
            type: 'send',
            date: '2018-05-15',
            time: '17:24:00',
            sum: 8.45,
            address: '123123123123',
        },
        {
            id: 4,
            type: 'send',
            date: '2018-05-15',
            time: '03:20:00',
            sum: 9.96,
            address: '123123123123',
        },
        {
            id: 5,
            type: 'receive',
            date: '2018-05-15',
            time: '03:07:00',
            sum: 4.34,
            address: '123123123123',
        },
        {
            id: 6,
            type: 'send',
            date: '2018-05-11',
            time: '03:21:00',
            sum: 5,
            address: '123123123123',
        },
        {
            id: 7,
            type: 'receive',
            date: '2018-05-09',
            time: '03:24:00',
            sum: 22,
            address: '123123123123',
        },
        {
            id: 8,
            type: 'receive',
            date: '2018-05-09',
            time: '03:27:00',
            sum: 0.123,
            address: '123123123123',
        },
        {
            id: 9,
            type: 'send',
            date: '2018-05-09',
            time: '03:22:00',
            sum: 1.22,
            address: '123123123123',
        }
    ];

    return dispatch => {
        console.log(transactions);

        return new Promise(resolve => {
            dispatch({type: types.UPDATE_TRANSACTIONS, transactions});
            resolve();
        });
    };
};

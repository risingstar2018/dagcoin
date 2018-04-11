import { StyleSheet } from 'react-native';

const container = StyleSheet.create({
    m0: {
        margin: 0
    },
    m20t: {
        marginTop: 20
    },
    m20b: {
        marginBottom: 20
    },
    m40t: {
        marginTop: 40
    },
    m40b: {
        marginBottom: 40
    },
    m40: {
        margin: 40
    },
    m80: {
        margin: 80
    },
    p40: {
        padding: 40
    }
});

const text = StyleSheet.create({
    textGray: {
        color: '#8597a7'
    },
    textLeft: {
        textAlign: 'left'
    },
    textCenter: {
        textAlign: 'center'
    },
    textBrand: {
        color: '#d52026'
    }
});

const font = StyleSheet.create({
    size11: {
        fontSize: 11
    },
    size14: {
        fontSize: 14
    },
    size16: {
        fontSize: 16
    },
    weight600: {
        fontWeight: '600'
    },
    weight700: {
        fontWeight: '700'
    },
    weight200: {
        fontWeight: '200'
    }
});

export { container, text, font };

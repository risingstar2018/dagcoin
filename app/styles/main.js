import { StyleSheet } from 'react-native';

const container = StyleSheet.create({
    m0: {
        margin: 0
    },
    m10: {
        margin: 10
    },
    m20: {
        margin: 20
    },
    m30: {
        margin: 30
    },
    m40: {
        margin: 40
    },
    m80: {
        margin: 80
    },
    m5t: {
        marginTop: 5
    },
    m10t: {
        marginTop: 10
    },
    m15t: {
        marginTop: 15
    },
    m20t: {
        marginTop: 20
    },
    m40t: {
        marginTop: 40
    },
    m5b: {
        marginBottom: 5
    },
    m10b: {
        marginBottom: 10
    },
    m15b: {
        marginBottom: 15
    },
    m20b: {
        marginBottom: 20
    },
    m30b: {
        marginBottom: 30
    },
    m40b: {
        marginBottom: 40
    },
    m15l: {
        marginLeft: 15
    },
    m20l: {
        marginLeft: 20
    },
    m15r: {
        marginRight: 15
    },
    m20r: {
        marginRight: 20
    },
    p0: {
        padding: 0
    },
    p10: {
        padding: 10
    },
    p15: {
        padding: 15
    },
    p20: {
        padding: 20
    },
    p30: {
        padding: 30
    },
    p40: {
        padding: 40
    },
    p10t: {
        paddingTop: 10
    },
    p15t: {
        paddingTop: 15
    },
    p20t: {
        paddingTop: 20
    },
    p30t: {
        paddingTop: 30
    },
    p40t: {
        paddingTop: 40
    },
    p10l: {
        paddingLeft: 10
    },
    p15l: {
        paddingLeft: 15
    },
    p20l: {
        paddingLeft: 20
    },
    p40l: {
        paddingLeft: 40
    },
    p10r: {
        paddingRight: 10
    },
    p15r: {
        paddingRight: 15
    },
    p20r: {
        paddingRight: 20
    },
    p40r: {
        paddingRight: 40
    },
    p10b: {
        paddingBottom: 10
    },
    p15b: {
        paddingBottom: 15
    },
    p20b: {
        paddingBottom: 20
    },
    p40b: {
        paddingBottom: 40
    },
    transparent: {
        backgroundColor: 'transparent'
    },
    noBorder: {
        borderColor: 'transparent',
        shadowColor: 'transparent'
    },
    flex: {
        flex: 1
    },
    flexRight: {
        alignItems: 'flex-end'
    },
    flexLeft: {
        alignItems: 'flex-start'
    },
    backgroundRed: {
        backgroundColor: '#d51f26'
    },
    backgroundWhite: {
        backgroundColor: '#ffffff'
    },
    center: {
        alignItems: 'center'
    }
});

const text = StyleSheet.create({
    textGray: {
        color: '#8597a7'
    },
    textRed: {
        color: '#d51f26'
    },
    textWhite: {
        color: '#ffffff'
    },
    textLeft: {
        textAlign: 'left'
    },
    textCenter: {
        textAlign: 'center'
    },
    textRight: {
        textAlign: 'right'
    },
    textBrand: {
        color: '#d52026'
    }
});

const font = StyleSheet.create({
    size10: {
        fontSize: 10
    },
    size11: {
        fontSize: 11
    },
    size12: {
        fontSize: 12
    },
    size14: {
        fontSize: 14
    },
    size16: {
        fontSize: 16
    },
    size24: {
        fontSize: 24
    },
    weight400: {
        fontWeight: '400'
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

const controls = StyleSheet.create({
    label: StyleSheet.flatten([{color: '#34495e'}, font.size10, font.weight700])
});

export { container, text, font, controls };

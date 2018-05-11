import qr from 'qr.js';
import React, { Component, PureComponent } from 'react';
import { View, Image, Text } from 'react-native';

function getQrCodeImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = this.size;
    const fgColor = this.fgColor;
    const bgColor = this.bgColor;
    canvas.height = size;
    canvas.width = size;

    const cells = this.cells;
    const tileW = this.size / cells.length;
    const tileH = this.size / cells.length;
    const scale = 1;

    ctx.scale(scale, scale);

    cells.forEach(function (row, ri) {
        row.forEach(function (cell, ci) {
            ctx.fillStyle = cell ? fgColor : bgColor;
            const w = (Math.ceil((ci + 1) * tileW) - Math.floor(ci * tileW));
            const h = (Math.ceil((ri + 1) * tileH) - Math.floor(ri * tileH));
            ctx.fillRect(Math.round(ci * tileW), Math.round(ri * tileH), w, h);
        });
    });

    return new Promise((resolve, reject) => {
        if (this.logo) {
            const image = document.createElement('img');
            image.src = this.logo;
            image.onload = function () {
                const dwidth = size * 0.2;
                const dx = (size - dwidth) / 2;
                const dheight = image.height / image.width * dwidth;
                const dy = (size - dheight) / 2;
                image.width = dwidth;
                image.height = dheight;
                ctx.drawImage(image, dx, dy, dwidth, dheight);

                resolve(canvas.toDataURL());
            }
        } else {
            resolve(canvas.toDataURL());
        }
    });
}

class DagQrCodeWeb extends PureComponent {
    constructor() {
        super();

        this.state = {
            image: null
        }
    }

    componentWillMount() {
        const value = this.utf16to8(this.props.value);

        const canvasContext = {
            size: this.props.size,
            value: this.props.value,
            bgColor: this.props.backgroundColor,
            fgColor: this.props.color,
            cells: qr(value).modules,
            logo: this.props.logo
        };

        const method = getQrCodeImage.bind(canvasContext);
        const promise = method();
        promise.then((img) => {
            if (this.state.image !== img) {
                this.setState({
                    image: img
                })
            }
        });
    }

    utf16to8(str) {
        let out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    render() {
        if (this.state.image == null) {
            return null;
        }

        return (
            <Image style={{width: this.props.size, height: this.props.size}} source={{uri: this.state.image}} />
        );
    }
}

export default DagQrCodeWeb;

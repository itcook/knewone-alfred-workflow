"use strict"

const AlfredItem = require("alfred-item");
const request = require('superagent');
const path = require('path');
const https = require('https');
const fs = require('fs');
const fsu = require('nodejs-fs-utils');
const tempPath = path.join(__dirname, 'temp/');

function getImageExt(url) {
    if (url.match(/.\w+$/)[0]) {
        return url.match(/.\w+$/)[0];
    }
}


function downloadImagesToTemp(products) {
    fsu.emptyDirSync(tempPath);
    if (products) {
        let item = new AlfredItem();
        for (let i = 0; i < products.length; i++) {
            const iconUrl = products[i].photo.replace(/!huge$/, '')
            const ext = getImageExt(iconUrl);
            const iconRequest = https.get(iconUrl + '!small');
            const iconFilePath = tempPath + 'item' + i + ext;
            iconRequest.on('response', res => {
                res.on('data', chunk => {
                    fs.writeFile(iconFilePath, chunk);
                });
            });
            item.addItem((i + 2) + Math.random(), products[i].title, products[i].subtitle, products[i].url, iconFilePath);
        }
        return item;
    }
}

const getKnewoneProducts = new Promise((resolve, reject) => {
    request
        .get("https://knewone.com/things")
        .query({ pages: 0 })
        .accept('json')
        .end((err, res) => {
            if (!err && res.statusCode == 200 && res.body.length > 1) {
                resolve(res.body);
            } else {
                resolve(undefined);
            }
        });
});

module.exports = () => {
    getKnewoneProducts
        .then(downloadImagesToTemp)
        .then(console.log);
};
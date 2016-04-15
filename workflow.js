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
            iconRequest.on('response', function(res) {
                res.on('data', function(chunk) {
                    fs.writeFile(tempPath + 'item' + i + ext, chunk);
                });
            });
            item.addItem((i+2)+Math.random(), products[i].title, products[i].subtitle, products[i].url, tempPath + 'item' + i + ext);
        }
        return item;
    }
}

const getKnewoneProducts = new Promise(function(resolve,reject){
	request
    .get("https://knewone.com/things")
    .query({ pages: 0 })
    .accept('json')
    .end(function(err, res) {
        if (!err && res.statusCode == 200 && res.body.length > 1) {
        	// console.log(res.body);
            resolve(res.body);
        }
        else {
        	resolve(undefined);
        }
    });
});

module.exports = function(){
	let item = new AlfredItem();
	getKnewoneProducts
	.then(downloadImagesToTemp)
	.then(console.log);
	// console.log(item);	
};
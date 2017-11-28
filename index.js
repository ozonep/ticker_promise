const express = require("express");
const app = express();
const https = require("https");
const ivan = require("./secret.js");

app.use(express.static(__dirname + '/public'));

function myToken() {
    return new Promise((resolve, reject) => {
        let token;
        const creds = `${ivan.key}:${ivan.secret}`;
        const encCreds = new Buffer(creds).toString("base64");
        const postOptions = {
            method: "POST",
            host: 'api.twitter.com',
            path: '/oauth2/token',
            headers: {
                'Authorization': `Basic ${encCreds}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            }
        };
        const req = https.request(postOptions, (res) => {
            console.log(res.statusCode);
            let body = '';
            res.on('data', (chunks) => {
                body += chunks;
            });
            res.on('end', () => {
                body = JSON.parse(body);
                token = body.access_token;
                if (token) {
                    resolve(token);
                } else {
                    reject("Holy Moly!");
                }
            });
        });
        req.write('grant_type=client_credentials');
        req.end();
    });
}

function myTweets(token, source) {
    return new Promise((resolve, reject) => {
        if (!token) {
            reject()
        } else {
            let request = {
                method: "GET",
                host: 'api.twitter.com',
                path: `/1.1/statuses/user_timeline.json?count=5&screen_name=${source}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                }
            };
            https.request(request, response => {
                let resBody = '';
                response.on('data', chunk => resBody += chunk);
                response.on('end', function () {
                    let headings = [];
                    let string = JSON.parse(resBody);
                    for (let i = 0; i < string.length; i++) {
                        if (string[i].text && string[i].entities.urls[0] && string[i].entities.urls.length < 2) {
                            var href = string[i].entities.urls[0].url;
                            var title = string[i].text.replace(href, '');
                            var author = string[i].user.name;
                            headings.push({'title': title, 'href': href, 'author': author});
                        }
                    }
                    resolve(headings)
                });
            }).end();
        }
    })
}

app.get("/headings.json", (req, res) => {
    myToken().then(function(token) {
        return Promise.all([
            myTweets(token, 'nytimes'),
            myTweets(token, 'cnn'),
            myTweets(token, 'cnnbrk')
        ]).then((result) => {
            let nyt = result[0];
            let cnn = result[1];
            let cnnb = result[2];
            let finalArr = nyt.concat(cnn, cnnb)
            return res.json(finalArr)
        });
    });
});

app.listen(8080);


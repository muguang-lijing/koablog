"use strict";
// test router '/authors'
const request = require("request");
const configs = require("./configs.json");
const assert = require("assert");
const util = require("util");
const prefix = "/authors";
const auth = "/authentications";
const protocol = configs.app.protocol;
const host = configs.app.host;
const port = configs.app.port;

describe("test the /authors", function () {
    let token;
    let userId;
    let username;
    let password;

    it("get root user must be ok", function (done) {
        assert.deepStrictEqual(configs.users.root.length >= 1, true, "root users's length must >= 1");
        username = configs.users.root[0].username;
        password = configs.users.root[0].password;
        done();
    });

    it("log in must be ok", function (done) {
        request({
            method: "POST",
            url: util.format("%s://%s:%s%s", protocol, host, port, auth),
            form: {
                username: username,
                password: password
            }
        }, function (error, response, body) {
            assert.strictEqual(error, null);
            assert.strictEqual(response.statusCode, 200);
            token = JSON.parse(body).token;
            assert.strictEqual(typeof token, "string");
            done();
        });
    });

    it("log out with right token must be ok", function (done) {
        request({
            method: "DELETE",
            url: util.format("%s://%s:%s%s", protocol, host, port, auth),
            headers: {
                "Authorization": "jwt " + token
            }
        }, function (error, response, body) {
            assert.strictEqual(error, null);
            assert.strictEqual(response.statusCode, 200);
            done();
        });
    });

    it("log out with none token must be failed", function (done) {
        request({
            method: "DELETE",
            url: util.format("%s://%s:%s%s", protocol, host, port, auth),
        }, function (error, response, body) {
            assert.strictEqual(error, null);
            assert.strictEqual(response.statusCode, 401);
            assert.strictEqual(JSON.parse(body).errorCode, 1000);
            done();
        });
    });

    it("get one of authors", function (done) {
        let id = configs.users.root[0].id;
        request({
            method: "GET",
            url: util.format("%s://%s:%s%s/%s", protocol, host, port, prefix, id)
        }, function (error, response, body) {
            assert.strictEqual(error, null);
            assert.strictEqual(response.statusCode, 200);
            done();
        });
    });

    it("get page of authors", function (done) {
        let page = 1;
        request({
            method: "GET",
            url: util.format("%s://%s:%s%s?page=%s", protocol, host, port, prefix, page)
        }, function(error, response, body) {
            assert.strictEqual(error, null);
            assert.strictEqual(response.statusCode, 200);
            done();
        });
    });

    it("create a user with right token must be ok", function (done) {
        request({
            method: "POST",
            form: {
                username
            }
        }, function (error, response, body) {
            assert.strictEqual(error, null);
            assert.strictEqual(response.statusCode, 200);
        })
    });
});

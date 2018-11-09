/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

var jsdom = require("jsdom");

global.window = new jsdom.JSDOM().window;
global.document = window.document;
global.CustomEvent = require("custom-event");

var Vue = require("vue");
var ajax = require("../src/vuejs-ajax");

Vue.use(ajax);

describe('Vue.ajax', function () {
    it('Vue.ajax.get()', () => {
        XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

        return Vue.ajax.get('https://postman-echo.com/get', {foo: 'bar'}).then(res => {
            expect(res.xhrStatus).toBe('Complete');
            done();
        });
    });

    it('Vue.ajax.post()', () => {
        XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

        return Vue.ajax.post('https://postman-echo.com/post', {foo: 'bar'}).then(res => {
            expect(res.xhrStatus).toBe('Complete');
            done();
        });
    });

    it('Vue.ajax.put()', () => {
        XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

        return Vue.ajax.put('https://postman-echo.com/put', {foo: 'bar'}).then(res => {
            expect(res.xhrStatus).toBe('Complete');
            done();
        });
    });

    it('Vue.ajax.patch()', () => {
        XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

        return Vue.ajax.patch('https://postman-echo.com/patch', {foo: 'bar'}).then(res => {
            expect(res.xhrStatus).toBe('Complete');
            done();
        });
    });

    it('Vue.ajax.delete()', () => {
        XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

        return Vue.ajax.delete('https://postman-echo.com/delete', {foo: 'bar'}).then(res => {
            expect(res.xhrStatus).toBe('Complete');
            done();
        });
    });

    it('Vue.ajax()', () => {
        XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

        return Vue.ajax({
            url: 'https://postman-echo.com/get'
        }).then(res => {
            expect(res.xhrStatus).toBe('Complete');
            done();
        });
    });
});
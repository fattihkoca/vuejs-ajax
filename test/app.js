/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

var Vue = require("vue");
var ajax = require("../src/vuejs-ajax");

Vue.use(ajax);

new Vue({
    el: '#app',
    components: {
        vueAjaxExample: require('./component.vue').default
    }
});
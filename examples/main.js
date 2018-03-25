/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

import Vue from 'vue'
import ajax from "vue-ajax-plugin";

window.Vue = Vue;
Vue.use(ajax);

var vm = new Vue({
    el: '#app',
    components: {
        vueAjaxExample: require('vueAjaxExample.vue').default
    }
});
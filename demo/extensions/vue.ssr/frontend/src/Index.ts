// @ts-ignore
import Main from 'Main.vue';
import Vue from 'vue';

const app = new Vue({
    render: h => h(Main)
});

export default () => app;

if (process.env.VUE_ENV === 'client') {
    app.$mount(document.getElementById('app'));
}
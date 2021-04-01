// @ts-ignore
import Main from 'Main.vue';
import Vue from 'vue';

console.log('[DEMO: Environment distinction]', process.env.VUE_ENV);

const app = new Vue({
    el: '#app',
    render: h => h(Main)
});

export default () => app;

if (process.env.VUE_ENV === 'client') {
    app.$mount('#app');
}
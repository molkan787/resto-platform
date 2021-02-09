import Vue from 'vue';
import { formatPrice } from 'murew-core/dist/TextUtils';

Vue.filter('price', (val: number | string) => formatPrice(val));
Vue.filter('price_ft', (val: number | string) => parseFloat(<any>val) == 0 ? 'Free' : formatPrice(val));

Vue.filter('capitalize', (str: string) => {
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
});

Vue.filter('date', (date: Date | string) => {
  const _date = typeof date == 'string' ? new Date(date) : date;
  return _date.toLocaleString();
});

Vue.filter('uppercase', (value: string) => {
  return typeof  value === 'string' ? value.toUpperCase() : value;
})
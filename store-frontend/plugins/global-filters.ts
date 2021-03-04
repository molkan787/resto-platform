import Vue from 'vue';
import { formatPrice } from 'murew-core/dist/TextUtils';

Vue.filter('price', (val: number | string) => formatPrice(val));
Vue.filter('price_ft', (val: number | string) => parseFloat(<any>val) == 0 ? 'Free' : formatPrice(val));

Vue.filter('capitalize', (str: string) => {
  return typeof str == 'string' ? ( str.charAt(0).toUpperCase() + str.substr(1).toLowerCase() ) : str;
});

Vue.filter('date', (date: Date | string) => {
  const _date = typeof date == 'string' ? new Date(date) : date;
  return _date instanceof Date ? _date.toLocaleString() : date;
});

Vue.filter('date_only', (date: Date | string) => {
  const _date = typeof date == 'string' ? new Date(date) : date;
  return _date instanceof Date ? _date.toLocaleDateString() : date;
});

Vue.filter('strapi_time', (time: string) => {
  return (typeof time == 'string' ? time : '').split(':').slice(0, 2).join(':');
});

Vue.filter('uppercase', (value: string) => {
  return typeof  value === 'string' ? value.toUpperCase() : value;
})
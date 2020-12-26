import Vue from 'vue';

const CURRENCY_SYMBOL = '£';

Vue.filter('price', (val: number | string) => {
  let _val = typeof val == 'string' ? parseFloat(val) : val;
  const negative = _val < 0;
  if(negative){
    _val *= -1;
  }
  const str_val = _val.toFixed(2);
  return (negative ? '- ' : '').concat(CURRENCY_SYMBOL).concat(str_val);
});

Vue.filter('capitalize', (str: string) => {
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
});

Vue.filter('date', (date: Date | string) => {
  const _date = typeof date == 'string' ? new Date(date) : date;
  return _date.toLocaleString();
});
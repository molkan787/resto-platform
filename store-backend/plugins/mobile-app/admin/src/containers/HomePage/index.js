/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react';
import { VueWrapper } from 'vuera';
import IndexComponent from './index.vue'

const HomePage = () => {
  return (
    <div>
      <VueWrapper component={IndexComponent} />
    </div>
  );
};

export default memo(HomePage);

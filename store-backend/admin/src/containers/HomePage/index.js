/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { get, upperFirst } from 'lodash';
import { auth, LoadingIndicatorPage, request } from 'strapi-helper-plugin';
import PageTitle from '../../components/PageTitle';
import { useModels } from '../../hooks';

import useFetch from './hooks';
import { ALink, Block, Container, LinkWrapper, P, Wave, Separator } from './components';

import { VueWrapper } from 'vuera';
import DashboardMainPanel from './DashboardMainPanel.vue'
import DashboardFeaturesPanel from './DashboardFeaturesPanel.vue'

const HomePage = ({ history: { push } }) => {
  // Temporary until we develop the menu API
  const { collectionTypes, singleTypes, isLoading: isLoadingForModels } = useModels();

  if (isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  // const features = useMemo(() => window.strapi.platform.features)
  
  const { host } = window.location
  const fHost = host.startsWith('backend.') ? host.substring(8) : host
  const frontendURL = 'https://' + fHost


  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {title => <PageTitle title={title} />}
      </FormattedMessage>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <Block>
              {/* <h1>Dashboard</h1> */}
              <VueWrapper component={DashboardMainPanel} />
            </Block>
          </div>

          <div className="col-md-12 col-lg-4">
            <Block style={{ paddingRight: 30, paddingBottom: 0 }}>
              <VueWrapper component={DashboardFeaturesPanel} />
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);

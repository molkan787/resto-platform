/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { get, upperFirst } from 'lodash';
import { auth, LoadingIndicatorPage } from 'strapi-helper-plugin';
import PageTitle from '../../components/PageTitle';
import { useModels } from '../../hooks';

import useFetch from './hooks';
import { ALink, Block, Container, LinkWrapper, P, Wave, Separator } from './components';

import { VueWrapper } from 'vuera';
import DashboardMainPanel from './DashboardMainPanel.vue'

const HomePage = ({ history: { push } }) => {
  // Temporary until we develop the menu API
  const { collectionTypes, singleTypes, isLoading: isLoadingForModels } = useModels();

  const handleClick = e => {
    e.preventDefault();

    push(
      '/plugins/content-type-builder/content-types/plugins::users-permissions.user?modalType=contentType&kind=collectionType&actionType=create&settingType=base&forTarget=contentType&headerId=content-type-builder.modalForm.contentType.header-create&header_icon_isCustom_1=false&header_icon_name_1=contentType&header_label_1=null'
    );
  };

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
              <h2>Your Apps</h2>
              <Separator style={{ marginTop: 14, marginBottom: 12 }} />
              <h4 style={{ marginBottom: 2 }}>Website:</h4>
              <a href={ frontendURL } target="_blank">
                {frontendURL}
              </a>
              <div style={{ height: 12 }}></div>
              <h4 style={{ marginBottom: 2 }}>Mobile App:</h4>
              <a href="/admin/plugins/mobile-app">Generate App</a>
              <div style={{ height: 12 }}></div>
              <h4 style={{ marginBottom: 2 }}>POS App:</h4>
              <a href="/admin/plugins/pos-sync">Configure</a>
              <div style={{ height: 12 }}></div>
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);

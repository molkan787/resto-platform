import React, { memo, useMemo } from 'react';
import { Header } from '@buffetjs/custom';
import { Flex, Padded, Text } from '@buffetjs/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useIntl } from 'react-intl';
import BaselineAlignement from '../../components/BaselineAlignement';
import Bloc from '../../components/Bloc';
import PageTitle from '../../components/SettingsPageTitle';
import makeSelectApp from '../App/selectors';
import makeSelectAdmin from '../Admin/selectors';
import { Detail, InfoText } from './components';

const makeSelectAppInfos = () => createSelector(makeSelectApp(), appState => appState.appInfos);
const makeSelectLatestRelease = () =>
  createSelector(makeSelectAdmin(), adminState => adminState.latestStrapiReleaseTag);

const ApplicationInfosPage = () => {
  const { formatMessage } = useIntl();
  const selectAppInfos = useMemo(makeSelectAppInfos, []);
  const selectLatestRealase = useMemo(makeSelectLatestRelease, []);
  const appInfos = useSelector(state => selectAppInfos(state));
  const latestStrapiReleaseTag = useSelector(state => selectLatestRealase(state));

  const currentPlan = appInfos.communityEdition
    ? 'app.components.UpgradePlanModal.text-ce'
    : 'app.components.UpgradePlanModal.text-ee';

  const headerProps = {
    title: { label: formatMessage({ id: 'Settings.application.title' }) },
    content: formatMessage({
      id: 'Settings.application.description',
    }),
  };
  const pricingLabel = formatMessage({ id: 'Settings.application.link-pricing' });
  const upgradeLabel = formatMessage({ id: 'Settings.application.link-upgrade' });
  const strapiVersion = formatMessage({ id: 'Settings.application.strapi-version' });
  const nodeVersion = formatMessage({ id: 'Settings.application.node-version' });
  const editionTitle = formatMessage({ id: 'Settings.application.edition-title' });

  const shouldShowUpgradeLink = `v${appInfos.strapiVersion}` !== latestStrapiReleaseTag;

  /* eslint-disable indent */
  const upgradeLink = shouldShowUpgradeLink
    ? {
        label: upgradeLabel,
        href: `https://github.com/strapi/strapi/releases/tag/${latestStrapiReleaseTag}`,
      }
    : null;
  /* eslint-enable indent */

  return (
    <div>
      <PageTitle name="Infos" />
      <Header {...headerProps} />
      <BaselineAlignement top size="3px" />
      <Bloc>
        <Padded left right top size="smd">
          <Padded left right top size="xs">
            <Padded top size="lg">
              <Text fontSize="xs" color="grey" fontWeight="bold">
                {nodeVersion}
              </Text>
              <InfoText content={appInfos.nodeVersion} />
            </Padded>
          </Padded>
        </Padded>
        <BaselineAlignement top size="60px" />
      </Bloc>
    </div>
  );
};

export default memo(ApplicationInfosPage);

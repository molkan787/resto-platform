/*
 *
 * LeftMenu
 *
 */

import React, {
  forwardRef,
  memo,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
} from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import { UserContext, hasPermissions, request, auth } from 'strapi-helper-plugin';
import {
  LeftMenuLinksSection,
  LeftMenuFooter,
  LeftMenuHeader,
  LinksContainer,
} from '../../components/LeftMenu';
import { useSettingsMenu } from '../../hooks';
import { generateModelsLinks, filterLinks } from './utils';
import init from './init';
import reducer, { initialState } from './reducer';
import Loader from './Loader';
import Wrapper from './Wrapper';
import Select from 'react-select';

const LeftMenu = forwardRef(({ latestStrapiReleaseTag, version, plugins }, ref) => {
  const LS_STORE_ID_KEY = 'murew_store_id';
  const location = useLocation();
  const permissions = useContext(UserContext);
  const { menu: settingsMenu } = useSettingsMenu(true);

  // TODO: this needs to be added to the settings API in the v4
  const settingsLinkNotificationCount = useMemo(() => {
    if (`v${version}` !== latestStrapiReleaseTag) {
      return 1;
    }

    return 0;
  }, [latestStrapiReleaseTag, version]);
  let [
    {
      collectionTypesSectionLinks,
      generalSectionLinks,
      isLoading,
      stores,
      currentStore,
      pluginsSectionLinks,
      singleTypesSectionLinks,
    },
    dispatch,
  ] = useReducer(reducer, initialState, () =>
    init(initialState, plugins, settingsMenu, settingsLinkNotificationCount)
  );

  const lastItem = arr => arr[arr.length - 1]

  function mapLinks(map, links){
    for(let i = 0; i < links.length; i++){
      const e = links[i]
      const slug = lastItem(lastItem(e.destination.split('/')).split('.'))
      map[slug] = e
    }
    return map
  }
  function grabLinks(map, items){
    const out = []
    for(let i = 0; i < items.length; i++){
      const e = items[i]
      const l = map[e]
      delete map[e]
      if(l) out.push(l)
    }
    return out
  }

  const RANK_SuperAdmin = 1000
  const RANK_PlatformAdmin = 900
  const RANK_StoreAdmin = 500
  const RANK_StoreEditor = 200

  const rolesRanks = {
    'strapi-super-admin': RANK_SuperAdmin, // Super Admin (Developer)
    'platform-admin': RANK_PlatformAdmin, // Platform Admin (Business Manager)
    'strapi-editor': RANK_StoreAdmin, // Store Admin (Restaurant Owner / Manager)
    'strapi-author': RANK_StoreEditor, // Store Editor (Restaurant Employee)
  }

  const userRoleCode = auth.getUserInfo().roles[0].code
  const currentUserRoleRank = rolesRanks[userRoleCode] || 0


  const collectionlinksMap = mapLinks({}, collectionTypesSectionLinks)
  const singlelinksMap = mapLinks({}, singleTypesSectionLinks)
  const pluginslinksMap = mapLinks({}, pluginsSectionLinks)
  const generallinksMap = mapLinks({}, generalSectionLinks)
  
  const restaurantSectionLinks = [
    ...grabLinks(collectionlinksMap, ['order', 'category', 'product', 'offer', 'booking']),
    ...grabLinks(singlelinksMap, ['store-settings']),
  ]

  const customersSectionLinks = grabLinks(collectionlinksMap, ['user', 'review', 'contact-message'])

  const showAdminLinks = currentUserRoleRank >= RANK_StoreAdmin

  const websiteSectionLinks = [
    ...grabLinks(singlelinksMap, ['home-page-settings', 'layout-settings', 'gallery']),
    ...grabLinks(collectionlinksMap, ['pages']),
  ]

  const toolsSectionLinks = showAdminLinks ? [
    ...grabLinks(pluginslinksMap, ['booking', 'reports']),
  ] : []

  const platformSectionLinks = showAdminLinks ? [
    ...grabLinks(collectionlinksMap, ['store']),
    ...grabLinks(pluginslinksMap, ['mobile-app', 'pos-sync', 'stripe-connect', 'upload']),
  ] : []

  const remainingSectionLinks = (currentUserRoleRank >= RANK_PlatformAdmin) ? 
  [
    ...Object.values(collectionlinksMap),
    ...Object.values(singlelinksMap),
    ...Object.values(pluginslinksMap),
    ...Object.values(generallinksMap),
  ] : []



  // TODO:
  // This is making a lot of request especially for the Author role as all permissions are being sent to
  // to the backend.
  // We should improve this by sending one request in with all permissions in bulk using the
  // findMatchingPermissions util from the helper plugin and the /users/me/permissions endPoint
  const checkPermissions = async (index, permissionsToCheck) => {
    const hasPermission = await hasPermissions(permissions, permissionsToCheck);

    return { index, hasPermission };
  };

  const generateArrayOfPromises = array =>
    array.map((_, index) => checkPermissions(index, array[index].permissions));

  const getModels = async () => {
    const requestURL = '/content-manager/content-types';

    try {
      const { data } = await request(requestURL, { method: 'GET' });

      const formattedData = generateModelsLinks(data);

      const collectionTypesSectionLinksArrayOfPromises = generateArrayOfPromises(
        formattedData.collectionTypesSectionLinks
      );
      const collectionTypesSectionResults = await Promise.all(
        collectionTypesSectionLinksArrayOfPromises
      );

      const singleTypesSectionLinksArrayOfPromises = generateArrayOfPromises(
        formattedData.singleTypesSectionLinks
      );
      const singleTypesSectionResults = await Promise.all(singleTypesSectionLinksArrayOfPromises);

      dispatch({
        type: 'GET_MODELS_SUCCEEDED',
        data: formattedData,
      });

      dispatch({
        type: 'SET_LINK_PERMISSIONS',
        data: {
          collectionTypesSectionLinks: collectionTypesSectionResults,
          singleTypesSectionLinks: singleTypesSectionResults,
        },
      });
    } catch (err) {
      console.error(err);
      strapi.notification.toggle({
        type: 'warning',
        message: { id: 'notification.error' },
      });
    }
  };

  // Make the getModels method available for all the other plugins
  // So they can regenerate the menu when they need
  // It's specially used in the content type builder
  useImperativeHandle(ref, () => ({
    getModels,
  }));

  useEffect(() => {
    const getLinksPermissions = async () => {
      const generalSectionLinksArrayOfPromises = generateArrayOfPromises(generalSectionLinks);
      const pluginsSectionLinksArrayOfPromises = generateArrayOfPromises(pluginsSectionLinks);

      await getModels();

      const generalSectionResults = await Promise.all(generalSectionLinksArrayOfPromises);
      const pluginsSectionResults = await Promise.all(pluginsSectionLinksArrayOfPromises);

      const url = '/content-manager/explorer/application::store.store?_sort=name%3AASC';
      const _stores = await request(url, { method: 'GET' });
      const stores = _stores.map(s => ({ label: s.name, value: s.id }));
      strapi.stores = stores;
      const callbacks = strapi.onStoresLoaded || [];
      callbacks.forEach(cb => cb(stores));
      dispatch({
        type: 'SET_STORES',
        data: stores
      });

      let store = null;
      const currentStoreId = window.localStorage.getItem(LS_STORE_ID_KEY);
      if(currentStoreId){
        const storeIndex = stores.findIndex(s => s.value == currentStoreId);
        store = storeIndex >= 0 && stores[storeIndex];
        
      }
      if(!store) store = stores[0];
      if(store){
        dispatch({
          type: 'SET_CURRENT_STORE',
          data: store
        });
        window.localStorage.setItem(LS_STORE_ID_KEY, store.value);
      }
      
      dispatch({
        type: 'SET_LINK_PERMISSIONS',
        data: {
          generalSectionLinks: generalSectionResults,
          pluginsSectionLinks: pluginsSectionResults,
        },
      });

      dispatch({
        type: 'TOGGLE_IS_LOADING',
      });
    };

    getLinksPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions]);

  const onStoreChange = (option) => {
    window.localStorage.setItem(LS_STORE_ID_KEY, option.value);
    dispatch({
      type: 'SET_CURRENT_STORE',
      data: option
    });
    window.location.reload();
  }

  return (
    <Wrapper>
      <Loader show={isLoading} />
      <LeftMenuHeader />
      <LinksContainer>
        <div className="select-store-section" style={{ padding: '1rem' }}>
          <span style={{ color: 'white' }}>Browse Store</span>
          <Select onChange={onStoreChange} options={stores} value={currentStore}></Select>
        </div>
        <LeftMenuLinksSection
            title="Restaurant"
            name="collectionType"
            links={restaurantSectionLinks}
            location={location}
            searchable={false}
        />
        <LeftMenuLinksSection
            title="Customers"
            name="collectionType"
            links={customersSectionLinks}
            location={location}
            searchable={false}
        />
        
        {websiteSectionLinks.length > 0 && (
          <LeftMenuLinksSection
            title="Website"
            name="singleType"
            links={websiteSectionLinks}
            location={location}
            searchable={false}
          />
        )}
        {toolsSectionLinks.length > 0 && (
          <LeftMenuLinksSection
            shrink={false}
            title="Tools"
            name="plugins"
            links={toolsSectionLinks}
            location={location}
            searchable={false}
          />
        )}    
        {platformSectionLinks.length > 0 && (
          <LeftMenuLinksSection
            shrink={false}
            title="Platform"
            name="plugins"
            links={platformSectionLinks}
            location={location}
            searchable={false}
          />
        )}
        {remainingSectionLinks.length > 0 && (
          <LeftMenuLinksSection
          shrink={false}
            title="Developer Links"
            name="general"
            links={remainingSectionLinks}
            location={location}
            searchable={false}
          />
        )}
      </LinksContainer>
      <LeftMenuFooter key="footer" version={version} />
    </Wrapper>
  );
});

LeftMenu.propTypes = {
  latestStrapiReleaseTag: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  plugins: PropTypes.object.isRequired,
};

export default memo(LeftMenu);

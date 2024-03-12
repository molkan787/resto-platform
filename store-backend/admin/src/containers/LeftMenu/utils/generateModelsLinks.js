import { chain, get } from 'lodash';

const _icons = {
  'application::store.store': 'store',
  'application::order.order': 'box',
  'application::category.category': 'bars',
  'application::product.product': 'utensils',
  'application::offer.offer': 'tags',
  'plugins::booking.booking': 'calendar-alt',
  'application::store-settings.store-settings': 'cog',
  'plugins::users-permissions.user': 'user',
  'application::review.review': 'comment-alt',
  'application::contact-message.contact-message': 'envelope',
  'application::home-page-settings.home-page-settings': 'desktop',
  'application::layout-settings.layout-settings': 'table',
  'application::gallery.gallery': 'images',
  'application::pages.pages': 'columns',
}

const generateLinks = links => {
  return links
    .filter(link => link.isDisplayed)
    .map(link => {
      return {
        icon: _icons[link.uid] || 'file',
        destination: `/plugins/content-manager/${link.schema.kind}/${link.uid}`,
        isDisplayed: false,
        label: link.label,
        permissions: [
          { action: 'plugins::content-manager.explorer.create', subject: link.uid },
          { action: 'plugins::content-manager.explorer.read', subject: link.uid },
          { action: 'plugins::content-manager.explorer.update', subject: link.uid },
        ],
      };
    });
};

const generateModelsLinks = models => {
  const [collectionTypes, singleTypes] = chain(models)
    .groupBy('schema.kind')
    .map((value, key) => ({ name: key, links: value }))
    .sortBy('name')
    .value();

  return {
    collectionTypesSectionLinks: generateLinks(get(collectionTypes, 'links', [])),
    singleTypesSectionLinks: generateLinks(get(singleTypes, 'links', [])),
  };
};

export default generateModelsLinks;
export { generateLinks };

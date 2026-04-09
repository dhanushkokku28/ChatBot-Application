import type { Core } from '@strapi/strapi';

const CHAT_MESSAGE_ACTIONS = [
  'api::chat-message.chat-message.find',
  'api::chat-message.chat-message.create',
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const authenticatedRole = await strapi
      .db
      .query('plugin::users-permissions.role')
      .findOne({
        where: {
          type: 'authenticated',
        },
      });

    if (!authenticatedRole) {
      return;
    }

    for (const action of CHAT_MESSAGE_ACTIONS) {
      const existingPermission = await strapi
        .db
        .query('plugin::users-permissions.permission')
        .findOne({
          where: {
            action,
            role: authenticatedRole.id,
          },
        });

      if (!existingPermission) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            action,
            enabled: true,
            role: authenticatedRole.id,
          },
        });
        continue;
      }

      if (!existingPermission.enabled) {
        await strapi.db.query('plugin::users-permissions.permission').update({
          where: {
            id: existingPermission.id,
          },
          data: {
            enabled: true,
          },
        });
      }
    }
  },
};

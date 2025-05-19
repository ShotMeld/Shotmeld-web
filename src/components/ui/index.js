import SfButton from './SfButton.vue';
import SfInput from './SfInput.vue';
import SfCard from './SfCard.vue';
import SfModal from './SfModal.vue';
import SfAvatar from './SfAvatar.vue';
import SfBadge from './SfBadge.vue';
import SfNavbar from './SfNavbar.vue';
import SfNavLink from './SfNavLink.vue';
import SfLinkButton from './SfLinkButton.vue';
import SfDeleteConfirmModal from './SfDeleteConfirmModal.vue';

export {
  SfButton,
  SfInput,
  SfCard,
  SfModal,
  SfAvatar,
  SfBadge,
  SfNavbar,
  SfNavLink,
  SfLinkButton,
  SfDeleteConfirmModal
};

export default {
  install: (app) => {
    app.component('SfButton', SfButton);
    app.component('SfInput', SfInput);
    app.component('SfCard', SfCard);
    app.component('SfModal', SfModal);
    app.component('SfAvatar', SfAvatar);
    app.component('SfBadge', SfBadge);
    app.component('SfNavbar', SfNavbar);
    app.component('SfNavLink', SfNavLink);
    app.component('SfLinkButton', SfLinkButton);
    app.component('SfDeleteConfirmModal', SfDeleteConfirmModal);
  }
};

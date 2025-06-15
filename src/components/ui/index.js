import SfButton from './SfButton.vue'
import SfInput from './SfInput.vue'
import SfCard from './SfCard.vue'
import SfModal from './SfModal.vue'
import SfAvatar from './SfAvatar.vue'
import SfBadge from './SfBadge.vue'
import SfNavbar from './SfNavbar.vue'
import SfNavLink from './SfNavLink.vue'
import SfLinkButton from './SfLinkButton.vue'
import SfDeleteConfirmModal from './SfDeleteConfirmModal.vue'
import LoginTransition from './LoginTransition.vue'
import LazyImage from './LazyImage.vue'
import LoadingSpinner from './LoadingSpinner.vue'

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
  SfDeleteConfirmModal,
  LoginTransition,
  LazyImage,
  LoadingSpinner,
}

export default {
  install: app => {
    app.component('SfButton', SfButton)
    app.component('SfInput', SfInput)
    app.component('SfCard', SfCard)
    app.component('SfModal', SfModal)
    app.component('SfAvatar', SfAvatar)
    app.component('SfBadge', SfBadge)
    app.component('SfNavbar', SfNavbar)
    app.component('SfNavLink', SfNavLink)
    app.component('SfLinkButton', SfLinkButton)
    app.component('SfDeleteConfirmModal', SfDeleteConfirmModal)
    app.component('LoginTransition', LoginTransition)
    app.component('LazyImage', LazyImage)
    app.component('LoadingSpinner', LoadingSpinner)
  },
}

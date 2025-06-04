export default {
  message: {
    hello: 'Hello',
    welcome: 'Welcome to ShotMeld'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Customize your ShotMeld experience',
    theme: {
      title: 'Theme',
      description: 'Choose your preferred interface theme',
      light: 'Light Mode',
      dark: 'Dark Mode',
      system: 'Follow System'
    },
    language: {
      title: 'Language',
      description: 'Choose your preferred interface language',
      zh: '中文',
      en: 'English'
    }
  },
  profile: {
    loading: 'Loading profile information...',
    email: 'Email',
    registerDate: 'Registration Date',
    photos: 'Photos',
    noPhotos: 'No Photos',
    albums: 'Albums',
    noAlbums: 'No Albums',
    logout: 'Logout',
    fetchError: 'Failed to fetch user information:'
  },
  sharePhoto: {
    loading: 'Loading photo...',
    error: {
      title: 'Photo does not exist or is not shared',
      homeButton: 'Return to Home',
      invalidId: 'Invalid photo ID',
      loadFailed: 'Failed to load shared photo:',
      notFound: 'Photo does not exist or is not shared',
      imageLoadFailed: 'Failed to load photo'
    },
    defaultTitle: 'Shared Photo',
    download: 'Download',
    imageLoading: 'Loading image...',
    pageTitle: 'Shotmeld Shared Photo',
    timeline: {
      loading: 'Loading timeline...',
      retry: 'Retry',
      year: 'Year',
      month: 'Month',
      photos: 'Photos',
      noTitle: 'No Title',
      uploadModal: {
        title: 'Upload Photo'
      },
      error: {
        fetchFailed: 'Failed to fetch photos:',
        loadFailed: 'Failed to load timeline, please try again',
        deleteFailed: 'Failed to delete photo:',
        deleteFailedTitle: 'Delete Failed',
        deleteFailedMessage: 'Unable to delete photo, please try again'
      },
      editPhoto: 'Edit photo:',
      editPhotoComingSoon: 'Photo editing feature will be implemented in future versions',
      uploadSuccess: {
        title: 'Upload Success',
        message: 'Successfully uploaded {count} photos'
      },
      deleteSuccess: {
        title: 'Success',
        message: 'Photo has been deleted'
      }
    }
  }
}

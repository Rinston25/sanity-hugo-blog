// Share button: opens the device's share sheet if there is one, otherwise copies the link.
const button = document.querySelector('[data-share-button]')
const message = document.querySelector('[data-share-message]')

function showMessage(text) {
  message.textContent = text
  // Clear after 2 seconds so the live region is empty and ready for the next announcement.
  setTimeout(() => {
    message.textContent = ''
  }, 2000)
}

button.addEventListener('click', async () => {
  const shareData = { title: document.title, url: window.location.href }
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareData.url)
      showMessage('Link copied!')
    }
  } catch (error) {
    // Closing the share sheet without choosing anything is not an error.
    if (error.name !== 'AbortError') showMessage('Could not share the link')
  }
})

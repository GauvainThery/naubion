/**
 * Clipboard utility functions
 */

/**
 * Copy text to clipboard with fallback for older browsers
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element to show feedback
 */
export async function copyToClipboard(text, button) {
  // Check if the browser supports clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      showCopySuccess(button);
    } catch (err) {
      console.error('Failed to copy: ', err);
      fallbackCopyTextToClipboard(text, button);
    }
  } else {
    fallbackCopyTextToClipboard(text, button);
  }
}

/**
 * Show success feedback on copy button
 * @param {HTMLElement} button - Button element
 */
function showCopySuccess(button) {
  button.textContent = '✅ Copied!';
  button.style.background = 'rgba(16, 185, 129, 0.3)';
  setTimeout(() => {
    button.textContent = '📋 Copy Share Link';
    button.style.background = 'rgba(255, 255, 255, 0.2)';
  }, 2000);
}

/**
 * Fallback function for older browsers or non-secure contexts
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element
 */
function fallbackCopyTextToClipboard(text, button) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      button.textContent = '✅ Copied!';
      button.style.background = 'rgba(16, 185, 129, 0.3)';
    } else {
      button.textContent = '❌ Copy failed';
      button.style.background = 'rgba(239, 68, 68, 0.3)';
    }
  } catch (err) {
    button.textContent = `Share: ${text.substring(0, 30)}...`;
    button.style.background = 'rgba(255, 255, 255, 0.3)';
  }

  document.body.removeChild(textArea);

  setTimeout(() => {
    button.textContent = '📋 Copy Share Link';
    button.style.background = 'rgba(255, 255, 255, 0.2)';
  }, 3000);
}

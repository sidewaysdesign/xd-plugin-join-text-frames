const { saveSettings } = require('./preferences')

function getSplitDialog(prefs) {
  // Get the dialog if it already exists
  let dialog = document.querySelector('dialog')

  if (dialog) {
    console.log('Dialog already loaded in DOM. Reusing...\n')
    return dialog
  } else {
    // Otherwise, create and return a new dialog
    return createSplitDialog(prefs)
  }
}

function createSplitDialog(prefs) {
  console.log('Adding dialog to DOM.\nIt will remain in the DOM until you call `dialog.remove()`, or your plugin is reloaded by XD.\n')
  //// Add your HTML to the DOM
  document.body.innerHTML = `
    <style>
        dialog {
            width: 400px;
        }
        h1 {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .icon {
            width: 24px;
            height: 24px;
            overflow: hidden;
        }
    </style>
    <dialog id="dialog">
        <form method="dialog">
            <h1><span>Split text box</span><img class="icon" src="images/icon@1x.png"></h1>
            <hr />
            <label for="splithorizontal">
            <span>Horizontal</span>
            <input type="radio" id="splithorizontal" name="splitdirection" value="horizontal" ${prefs.splitdirection === 'horizontal' ? ` checked` : ''}>
            </label>
            <label for="splitvertical">
            <span>Vertical</span>
            <input type="radio" id="splitvertical" name="splitdirection" value="vertical" ${prefs.splitdirection === 'vertical' ? ` checked` : ''}>
            </label>
            <footer>
                <button id="cancel">Cancel</button>
                <button type="submit" id="ok" uxp-variant="cta">OK</button>
            </footer>
        </form>
    </dialog>
  `
  //// Get references to DOM elements
  // Each of these will be used in event handlers below
  const [dialog, form, cancel, ok] = ['dialog', 'form', '#cancel', '#ok'].map(s => document.querySelector(s))

  //// Add event handlers
  // Close dialog when cancel is clicked, with an optional return value.
  // Note that XD handles the ESC key for you, also returning "reasonCanceled"
  cancel.addEventListener('click', () => dialog.close('reasonCanceled'))
  // Handle ok button click
  ok.addEventListener('click', e => handleSplitSubmit(e, dialog, prefs, { splitdirection: document.querySelector('[name="splitdirection"]:checked').value }))
  // Handle form submit via return key
  form.onsubmit = e => handleSplitSubmit(e, dialog, prefs, { splitdirection: document.querySelector('[name="splitdirection"]:checked').value })
  return dialog
}

function handleSplitSubmit(e, dialog, prefs, fields) {
  // Close the dialog, save fields to settings, and pass back data
  saveSettings({ ...prefs, ...fields })
  dialog.close(fields)
  // Prevent further automatic close handlers
  e.preventDefault()
}

module.exports = {
  getSplitDialog,
  createSplitDialog,
  handleSplitSubmit
}

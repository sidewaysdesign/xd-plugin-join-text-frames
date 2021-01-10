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
  console.log('prefs.joinoverride', prefs.joinoverride)
  // console.log('Adding dialog to DOM.\nIt will remain in the DOM until you call `dialog.remove()`, or your plugin is reloaded by XD.\n')
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
        .row {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            display:block;
            position:relative;
            padding: 0 0.375rem;
        }
        .row + hr {
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        .row + label:first-child {
          margin-top:0.25rem;
        }
        .row-hasselect {
          transform:translateY(-0.75rem);
        }
        .first-column {
            min-width: 120px;
        }
        input[type="radio"] {
          margin-left:0.0625rem;
        }
        select#splitcharacter {
          margin-bottom: -0.25rem;
          margin-left:0;
        }
        select#joinoverride-alignment {
          margin-bottom: 0.0625rem;
        }
    </style>
    <dialog id="dialog">
	<form method="dialog">
		<h1><span>Split &amp; Join Settings</span><img class="icon" src="images/icon@1x.png"></h1>
		<hr />
		<div class="row label--bold">Split direction</div>
		<div class="row">
			<label for="splithorizontal" class="first-column">
				<input type="radio" id="splithorizontal" name="splitdirection" value="horizontal" ${prefs.splitdirection === 'horizontal' ? ` checked` : ''}>
				<span>Horizontal</span>
			</label>
			<label for="splitvertical">
				<input type="radio" id="splitvertical" name="splitdirection" value="vertical" ${prefs.splitdirection === 'vertical' ? ` checked` : ''}>
				<span>Vertical</span>
			</label>
		</div>
		<div class="row row-hasselect">
			<label for="splitcharacter" class="first-column">Split character</label>
			<select id="splitcharacter" name="splitcharacter">
				<option value="tab" ${prefs.splitcharacter === 'tab' ? ` selected="selected"` : ''}>Tab (opt + tab)</option>
				<option value="pipe" ${prefs.splitcharacter === 'pipe' ? ` selected="selected"` : ''}>Pipe ( | )</option>
				<option value="underscore" ${prefs.splitcharacter === 'underscore' ? ` selected="selected"` : ''}>Underscore ( _ )</option>
				<option value="bullet" ${prefs.splitcharacter === 'bullet' ? ` selected="selected"` : ''}>Bullet ( • )</option>
			</select>
		</div>
		<hr />
		<div class="row label--bold">Join order</div>
		<div class="row">
			<label for="joinroder-selected" class="first-column">
				<input type="radio" id="joinorder-selected" name="joinorder-selected" value="selected" ${prefs.joinorder === 'selected' ? ` checked` : ''}>
				<span>Selected</span>
			</label>
			<label for="joinorder-topleft">
				<input type="radio" id="joinorder-topleft" name="joinorder-topleft" value="topleft" ${prefs.joinorder === 'topleft' ? ` checked` : ''}>
				<span>Top-left</span>
			</label>
		</div>
		<div class="row row-hasselect">
			<label for="joinalignment-firstframe" class="first-column">
				<input type="radio" id="joinalignment-firstframe" name="joinalignment-firstframe" value="vertical" ${prefs.joinalignment === 'firstframe' ? ` checked` : ''}>
				<span>First frame</span>
			</label>
			<label for="joinalignment-override">
				<input type="radio" id="joinalignment-override" name="joinalignment-override" value="vertical" ${prefs.joinalignment === 'override' ? ` checked` : ''}>
				<span>Override</span>
			</label>
			<select id="joinoverride-alignment" name="joinoverride-alignment">
				<option value="left" ${prefs.joinoverride === 'left' ? ` selected="selected"` : ''}>Left</option>
				<option value="center" ${prefs.joinoverride === 'center' ? ` selected="selected"` : ''}>Center</option>
				<option value="right" ${prefs.joinoverride === 'right' ? ` selected="selected"` : ''}>Right</option>
      </select>
    </div>
    <footer>
      <button id="cancel">Cancel</button>
      <button type="submit" id="ok" uxp-variant="cta">OK</button>
    </footer>
	</form>
</dialog>
x${prefs.joinoverride}x
  `
  //// Get references to DOM elements
  // Each of these will be used in event handlers below
  const [dialog, form, cancel, ok] = ['dialog', 'form', '#cancel', '#ok'].map(s => document.querySelector(s))

  //// Add event handlers
  // Close dialog when cancel is clicked, with an optional return value.
  // Note that XD handles the ESC key for you, also returning "reasonCanceled"
  cancel.addEventListener('click', () => dialog.close('reasonCanceled'))
  // Handle ok button click
  ok.addEventListener('click', e =>
    handleSplitSubmit(e, dialog, prefs, {
      splitdirection: document.querySelector('[name="splitdirection"]:checked').value,
      splitcharacter: document.querySelector('[name="splitcharacter"]:selected').value,
      joinorder: document.querySelector('[name="joinorder"]:checked').value
    })
  )
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

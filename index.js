
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { characters, getCharacters, saveSettingsDebounced, handleDeleteCharacter } from "../../../../script.js";

// Keep track of where your extension is located
const extensionName = "st-bulk-card-manager";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}/`;
const extensionSettings = extension_settings[extensionName];

const defaultSettings = {};
let is_bulk_edit = false;


/**
 * Loads the extension settings if they exist, otherwise initializes them to the defaults.
 */
async function loadSettings() {
    //Create the settings if they don't exist
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
}


/**
 * Toggles bulk edit mode on/off when the edit button is clicked.
 */
function onEditButtonClick() {
    console.log("Edit button clicked");
    // toggle bulk edit mode
    if (is_bulk_edit) {
        disableBulkSelect();
        // hide the delete button
        $("#bulkDeleteButton").hide();
        is_bulk_edit = false;
    } else {
        enableBulkSelect();
        // show the delete button
        $("#bulkDeleteButton").show();
        is_bulk_edit = true;
    }
}


/**
 * Deletes the character with the given chid.
 * 
 * @param {string} this_chid - The chid of the character to delete.
 */
async function deleteCharacter(this_chid) {
    await handleDeleteCharacter("del_ch", this_chid);
}

/** 
 * Deletes all characters that have been selected via the bulk checkboxes.
 */
async function onDeleteButtonClick() {
    console.log("Delete button clicked");

    // Create a mapping of chid to avatar
    let toDelete = [];
    $(".bulk_select_checkbox:checked").each((i, el) => {
        const chid = $(el).parent().attr('chid');
        const avatar = characters[chid].avatar;
        // Add the avatar to the list of avatars to delete
        toDelete.push(avatar);
    });

    // Delete the characters
    for (const avatar of toDelete) {
        console.log(`Deleting character with avatar ${avatar}`);
        await getCharacters();

        //chid should be the key of the character with the given avatar
        const chid = Object.keys(characters).find(key => characters[key].avatar === avatar);
        console.log(`Deleting character with chid ${chid}`);
        await deleteCharacter(chid);
    }
}



/**
 * Adds the bulk edit and delete buttons to the UI.
 */
function addButtons() {
    const editButton = $("<i id='bulkEditButton' class='fa-solid fa-edit menu_button bulkEditButton' title='Bulk edit characters'></i>");
    const deleteButton = $("<i id='bulkDeleteButton' class='fa-solid fa-trash menu_button bulkDeleteButton' title='Bulk delete characters' style='display: none;'></i>");

    $("#charListGridToggle").after(editButton, deleteButton);

    $("#bulkEditButton").on("click", onEditButtonClick);
    $("#bulkDeleteButton").on("click", onDeleteButtonClick);
}



/**
 * Enables bulk selection by adding a checkbox next to each character.
 */
function enableBulkSelect() {
    $(".character_select").each((i, el) => {
        const character = $(el).text();
        const checkbox = $("<input type='checkbox' class='bulk_select_checkbox'>");
        checkbox.on("change", () => {
            // Do something when the checkbox is changed
        });
        $(el).prepend(checkbox);
    });
    // We also need to disable the default click event for the character_select divs
    $(document).on('click', '.bulk_select_checkbox', function (event) {
        event.stopImmediatePropagation();
    });

}

/**
 * Disables bulk selection by removing the checkboxes.
 */
function disableBulkSelect() {
    $(".bulk_select_checkbox").remove();
}


/**
 * Entry point that runs on page load.
 */
jQuery(async () => {
    addButtons();
    loadSettings();
});

// The main script for the extension
// The following are examples of some basic extension functionality

//You'll likely need to import extenion_settings, getContext, and loadExtensionSettings from extensions.js
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

// Keep track of where your extension is located
const extensionName = "st-bulk-card-manager";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}/`;
const extensionSettings = extension_settings[extensionName];

const defaultSettings = {};

async function loadSettings() {
    //Create the settings if they don't exist
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
}

function onEditButtonClick() {
    enableBulkSelect();
}

function deleteCharacter(character) {
    console.log(
        "Deleting character -- ChID: " +
        this_chid +
        " -- Name: " +
        characters[this_chid].name
    );
    const delete_chats = !!$("#del_char_checkbox").prop("checked");
    const avatar = characters[this_chid].avatar;
    const name = characters[this_chid].name;
    const msg = new FormData($("#form_create").get(0)); // ID form
    msg.append("delete_chats", delete_chats);
    jQuery.ajax({
        method: "POST",
        url: "/deletecharacter",
        beforeSend: function () {
        },
        data: msg,
        cache: false,
        contentType: false,
        processData: false,
        success: async function (html) {
            //RossAscends: New handling of character deletion that avoids page refreshes and should have
            // fixed char corruption due to cache problems.
            //due to how it is handled with 'popup_type', i couldn't find a way to make my method completely
            // modular, so keeping it in TAI-main.js as a new default.
            //this allows for dynamic refresh of character list after deleting a character.
            // closes advanced editing popup
            $("#character_cross").click();
            // unsets expected chid before reloading (related to getCharacters/printCharacters from using old arrays)
            this_chid = "invalid-safety-id";
            // resets the characters array, forcing getcharacters to reset
            characters.length = 0;
            name2 = systemUserName; // replaces deleted charcter name with system user since she will be displayed next.
            chat = [...safetychat]; // sets up system user to tell user about having deleted a character
            chat_metadata = {}; // resets chat metadata
            setRightTabSelectedClass() // 'deselects' character's tab panel
            $(document.getElementById("rm_button_selected_ch"))
                .children("h2")
                .text(""); // removes character name from nav tabs
            clearChat(); // removes deleted char's chat
            this_chid = undefined; // prevents getCharacters from trying to load an invalid char.
            delete tag_map[avatar]; // removes deleted char's avatar from tag_map
            await getCharacters(); // gets the new list of characters (that doesn't include the deleted one)
            select_rm_info("char_delete", name); // also updates the 'deleted character' message
            printMessages(); // prints out system user's 'deleted character' message
            //console.log("#dialogue_popup_ok(del-char) >>>> saving");
            saveSettingsDebounced(); // saving settings to keep changes to variables
        },
    });
}

function onDeleteButtonClick() {
    // Get the selected characters
    const selectedCharacters = $(".bulk_select_checkbox:checked").map((i, el) => {
        return $(el).parent().text();
    });
    console.log(selectedCharacters);

    // Delete the selected characters
    selectedCharacters.each((i, character) => {
        deleteCharacter(character);
    });
}

function disableListener() {
    $(document).off("click", ".character_select");
}

function enableListener() {
    $(document).on("click", ".character_select", function () {
        if (selected_group && is_group_generating) {
            return;
        }

        if (selected_group || this_chid !== $(this).attr("chid")) {
            //if clicked on a different character from what was currently selected
            if (!is_send_press) {
                cancelTtsPlay();
                resetSelectedGroup();
                this_edit_mes_id = undefined;
                selected_button = "character_edit";
                this_chid = $(this).attr("chid");
                clearChat();
                chat.length = 0;
                chat_metadata = {};
                getChat();
            }
        } else {
            //if clicked on character that was already selected
            selected_button = "character_edit";
            select_selected_character(this_chid);
        }
    });
}




// Adds a checkbox beside each character in the rm_print_characters_block
// Each character is contained in a div with the class "character_select"
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
    disableListener();
}

// This function is called when the extension is loaded
jQuery(async () => {
    // This is an example of loading HTML from a file
    const settingsHtml = await $.get(
        `${extensionFolderPath}example.html`
    );

    // Append settingsHtml to extensions_settings
    // exension_settings and extensions_settings2 are the left and right columns of the settings menu
    // You can append to either one
    $("#extensions_settings").append(settingsHtml);

    // These are examples of listening for events
    $("#bulkEditButton").on("click", onEditButtonClick());
    $("#bulkDeleteButton").on("click", onDeleteButtonClick());

    // Load settings when starting things up (if you have any)
    loadSettings();
});

/*
 * FDC Application example package file
 * Written by Andrew Black
 * 2014
 */

// Declare global variables
var NUMBER_OF_TABLES = 4;
var DEFAULT_MESSAGE = "";
var rowNumber = [];
var fieldLayout = [];
var savedJson = {};
var metaData = [];
var metaDataOrig = [];
var messageFlags = [];
var messageFlagsOrig = [];
var fields = [];
var numberedFields = [];
var historicalData = {};
var importedSchema = [];

// Load the alpaca schemas
importedSchema[0] = jQuery.parseJSON(schemaFile0);
importedSchema[1] = jQuery.parseJSON(schemaFile1);
importedSchema[2] = jQuery.parseJSON(schemaFile2);
importedSchema[3] = jQuery.parseJSON(schemaFile3);

// Prevent JQuery mobile from styling forms. data-enhance="false" also set in layout
$.mobile.ignoreContentEnabled = true;

// Load the stylesheet and html layout
$('head').append('<style>' + styleFile + '</style>');
$("#internalPages").append(layoutFile);
$("#internalPages").append(helpFile);

// Add buttons to the menu
$("#leftMenuPanel").append('<li><a href="#1page" class="ui-btn" onclick="changeTitle(' + "'Field Data Collection | Large Tree Plot'" + ')">Large Tree Plot</a></li>');
$("#leftMenuPanel").append('<li><a href="#2page" class="ui-btn" onclick="changeTitle(' + "'Field Data Collection | Large Tree Plot - Help'" + ')">Large Tree Plot - Help</a></li>');

// This begins the series of function calls
getMetadata();

/*
 * Retrieves the JSON object from metadata file
 */
function getMetadata() {
    // Initialize each array for the number of tables within the form
    for (var i = 0; i < NUMBER_OF_TABLES; i++) {
        rowNumber[i] = 0;
        metaData[i] = [];
        messageFlags[i] = [];
        fields[i] = [];
        numberedFields[i] = [];
        messageFlagsOrig[i] = [];
        metaDataOrig[i] = [];
        fieldLayout[i] = "";
    }
    
    // Build the arrays for tracking field message states and holding field names
    metaData[0][0] = jQuery.parseJSON(metadataFile0);
    metaData[1][0] = jQuery.parseJSON(metadataFile1);
    metaData[2][0] = jQuery.parseJSON(metadataFile2);
    metaData[3][0] = jQuery.parseJSON(metadataFile3);
    metaDataOrig[0] = jQuery.parseJSON(metadataFile0);
    metaDataOrig[1] = jQuery.parseJSON(metadataFile1);
    metaDataOrig[2] = jQuery.parseJSON(metadataFile2);
    metaDataOrig[3] = jQuery.parseJSON(metadataFile3);

    // For each table
    for (var i = 0; i < NUMBER_OF_TABLES; i++) {
        // Then for each row
        var j = 0;
        messageFlags[i][0] = [];
        $.each(metaData[i][0], function(key, val) {
            messageFlags[i][0][key] = [];
            
            // Save the default messageFlags array values
            messageFlagsOrig[i][key] = [];
            fields[i][j] = key;

            j++;
        });
    }

    // Set the initial events for buttons
    clickEventsBeginning();

    // Now that we have the metadata, add the table headers
    addStrings();

    // Here is the call for building the Alpaca fields
    populateTables();

}

/*
 * Configure the onClick events that fire before any events added by Alpaca
 */
function clickEventsBeginning() {
    // Add functionality to the addRow buttons
    $("#addRowButton1").click(function(e) {
        e.preventDefault();
        addRowMultiTable(null, 1);
    });
    $("#addRowButton2").click(function(e) {
        e.preventDefault();
        addRowMultiTable(null, 2);
    });
    $("#addRowButton3").click(function(e) {
        e.preventDefault();
        addRowMultiTable(null, 3);
    });

    // Allow the save button to clear the output areas once pressed
    $("#saveButton").click(function(e) {
        e.preventDefault();
        savedJson = {};
        $("#jsonPrint").html("");
    });
}

/*
 * Add strings to the HTML headers once loaded from the metadata file
 */
function addStrings() {
    // Add the headers to the HTML tables
    for (var i = 0; i < NUMBER_OF_TABLES; i++) {
        for (var j = 0; j < fields[i].length; j++) {
            $("#header" + i + "_" + j).html(metaData[i][0][fields[i][j]].title);
        }
    }
}

/*
 * Attempt to load previous form data and add Alpaca fields
 */
function populateTables() {
    var headerVal = null;

    // If there is an imported JSON file, parse it for possible values
    if (importedJson) {
        var convertedImport = jQuery.parseJSON(importedJson);
        
        $.each(convertedImport, function(key, val) {
            // Each entry should begin with a standard named key.
            // Use indexOf to check for possible keys and add rows if found
            if (key.indexOf("header") > -1) {
                // Single row tables can only be populated once, so set the value here
                headerVal = val;
            } else if (key.indexOf("tree") > -1) {
                addRowMultiTable(val, 1);
            } else if (key.indexOf("removed") > -1) {
                addRowMultiTable(val, 2);
            } else if (key.indexOf("comment") > -1) {
                addRowMultiTable(val, 3);
            }
            
        });
    }
    
    // Add a row to each table regardless of imported data
    addRowSingleTable(headerVal);
    addRowMultiTable(null, 1);
    addRowMultiTable(null, 2);
    addRowMultiTable(null, 3);
}

/*
 * Updates the message area with details for current field
 */
function updateMessages(fieldName, row, table) {

    // Clear the previous message field
    $("#messageArea").html(DEFAULT_MESSAGE);
    
    // Build a title to be displayed if there is something to show
    var titleString = metaData[table][row][fieldName].title + "...<br />";
    var messageString = "";

    // Loop through each message, recording those that are flagged
    for (var i = 1; i <= messageFlags[table][row][fieldName].length; i++) {
        if (messageFlags[table][row][fieldName][i]) {
            messageString += metaData[table][row][fieldName]["msg" + i] + "<br />";
        }
    }

    // If any messages were recorded, write title and messages to message area
    if (messageString !== "") {
        $("#messageArea").html(titleString + messageString);
    }

}

/*
 * Write the current JSON string to the saved data file
 */
var writeToFile = function() {
    writeToJson.write(JSON.stringify(savedJson, null, "  "));
};

/*
 * Display all current error messages after pressing validate
 */
var displayAllMessages = function() {
    // Parse each table and row for invalid fields, appending each to the allMessages string
    var allMessages = "";
    for (var table = 0; table < NUMBER_OF_TABLES; table++) {
        for (var row = 0; row <= messageFlags[table].length; row++) {
            var rowTitle = "Table#" + (table + 1) + " Row#" + (row + 1) + "... ";
            var rowMessages = "";
            for (var fieldName in messageFlags[table][row]) {

                var titleString = metaData[table][row][fieldName].title + ": ";
                var messageString = "";

                // Loop through each message, displaying those that are flagged
                for (var i = 1; i <= messageFlags[table][row][fieldName].length; i++) {
                    if (messageFlags[table][row][fieldName][i]) {
                        messageString += metaData[table][row][fieldName]["msg" + i] + ", ";
                    }
                }
                // If any messages were recorded, write title and messages to main
                if (messageString !== "") {
                    rowMessages += titleString + messageString;
                }
            }
            if (rowMessages !== "") {
                allMessages += rowTitle + rowMessages + "<br /><br />";
            }
        }
    }
    // Display the current allMessages string in the message area
    $("#validationArea").html(allMessages);
};

/*
 * Handle our own validation checks whenever Alpaca validates a field
 */
function customValidator(control, callback) {
    // The propertyId for a field is the same as its key name
    var fieldName = control.propertyId;

    // This gets the row number of the selected field
    if (control.getParent().childrenByPropertyId["header_dataID_networkLabel"]) {
        var table = 0;
        var row = 0;
    }

    if (control.getParent().childrenByPropertyId["tree_details_treeNumber"]) {
        var table = 1;
        var row = parseInt(control.getParent().childrenByPropertyId["tree_details_treeNumber"].getId(), 10);
    }

    if (control.getParent().childrenByPropertyId["removed_treeNumber"]) {
        var table = 2;
        var row = parseInt(control.getParent().childrenByPropertyId["removed_treeNumber"].getId(), 10);
    }

    if (control.getParent().childrenByPropertyId["comments_treeNumber"]) {
        var table = 3;
        var row = parseInt(control.getParent().childrenByPropertyId["comments_treeNumber"].getId(), 10);
    }

    // Ensure that form is initially valid
    callback({
        "status": true
    });

    // Set all message error and warning flags to false initially
    for (var i = 0; i < messageFlags[table][row][fieldName].length; i++) {
        messageFlags[table][row][fieldName][i] = false;
    }

    //Check if the basic Alpaca schema validation has passed
    if (!control.isValid()) {
        // not alpaca valid
        messageFlags[table][row][fieldName][0] = true;
        messageFlags[table][row][fieldName][1] = true;
    }

    // Only some fields will require special validation
    specialValidation(fieldName, control, row, table);

    // If any validation checks failed, flag field as invalid
    if (messageFlags[table][row][fieldName][0]) {
        callback({
            "status": false
        });
    }

    // Update the message area with errors or warnings
    updateMessages(fieldName, row, table);
}

/*
 * Checks that historical data exists for a given field and returns the value
 */
function historicalCheck(fieldName, dependency) {
    var currentTreeNumber = dependency["tree_details_treeNumber"];
    // Row must contain a tree number
    if (!currentTreeNumber) {
        return null;
    }

    // Historical data must have a record for this tree
    if (!historicalData[currentTreeNumber]) {
        return null;
    }

    // Return the historical value of the current field
    return historicalData[currentTreeNumber][fieldName];
}

/*
 * Handle programmatic and dependency based validation checks for some fields 
 */
function specialValidation(fieldName, control, row, table) {
    var fieldValue = control.getValue();
    var dependency = control.getParent().getValue();
    var historicalValue = historicalCheck(fieldName, dependency);

    switch (fieldName) {
        case "tree_details_plotSector":
        case "tree_details_genus":
        case "tree_details_species":
        case "tree_details_variety":
            if (historicalValue) {
                if (fieldValue !== historicalValue) {
                    messageFlags[table][row][fieldName][0] = true;
                    messageFlags[table][row][fieldName][2] = true;
                    metaData[table][row][fieldName]["msg2"] = metaDataOrig[table][fieldName]["msg2"] + " (" + historicalValue + ")";
                }
            }
            break;
        case "tree_details_treeStatus":
            if (historicalValue) {
                if (historicalValue === "DS" && (fieldValue === "LS" || fieldValue === "LF")) {
                    messageFlags[table][row][fieldName][0] = true;
                    messageFlags[table][row][fieldName][2] = true;
                }
            }
            break;
        case "tree_details_dbh":
            if (historicalValue) {
                if ((dependency["tree_details_treeStatus"] === "LS" || dependency["tree_details_treeStatus"] === "LF") && fieldValue <= historicalValue) {
                    messageFlags[table][row][fieldName][0] = true;
                    messageFlags[table][row][fieldName][2] = true;
                    metaData[table][row][fieldName]["msg2"] = metaDataOrig[table][fieldName]["msg2"] + " (" + historicalValue + ")";
                }
            }
            if (fieldValue < 9.0) {
                messageFlags[table][row][fieldName][3] = true;
            }
        case "tree_details_treeHeight":
            if (historicalValue) {
                if (dependency["tree_details_treeStatus"] === "DS" && fieldValue > historicalValue) {
                    messageFlags[table][row][fieldName][0] = true;
                    messageFlags[table][row][fieldName][2] = true;
                    metaData[table][row][fieldName]["msg2"] = metaDataOrig[table][fieldName]["msg2"] + " (" + historicalValue + ")";
                }
                if ((dependency["tree_details_treeStatus"] === "LS" || dependency["tree_details_treeStatus"] === "LF") && dependency["tree_details_stem"] === "I" && fieldValue < historicalValue) {
                    messageFlags[table][row][fieldName][0] = true;
                    messageFlags[table][row][fieldName][3] = true;
                    metaData[table][row][fieldName]["msg3"] = metaDataOrig[table][fieldName]["msg3"] + " (" + historicalValue + ")";
                }
            }
            break;
        case "tree_details_crownClass":
            if ((dependency["tree_details_treeStatus"] === "LF" || dependency["tree_details_treeStatus"] === "DS") && fieldValue !== "N") {
                messageFlags[table][row][fieldName][0] = true;
                messageFlags[table][row][fieldName][2] = true;
            }
            var historicalStatusValue = historicalCheck("tree_details_treeStatus", dependency);
            if (historicalValue && historicalStatusValue) {
                if ((historicalStatusValue === "LF" || historicalStatusValue === "DS") && fieldValue !== "N") {
                    messageFlags[table][row][fieldName][0] = true;
                    messageFlags[table][row][fieldName][3] = true;
                }
            }
            if (dependency["tree_details_treeStatus"] === "LS" && dependency["tree_condition_stem"] !== "B" && fieldValue === "N") {
                messageFlags[table][row][fieldName][4] = true;
            }
            break;
        case "tree_details_heightToLiveCrownBase":
        case "tree_details_heightToLiveCrownTop":
            if (!(fieldValue === -9 || (fieldValue >= 0.1 && fieldValue <= 99.99))) {
                messageFlags[table][row][fieldName][0] = true;
                messageFlags[table][row][fieldName][1] = true;
            }
            if (historicalValue) {
                if (historicalValue === -9 && fieldValue !== -9) {
                    messageFlags[table][row][fieldName][0] = true;
                    messageFlags[table][row][fieldName][2] = true;
                }
            }
            if ((dependency["tree_details_treeStatus"] === "LF" || dependency["tree_details_treeStatus"] === "DS") && fieldValue !== -9) {
                messageFlags[table][row][fieldName][0] = true;
                messageFlags[table][row][fieldName][3] = true;
            }
            break;
        case "tree_condition_bark":
        case "tree_condition_wood":
            if (historicalValue) {
                if (fieldValue < historicalValue) {
                    messageFlags[table][row][fieldName][0] = true;
                    messageFlags[table][row][fieldName][2] = true;
                    metaData[table][row][fieldName]["msg2"] = metaDataOrig[fieldName]["msg2"] + " (" + historicalValue + ")";
                }
            }
            break;
        case "tree_stemMapping_distanceToTreeFace":
            if (!(fieldValue === -1 || (fieldValue >= 0.1 && fieldValue <= 99.99))) {
                messageFlags[table][row][fieldName][0] = true;
                messageFlags[table][row][fieldName][1] = true;
            }
            break;
        default:
            // Do nothing
            break;
    }

}

/*
 * This adds the row id to the html and calls Alpaca to render the fields for single row tables
 */
function addRowSingleTable(importData) {
    var table = 0;
    
    // Prepare the HTML layout for a new row to be added
    for (var i = 0; i < fields[table].length; i++) {
        numberedFields[table][i] = fields[table][i] + rowNumber[table];
    }
    fieldLayout[table] = $("#data_row0_0").html();
    $("#data_row0_0").html("");

    // Add a new messageFlags and metaData entry for this row based on default data
    messageFlags[table][rowNumber[table]] = messageFlagsOrig[table];

    metaData[table][rowNumber[table]] = metaDataOrig[table];

    var newRow = "data_row" + table + "_" + rowNumber[table];

    alpacaRenderSingleTable("#" + newRow, importData);
}

/*
 * This is where the Alpaca form is assembled for single row tables
 */
function alpacaRenderSingleTable(fieldName, importData) {
    var table = 0;
    // Set view type depending on whether or not there is imported data
    var uiType = "";
    if (!importData) {
        importData = {};
        uiType = "VIEW_BOOTSTRAP_CREATE";
    } else {
        uiType = "VIEW_BOOTSTRAP_EDIT";
    }

    var alpacaSchema = importedSchema[0];

    // Alpaca options JSON data
    var alpacaOptions = {
        "fields": {
            "header_dataID_networkLabel": {
                "showMessages": false,
                "size": 7,
                "validator": customValidator
            },
            "header_date_year": {
                "showMessages": false,
                "size": 4,
                "validator": customValidator
            },
            "header_date_month": {
                "showMessages": false,
                "size": 2,
                "validator": customValidator
            },
            "header_date_day": {
                "showMessages": false,
                "size": 2,
                "validator": customValidator
            },
            "header_date_measureNumber": {
                "showMessages": false,
                "size": 3,
                "validator": customValidator
            },
            "header_crewInitials1": {
                "showMessages": false,
                "size": 3,
                "validator": customValidator
            },
            "header_crewInitials2": {
                "showMessages": false,
                "size": 3,
                "validator": customValidator
            },
            "header_crewInitials3": {
                "showMessages": false,
                "size": 3,
                "validator": customValidator
            },
            "header_plotType": {
                "type": "select",
                "showMessages": false,
                "validator": customValidator
            },
            "header_nominalPlotSize": {
                "showMessages": false,
                "size": 6,
                "validator": customValidator
            },
            "header_measuredPlotSize": {
                "showMessages": false,
                "size": 6,
                "validator": customValidator
            }
        }
    };

    // Alpaca view determines form UI and field bindings
    var alpacaView = {
        "parent": uiType,
        "layout": {
            "template": fieldLayout[table],
            "bindings": {
                "header_dataID_networkLabel": numberedFields[table][0],
                "header_date_year": numberedFields[table][1],
                "header_date_month": numberedFields[table][2],
                "header_date_day": numberedFields[table][3],
                "header_date_measureNumber": numberedFields[table][4],
                "header_crewInitials1": numberedFields[table][5],
                "header_crewInitials2": numberedFields[table][6],
                "header_crewInitials3": numberedFields[table][7],
                "header_plotType": numberedFields[table][8],
                "header_nominalPlotSize": numberedFields[table][9],
                "header_measuredPlotSize": numberedFields[table][10]
            }
        }
    };

    // Code for after form has loaded IE: Set UI button actions
    var postRenderCallback = function(control) {
        // Erase initial form load validation messages
        $("#messageArea").html(DEFAULT_MESSAGE);

        $("#saveButton").click(function(e) {
            e.preventDefault();

            // If a row has been removed, delete this event
            if (!control) {
                $("#saveButton").unbind(e);
                return;
            }

            var controlVal = control.getValue();
            var treeNumber = control.childrenByPropertyId["header_dataID_networkLabel"];
            var dataName = "header";

            // A tree number must be entered to save the current row
            if (treeNumber.getValue() && treeNumber.isValid()) {
                savedJson[dataName + treeNumber.getValue()] = controlVal;
            }

        });

        // Validate each row once validation button is clicked
        $("#validateButton").click(function(e) {
            e.preventDefault();

            // If a row has been removed, delete this event
            if (!control) {
                $("#validateButton").unbind(e);
                return;
            }

            control.refreshValidationState(true);

            // Message area will display last validated field unless cleared
            $("#messageArea").html(DEFAULT_MESSAGE);
        });

        // Unbind the currennt validation event
        $("#validateButton").unbind("click", displayAllMessages);
        // Rebind validation event to the back of queue
        $("#validateButton").bind("click", displayAllMessages);

        // Unbind the currennt write file event
        $("#saveButton").unbind("click", writeToFile);
        // Rebind the currennt write file event
        $("#saveButton").bind("click", writeToFile);
    };

    // This is the actual call that writes to form to the HTML
    $(fieldName).alpaca({
        "data": importData,
        "schema": alpacaSchema,
        "view": alpacaView,
        "options": alpacaOptions,
        "postRender": postRenderCallback
    });
}

/*
 * This adds the row id to the html and calls Alpaca to render the fields for multi row tables
 */
function addRowMultiTable(importData, table) {
    // Prepare the HTML layout for a new row to be added
    for (var i = 0; i < fields[table].length; i++) {
        numberedFields[table][i] = fields[table][i] + rowNumber[table];
    }

    // Add the remove button to the beginning of each row
    fieldLayout[table] = '<td><button id="removeRow' + table + '_' + rowNumber[table] + '"class="ui-btn ui-shadow ui-corner-all ui-icon-minus ui-btn-icon-notext ui-btn-b ui-btn-inline">Remove Row ' + (rowNumber[table] + 1) + '</button></td>';

    for (var i = 0; i < fields[table].length; i++) {
        fieldLayout[table] += '<td class="fieldCell' + table + "_" + i + '"><div id="' + numberedFields[table][i] + '"></div></td>';
    }

    // Add a new messageFlags and metaData entry for this row based on default data
    messageFlags[table][rowNumber[table]] = messageFlagsOrig[table];
    metaData[table][rowNumber[table]] = metaDataOrig[table];

    var newRow = "data_row" + table + "_" + rowNumber[table];
    // Insert the row which Alpaca will populate with fields
    $("#dataTable" + table).before('<tr id="' + newRow + '"></tr>');

    alpacaRenderMultiTable("#" + newRow, importData, rowNumber[table], table);
    rowNumber[table]++;
}

/*
 * This is where the Alpaca form is assembled for multi row tables
 */
function alpacaRenderMultiTable(fieldName, importData, currentRowNumber, table) {
    // Set view type depending on whether or not there is imported data
    var uiType = "";
    if (!importData) {
        importData = {};
        uiType = "VIEW_BOOTSTRAP_CREATE";
    } else {
        uiType = "VIEW_BOOTSTRAP_EDIT";
    }

    var alpacaSchema = importedSchema[table];
    var alpacaOptions = {};
    var alpacaView = {};

    if (table === 1) {

        // Alpaca options JSON data
        alpacaOptions = {
            "fields": {
                "tree_details_plotSector": {
                    "showMessages": false,
                    "size": 1,
                    "validator": customValidator
                },
                "tree_details_treeNumber": {
                    "showMessages": false,
                    "size": 4,
                    "id": currentRowNumber + "treeRowKey",
                    "validator": customValidator
                },
                "tree_details_origPlotArea": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_details_genus": {
                    "showMessages": false,
                    "size": 4,
                    "validator": customValidator
                },
                "tree_details_species": {
                    "showMessages": false,
                    "size": 3,
                    "validator": customValidator
                },
                "tree_details_variety": {
                    "showMessages": false,
                    "size": 3,
                    "validator": customValidator
                },
                "tree_details_treeStatus": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_details_dbh": {
                    "showMessages": false,
                    "size": 3,
                    "validator": customValidator
                },
                "tree_details_dbhME": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_details_treeHeight": {
                    "showMessages": false,
                    "size": 4,
                    "validator": customValidator
                },
                "tree_details_treeHeightME": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_details_crownClass": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_details_heightToLiveCrownBase": {
                    "showMessages": false,
                    "size": 4,
                    "validator": customValidator
                },
                "tree_details_heightToLiveCrownTop": {
                    "showMessages": false,
                    "size": 4,
                    "validator": customValidator
                },
                "tree_condition_stem": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_condition_crown": {
                    "showMessages": false,
                    "size": 1,
                    "validator": customValidator
                },
                "tree_condition_bark": {
                    "showMessages": false,
                    "size": 1,
                    "validator": customValidator
                },
                "tree_condition_wood": {
                    "showMessages": false,
                    "size": 1,
                    "validator": customValidator
                },
                "tree_stemMapping_azimuthToTree": {
                    "showMessages": false,
                    "size": 3,
                    "validator": customValidator
                },
                "tree_stemMapping_distanceToTreeFace": {
                    "showMessages": false,
                    "size": 5,
                    "validator": customValidator
                },
                "tree_damageAgents_damageAgent1": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_damageAgents_location1": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_damageAgents_severity1": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_damageAgents_damageAgent2": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_damageAgents_location2": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                },
                "tree_damageAgents_severity2": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                }
            }
        };

        // Alpaca view determines form UI and field bindings
        alpacaView = {
            "parent": uiType,
            "layout": {
                "template": fieldLayout[table],
                "bindings": {
                    "tree_details_plotSector": numberedFields[table][0],
                    "tree_details_treeNumber": numberedFields[table][1],
                    "tree_details_origPlotArea": numberedFields[table][2],
                    "tree_details_genus": numberedFields[table][3],
                    "tree_details_species": numberedFields[table][4],
                    "tree_details_variety": numberedFields[table][5],
                    "tree_details_treeStatus": numberedFields[table][6],
                    "tree_details_dbh": numberedFields[table][7],
                    "tree_details_dbhME": numberedFields[table][8],
                    "tree_details_treeHeight": numberedFields[table][9],
                    "tree_details_treeHeightME": numberedFields[table][10],
                    "tree_details_crownClass": numberedFields[table][11],
                    "tree_details_heightToLiveCrownBase": numberedFields[table][12],
                    "tree_details_heightToLiveCrownTop": numberedFields[table][13],
                    "tree_condition_stem": numberedFields[table][14],
                    "tree_condition_crown": numberedFields[table][15],
                    "tree_condition_bark": numberedFields[table][16],
                    "tree_condition_wood": numberedFields[table][17],
                    "tree_stemMapping_azimuthToTree": numberedFields[table][18],
                    "tree_stemMapping_distanceToTreeFace": numberedFields[table][19],
                    "tree_damageAgents_damageAgent1": numberedFields[table][20],
                    "tree_damageAgents_location1": numberedFields[table][21],
                    "tree_damageAgents_severity1": numberedFields[table][22],
                    "tree_damageAgents_damageAgent2": numberedFields[table][23],
                    "tree_damageAgents_location2": numberedFields[table][24],
                    "tree_damageAgents_severity2": numberedFields[table][25]
                }
            }
        };
    }

    if (table === 2) {
        // Alpaca options JSON data
        alpacaOptions = {
            "fields": {
                "removed_treeNumber": {
                    "showMessages": false,
                    "size": 4,
                    "id": currentRowNumber + "removedRowKey",
                    "validator": customValidator
                },
                "removed_reason": {
                    "type": "select",
                    "showMessages": false,
                    "validator": customValidator
                }
            }
        };

        // Alpaca view determines form UI and field bindings
        alpacaView = {
            "parent": uiType,
            "layout": {
                "template": fieldLayout[table],
                "bindings": {
                    "removed_treeNumber": numberedFields[table][0],
                    "removed_reason": numberedFields[table][1]
                }
            }
        };
    }

    if (table === 3) {
        // Alpaca options JSON data
        alpacaOptions = {
            "fields": {
                "comments_treeNumber": {
                    "showMessages": false,
                    "size": 4,
                    "id": currentRowNumber + "commentRowKey",
                    "validator": customValidator
                },
                "comments_comments": {
                    "showMessages": false,
                    "size": 250,
                    "validator": customValidator
                }
            }
        };

        // Alpaca view determines form UI and field bindings
        alpacaView = {
            "parent": uiType,
            "layout": {
                "template": fieldLayout[table],
                "bindings": {
                    "comments_treeNumber": numberedFields[table][0],
                    "comments_comments": numberedFields[table][1]
                }
            }
        };
    }
    // Code for after form has loaded IE: Set UI button actions
    var postRenderCallback = function(control) {

        // Erase initial form load validation messages
        $("#messageArea").html(DEFAULT_MESSAGE);

        $("#saveButton").click(function(e) {
            e.preventDefault();

            // If a row has been removed, delete this event
            if (!control) {
                $("#saveButton").unbind(e);
                return;
            }

            var controlVal = control.getValue();
            var treeNumber = null;
            var dataName = "";
            if (table === 1) {
                treeNumber = control.childrenByPropertyId["tree_details_treeNumber"];
                dataName = "tree";
            } else if (table === 2) {
                treeNumber = control.childrenByPropertyId["removed_treeNumber"];
                dataName = "removed";
            } else if (table === 3) {
                treeNumber = control.childrenByPropertyId["comments_treeNumber"];
                dataName = "comment";
            }
            // A tree number must be entered to save the current row
            if (treeNumber.getValue() && treeNumber.isValid()) {
                savedJson[dataName + treeNumber.getValue()] = controlVal;
            }
        });

        // Validate each row once validation button is clicked
        $("#validateButton").click(function(e) {
            e.preventDefault();

            // If a row has been removed, delete this event
            if (!control) {
                $("#validateButton").unbind(e);
                return;
            }

            control.refreshValidationState(true);

            // Message area will display last validated field unless cleared
            $("#messageArea").html(DEFAULT_MESSAGE);
        });

        $("#removeRow" + table + "_" + currentRowNumber).click(function(e) {
            e.preventDefault();

            // Destroy the control
            control = null;

            // Destroy it's flag and metadata objects
            metaData[table][currentRowNumber] = null;
            messageFlags[table][currentRowNumber] = null;

            $("#data_row" + table + "_" + currentRowNumber).remove();
        });

        // Unbind the currennt validation event
        $("#validateButton").unbind("click", displayAllMessages);
        // Rebind validation event to the back of queue
        $("#validateButton").bind("click", displayAllMessages);

        // Unbind the currennt write file event
        $("#saveButton").unbind("click", writeToFile);
        // Rebind the currennt write file event
        $("#saveButton").bind("click", writeToFile);
    };

    // This is the actual call that writes to form to the HTML
    $(fieldName).alpaca({
        "data": importData,
        "schema": alpacaSchema,
        "view": alpacaView,
        "options": alpacaOptions,
        "postRender": postRenderCallback
    });
}
// VARIABLES
var
	contextMenu = require("context-menu"),
	tabs = require("tabs"),
	windows = require("windows").browserWindows,
	selection = require("selection")
;

const { Hotkey } = require("hotkeys");

// VARIABLES
exports.buttonContext = contextMenu.PageContext();
exports.buttonStatuses = { first: true, left: true, right: true, last: true };
exports.buttonNames = { first: "first", left: "left", right: "right", last: "last" };

exports.preferences = {
	debugMode: false,
	forceDocumentFocus: false,
	useAutoPin: false
};

// METHODS

/*
 * Log a message to the console if debugMode is set to true.
 * @param String message
 */
exports.log = function (message) {
	if (this.preferences.debugMode === true) {
		console.log(message);
	}
};

/*
 * This adds the sub-menu to the context menu.
 *
 * @return integer
 */
exports.addMenus = function () {
	var moveTabsMenu = contextMenu.Menu({
		label: "Move tabs to",
		context: contextMenu.PageContext(),
		contentScript: 'self.on("click", function (node, data) {' +
									'	self.postMessage(data);' +
									'});',
		onMessage: function (data) {
			var mt = require("module-move-tabs");
			mt.log("Click on button '" + data + "'.");
			mt.checkTabAndTrigger(data);
		},
		items: [
			contextMenu.Item({ label: "first", data: "first" }),
			contextMenu.Item({ label: "left", data: "left" }),
			contextMenu.Item({ label: "right", data: "right" }),
			contextMenu.Item({ label: "last", data: "last" })
		]
	});
};

/*
 * Load interactions on the active tab and add the move buttons to the context menu.
 */
exports.init = function () {
	this.addMenus();
	this.listenPrefs();
	this.load(tabs.activeTab);
};

/*
 * Load the behaviors.
 * @param object tab
 */
exports.load = function (tab) {
	this.loadEvents();
};

/*
 * Load the keyboard gesture.
 * @param object tab
 */
exports.loadEvents = function () {
	exports.moveFirstHotKey = Hotkey({
		combo: "ctrl-home",
		onPress: function() {
			var mt = require("module-move-tabs");
			mt.checkTabAndTrigger(mt.buttonNames.first);
		}
	});

	exports.moveLeftHotKey = Hotkey({
		combo: "ctrl-left",
		onPress: function() {
			var mt = require("module-move-tabs");
			mt.checkTabAndTrigger(mt.buttonNames.left);
		}
	});

	exports.moveRightHotKey = Hotkey({
		combo: "ctrl-right",
		onPress: function() {
			var mt = require("module-move-tabs");
			mt.checkTabAndTrigger(mt.buttonNames.right);
		}
	});

	exports.moveLastHotKey = Hotkey({
		combo: "ctrl-end",
		onPress: function() {
			var mt = require("module-move-tabs");
			mt.checkTabAndTrigger(mt.buttonNames.last);
		}
	});
};

/*
 * Unload the keyboard shortcuts.
 * @param Object tab
 */
exports.unload = function (tab) {
	this.unloadEvents();
};

/*
 * Unload the keyboard events.
 */
exports.unloadAll = function () {
	for each (var tab in tabs)
		this.unload(tab);
};

/*
 * Unload the keyboard events.
 */
exports.unloadEvents = function () {
	// @todo
};

/**
 * Listen to preferences change events
 */
exports.listenPrefs = function () {
	for (var k in this.preferences) {
		require("simple-prefs").on(k, require("module-move-tabs").updatePref);
	}
};

/**
 * Update the preferences with the app ones
 * @param  {String} prefName The name of
 */
exports.updatePref = function (prefName) {
	var 
		mt = require("module-move-tabs"),
		value = require("simple-prefs").prefs[prefName]
	;

	mt.preferences[prefName] = value;

	mt.log('PREFS : setting "' + prefName + '" is now set to "' + value + '".');
};

/*
 * This counts the number of tabs in the window.
 *
 * @return integer
 */
exports.countTabs = function () {
	return windows.activeWindow.tabs.length;
};

/*
 * Get a specific tab in the window.
 * @param Number index
 *
 * @return Tab object or false if asked tab does not exist
 */
exports.getTab = function (index) {
	var tab = null;

	for each (var t in windows.activeWindow.tabs) {
		if (t.index == index) {
			tab = t;
			break;
		}
	}

	return tab;
};

/*
 * Check if a tab can be moved and launch the move if possible
 * @param String direction
 *
 * @return Boolean
 */
exports.checkTabAndTrigger = function (direction) {
	if (selection.text !== null) {
		this.log('CANCEL : the user is making a text selection.');
		return;
	}

	var contentScript = "var e = document.activeElement;";
	if (this.preferences.forceDocumentFocus === true)
		contentScript += "self.postMessage(!document.hasFocus() || e.tagName == 'INPUT' || e.tagName == 'TEXTAREA' || e.contenteditable == true);"
	else
		contentScript += "self.postMessage(e.tagName == 'INPUT' || e.tagName == 'TEXTAREA' || e.contenteditable == true);"

	tabs.activeTab.attach({
		contentScript: contentScript,
		onMessage: function (status) {
			var mt = require('module-move-tabs');
			if (!status)
				mt.move(direction);
			else
				mt.log('CANCEL : user is editing the page.');
		}
	});
};

/*
 * Move the tab and check the move buttons.
 * @param String direction
 */
exports.move = function (direction) {

	// @todo : check usesAutoPin

	if (direction == this.buttonNames.first) {
		this.moveToFirst(tabs.activeTab);
	}
	else if (direction == this.buttonNames.left) {
		this.moveToLeft(tabs.activeTab);
	}
	else if (direction == this.buttonNames.right) {
		this.moveToRight(tabs.activeTab);
	}
	else if (direction == this.buttonNames.last) {
		this.moveToLast(tabs.activeTab);
	}
};

/*
 * Move a tab to a specific index position
 * @param Object tab
 * @param Integer index
 */
exports.moveTo = function (tab, index) {
	this.log("Move tab #" + tab.index + " to #" + index + ".");
	tab.index = index;
};

/*
 * Move the tab to the first position.
 * @param Object tab The tab to move
 */
exports.moveToFirst = function (tab) {
	var
		index = 0,
		targetTab = this.getTab(index)
	;

	if (!targetTab)
		return;

	this.log("FIRST --> Tab #" + tab.index + " is asking to move to #" + index + "...");

	if (tab.index > index) {
		if (this.preferences.useAutoPin && !tab.isPinned && targetTab.isPinned)
			tab.pin();

		this.moveTo(tab, targetTab.index);
	}
};

/*
 * Move the tab to the left position.
 * @param Object tab The tab to move
 */
exports.moveToLeft = function (tab) {
	var
		index = tab.index - 1,
		targetTab = this.getTab(index)
	;

	if (!targetTab)
		return;

	this.log("LEFT --> Tab #" + tab.index + " is asking to move to #" + index + "...");

	if (index >= 0) {
		if (this.preferences.useAutoPin && !tab.isPinned && targetTab.isPinned)
			tab.pin();
		else
			this.moveTo(tab, targetTab.index);
	} 
};

/*
 * Move the tab to the right position.
 * @param Object tab The tab to move
 */
exports.moveToRight = function (tab) {
	var
		index = tab.index + 1,
		targetTab = this.getTab(index)
	;

	if (!targetTab)
		return;

	this.log("RIGHT --> Tab #" + tab.index + " is asking to move to #" + index + "...");

	if (index < this.countTabs()) {
		if (this.preferences.useAutoPin && tab.isPinned && !targetTab.isPinned)
			tab.unpin();
		else
			this.moveTo(tab, targetTab.index);
	}
};

/*
 * Move the tab to the last position.
 * @param Object tab The tab to move
 */
exports.moveToLast = function (tab) {
	var
		index = this.countTabs() - 1,
		targetTab = this.getTab(index)
	;

	if (!targetTab)
		return;

	this.log("LAST --> Tab #" + tab.index + " is asking to move to #" + index + "...");

	if (tab.index < index) {
		if (this.preferences.useAutoPin && tab.isPinned && !targetTab.isPinned)
			tab.unpin();

		this.moveTo(tab, targetTab.index);
	}
};
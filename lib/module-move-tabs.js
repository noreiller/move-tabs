// VARIABLES
var
  contextMenu = require("context-menu"),
  tabs = require("tabs")
;
const { Hotkey } = require("hotkeys");

// VARIABLES
exports.buttonContext = contextMenu.PageContext();
exports.buttonStatuses = { first: true, left: true, right: true, last: true };
exports.buttonNames = { first: "first", left: "left", right: "right", last: "last" };
exports.debugMode = false;

// METHODS
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
                  '  self.postMessage(data);' +
                  '});',
    onMessage: function (data) {
      var mt = require("module-move-tabs");
      mt.log("Click on button '" + data + "'.");
      mt.move(data);
    },
    items: [
      contextMenu.Item({ label: "first", data: "first" }),
      contextMenu.Item({ label: "left", data: "left" }),
      contextMenu.Item({ label: "right", data: "right" }),
      contextMenu.Item({ label: "last", data: "last" })
    ]
  });
}

/*
 * This counts the number of tabs in the window.
 * 
 * @return integer
 */
exports.countTabs = function () {
  var i = 0;
  for (tab in tabs)
    i++;
  
  return i;
}

/*
 * Get a specific tab in the window.
 *
 * @return Tab object or false if asked tab does not exist
 */
exports.getTab = function (n, tabsCount) {
  if (tabsCount == undefined)
    tabsCount = this.countTabs();
  
  if (n >= 0 && n <= tabsCount)
    return tabs[n];
}

/*
 * Load interactions on the active tab and add the move buttons to the context menu.
 */
exports.init = function () {
  this.addMenus();
  this.load(tabs.activeTab);
}

/*
 * Check if a tab can be moved to the first position.
 * @param Object tab
 * @param Integer tabsCount
 *
 * @return Boolean
 */
exports.isFirstAble = function (tab, tabsCount) {
  if (tabsCount == undefined)
    tabsCount = this.countTabs();

  var ret, firstTab = this.getTab(0, tabsCount);

  if (tab.index > 0 && !tab.isPinned && !firstTab.isPinned)
    ret = true;
  else if (tab.index > 0 && tab.isPinned && firstTab.isPinned)
    ret = true;
  else
    ret = false;

  this.log("/* CHECK FIRST */");
  this.log("Tab #" + tab.index + "/" + tabsCount + " is firstAble ? Answer : " + ret + ".");

  return ret;
}

/*
 * Check if a tab can be moved to his left.
 * @param Object tab
 * @param Integer tabsCount
 *
 * @return Boolean
 */
exports.isLeftAble = function (tab, tabsCount) {
  if (tabsCount == undefined)
    tabsCount = this.countTabs();

  var ret, prevTab = this.getTab(tab.index - 1, tabsCount);

  if (tab.index > 0 && !tab.isPinned && !prevTab.isPinned)
    ret = true;
  else if (tab.index > 0 && tab.isPinned && prevTab.isPinned)
    ret = true;
  else
    ret = false;

  this.log("/* CHECK LEFT */");
  this.log("Tab #" + tab.index + "/" + tabsCount + " is leftAble ? Answer : " + ret + ".");

  return ret;
}

/*
 * Check if a tab can be moved to his right.
 * @param Object tab
 * @param Integer tabsCount
 *
 * @return Boolean
 */
exports.isRightAble = function (tab, tabsCount) {
  if (tabsCount == undefined)
    tabsCount = this.countTabs();

  var ret, nextTab = this.getTab(tab.index + 1, tabsCount);
  
  if (tab.index < (tabsCount - 1) && !tab.isPinned)
    ret = true;
  else if (tab.index < (tabsCount - 1) && tab.isPinned && nextTab.isPinned)
    ret = true;
  else
    ret = false;

  this.log("/* CHECK RIGHT */");
  this.log("Tab #" + tab.index + "/" + tabsCount + " is rightAble ? Answer : " + ret + ".");

  return ret;
}

/*
 * Check if a tab can be moved to the last position.
 * @param Object tab
 * @param Integer tabsCount
 *
 * @return Boolean
 */
exports.isLastAble = function (tab, tabsCount) {
  if (tabsCount == undefined)
    tabsCount = this.countTabs();
  
  var ret, lastTab = this.getTab(tabsCount -1, tabsCount);

  if (tab.index < (tabsCount - 1) && !tab.isPinned)
    ret = true;
  else if (tab.index < (tabsCount - 1) && tab.isPinned && lastTab.isPinned)
    ret = true;
  else
    ret = false;

  this.log("/* CHECK LAST */");
  this.log("Tab #" + tab.index + "/" + tabsCount + " is lastAble ? Answer : " + ret + ".");

  return ret;
}

/*
 * Load the behaviors.
 * @param object tab
 */
exports.load = function (tab) {
  this.loadEvents();
}

/*
 * Load the keyboard gesture.
 * @param object tab
 */
exports.loadEvents = function () {
  exports.moveFirstHotKey = Hotkey({
    combo: "ctrl-home",
    onPress: function() {
      var mt = require("module-move-tabs");
      mt.move(mt.buttonNames.first);
    }
  });
  
  exports.moveLeftHotKey = Hotkey({
    combo: "ctrl-left",
    onPress: function() {
      var mt = require("module-move-tabs");
      mt.move(mt.buttonNames.left);
    }
  });

  exports.moveRightHotKey = Hotkey({
    combo: "ctrl-right",
    onPress: function() {
      var mt = require("module-move-tabs");
      mt.move(mt.buttonNames.right);
    }
  });

  exports.moveLastHotKey = Hotkey({
    combo: "ctrl-end",
    onPress: function() {
      var mt = require("module-move-tabs");
      mt.move(mt.buttonNames.last);
    }
  });
}

/*
 * Log a message to the console if debugMode is set to true.
 * @param String message
 */
exports.log = function (message) {
  if (this.debugMode == true) {
    console.log(message);
  }
}

/*
 * Move the tab and check the move buttons.
 * @param String direction
 */
exports.move = function (direction) {
  var index = -1;
  
  if (direction == this.buttonNames.first) {
    if (this.isFirstAble(tabs.activeTab))
      index = 0;
  }
  else if (direction == this.buttonNames.left) {
    if (this.isLeftAble(tabs.activeTab))
      index = tabs.activeTab.index - 1;
  }
  else if (direction == this.buttonNames.right) {
    if (this.isRightAble(tabs.activeTab))
      index = tabs.activeTab.index + 1;
  }
  else if (direction == this.buttonNames.last) {
    if (this.isLastAble(tabs.activeTab))
      index = tabs.length;
  }

  if (index != -1) {
    tabs.activeTab.index = index;
    this.log("Move tab #" + tabs.activeTab.index + " to #" + index + " using direction '" + direction + "'.");
  }
}

/*
 * Unload the keyboard shortcuts.
 * @param Object tab
 */
exports.unload = function (tab) {
  this.unloadEvents();
}

/*
 * Unload the keyboard events.
 */
exports.unloadAll = function () {
  for (tab in tabs)
    this.unload(tab);
}

/*
 * Unload the keyboard events.
 */
exports.unloadEvents = function () {
  // @todo
}
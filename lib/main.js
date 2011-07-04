var
  moveTabs = require("module-move-tabs"),
  tabs = require("tabs")
;

exports.main = function (options, callbacks) {
  /*
   * On init, launch moveTabs initialization.
   */
  moveTabs.init();

  /*
   * Load interactions when opening a tab.
   */
  tabs.onOpen = function(tab) {
    moveTabs.load(tab);
  }
};

exports.onUnload = function (reason) {
  /*
   * Unload move-tabs
   */
  moveTabs.unloadAll();
};
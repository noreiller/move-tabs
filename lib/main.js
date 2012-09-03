var
  mt = require("module-move-tabs"),
  tabs = require("tabs")
;

exports.main = function (options, callbacks) {
  /*
   * On init, launch the move-tabs module initialization.
   */
  mt.init();

  /*
   * Load interactions when opening a tab.
   */
  tabs.on('open', function(tab) {
    mt.load(tab);
  });
};

exports.onUnload = function (reason) {
  /*
   * Unload move-tabs
   */
  mt.unloadAll();
};
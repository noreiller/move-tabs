Introduction
------------

It requires the following modules :

* module-move-tabs
* tabs


Events
------

When extension is loaded, three events are set :

* Initialization of the moveTabs module, in fact it loads interactions on the active tab and add the move buttons to the context menu;
* Addition of the keyboard shortcut on tab opening;
* Check the buttons of the keyboard shortcut when getting the focus of a tab;

When extension is unloaded, all tabs events are removedd.
Introduction
------------

It requires the following modules :

* context-menu
* tabs


Objects
-------

<api name="leftButton">
@property {object}
The move button to display in menu.
</api>

<api name="rightButton">
@property {object}
The move button to display in menu.
</api>


Methods
-------

<api name="check">
@property {method}
Check if the move buttons need to be displayed.
</api>

<api name="countTabs">
@property {method}
This counts the number of tabs in the window.
</api>

<api name="eventOnKeyDown">
@property {method}
This function is fired on key down document event. It checks keyboard gesture and move to the indicated direction.
</api>

<api name="init">
@property {method}
On init, it loads interactions on the active tab and add the move buttons to the context menu.
</api>

<api name="isLeftAble">
@property {method}
This function checks if a tab can be moved to his left.
</api>

<api name="isRightAble">
@property {method}
This function checks if a tab can be moved to his right.
</api>

<api name="load">
@property {method}
Loads and check the keyboard gesture.
</api>

<api name="log">
@property {method}
If debugMode is set to true, log the message to the console.
</api>

<api name="move">
@property {method}
Moves the tab and check the move buttons.
</api>

<api name="toggleMoveButton">
@property {method}
Toggle the display of the move buttons.
</api>

<api name="unload">
@property {method}
Unloads the keyboard events.
</api>
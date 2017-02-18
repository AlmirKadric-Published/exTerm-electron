 - Move these into the issue tracker

 - Issues & bugs & general improvements
   - Review estlint settings and fix all lint errors
   - Implement unit and integration testing
   - Check if we can improve performance on creating panes (xterm creation seems heavy)
   - Check if we can improve performance on resizing (xterm fit seems heavy)
   - Terminal resize truncates buffer characters instead of wrapping
   - Terminal not reset when sessions is moved (drag drop into new window or window reloaded)
   - Dividers disappear on certain widths (min-width?)
   - Terminals not resized on window resize
   - Improve keyboard pane selection algorithm so we don't start at beginning of group when moving
     between split directions. This also applies to pane moving
   - Buffer not properly reset on broadcasting `ctrl+k`
   - All broadcasting panes not showing as active and scrolling as they should
   - [Windows] Window stick to edge is not preserved when window is reloaded

 - Panes & Tabs
   - Drop pane into tab area for tab
   - Drop pane outside any window for new window
   - Drag-Drop tabs to re-arrange
   - Drop tab outside any window for new window
   - Move panes using keyboard shortcuts
   - Move pane state when using menu 'Move to'
   - Maximise current pane (not a new tab or window, just hides the others temporarily)

 - Sugar Coating
   - Add character dimensions icon overlay when resizing
   - Add input broadcast icon overlay when accepting broadcast input
   - Activate all tabs which are accepting broadcast inputs
   - Preserve last window position and size on close

 - Preferences & Config System

 - Themes
   - CSS Addons
   - React Component Addons
   - Default Themes
     - iTerm2
     - Glass-base
     - Glass-black

 - Functionality Extension
   - Main Thread Addons
   - React Component Addons
   - Terminal Addons

 - Plugin Bundle System

 - Other Features
   - Ability to save and restore layouts
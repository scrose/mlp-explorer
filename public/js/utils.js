/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.UI.Utilities
  File:         public/js/utils.js
  ------------------------------------------------------
  Handles user interactions with miscellaneous display
  elements and controls.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 20, 2020
  ======================================================
*/


/*
  ------------------------------------------------------
  Extension wrapper for DOM node
  ------------------------------------------------------
*/
function nodeUtils(id) {
  return {
    element: document.getElementById(id),
    addClassname: function(className) {
      let arr = this.element.className.split(" ");
      if (arr.indexOf(name) === -1) {
        this.element.className += " " + name;
      }
    }
  }
}

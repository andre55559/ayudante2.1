// code/src/scripts/field_detector.js

(function() {
  // This IIFE structure helps avoid polluting the global scope of the page it's injected into.

  function getSelectionDetails() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null; // No selection or empty selection
    }
    return selection;
  }

  // Basic function to generate a CSS selector.
  // This is a simplified version for demonstration. A truly robust one is more complex.
  function generateSelector(el) {
    if (!(el instanceof Element)) return;
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break; // ID is unique enough
      } else {
        let sib = el, nth = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() == selector) nth++;
        }
        if (nth != 1) selector += ":nth-of-type("+nth+")";
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }

  function findTargetInputElement() {
    const selection = getSelectionDetails();
    if (!selection) {
      return { error: "No text selected or selection is collapsed." };
    }

    const range = selection.getRangeAt(0);
    let commonAncestor = range.commonAncestorContainer;
    if (commonAncestor.nodeType === Node.TEXT_NODE) {
      commonAncestor = commonAncestor.parentNode;
    }

    // Search for suitable input fields (text, textarea, password, email, search, url, tel)
    // We'll look in siblings of the selection's direct parent, and then go up the DOM tree.
    let searchScope = commonAncestor;
    let candidateInput = null;

    for (let i = 0; i < 3 && searchScope && searchScope !== document.body; i++) { // Search up to 3 levels or until body
      const inputs = Array.from(searchScope.querySelectorAll(
        'input[type="text"], input[type="password"], input[type="email"], input[type="search"], input[type="tel"], input[type="url"], textarea'
      ));

      const visibleEnabledInputs = inputs.filter(input => {
        const style = window.getComputedStyle(input);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               !input.disabled &&
               input.offsetHeight > 0 && // Basic check for actual visibility
               input.offsetWidth > 0;
      });

      if (visibleEnabledInputs.length > 0) {
        // Simplistic heuristic: pick the first one found at this level.
        // More advanced: measure distance from selection, check for associated labels.
        candidateInput = visibleEnabledInputs[0];
        break;
      }
      searchScope = searchScope.parentNode;
    }

    if (candidateInput) {
      const rect = candidateInput.getBoundingClientRect();
      return {
        success: true,
        selector: generateSelector(candidateInput), // Generate a selector for it
        // Additional potentially useful info (coordinates are relative to viewport)
        tagName: candidateInput.tagName.toLowerCase(),
        type: candidateInput.type ? candidateInput.type.toLowerCase() : null,
        rect: { // DOMRect properties
            x: rect.x, y: rect.y,
            width: rect.width, height: rect.height,
            top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left
        },
        details: "Found a potential input field."
      };
    }

    return { error: "No suitable input field found near the selection." };
  }

  // The result of this function call will be returned by executeJavaScript
  return findTargetInputElement();
})();

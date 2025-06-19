// code/src/scripts/epub_reader.js
document.addEventListener('DOMContentLoaded', () => {
  const openEpubFileBtn = document.getElementById('openEpubFileBtn');
  const epubViewportEl = document.getElementById('epubViewport');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const epubPageInfoEl = document.getElementById('epubPageInfo');
  const epubLoadingIndicatorEl = document.getElementById('epubLoadingIndicator');
  const epubErrorDisplayEl = document.getElementById('epubErrorDisplay');

  let currentBook = null;
  let rendition = null;

  function showLoading(isLoading) {
    if (epubLoadingIndicatorEl) epubLoadingIndicatorEl.style.display = isLoading ? 'block' : 'none';
    if (isLoading) {
      if (epubViewportEl) epubViewportEl.innerHTML = '<p>Loading book...</p>'; // Clear previous book
      if (epubErrorDisplayEl) epubErrorDisplayEl.style.display = 'none';
      if (epubPageInfoEl) epubPageInfoEl.textContent = '';
    }
  }

  function showError(message) {
    if (epubErrorDisplayEl) {
      epubErrorDisplayEl.textContent = message;
      epubErrorDisplayEl.style.display = 'block';
    }
    if (epubViewportEl) epubViewportEl.innerHTML = `<p style="color: red; text-align: center;">Error: ${message}</p>`;
    if (epubPageInfoEl) epubPageInfoEl.textContent = 'Error';
  }

  function updatePageInfo() {
    if (!rendition || !rendition.location || !currentBook || !currentBook.locations) {
      if (epubPageInfoEl) epubPageInfoEl.textContent = '';
      return;
    }
    // epub.js locations are generated asynchronously, so we need to wait for them
    currentBook.ready.then(() => {
        return currentBook.locations.generate(1000); // Generate locations (usually by character count per page)
    }).then(locations => {
        const currentLocation = rendition.location.start;
        if (currentLocation && currentLocation.displayed) {
            const currentPage = currentLocation.displayed.page;
            // Total pages can be tricky with epub.js as it depends on viewport and settings.
            // locations.length gives a good estimate for fixed layouts or after generation.
            const totalPages = locations.length;
            if (epubPageInfoEl) epubPageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
        } else if (currentLocation && currentLocation.cfi) {
            // Fallback to CFI if page numbers aren't readily available or for more precise location
            const progress = currentBook.locations.percentageFromCfi(currentLocation.cfi);
            if (epubPageInfoEl) epubPageInfoEl.textContent = `${(progress * 100).toFixed(2)}%`;
        } else {
            if (epubPageInfoEl) epubPageInfoEl.textContent = 'Page info unavailable';
        }
    }).catch(err => {
        console.error("Error generating locations:", err);
        if (epubPageInfoEl) epubPageInfoEl.textContent = 'Page info error';
    });
  }

  async function loadEpub(filePath) {
    showLoading(true);
    try {
      // For local files, epub.js typically expects the path directly or an ArrayBuffer.
      // The library handles if it needs to fetch it or process it.
      // No need to prepend "file://" manually unless specific issues arise.

      currentBook = ePub(filePath); // ePub is the global from epub.js library

      if (epubViewportEl) epubViewportEl.innerHTML = '';

      rendition = currentBook.renderTo(epubViewportEl, {
        width: "100%",
        height: "100%", // This should match the container's height for proper rendering
        spread: "auto"
      });

      await rendition.display();

      rendition.on('displayed', () => {
        updatePageInfo();
      });

      // rendition.rendered is a promise that resolves when the section is displayed.
      await rendition.rendered;
      updatePageInfo(); // Initial page info update

      showLoading(false);

    } catch (error) {
      console.error("Error loading EPUB:", error);
      showError(`Failed to load EPUB: ${error.message}`);
      showLoading(false);
    }
  }

  if (openEpubFileBtn) {
    openEpubFileBtn.addEventListener('click', async () => {
      const result = await window.electronAPI.openEpubFile();
      if (result.success && result.filePath) {
        if (epubErrorDisplayEl) epubErrorDisplayEl.style.display = 'none'; // Clear previous errors
        loadEpub(result.filePath);
      } else if (result.error) {
        console.log('File open dialog error or cancelled:', result.error);
        if (result.error !== 'File selection canceled.') {
            showError(result.error);
        }
      }
    });
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (rendition) {
        rendition.prev(); // 'displayed' event will trigger updatePageInfo
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (rendition) {
        rendition.next(); // 'displayed' event will trigger updatePageInfo
      }
    });
  }

  if(epubPageInfoEl) epubPageInfoEl.textContent = '';

});

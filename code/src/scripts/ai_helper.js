// code/src/scripts/ai_helper.js
document.addEventListener('DOMContentLoaded', () => {
  const aiCapturedQuestionEl = document.getElementById('aiCapturedQuestion');
  const aiAnswerDisplayEl = document.getElementById('aiAnswerDisplay');
  const copyAiAnswerBtn = document.getElementById('copyAiAnswerBtn');
  const aiHelperStatusEl = document.getElementById('aiHelperStatus');
  const aiLoadingIndicatorEl = document.getElementById('aiLoadingIndicator');

  let currentAnswer = '';

  // Function to show loading state
  function showLoading(isLoading) {
    if (isLoading) {
      aiLoadingIndicatorEl.style.display = 'block';
      aiAnswerDisplayEl.innerHTML = '<p>Thinking...</p>';
      aiAnswerDisplayEl.classList.add('loading-placeholder');
      copyAiAnswerBtn.style.display = 'none';
      aiHelperStatusEl.style.display = 'none';
    } else {
      aiLoadingIndicatorEl.style.display = 'none';
      aiAnswerDisplayEl.classList.remove('loading-placeholder');
    }
  }

  // Function to display status messages
  function showStatus(message, type = 'info') {
    aiHelperStatusEl.textContent = message;
    aiHelperStatusEl.className = `message ${type}`; // Assumes 'message' and 'message error/success/info' classes exist
    aiHelperStatusEl.style.display = 'block';
  }

  // Listen for captured text from the main process
  window.electronAPI.onCapturedTextForAI(async (text) => {
    console.log('AI Helper received captured text:', text);

    // Switch to AI Helper tab if not already active (requires AppState and switchTab from app.js)
    // This might be better handled by the main process or a shared state if direct call is complex.
    // For now, we assume user might manually switch or it's already active.
    // if (window.AppState && window.AppState.activeTab !== 'aiHelperTab' && typeof window.switchTab === 'function') {
    //   window.switchTab('aiHelperTab');
    // }

    aiCapturedQuestionEl.innerHTML = ''; // Clear previous
    const p = document.createElement('p');
    p.textContent = text;
    aiCapturedQuestionEl.appendChild(p);
    aiCapturedQuestionEl.classList.remove('loading-placeholder');

    showLoading(true);
    currentAnswer = ''; // Reset current answer

    try {
      const result = await window.electronAPI.getOpenAICompletion(text);
      showLoading(false);
      if (result.success) {
        currentAnswer = result.response;
        aiAnswerDisplayEl.innerHTML = ''; // Clear previous
        const pre = document.createElement('pre'); // Use <pre> for better formatting of AI response
        pre.textContent = currentAnswer;
        aiAnswerDisplayEl.appendChild(pre);
        copyAiAnswerBtn.style.display = 'block';
      } else {
        console.error('AI Helper OpenAI Error:', result.error);
        showStatus(`Error from AI: ${result.error}`, 'error');
        aiAnswerDisplayEl.innerHTML = '<p>Sorry, I could not get an answer.</p>';
      }
    } catch (error) {
      showLoading(false);
      console.error('AI Helper critical error:', error);
      showStatus(`Critical error: ${error.message}`, 'error');
      aiAnswerDisplayEl.innerHTML = '<p>A critical error occurred.</p>';
    }
  });

  // Listen for no text captured event
  window.electronAPI.onNoTextCapturedForAI(() => {
    console.log('AI Helper: No text was captured.');
    // if (window.AppState && window.AppState.activeTab !== 'aiHelperTab' && typeof window.switchTab === 'function') {
    //   window.switchTab('aiHelperTab');
    // }
    showStatus('No text was selected or captured. Please highlight text and try the shortcut again.', 'warning');
    aiCapturedQuestionEl.innerHTML = '<p>No text captured. Try highlighting text and using the shortcut.</p>';
    aiCapturedQuestionEl.classList.add('loading-placeholder');
    aiAnswerDisplayEl.innerHTML = '<p>Answer will appear here...</p>';
    aiAnswerDisplayEl.classList.add('loading-placeholder');
    copyAiAnswerBtn.style.display = 'none';
  });

  // Optional: Listen for global shortcut triggered event for UI feedback
  window.electronAPI.onGlobalShortcutTriggered((data) => {
    console.log('Global shortcut triggered in renderer:', data.shortcut);
    // Could add a brief visual indication in this tab if it's active
    // For example:
    // if (AppState.activeTab === 'aiHelperTab') {
    //   showStatus(`Hotkey ${data.shortcut} pressed. Capturing text...`, 'info');
    // }
  });

  // Implement "Copy Answer" button functionality
  if (copyAiAnswerBtn) {
    copyAiAnswerBtn.addEventListener('click', () => {
      if (currentAnswer) {
        navigator.clipboard.writeText(currentAnswer)
          .then(() => {
            showStatus('Answer copied to clipboard!', 'success');
          })
          .catch(err => {
            console.error('Failed to copy answer: ', err);
            showStatus('Failed to copy answer.', 'error');
          });
      }
    });
  }

  // Initial state message
  aiCapturedQuestionEl.innerHTML = '<p>Highlight text in any application and press CommandOrControl+Shift+Q.</p>';
});

// code/src/scripts/ai_helper.js
document.addEventListener('DOMContentLoaded', () => {
  const aiCapturedQuestionEl = document.getElementById('aiCapturedQuestion');
  const aiAnswerDisplayEl = document.getElementById('aiAnswerDisplay');
  const copyAiAnswerBtn = document.getElementById('copyAiAnswerBtn');
  const typeAiAnswerBtn = document.getElementById('typeAiAnswerBtn');
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
      typeAiAnswerBtn.style.display = 'none';
      aiHelperStatusEl.style.display = 'none';
    } else {
      aiLoadingIndicatorEl.style.display = 'none';
      aiAnswerDisplayEl.classList.remove('loading-placeholder');
    }
  }

  // Function to display status messages
  function showStatus(message, type = 'info') {
    aiHelperStatusEl.textContent = message;
    aiHelperStatusEl.className = `message ${type}`;
    aiHelperStatusEl.style.display = 'block';
  }

  // Function to handle the actual typing logic
  async function executeTypeText() {
    if (currentAnswer) {
      showStatus('Typing answer...', 'info');
      try {
        const result = await window.electronAPI.typeText(currentAnswer);
        if (result.success) {
          showStatus('Answer typed successfully!', 'success');
        } else {
          showStatus(`Error typing answer: ${result.error || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        console.error('Error invoking typeText:', error);
        showStatus(`Critical error during typing: ${error.message}`, 'error');
      }
    } else {
      showStatus('No answer available to type.', 'warning');
    }
  }

  // Listen for captured text from the main process
  window.electronAPI.onCapturedTextForAI(async (text) => {
    console.log('AI Helper received captured text:', text);

    aiCapturedQuestionEl.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = text;
    aiCapturedQuestionEl.appendChild(p);
    aiCapturedQuestionEl.classList.remove('loading-placeholder');

    showLoading(true);
    currentAnswer = '';

    try {
      const result = await window.electronAPI.getOpenAICompletion(text);
      showLoading(false);
      if (result.success) {
        currentAnswer = result.response;
        aiAnswerDisplayEl.innerHTML = '';
        const pre = document.createElement('pre');
        pre.textContent = currentAnswer;
        aiAnswerDisplayEl.appendChild(pre);
        copyAiAnswerBtn.style.display = 'block';
        typeAiAnswerBtn.style.display = 'block';
      } else {
        console.error('AI Helper OpenAI Error:', result.error);
        showStatus(`Error from AI: ${result.error}`, 'error');
        aiAnswerDisplayEl.innerHTML = '<p>Sorry, I could not get an answer.</p>';
        typeAiAnswerBtn.style.display = 'none';
      }
    } catch (error) {
      showLoading(false);
      console.error('AI Helper critical error:', error);
      showStatus(`Critical error: ${error.message}`, 'error');
      aiAnswerDisplayEl.innerHTML = '<p>A critical error occurred.</p>';
      typeAiAnswerBtn.style.display = 'none';
    }
  });

  // Listen for no text captured event
  window.electronAPI.onNoTextCapturedForAI(() => {
    console.log('AI Helper: No text was captured.');
    showStatus('No text was selected or captured. Please highlight text and try the shortcut again.', 'warning');
    aiCapturedQuestionEl.innerHTML = '<p>No text captured. Try highlighting text and using the shortcut.</p>';
    aiCapturedQuestionEl.classList.add('loading-placeholder');
    aiAnswerDisplayEl.innerHTML = '<p>Answer will appear here...</p>';
    aiAnswerDisplayEl.classList.add('loading-placeholder');
    copyAiAnswerBtn.style.display = 'none';
    typeAiAnswerBtn.style.display = 'none';
  });

  // Optional: Listen for global shortcut triggered event for UI feedback
  window.electronAPI.onGlobalShortcutTriggered((data) => {
    console.log('Global shortcut triggered in renderer:', data.shortcut);
    // Example: if (AppState.activeTab === 'aiHelperTab') { showStatus(`Hotkey ${data.shortcut} pressed...`, 'info'); }
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

  // Event listener for the "Type Answer" button
  if (typeAiAnswerBtn) {
    typeAiAnswerBtn.addEventListener('click', executeTypeText); // Call the shared function
  }

  // Listen for the hotkey trigger from main process
  window.electronAPI.onTriggerTypeAnswerHotkey(() => {
    console.log('Hotkey to type answer triggered in renderer.');
    executeTypeText(); // Call the same shared function
  });

  // Initial state message
  aiCapturedQuestionEl.innerHTML = '<p>Highlight text in any application and press CommandOrControl+Shift+Q.</p>';
});

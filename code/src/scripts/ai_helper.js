// code/src/scripts/ai_helper.js
document.addEventListener('DOMContentLoaded', () => {
  const aiCapturedQuestionEl = document.getElementById('aiCapturedQuestion');
  const aiAnswerDisplayEl = document.getElementById('aiAnswerDisplay');
  const copyAiAnswerBtn = document.getElementById('copyAiAnswerBtn');
  const typeAiAnswerBtn = document.getElementById('typeAiAnswerBtn');
  const aiHelperStatusEl = document.getElementById('aiHelperStatus');
  const aiLoadingIndicatorEl = document.getElementById('aiLoadingIndicator');

  let currentAnswer = '';
  let currentTargetFieldInfo = null;

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

  // Updated executeTypeText function
  async function executeTypeText() {
    if (!currentAnswer) {
      showStatus('No answer available to type.', 'warning');
      return;
    }

    showStatus('Processing type request...', 'info');
    let result; // To store the outcome of the typing attempt

    if (currentTargetFieldInfo && currentTargetFieldInfo.selector) {
      console.log(`Attempting to type into detected web field: ${currentTargetFieldInfo.selector}`);
      result = await window.electronAPI.typeIntoWebContentField(currentTargetFieldInfo.selector, currentAnswer);

      if (result.success) {
        showStatus(result.message || 'Answer typed into web field successfully!', 'success');
      } else {
        // Web field typing failed
        showStatus(`Web field typing failed: ${result.error}. If you manually focus the field, the hotkey may now use general typing.`, 'error');
        console.warn(`Failed to type into web field ${currentTargetFieldInfo.selector}. Clearing targetFieldInfo for potential robotjs fallback on next attempt.`);
        currentTargetFieldInfo = null; // Clear the specific target, so a retry uses robotjs
      }
    } else {
      // No web field pre-detected, or it was cleared after a failure
      console.log('No web field pre-detected (or cleared after previous failure), using general typing at current cursor (robotjs).');
      showStatus('Typing answer at current cursor...', 'info');
      result = await window.electronAPI.typeText(currentAnswer); // General robotjs typing

      if (result.success) {
        showStatus('Answer typed successfully!', 'success');
      } else {
        showStatus(`Error typing answer: ${result.error || 'Unknown error'}`, 'error');
      }
    }
  }

  // Listen for captured text from the main process
  window.electronAPI.onCapturedTextForAI(async (data) => {
    console.log('AI Helper received data:', data);
    currentTargetFieldInfo = null; // Reset on new capture

    const capturedText = data.text;

    if (data.targetField && data.targetField.success) {
      currentTargetFieldInfo = data.targetField;
      showStatus(`Question captured. Target field found: ${currentTargetFieldInfo.selector.substring(0, 50)}...`, 'info');
    } else if (data.targetField && data.targetField.error) {
      showStatus(`Question captured. Field detection failed: ${data.targetField.error}`, 'warning');
    } else {
      showStatus('Question captured. No target field auto-detected.', 'info');
    }

    aiCapturedQuestionEl.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = capturedText;
    aiCapturedQuestionEl.appendChild(p);
    aiCapturedQuestionEl.classList.remove('loading-placeholder');

    showLoading(true);
    currentAnswer = '';

    try {
      const result = await window.electronAPI.getOpenAICompletion(capturedText);
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
    currentTargetFieldInfo = null;
  });

  // Optional: Listen for global shortcut triggered event for UI feedback
  window.electronAPI.onGlobalShortcutTriggered((data) => {
    console.log('Global shortcut triggered in renderer:', data.shortcut);
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
    typeAiAnswerBtn.addEventListener('click', executeTypeText);
  }

  // Listen for the hotkey trigger from main process
  window.electronAPI.onTriggerTypeAnswerHotkey(() => {
    console.log('Hotkey to type answer triggered in renderer.');
    executeTypeText();
  });

  // Initial state message
  aiCapturedQuestionEl.innerHTML = '<p>Highlight text in any application and press CommandOrControl+Shift+Q.</p>';
});

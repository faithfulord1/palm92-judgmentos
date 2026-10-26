/* Palm92 Capture to Action. Local-first MVP: no account, server, or external AI calls. */
(() => {
  'use strict';
  const DB_NAME = 'palm92-capture-to-action';
  const DB_VERSION = 1;
  const STORE = 'memories';
  const $ = (id) => document.getElementById(id);
  const ui = {
    form: $('note-form'), title: $('note-title'), project: $('note-project'), transcript: $('note-transcript'),
    record: $('record-button'), recordLabel: $('record-label'), recordTime: $('record-time'), audioFile: $('audio-file'),
    dictate: $('dictate-button'), captureStatus: $('capture-status'), search: $('search-input'),
    memoryList: $('memory-list'), empty: $('empty-state'), noteCount: $('note-count'), filters: $('project-filters'),
    taskList: $('task-list'), taskEmpty: $('task-empty'), taskCount: $('task-count'), export: $('export-button'), toast: $('toast')
  };
  let db;
  let memories = [];
  let activeFilter = 'All';
  let recorder = null;
  let recordingStream = null;
  let audioChunks = [];
  let recordedBlob = null;
  let recordingStartedAt = 0;
  let timerId = null;
  let recognition = null;
  let toastTimer;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function transact(mode, operation) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, mode);
      const request = operation(transaction.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onabort = () => reject(transaction.error || new Error('Storage transaction aborted'));
    });
  }
  const getAll = () => transact('readonly', store => store.getAll());
  const put = item => transact('readwrite', store => store.put(item));
  const remove = id => transact('readwrite', store => store.delete(id));
  const makeId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const dateLabel = stamp => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(stamp));
  const plainText = value => String(value || '').replace(/\s+/g, ' ').trim();
  function showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 2300);
  }
  function summarize(text) {
    const sentences = plainText(text).match(/[^.!?]+[.!?]?/g) || [];
    const summary = sentences.slice(0, 2).map(plainText).join(' ').trim();
    return summary.length > 260 ? `${summary.slice(0, 257)}…` : summary;
  }
  function proposeActions(text) {
    const phrases = String(text || '').split(/(?<=[.!?])\s+|\n+/).map(plainText).filter(Boolean);
    const cues = /\b(i need to|we need to|need to|must|remember to|follow up|follow-up|action item|next step|i will|we will|I'll|we'll|send|email|call|book|schedule|prepare|review|complete|check back|remind me)\b/i;
    const seen = new Set();
    return phrases.filter(line => cues.test(line) && line.length > 8).filter(line => {
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6).map(text => ({ id: makeId(), text, status: 'proposed', createdAt: Date.now() }));
  }
  function matches(memory, query) {
    const haystack = [memory.title, memory.project, memory.transcript, memory.summary, ...(memory.tags || [])].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }
  function render() {
    const query = plainText(ui.search.value);
    const visible = memories.filter(m => (activeFilter === 'All' || m.project === activeFilter) && (!query || matches(m, query)))
      .sort((a,b) => b.createdAt - a.createdAt);
    ui.noteCount.textContent = memories.length;
    ui.memoryList.innerHTML = visible.map(memory => {
      const tagMarkup = (memory.tags || []).map(tag => `<span class="memory-tag">${escapeHtml(tag)}</span>`).join('');
      const audioMarkup = memory.audio ? `<span><a class="audio-link" href="#" data-audio="${memory.id}">▶ Play audio</a> <button class="text-button" data-download-audio="${memory.id}">Download</button></span>` : '<span class="memory-meta">Text memory</span>';
      return `<article class="memory-card">
        <div class="memory-top"><div><h3 class="memory-title">${escapeHtml(memory.title)}</h3><div class="memory-meta">${escapeHtml(dateLabel(memory.createdAt))} · ${escapeHtml(memory.project)}</div></div><span class="project-label">${escapeHtml(memory.project.toUpperCase())}</span></div>
        ${memory.summary ? `<p class="memory-summary">${escapeHtml(memory.summary)}</p>` : '<p class="memory-summary">No summary yet. Add notes or transcript to create reviewable action suggestions.</p>'}
        ${tagMarkup ? `<div class="memory-tags">${tagMarkup}</div>` : ''}
        <div class="memory-actions">${audioMarkup}<div><button class="text-button" data-edit="${memory.id}">Edit</button><button class="text-button" data-delete="${memory.id}">Delete</button></div></div>
      </article>`;
    }).join('');
    ui.empty.hidden = visible.length > 0;
    if (memories.length && !visible.length) {
      ui.empty.hidden = false;
      ui.empty.innerHTML = '<div class="empty-icon">⌕</div><h3>No matching memories</h3><p>Try another word or clear the space filter.</p>';
    } else if (!memories.length) {
      ui.empty.hidden = false;
      ui.empty.innerHTML = '<div class="empty-icon">✳</div><h3>Your next useful memory starts here.</h3><p>Capture a thought, add a transcript, or record audio. Your notes stay in this browser until you export them.</p>';
    }
    renderTasks();
  }
  function renderTasks() {
    const allActions = memories.flatMap(memory => (memory.actions || []).filter(action => ['proposed', 'approved'].includes(action.status)).map(action => ({ ...action, memoryId: memory.id, source: memory.title })))
      .sort((a,b) => b.createdAt - a.createdAt);
    const proposed = allActions.filter(action => action.status === 'proposed');
    const approved = allActions.filter(action => action.status === 'approved');
    ui.taskCount.textContent = allActions.length;
    ui.taskEmpty.hidden = allActions.length > 0;
    const proposedMarkup = proposed.map(task => `<article class="task-card"><p>${escapeHtml(task.text)}</p><div class="task-source">Suggested from: ${escapeHtml(task.source)}</div><div class="task-buttons"><button class="approve-task" data-approve="${task.memoryId}" data-action="${task.id}">Approve to my list</button><button class="dismiss-task" data-dismiss="${task.memoryId}" data-action="${task.id}">Dismiss</button></div></article>`).join('');
    const approvedMarkup = approved.length ? `<p class="task-source">ON YOUR LOCAL LIST</p>${approved.map(task => `<article class="task-card approved"><p>${escapeHtml(task.text)}</p><div class="task-source">From: ${escapeHtml(task.source)}</div><div class="task-buttons"><button class="approve-task" data-complete="${task.memoryId}" data-action="${task.id}">Mark complete</button></div></article>`).join('')}` : '';
    ui.taskList.innerHTML = `${proposedMarkup}${approvedMarkup}`;
  }
  async function refresh() { memories = await getAll(); render(); }
  async function stopAudioTracks() {
    if (recordingStream) recordingStream.getTracks().forEach(track => track.stop());
    recordingStream = null;
  }
  function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
  }
  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      showToast('Audio recording is not supported in this browser. Try a recent Chrome browser.');
      return;
    }
    try {
      recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      recorder = new MediaRecorder(recordingStream);
      recorder.ondataavailable = event => { if (event.data.size) audioChunks.push(event.data); };
      recorder.onstop = async () => {
        recordedBlob = new Blob(audioChunks, { type: recorder.mimeType || 'audio/webm' });
        await stopAudioTracks();
        ui.captureStatus.textContent = `Audio captured (${formatDuration(Date.now() - recordingStartedAt)}). It will be saved on this device with your next memory.`;
        ui.recordLabel.textContent = 'Record again';
        ui.record.classList.remove('recording');
        ui.record.setAttribute('aria-pressed', 'false');
        ui.recordTime.textContent = '';
      };
      recorder.start(500);
      recordingStartedAt = Date.now();
      ui.recordLabel.textContent = 'Stop recording';
      ui.record.classList.add('recording');
      ui.record.setAttribute('aria-pressed', 'true');
      ui.captureStatus.textContent = 'Recording in progress. Tap Stop recording when you are done.';
      timerId = setInterval(() => { ui.recordTime.textContent = formatDuration(Date.now() - recordingStartedAt); }, 250);
    } catch (error) {
      await stopAudioTracks();
      showToast(error.name === 'NotAllowedError' ? 'Microphone access was not granted.' : 'Could not start recording. Check microphone access and try again.');
    }
  }
  function stopRecording() {
    clearInterval(timerId);
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }
  async function dictate() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Dictation is unavailable. Use your phone keyboard microphone or type the transcript.');
      return;
    }
    if (recognition) { recognition.stop(); recognition = null; ui.dictate.textContent = '◉ Dictate'; return; }
    recognition = new SpeechRecognition();
    recognition.lang = navigator.language || 'en-GB';
    recognition.continuous = true;
    recognition.interimResults = true;
    const startIndex = ui.transcript.value.length ? ui.transcript.value.trimEnd().length + 1 : 0;
    recognition.onresult = event => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript + ' ';
        else interimText += event.results[i][0].transcript;
      }
      const current = ui.transcript.value;
      const base = current.slice(0, startIndex);
      const prior = current.slice(startIndex).replace(/\s*\[Listening…\].*$/, '');
      ui.transcript.value = `${base}${prior}${prior && finalText ? ' ' : ''}${finalText}${interimText ? ` [Listening…] ${interimText}` : ''}`;
    };
    recognition.onerror = () => { showToast('Dictation stopped. Check your browser microphone permission.'); finishDictation(); };
    recognition.onend = finishDictation;
    try {
      recognition.start();
      ui.dictate.textContent = '■ Stop dictation';
      ui.captureStatus.textContent = 'Dictation uses your browser or device speech service. Review the words before saving.';
      ui.transcript.focus();
    } catch { finishDictation(); showToast('Could not start dictation.'); }
  }
  function finishDictation() {
    ui.transcript.value = ui.transcript.value.replace(/\s*\[Listening…\].*$/, '').trim();
    ui.dictate.textContent = '◉ Dictate';
    recognition = null;
  }
  function createTags(text) {
    const known = ['meeting','idea','follow-up','decision','church','palm92','career','learning','plan','reminder'];
    const lower = String(text || '').toLowerCase();
    return known.filter(word => lower.includes(word)).slice(0,4);
  }
  async function saveMemory(event) {
    event.preventDefault();
    if (recorder && recorder.state !== 'inactive') stopRecording();
    if (recognition) recognition.stop();
    const title = plainText(ui.title.value);
    const transcript = ui.transcript.value.trim();
    if (!title) return;
    if (!transcript && !recordedBlob) { showToast('Add a transcript or record audio first.'); ui.transcript.focus(); return; }
    const memory = {
      id: makeId(), title, project: ui.project.value, transcript,
      summary: summarize(transcript), tags: createTags(`${title} ${transcript}`),
      actions: proposeActions(transcript), createdAt: Date.now(), updatedAt: Date.now(), audio: recordedBlob || null,
      audit: [{ event: 'memory_created', at: Date.now() }]
    };
    try {
      await put(memory);
      memories.push(memory);
      ui.form.reset(); recordedBlob = null; ui.captureStatus.textContent = 'Audio and notes stay in this browser. Browser dictation may use your browser or device speech service.';
      render(); showToast('Memory saved on this device. Review suggested actions before approving.');
    } catch {
      showToast('Could not save. Your browser may be low on storage. Export your notes and try again.');
    }
  }
  async function actOnTask(memoryId, actionId, status) {
    const memory = memories.find(item => item.id === memoryId);
    if (!memory) return;
    const action = memory.actions.find(item => item.id === actionId);
    if (!action) return;
    action.status = status;
    action.reviewedAt = Date.now();
    memory.updatedAt = Date.now();
    memory.audit = [...(memory.audit || []), { event: status === 'approved' ? 'action_approved_to_local_list' : 'action_dismissed', actionId, at: Date.now() }];
    await put(memory); await refresh();
    showToast(status === 'approved' ? 'Added to your local action list.' : status === 'done' ? 'Marked complete.' : 'Suggestion dismissed.');
  }
  async function deleteMemory(id) {
    if (!window.confirm('Delete this memory and its audio from this browser? This cannot be undone.')) return;
    await remove(id); await refresh(); showToast('Memory deleted from this device.');
  }
  async function editMemory(id) {
    const memory = memories.find(item => item.id === id);
    if (!memory) return;
    const transcript = window.prompt('Edit the transcript or notes. Action suggestions are not changed automatically.', memory.transcript || '');
    if (transcript === null) return;
    memory.transcript = transcript.trim(); memory.summary = summarize(memory.transcript); memory.updatedAt = Date.now();
    memory.audit = [...(memory.audit || []), { event: 'transcript_edited', at: Date.now() }];
    await put(memory); await refresh(); showToast('Memory updated.');
  }
  function playAudio(id) {
    const memory = memories.find(item => item.id === id);
    if (!memory?.audio) return;
    const url = URL.createObjectURL(memory.audio);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.play().catch(() => { URL.revokeObjectURL(url); showToast('Audio could not be played in this browser.'); });
  }
  function downloadAudio(id) {
    const memory = memories.find(item => item.id === id);
    if (!memory?.audio) return;
    const url = URL.createObjectURL(memory.audio);
    const link = document.createElement('a');
    const safeTitle = memory.title.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').slice(0,60) || 'memory';
    link.href = url; link.download = `${safeTitle}.${memory.audio.type.includes('mp4') ? 'm4a' : memory.audio.type.includes('ogg') ? 'ogg' : 'webm'}`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function addAudioFile(file) {
    if (!file) return;
    recordedBlob = file;
    if (!ui.title.value) ui.title.value = file.name.replace(/\.[^.]+$/, '').slice(0,100);
    ui.captureStatus.textContent = `Audio selected (${(file.size / 1024 / 1024).toFixed(1)} MB). It will be saved on this device with your next memory.`;
  }
  async function exportMemories() {
    if (!memories.length) { showToast('There are no memories to export yet.'); return; }
    const payload = { product: 'Palm92 Capture to Action', formatVersion: 1, exportedAt: new Date().toISOString(), audioIncluded: false,
      note: 'JSON export contains text, action statuses and audit events. Download audio separately from each memory if needed.',
      memories: memories.map(({ audio, ...memory }) => memory) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `palm92-memories-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url);
    showToast('Text memories exported. Audio is not included in the JSON.');
  }
  ui.record.addEventListener('click', () => recorder && recorder.state !== 'inactive' ? stopRecording() : startRecording());
  ui.dictate.addEventListener('click', dictate);
  ui.audioFile.addEventListener('change', event => addAudioFile(event.target.files?.[0]));
  ui.form.addEventListener('submit', saveMemory);
  ui.search.addEventListener('input', render);
  ui.filters.addEventListener('click', event => {
    const button = event.target.closest('[data-project]'); if (!button) return;
    activeFilter = button.dataset.project;
    ui.filters.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('active', chip === button));
    render();
  });
  ui.memoryList.addEventListener('click', event => {
    const audio = event.target.closest('[data-audio]'); const del = event.target.closest('[data-delete]'); const edit = event.target.closest('[data-edit]');
    const download = event.target.closest('[data-download-audio]');
    if (audio) { event.preventDefault(); playAudio(audio.dataset.audio); }
    if (download) downloadAudio(download.dataset.downloadAudio);
    if (del) deleteMemory(del.dataset.delete);
    if (edit) editMemory(edit.dataset.edit);
  });
  ui.taskList.addEventListener('click', event => {
    const approve = event.target.closest('[data-approve]'); const dismiss = event.target.closest('[data-dismiss]'); const complete = event.target.closest('[data-complete]');
    if (approve) actOnTask(approve.dataset.approve, approve.dataset.action, 'approved');
    if (dismiss) actOnTask(dismiss.dataset.dismiss, dismiss.dataset.action, 'dismissed');
    if (complete) actOnTask(complete.dataset.complete, complete.dataset.action, 'done');
  });
  ui.export.addEventListener('click', exportMemories);
  window.Palm92Capture = { summarize, proposeActions, matches };
  (async () => {
    try { db = await openDatabase(); await refresh(); }
    catch { ui.captureStatus.textContent = 'Local storage is unavailable. Try a current browser in a private tab turned off.'; showToast('Could not open local storage.'); }
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
  })();
})();

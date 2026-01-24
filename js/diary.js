/**
 * Shizuku's Diary - Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const listSection = document.getElementById('view-list');
    const editorSection = document.getElementById('view-editor');
    const entriesContainer = document.getElementById('entries-container');
    const diaryForm = document.getElementById('diary-form');

    // Buttons
    const newEntryBtn = document.getElementById('new-entry-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const backBtn = document.getElementById('back-btn'); // If needed in future

    // Form Inputs
    const dateInput = document.getElementById('entry-date');
    const titleInput = document.getElementById('entry-title');
    const contentInput = document.getElementById('entry-content');

    // Toast
    const toast = document.getElementById('toast');

    // --- State ---
    // Load entries from localStorage or start empty
    let entries = JSON.parse(localStorage.getItem('shizuku_diary_entries')) || [];

    // --- Initialization ---
    function init() {
        renderEntries();
        // Set default date to today
        dateInput.valueAsDate = new Date();
    }

    // --- Functions ---

    // Switch Views
    function showEditor() {
        listSection.classList.add('hidden');
        listSection.classList.remove('active');

        editorSection.classList.remove('hidden');
        setTimeout(() => editorSection.classList.add('active'), 10);

        // Hide "Write" button in header when in editor
        newEntryBtn.style.display = 'none';

        // Reset form or set today's date
        dateInput.valueAsDate = new Date();
        titleInput.value = '';
        contentInput.value = '';
        titleInput.focus();
    }

    function showList() {
        editorSection.classList.remove('active');
        editorSection.classList.add('hidden');

        listSection.classList.remove('hidden');
        setTimeout(() => listSection.classList.add('active'), 10);

        newEntryBtn.style.display = 'inline-flex';
    }

    // Save Data
    function saveEntries() {
        localStorage.setItem('shizuku_diary_entries', JSON.stringify(entries));
    }

    // Render List
    function renderEntries() {
        entriesContainer.innerHTML = '';

        if (entries.length === 0) {
            entriesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-face-smile"></i>
                    <p>まだ日記がありません。<br>「書く」ボタンから、今日の日記をつけてみましょう！</p>
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedEntries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'entry-card';

            // Format Date (YYYY年MM月DD日)
            const dateObj = new Date(entry.date);
            const dateStr = dateObj.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });

            card.innerHTML = `
                <div class="entry-header">
                    <span class="entry-date">${dateStr}</span>
                    <button class="entry-delete" data-id="${entry.id}" title="削除">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
                <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
                <div class="entry-body">${escapeHtml(entry.content)}</div>
            `;

            entriesContainer.appendChild(card);
        });

        // Add Delete Listeners
        document.querySelectorAll('.entry-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                deleteEntry(id);
            });
        });
    }

    function addEntry(date, title, content) {
        const newEntry = {
            id: Date.now().toString(),
            date: date,
            title: title,
            content: content,
            timestamp: Date.now()
        };

        entries.push(newEntry);
        saveEntries();
        renderEntries();
        showList();
        showToast('日記を保存しました！');
    }

    function deleteEntry(id) {
        if (confirm('この日記を削除してもよろしいですか？')) {
            entries = entries.filter(entry => entry.id !== id);
            saveEntries();
            renderEntries();
            showToast('削除しました');
        }
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Helper: Prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Event Listeners ---

    newEntryBtn.addEventListener('click', showEditor);
    cancelBtn.addEventListener('click', showList);

    diaryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = dateInput.value;
        const title = titleInput.value;
        const content = contentInput.value;

        if (date && title && content) {
            addEntry(date, title, content);
        }
    });

    // Start
    init();
});

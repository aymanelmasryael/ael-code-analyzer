(function() {
    const codeEditor = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    const langBtns = document.querySelectorAll('.ael-lang-btn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const locEl = document.getElementById('loc');
    const qualityEl = document.getElementById('quality');
    const issuesEl = document.getElementById('issues');
    const duplicatesEl = document.getElementById('duplicates');
    const issuesListEl = document.getElementById('issuesList');
    const duplicatesListEl = document.getElementById('duplicatesList');
    const suggestionsListEl = document.getElementById('suggestionsList');
    const issueCountSpan = document.getElementById('issueCount');
    const dupCountSpan = document.getElementById('dupCount');
    const analysisTimeSpan = document.getElementById('analysisTime');
    const notification = document.getElementById('notification');
    const notifyMsg = document.getElementById('notifyMsg');
    const editorContainer = document.getElementById('editorContainer');
    const dropZone = document.getElementById('dropZone');

    let currentLanguage = 'auto';

    function updateLineNumbers() {
        const content = codeEditor.value || '';
        const lines = content.split('\n');
        const lineCount = Math.max(lines.length, 1);
        let html = '';
        for (let i = 1; i <= lineCount; i++) {
            html += i + '\n';
        }
        lineNumbers.innerText = html;
    }

    updateLineNumbers();

    codeEditor.addEventListener('scroll', () => {
        lineNumbers.scrollTop = codeEditor.scrollTop;
    });

    codeEditor.addEventListener('input', () => {
        updateLineNumbers();
        clearTimeout(window.aelAnalysisTimeout);
        window.aelAnalysisTimeout = setTimeout(performAnalysis, 800);
    });

    codeEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = codeEditor.selectionStart;
            const end = codeEditor.selectionEnd;
            codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);
            codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
            updateLineNumbers();
            clearTimeout(window.aelAnalysisTimeout);
            window.aelAnalysisTimeout = setTimeout(performAnalysis, 800);
        }
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            performAnalysis();
        }
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            clearEditor();
        }
    });

    editorContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    editorContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
    });

    editorContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            codeEditor.value = ev.target.result;
            updateLineNumbers();
            performAnalysis();
            showNotif('Loaded: ' + file.name, 'success');
        };
        reader.readAsText(file);
    });

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            performAnalysis();
            showNotif('Language: ' + currentLanguage.toUpperCase());
        });
    });

    clearBtn.addEventListener('click', clearEditor);

    function clearEditor() {
        codeEditor.value = '';
        updateLineNumbers();
        resetResults();
        codeEditor.focus();
        showNotif('Editor cleared');
    }

    function resetResults() {
        locEl.textContent = '-';
        qualityEl.textContent = '-';
        issuesEl.textContent = '-';
        duplicatesEl.textContent = '-';
        issueCountSpan.textContent = '0';
        dupCountSpan.textContent = '0';
        issuesListEl.innerHTML = '<div class="ael-empty-state">No code to analyze</div>';
        duplicatesListEl.innerHTML = '';
        suggestionsListEl.innerHTML = '<div class="ael-empty-state">No suggestions</div>';
        analysisTimeSpan.textContent = 'ready';
    }

    analyzeBtn.addEventListener('click', performAnalysis);

    function performAnalysis() {
        const code = codeEditor.value || '';
        if (!code.trim()) {
            resetResults();
            return;
        }
        const start = performance.now();

        let lang = currentLanguage;
        if (lang === 'auto') {
            lang = detectLanguage(code);
        }

        const lines = code.split('\n');
        const totalLines = lines.length;

        const issues = detectIssues(code, lang);
        const duplicates = findSmartDuplicates(lines);
        const suggestions = generateSuggestions(issues, lang, code);

        let quality = 100;
        quality -= issues.length * 5;
        quality -= duplicates.length * 3;
        quality = Math.max(0, Math.min(100, quality));

        locEl.textContent = totalLines;
        qualityEl.textContent = quality + '%';
        issuesEl.textContent = issues.length;
        duplicatesEl.textContent = duplicates.length;
        issueCountSpan.textContent = issues.length;
        dupCountSpan.textContent = duplicates.length;

        issuesListEl.innerHTML = '';
        if (issues.length === 0) {
            issuesListEl.innerHTML = '<div class="ael-issue-item success"><span class="ael-issue-icon success">\u2713</span><span>No issues found</span></div>';
        } else {
            issues.forEach(issue => {
                const div = document.createElement('div');
                const typeClass = issue.type === 'warning' ? 'warning' : issue.type === 'info' ? 'info' : '';
                const iconType = issue.type === 'warning' ? 'warning' : issue.type === 'info' ? 'info' : '';
                div.className = `ael-issue-item ${typeClass}`;
                div.innerHTML = `<span class="ael-issue-icon ${iconType}">${issue.type === 'error' ? '!' : issue.type === 'info' ? 'i' : '\u26A0'}</span><span>${issue.message}</span>`;
                issuesListEl.appendChild(div);
            });
        }

        duplicatesListEl.innerHTML = '';
        if (duplicates.length === 0) {
            duplicatesListEl.innerHTML = '<div class="ael-empty-state">No duplicate lines found</div>';
        } else {
            duplicates.forEach(dup => {
                const div = document.createElement('div');
                div.className = 'ael-issue-item warning';
                div.innerHTML = `<span class="ael-issue-icon warning">D</span><span>Line ${dup.line} duplicates line ${dup.original}: "${dup.content}"</span>`;
                duplicatesListEl.appendChild(div);
            });
        }

        suggestionsListEl.innerHTML = '';
        if (suggestions.length === 0) {
            suggestionsListEl.innerHTML = '<div class="ael-empty-state">No suggestions</div>';
        } else {
            suggestions.forEach(s => {
                const div = document.createElement('div');
                div.className = 'ael-issue-item info';
                div.innerHTML = `<span class="ael-issue-icon info">AI</span><span>${s}</span>`;
                suggestionsListEl.appendChild(div);
            });
        }

        const end = performance.now();
        analysisTimeSpan.textContent = end - start < 10 ? '<10ms' : Math.round(end - start) + 'ms';
    }

    function findSmartDuplicates(lines) {
        const seen = {};
        const duplicates = [];
        const ignorePattern = /^\s*[{};]\s*$|^\s*$|^\s*\/\/|^\s*\/\*|^\s*\*\/|^\s*@|^\s*#/;

        lines.forEach((line, idx) => {
            const trimmed = line.trim();
            if (trimmed.length < 8 || ignorePattern.test(line)) return;

            const normalized = trimmed.replace(/\s+/g, ' ');
            if (seen[normalized] !== undefined) {
                duplicates.push({
                    line: idx + 1,
                    original: seen[normalized],
                    content: trimmed.length > 40 ? trimmed.substring(0, 40) + '\u2026' : trimmed
                });
            } else {
                seen[normalized] = idx + 1;
            }
        });

        return duplicates;
    }

    function detectLanguage(code) {
        const s = code.trim();
        if (s.startsWith('<') || /<html|<\!DOCTYPE/i.test(code)) return 'html';
        if (s.startsWith('{') || s.startsWith('[')) {
            try { JSON.parse(code); return 'json'; } catch(e) {}
        }
        if (/color:|margin:|padding:|font-|background:|border:/i.test(code)) return 'css';
        if (/(const|let|var|function|=>|class\s+\w+|import\s+|export\s+|console\.|document\.|window\.)/.test(code)) return 'js';
        if (/(def\s+|import\s+\w+|print\(|class\s+\w+:|if\s+__name__)/.test(code)) return 'py';
        if (s.includes('{') && s.includes('}')) return 'css';
        return 'unknown';
    }

    function detectIssues(code, lang) {
        const issues = [];
        const lines = code.split('\n');

        if (lang === 'js') {
            let inBlockComment = false;
            lines.forEach((line, idx) => {
                const trimmed = line.trim();
                const lineNum = idx + 1;

                if (trimmed.startsWith('/*')) inBlockComment = true;
                if (inBlockComment) {
                    if (trimmed.includes('*/')) inBlockComment = false;
                    return;
                }
                if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
                if (!trimmed) return;

                if (trimmed.includes('\t')) {
                    issues.push({ type: 'warning', message: `Line ${lineNum}: Mixed tabs/spaces detected` });
                }

                if (/console\.log/.test(trimmed)) {
                    issues.push({ type: 'info', message: `Line ${lineNum}: Consider removing console.log in production` });
                }

                if (/var\s+/.test(trimmed)) {
                    issues.push({ type: 'info', message: `Line ${lineNum}: Use let/const instead of var` });
                }
            });

            if (!code.includes('use strict') && code.length > 200) {
                issues.push({ type: 'info', message: 'Consider adding "use strict" for safer code' });
            }
        }

        if (lang === 'html') {
            if (!/<!DOCTYPE/i.test(code)) {
                issues.push({ type: 'warning', message: 'Missing DOCTYPE declaration' });
            }
            if (!/lang=["']/.test(code)) {
                issues.push({ type: 'info', message: 'Add lang attribute to <html> for accessibility' });
            }
            if (!/<meta\s+name=["']viewport["']/i.test(code)) {
                issues.push({ type: 'info', message: 'Missing viewport meta tag for mobile responsiveness' });
            }
        }

        if (lang === 'css') {
            lines.forEach((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.includes('!important')) {
                    issues.push({ type: 'warning', message: `Line ${idx+1}: Avoid !important \u2014 use specificity instead` });
                }
            });
        }

        if (lang === 'py') {
            lines.forEach((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.includes('\t')) {
                    issues.push({ type: 'warning', message: `Line ${idx+1}: Use spaces for indentation (PEP 8)` });
                }
            });
            if (code.length > 200 && !/def\s+main/.test(code) && code.includes('print(')) {
                issues.push({ type: 'info', message: 'Consider wrapping execution code in if __name__ == "__main__":' });
            }
        }

        if (lang === 'json') {
            try {
                JSON.parse(code);
            } catch (e) {
                const msg = e.message.length > 60 ? e.message.substring(0, 60) + '\u2026' : e.message;
                issues.push({ type: 'error', message: 'Invalid JSON: ' + msg });
            }
        }

        return issues;
    }

    function generateSuggestions(issues, lang, code) {
        const suggestions = [];
        const lines = code.split('\n').length;

        if (issues.length > 5) {
            suggestions.push('Too many issues \u2014 consider refactoring');
        }
        if (lang === 'js' && /var\s+/.test(code)) {
            suggestions.push('Replace var with let/const for block scoping');
        }
        if (lang === 'html' && !/lang=["']/.test(code)) {
            suggestions.push('Add lang attribute to <html> for accessibility');
        }
        if (lang === 'css' && !/@media/.test(code)) {
            suggestions.push('Add media queries for responsive design');
        }
        if (lines > 500) {
            suggestions.push('Large file \u2014 consider splitting into modules');
        }
        if (lines < 3 && code.trim()) {
            suggestions.push('Very short file \u2014 verify this is intentional');
        }

        return suggestions.slice(0, 4);
    }

    function showNotif(msg, type) {
        notifyMsg.textContent = msg;
        notification.className = 'ael-notification';
        if (type) notification.classList.add(type);
        notification.classList.add('show');
        clearTimeout(window.aelNotifTimeout);
        window.aelNotifTimeout = setTimeout(() => notification.classList.remove('show'), 2500);
    }

    performAnalysis();
})();

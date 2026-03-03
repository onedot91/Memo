export const getStandaloneHTML = (initialContent: string) => `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>메모장 (단일 파일)</title>
<style>
  :root {
    --bg-color: #fffcf5;
    --text-color: #4a3320;
    --accent-color: #b58362;
    --ui-bg: #f5eedc;
    --ui-border: #d4a382;
    --btn-bg: #ffffff;
    --btn-hover: #f0e5d1;
    --primary-bg: #5d8f53;
    --primary-text: #ffffff;
  }
  
  body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: '맑은 고딕', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  /* Font Sizes */
  body.size-normal { font-size: 2rem; }
  body.size-large { font-size: 3rem; }
  body.size-xlarge { font-size: 4rem; }

  #toolbar {
    background-color: var(--ui-bg);
    border-bottom: 1px solid var(--ui-border);
    padding: 10px 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    font-size: 1rem;
    font-weight: normal;
  }
  
  body.read-only #toolbar {
    display: none;
  }

  button, select {
    padding: 8px 16px;
    font-size: 1rem;
    cursor: pointer;
    background-color: var(--btn-bg);
    color: var(--text-color);
    border: 1px solid var(--ui-border);
    border-radius: 6px;
    font-family: inherit;
  }
  button:hover, select:hover {
    background-color: var(--btn-hover);
  }
  
  .btn-primary {
    background-color: var(--primary-bg);
    color: var(--primary-text);
    font-weight: bold;
    border-color: transparent;
  }
  .btn-primary:hover {
    opacity: 0.9;
  }

  #main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  #editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow-y: auto;
    position: relative;
    z-index: 10;
  }

  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 15rem;
    opacity: 0.05;
    pointer-events: none;
    user-select: none;
    filter: grayscale(100%);
    z-index: 1;
  }

  .editor-content {
    flex: 1;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    line-height: 1.6;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .editor-content:empty:before {
    content: attr(data-placeholder);
    color: rgba(74, 51, 32, 0.3);
    pointer-events: none;
  }

  .color-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.1);
    cursor: pointer;
    padding: 0;
    transition: transform 0.1s;
  }
  .color-btn:hover {
    transform: scale(1.1);
  }

  #date-display {
    position: absolute;
    top: 20px;
    right: 30px;
    font-size: 0.4em;
    opacity: 0.7;
    pointer-events: none;
    z-index: 20;
  }
  body:not(.read-only) #date-display {
    display: none;
  }

  #exit-readonly {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 30px;
    font-size: 1.2rem;
    background-color: var(--primary-bg);
    color: var(--primary-text);
    border: 2px solid rgba(0,0,0,0.1);
    border-radius: 50px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 30;
    font-weight: bold;
  }
  body.read-only:hover #exit-readonly {
    opacity: 1;
  }
  body:not(.read-only) #exit-readonly {
    display: none;
  }

  #help-bar {
    background-color: var(--ui-bg);
    border-top: 1px solid var(--ui-border);
    padding: 10px 20px;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
    font-weight: normal;
    color: rgba(0,0,0,0.6);
  }
  body.read-only #help-bar {
    display: none;
  }
</style>
</head>
<body class="size-large">

  <div id="toolbar">
    <div style="font-weight: bold; color: var(--accent-color); font-size: 1.2rem; margin-right: 10px;">
      <span style="font-size: 1.5rem;">🐻</span> 메모장
    </div>
    <select id="size-select">
      <option value="size-normal">보통 글자</option>
      <option value="size-large" selected>큰 글자</option>
      <option value="size-xlarge">매우 큰 글자</option>
    </select>
    <div style="display: flex; gap: 8px; align-items: center; background: var(--btn-bg); padding: 4px 8px; border-radius: 8px; border: 1px solid var(--ui-border); margin-left: 10px;">
      <button class="color-btn" style="background-color: #ef4444;" data-color="#ef4444" title="빨간색"></button>
      <button class="color-btn" style="background-color: #3b82f6;" data-color="#3b82f6" title="파란색"></button>
      <button class="color-btn" style="background-color: #22c55e;" data-color="#22c55e" title="초록색"></button>
      <button class="color-btn" style="background-color: #4a3320;" data-color="#4a3320" title="기본색"></button>
    </div>
    <div style="flex: 1;"></div>
    <button id="btn-readonly" class="btn-primary">UI 숨기기</button>
  </div>

  <div id="date-display"></div>

  <div id="main-content">
    <div class="watermark">🐻</div>
    <div id="editor-container">
      <div id="editor" class="editor-content" contenteditable="true" data-placeholder="여기에 내용을 입력하세요. 텍스트를 드래그하고 상단의 색상 버튼을 눌러 강조할 수 있습니다." spellcheck="false"></div>
    </div>
  </div>

  <button id="exit-readonly">편집 모드로 돌아가기 (Esc)</button>

  <div id="help-bar">
    <span>단축키: <b>Ctrl+S</b> 저장 | <b>Ctrl+Enter</b> 전체화면 | <b>Ctrl + / -</b> 글자 크기</span>
    <span id="save-msg" style="color: var(--primary-bg); font-weight: bold;"></span>
  </div>

  <script>
    const editor = document.getElementById('editor');
    const dateDisplay = document.getElementById('date-display');
    const saveMsg = document.getElementById('save-msg');
    
    // Load saved data
    editor.innerHTML = localStorage.getItem('classroom-memo-standalone') || decodeURIComponent('${encodeURIComponent(initialContent)}');
    document.body.className = localStorage.getItem('classroom-fontsize-standalone') || 'size-large';
    
    // Sync selects with body class
    const updateSelects = () => {
      document.getElementById('size-select').value = Array.from(document.body.classList).find(c => c.startsWith('size-')) || 'size-large';
    };
    updateSelects();

    const updateDate = () => {
      const now = new Date();
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      dateDisplay.textContent = \`\${now.getFullYear()}년 \${now.getMonth()+1}월 \${now.getDate()}일 (\${days[now.getDay()]})\`;
    };

    editor.addEventListener('input', () => {
      localStorage.setItem('classroom-memo-standalone', editor.innerHTML);
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('foreColor', false, color);
        editor.focus();
        localStorage.setItem('classroom-memo-standalone', editor.innerHTML);
      });
    });

    document.getElementById('size-select').addEventListener('change', (e) => {
      document.body.classList.remove('size-normal', 'size-large', 'size-xlarge');
      document.body.classList.add(e.target.value);
      localStorage.setItem('classroom-fontsize-standalone', document.body.className);
    });

    document.getElementById('btn-readonly').addEventListener('click', () => {
      document.body.classList.add('read-only');
      editor.setAttribute('contenteditable', 'false');
      updateDate();
    });

    document.getElementById('exit-readonly').addEventListener('click', () => {
      document.body.classList.remove('read-only');
      editor.setAttribute('contenteditable', 'true');
    });

    // Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('classroom-memo-standalone', editor.innerHTML);
        saveMsg.textContent = '저장되었습니다.';
        setTimeout(() => saveMsg.textContent = '', 2000);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen();
        }
      }
      if (e.key === 'Escape' && document.body.classList.contains('read-only')) {
        document.body.classList.remove('read-only');
        editor.setAttribute('contenteditable', 'true');
      }
    });

    updateDate();
  </script>
</body>
</html>`;

import React, { useState, useEffect, useRef } from 'react';
import { Save, FileDown, HelpCircle, Calendar, Edit3, Maximize } from 'lucide-react';
import { getStandaloneHTML } from './standaloneTemplate';

const SIZES = {
  normal: 'size-normal text-4xl',
  large: 'size-large text-5xl',
  xlarge: 'size-xlarge text-7xl',
};

const LEGACY_WELCOME_MESSAGE = '🐻 환영합니다!\n\n여기에 메모를 작성하세요.\n\n마늘 가방을 멘 곰돌이가 응원합니다! 🧄🍃';
const BEAR_IMAGE_SRC = '/bear.png';

export default function App() {
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('classroom-memo');
    if (!saved || saved === LEGACY_WELCOME_MESSAGE) {
      return '';
    }
    return saved;
  });
  const [fontSize, setFontSize] = useState<keyof typeof SIZES>(() => (localStorage.getItem('classroom-fontsize') as keyof typeof SIZES) || 'large');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showDate, setShowDate] = useState(() => localStorage.getItem('classroom-showdate') !== 'false');
  const [showHelp, setShowHelp] = useState(() => localStorage.getItem('classroom-showhelp') !== 'false');
  const [saveMsg, setSaveMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize editor content once on mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('classroom-memo', content);
  }, [content]);

  useEffect(() => {
    document.body.className = 'bg-bg-main text-text-main';
  }, []);

  useEffect(() => {
    localStorage.setItem('classroom-fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('classroom-showdate', String(showDate));
  }, [showDate]);

  useEffect(() => {
    localStorage.setItem('classroom-showhelp', String(showHelp));
  }, [showHelp]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('classroom-memo', content);
        setSaveMsg('저장되었습니다.');
        setTimeout(() => setSaveMsg(''), 2000);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        toggleFullscreen();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setFontSize(prev => prev === 'normal' ? 'large' : 'xlarge');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setFontSize(prev => prev === 'xlarge' ? 'large' : 'normal');
      }
      if (e.key === 'Escape' && isReadOnly) {
        setIsReadOnly(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, isReadOnly]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const applyColor = (color: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const downloadHTML = () => {
    const htmlContent = getStandaloneHTML(content);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'classroom-memo.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden transition-colors duration-300 bg-bg-main text-text-main ${SIZES[fontSize]}`}>
      
      {/* Toolbar (Hidden in Read-Only Mode) */}
      {!isReadOnly && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-bg-toolbar border-b border-border-ui text-base font-normal shrink-0 shadow-sm">
          
          <div className="flex items-center gap-2 mr-2 font-bold text-accent text-xl tracking-tight">
            <img src={BEAR_IMAGE_SRC} alt="곰 아이콘" className="w-12 h-12 object-contain" />
            <span className="hidden sm:inline">메모장</span>
          </div>

          <div className="flex items-center gap-1 bg-bg-btn rounded-lg border border-border-ui p-1 shadow-sm">
            <button onClick={() => setFontSize('normal')} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${fontSize === 'normal' ? 'bg-bg-primary text-text-primary font-bold shadow-md' : 'hover:bg-bg-btn-hover text-text-btn'}`}>보통</button>
            <button onClick={() => setFontSize('large')} className={`px-3 py-1.5 rounded-md text-base transition-colors ${fontSize === 'large' ? 'bg-bg-primary text-text-primary font-bold shadow-md' : 'hover:bg-bg-btn-hover text-text-btn'}`}>큼</button>
            <button onClick={() => setFontSize('xlarge')} className={`px-3 py-1.5 rounded-md text-lg transition-colors ${fontSize === 'xlarge' ? 'bg-bg-primary text-text-primary font-bold shadow-md' : 'hover:bg-bg-btn-hover text-text-btn'}`}>매우 큼</button>
          </div>

          <div className="flex items-center gap-2 bg-bg-btn rounded-lg border border-border-ui p-2 shadow-sm ml-2">
            <button onClick={() => applyColor('#ef4444')} className="w-6 h-6 rounded-full bg-red-500 hover:scale-110 transition-transform shadow-sm border border-black/10" title="빨간색"></button>
            <button onClick={() => applyColor('#3b82f6')} className="w-6 h-6 rounded-full bg-blue-500 hover:scale-110 transition-transform shadow-sm border border-black/10" title="파란색"></button>
            <button onClick={() => applyColor('#22c55e')} className="w-6 h-6 rounded-full bg-green-500 hover:scale-110 transition-transform shadow-sm border border-black/10" title="초록색"></button>
            <button onClick={() => applyColor('#4a3320')} className="w-6 h-6 rounded-full bg-[#4a3320] hover:scale-110 transition-transform shadow-sm border border-black/10" title="기본색"></button>
          </div>

          <div className="flex-1"></div>

          <button onClick={() => setShowDate(!showDate)} className={`p-2 rounded-lg border transition-colors shadow-sm ${showDate ? 'bg-bg-primary border-bg-primary text-text-primary' : 'bg-bg-btn border-border-ui text-text-btn hover:bg-bg-btn-hover'}`} title="날짜 표시 토글">
            <Calendar size={20} />
          </button>

          <button onClick={downloadHTML} className="p-2 bg-bg-btn border border-border-ui text-text-btn rounded-lg hover:bg-bg-btn-hover transition-colors shadow-sm" title="단일 HTML 파일로 다운로드">
            <FileDown size={20} className="text-accent" />
          </button>

          <button onClick={() => setIsReadOnly(true)} className="flex items-center gap-2 px-5 py-2.5 bg-bg-primary text-text-primary rounded-lg hover:bg-bg-primary-hover transition-colors font-bold shadow-md border border-transparent">
            <Maximize size={18} /> UI 숨기기
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Date Display */}
        {showDate && (
          <div className="absolute top-6 right-8 text-[0.4em] opacity-60 pointer-events-none z-10 font-normal">
            {currentDate}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col p-8 md:p-12 overflow-hidden relative">
          {/* Watermark */}
          <img
            src={BEAR_IMAGE_SRC}
            alt=""
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 w-[18rem] h-[18rem] -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none grayscale"
          />
          <div
            ref={editorRef}
            contentEditable={!isReadOnly}
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            className="editor-content relative z-10"
            data-placeholder="여기에 내용을 입력하세요. 텍스트를 드래그하고 상단의 색상 버튼을 눌러 강조할 수 있습니다."
            spellCheck={false}
          />
        </div>

      </div>

      {/* Exit Read-Only Hover Button */}
      {isReadOnly && (
        <button 
          onClick={() => setIsReadOnly(false)}
          className="fixed bottom-8 right-8 px-6 py-3 bg-bg-primary hover:bg-bg-primary-hover text-text-primary rounded-full shadow-xl flex items-center gap-2 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group border-2 border-bg-main/20 font-bold z-50"
          style={{ animation: 'fadeInOut 3s forwards' }}
        >
          <Edit3 size={20} /> 편집 모드로 돌아가기 (Esc)
        </button>
      )}

      {/* Help Bar */}
      {!isReadOnly && showHelp && (
        <div className="flex items-center justify-between px-6 py-3 bg-bg-toolbar border-t border-border-ui text-sm font-normal text-text-main/70 shrink-0">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 font-medium"><HelpCircle size={16} className="text-bg-primary" /> 단축키 안내</span>
            <span><kbd className="px-2 py-1 bg-bg-btn border border-border-ui rounded text-xs font-mono text-text-main shadow-sm">Ctrl</kbd> + <kbd className="px-2 py-1 bg-bg-btn border border-border-ui rounded text-xs font-mono text-text-main shadow-sm">S</kbd> 저장</span>
            <span><kbd className="px-2 py-1 bg-bg-btn border border-border-ui rounded text-xs font-mono text-text-main shadow-sm">Ctrl</kbd> + <kbd className="px-2 py-1 bg-bg-btn border border-border-ui rounded text-xs font-mono text-text-main shadow-sm">Enter</kbd> 전체화면</span>
            <span><kbd className="px-2 py-1 bg-bg-btn border border-border-ui rounded text-xs font-mono text-text-main shadow-sm">Ctrl</kbd> + <kbd className="px-2 py-1 bg-bg-btn border border-border-ui rounded text-xs font-mono text-text-main shadow-sm">+/-</kbd> 글자 크기</span>
          </div>
          <div className="flex items-center gap-4">
            {saveMsg && <span className="text-bg-primary font-bold flex items-center gap-1"><Save size={16} /> {saveMsg}</span>}
            <button onClick={() => setShowHelp(false)} className="hover:text-accent underline transition-colors">도움말 숨기기</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

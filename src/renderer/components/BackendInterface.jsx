import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, ExternalLink, Trash2, X, Loader2, Play, FileCode, Package } from 'lucide-react';
import { callGemini } from '../services/gemini';
import CodeApproval from './CodeApproval';

const BackendInterface = ({ isDetached, onClose }) => {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(!apiKey);
  const [model, setModel] = useState(() => {
    const saved = localStorage.getItem('gemini_model');
    // Migration: ensure gemini-3.1-pro becomes gemini-3.1-pro-preview
    if (saved === 'gemini-3.1-pro') return 'gemini-3.1-pro-preview';
    return saved || 'gemini-3.1-flash-lite-preview';
  });
  const [debugLogs, setDebugLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingCode, setPendingCode] = useState(null);
  const [view, setView] = useState('chat'); // 'chat' or 'files'
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('gemini_model', model);
  }, [model]);

  const addLog = (msg) => {
    setDebugLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-50));
  };

  const handleSend = async () => {
    if (!input.trim() || !apiKey) {
      if (!apiKey) setShowSettings(true);
      return;
    }

    const userPrompt = input;
    const userMsg = { role: 'user', content: userPrompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    addLog(`User: ${userPrompt}`);

    try {
      const responseText = await callGemini(userPrompt, messages, apiKey, model, addLog);
      const assistantMsg = { role: 'assistant', content: responseText };
      setMessages(prev => [...prev, assistantMsg]);

      // Simple extraction of code blocks
      const frontendMatch = responseText.match(/```(?:javascript|js|jsx)\n([\s\S]*?)```/);
      const backendMatch = responseText.match(/```(?:backend|node|main)\n([\s\S]*?)```/);

      if (frontendMatch) {
        setPendingCode({ type: 'frontend', code: frontendMatch[1] });
      } else if (backendMatch) {
        setPendingCode({ type: 'backend', code: backendMatch[1] });
      }

    } catch (error) {
      addLog(`SYSTEM ERROR: ${error.message}`);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Clear chat history?')) {
      setMessages([]);
      localStorage.removeItem('chat_history');
      addLog('Chat history cleared.');
    }
  };

  const handleApprove = async () => {
    if (!pendingCode) return;
    addLog(`Applying ${pendingCode.type} changes...`);
    try {
      await window.electronAPI.saveCode(pendingCode);
      if (pendingCode.type === 'backend') {
        window.electronAPI.runBackend();
      } else {
        // For frontend, we trigger a custom event that App.jsx listens for
        const event = new CustomEvent('frontend-code-updated', { detail: pendingCode.code });
        window.dispatchEvent(event);
      }
      addLog(`Successfully applied ${pendingCode.type} code.`);
    } catch (err) {
      addLog(`Error saving code: ${err.message}`);
    }
    setPendingCode(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white text-gray-800 overflow-hidden">
      {pendingCode && (
        <CodeApproval
          code={pendingCode.code}
          type={pendingCode.type}
          onApprove={handleApprove}
          onCancel={() => setPendingCode(null)}
        />
      )}

      {/* Header - Fixed Height */}
      <div className="flex items-center justify-between h-12 px-4 border-b bg-gray-100 flex-shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-md transition-colors no-drag ${showSettings ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600 hover:text-blue-600'}`}
            title="Settings"
          >
            <Settings size={18} />
          </button>
          <h2 className="font-semibold text-sm">System Backend</h2>
          <div className="flex bg-gray-200 rounded p-0.5 text-[10px] font-bold uppercase no-drag">
             <button
               onClick={() => setView('chat')}
               className={`px-3 py-0.5 rounded ${view === 'chat' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >Chat</button>
             <button
               onClick={() => setView('files')}
               className={`px-3 py-0.5 rounded ${view === 'files' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >Files</button>
          </div>
        </div>
        <div className="flex items-center gap-2 no-drag">
          {!isDetached && (
            <button onClick={() => window.electronAPI.openDetached()} className="p-1 hover:bg-gray-200 rounded" title="Detach Window">
              <ExternalLink size={16} />
            </button>
          )}
          <button onClick={clearHistory} className="p-1 hover:bg-gray-200 rounded text-red-500" title="Clear History">
            <Trash2 size={16} />
          </button>
          {!isDetached && (
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded" title="Hide Interface">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="p-4 border-b bg-blue-50/50 backdrop-blur-md flex-shrink-0 z-20">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-blue-900 uppercase tracking-tighter">Gemini Config</label>
              <button onClick={() => setShowSettings(false)} className="text-blue-400 hover:text-blue-600">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-700">API KEY</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 bg-white border border-blue-200 rounded text-sm no-drag focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Paste your Google AI Studio key..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-700 uppercase">Preferred Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 bg-white border border-blue-200 rounded text-sm no-drag focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Preview)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Preview)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Exp)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-2 bg-blue-600 text-white p-2 rounded text-sm font-black hover:bg-blue-700 no-drag transition-all shadow-md active:scale-95"
            >
              SAVE CONFIGURATION
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 relative min-h-0 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {view === 'chat' ? (
            <>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                  <p className="text-sm">Describe the feature you want to build.</p>
                  <p className="text-xs mt-2 italic">"Create a todo list with a glassmorphism effect."</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          ) : (
            <FileView addLog={addLog} />
          )}
        </div>

        <div className="h-32 flex-shrink-0 border-t bg-gray-900 text-green-400 p-2 overflow-y-auto font-mono text-[10px] z-20">
        <div className="flex justify-between items-center mb-1 text-gray-500 uppercase font-bold sticky top-0 bg-gray-900 z-20">
           <span>Debug Log</span>
           <button onClick={() => setDebugLogs([])} className="hover:text-white">Clear</button>
        </div>
          {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>

      <div className="p-3 border-t bg-white flex-shrink-0 z-20">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your instructions..."
            className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 no-drag resize-none"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors no-drag disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const FileView = ({ addLog }) => {
  const [files, setFiles] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => {
    const loadFiles = async () => {
      if (!window.electronAPI) {
        addLog("Electron API not found. Are you running in a browser?");
        return;
      }
      try {
        const fileList = await window.electronAPI.getGeneratedFiles();
        setFiles(fileList || []);
      } catch (err) {
        addLog(`Error loading files: ${err.message}`);
      }
    };
    loadFiles();
  }, [addLog]);

  const handleBuild = async () => {
    setIsBuilding(true);
    addLog("Starting DMG build process... This may take a few minutes.");
    try {
      const result = await window.electronAPI.buildDMG();
      addLog("Build successful! Check the 'dist_electron' folder in your project directory.");
      alert("DMG Build Complete! Check dist_electron folder.");
    } catch (err) {
      addLog(`Build failed: ${err}`);
      alert(`Build failed: ${err}`);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4">
        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Runtime Engine Status</h4>
        <p className="text-[11px] text-blue-700 leading-tight">
          These files are dynamically loaded by the application shell. <code className="bg-blue-100 px-1 rounded">renderer.js</code> controls the UI, and <code className="bg-blue-100 px-1 rounded">backend.js</code> runs in the Electron Main process.
        </p>
      </div>

      <div className="flex justify-between items-center border-b pb-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generated Assets</h3>
        <button
          onClick={handleBuild}
          disabled={isBuilding}
          className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold hover:bg-green-100 disabled:opacity-50 transition-colors"
        >
          {isBuilding ? <Loader2 size={12} className="animate-spin" /> : <Package size={12} />}
          {isBuilding ? "BUILDING DMG..." : "BUILD DMG"}
        </button>
      </div>
      {files.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No files generated yet.</p>
      ) : (
        <div className="grid gap-2">
          {files.map(file => (
            <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <FileCode size={20} className="text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{file.type}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const content = await window.electronAPI.getSavedCode(file.type);
                  setViewingFile({ name: file.name, content });
                }}
                className="text-xs text-blue-600 hover:underline"
              >View Source</button>
            </div>
          ))}
        </div>
      )}

      {viewingFile && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                 <FileCode size={18} className="text-blue-600" />
                 <h3 className="font-bold text-sm">{viewingFile.name}</h3>
              </div>
              <button onClick={() => setViewingFile(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-900 p-4">
               <pre className="text-green-400 text-xs font-mono whitespace-pre">
                {viewingFile.content}
              </pre>
            </div>
            <div className="p-3 border-t bg-gray-50 rounded-b-xl flex justify-end">
               <button
                 onClick={() => setViewingFile(null)}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
               >Close</button>
            </div>
          </div>
        </div>
      )}
      <div className="pt-4 border-t mt-10">
         <button
           onClick={async () => {
             if(confirm("DANGER: This will permanently DELETE all generated code AND clear all settings (API keys, history). This cannot be undone. Continue?")) {
               localStorage.clear();
               await window.electronAPI.resetApp();
               window.location.reload();
             }
           }}
           className="w-full py-2 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-bold hover:bg-red-100 transition-colors"
         >RESET ENTIRE APP & SETTINGS</button>
      </div>
    </div>
  );
};

export default BackendInterface;

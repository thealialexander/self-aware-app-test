const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openDetached: () => ipcRenderer.send('open-detached-backend'),
  saveCode: (payload) => ipcRenderer.invoke('save-code', payload),
  getSavedCode: (type) => ipcRenderer.invoke('get-saved-code', type),
  runBackend: () => ipcRenderer.send('run-backend-code'),
  getGeneratedFiles: () => ipcRenderer.invoke('get-generated-files'),
  resetApp: () => ipcRenderer.invoke('reset-app'),
  buildDMG: () => ipcRenderer.invoke('build-dmg'),
  onWindowFocus: (callback) => {
    ipcRenderer.on('window-focus', callback);
    return () => ipcRenderer.removeListener('window-focus', callback);
  },
  onWindowBlur: (callback) => {
    ipcRenderer.on('window-blur', callback);
    return () => ipcRenderer.removeListener('window-blur', callback);
  },
});

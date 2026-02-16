const { contextBridge, shell } = require('electron');

console.log('Preload script loaded successfully');

contextBridge.exposeInMainWorld('electronAPI', {
    openExternal: (url) => shell.openExternal(url)
});

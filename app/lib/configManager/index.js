// const Config = require('electron-config');


// Register required globals
const isDevelopmentMode = process.argv.indexOf('--dev') >= 0;
const isDarwin = process.platform === 'darwin';
const isWin32 = process.platform === 'win32';

global.isDevelopmentMode = isDevelopmentMode;
global.isDarwin = isDarwin;
global.isWin32 = isWin32;



if (typeof __dirname === 'undefined') global.__dirname = '/'
if (typeof __filename === 'undefined') global.__filename = ''
if (typeof process === 'undefined') {
  global.process = {};
}

process.browser = false;

String.prototype.replaceAll = function(search, replacement) {
    const target = this;
    return target.split(search).join(replacement);
};

if (window && window.nw) {
    process.env = window.nw.process.env;
    process.platform = window.nw.process.platform;
    process.mainModule = window.nw.process.mainModule;
    process.mainModule.paths = process.mainModule.paths.map(x => x.replaceAll('\\','/'));

}

// global.location = global.location || { port: 80 }
const isDev = typeof __DEV__ === 'boolean' && __DEV__
process.env['NODE_ENV'] = isDev ? 'development' : 'production'
if (typeof localStorage !== 'undefined') {
  localStorage.debug = isDev ? '*' : ''
}

// If using the crypto shim, uncomment the following line to ensure
// crypto is loaded first, so it can populate global.crypto
// require('crypto')


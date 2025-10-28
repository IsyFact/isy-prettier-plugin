#!/usr/bin/env node
/**
 * prettier-isyfact wrapper
 *
 * 1) If PRETTIER_PATH is set -> use it.
 * 2) Walk up from process.cwd() and try to resolve prettier/bin-prettier.js in each parent node_modules.
 * 3) Try resolving prettier relative to this package.
 * 4) Fallback to invoking 'prettier' on PATH (works when run from npm scripts).
 *
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DEBUG = !!process.env.DEBUG_PRETTIER_ISYFACT;
function debugLog(...args) {
    if (DEBUG) console.error('[prettier-isyfact debug]', ...args);
}

const ignoreFilePath = path.join(__dirname, '..', '.prettierignore');
const userArgs = process.argv.slice(2);

// detect --ignore-path or --ignore-path=...
const hasIgnorePath = userArgs.some(arg => arg === '--ignore-path' || arg.startsWith('--ignore-path='));

const finalArgs = userArgs.slice();
if (!hasIgnorePath && fs.existsSync(ignoreFilePath)) {
    // put ignore-path at front so it can be overridden by user later in args if needed
    finalArgs.unshift('--ignore-path', ignoreFilePath);
}

function exitWithSpawnResult(r) {
    if (!r) process.exit(1);
    if (r.signal) process.exit(1);
    const code = r.status === null ? 1 : r.status;
    process.exit(code);
}

function trySpawnNodeScript(scriptPath, args) {
    debugLog('Spawning node', scriptPath, args);
    const r = spawnSync(process.execPath, [scriptPath, ...args], { stdio: 'inherit' });
    if (r && (r.status !== null)) exitWithSpawnResult(r);
    return r;
}

function trySpawnCommand(cmd, args) {
    debugLog('Spawning command', cmd, args);
    const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
    if (r && (r.status !== null)) exitWithSpawnResult(r);
    return r;
}

// 1) PRETTIER_PATH override
if (process.env.PRETTIER_PATH) {
    const p = process.env.PRETTIER_PATH;
    debugLog('Using PRETTIER_PATH override:', p);
    try {
        if (p.endsWith('.js')) {
            trySpawnNodeScript(p, finalArgs);
        } else {
            trySpawnCommand(p, finalArgs);
        }
    } catch (err) {
        console.error('prettier-isyfact: failed to run PRETTIER_PATH:', p);
        process.exit(2);
    }
}

// 2) Walk up directories from process.cwd() trying to resolve in each <dir>/node_modules
function findPrettierBinUpwards() {
    let dir = process.cwd();
    const root = path.parse(dir).root;
    while (true) {
        const nm = path.join(dir, 'node_modules');
        debugLog('Checking', nm);
        if (fs.existsSync(nm)) {
            // try require.resolve with the specific node_modules path to avoid limiting Node's resolver
            try {
                const candidate = require.resolve('prettier/bin-prettier.js', { paths: [nm] });
                debugLog('Found prettier bin at', candidate);
                return candidate;
            } catch (e1) {
                try {
                    const candidate2 = require.resolve('prettier/bin.js', { paths: [nm] });
                    debugLog('Found prettier bin at', candidate2);
                    return candidate2;
                } catch (e2) {
                    // not found in this node_modules; continue upward
                }
            }
        }
        if (dir === root) break;
        dir = path.dirname(dir);
    }
    return null;
}

try {
    const bin = findPrettierBinUpwards();
    if (bin) {
        trySpawnNodeScript(bin, finalArgs);
    }
} catch (err) {
    debugLog('Error resolving upwards:', err && err.message);
}

// 3) Try resolving relative to this package (useful during testing)
try {
    let localPrettierBin = null;
    try {
        localPrettierBin = require.resolve('prettier/bin-prettier.js', { paths: [__dirname] });
        debugLog('Resolved prettier bin relative to package (bin-prettier.js):', localPrettierBin);
    } catch (e1) {
        try {
            localPrettierBin = require.resolve('prettier/bin.js', { paths: [__dirname] });
            debugLog('Resolved prettier bin relative to package (bin.js):', localPrettierBin);
        } catch (e2) {
            localPrettierBin = null;
        }
    }

    if (localPrettierBin) {
        trySpawnNodeScript(localPrettierBin, finalArgs);
    }
} catch (err) {
    debugLog('Error while trying to resolve local prettier:', err && err.message);
}

// 4) Fallback to invoking 'prettier' on PATH
debugLog("Falling back to invoking 'prettier' on PATH");
const spawnResult = spawnSync('prettier', finalArgs, { stdio: 'inherit', shell: true });

if (spawnResult.error && spawnResult.error.code === 'ENOENT') {
    console.error('prettier-isyfact: could not find a Prettier installation.');
    console.error('Suggestions:');
    console.error('- Ensure you installed Prettier in the project where you run this script: npm i -D prettier');
    console.error('- Run this via npm script so node_modules/.bin is on PATH, e.g. in package.json scripts: "format": "prettier-isyfact --write ."');
    console.error('- If you use pnpm workspaces or a monorepo and Prettier is only at the workspace root, either install Prettier in the package or set PRETTIER_PATH to that root prettier bin (e.g. PRETTIER_PATH=/full/path/node_modules/prettier/bin-prettier.js).');
    console.error('- DEBUG: set DEBUG_PRETTIER_ISYFACT=1 to see resolution attempts.');
    process.exit(2);
}

exitWithSpawnResult(spawnResult);

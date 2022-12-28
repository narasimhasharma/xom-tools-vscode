function visualiseCpqLogCmd() {

    const vscode = require('vscode');
    const root = require('../../../extension');
    const utils = require('../../utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.mjs');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    import (cpqjsPath).then(cpqJs => {
        cpqJs.visualiseLog(lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    });
    root.window.appendLine('Completed Processing CPQ log');
}

function processCpqLogCmd() {

    const vscode = require('vscode');
    const root = require('../../../extension');
    const utils = require('../../utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.mjs');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    import (cpqjsPath).then(cpqJs => {
        cpqJs.processCpqLog(lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    });
    root.window.appendLine('Completed Processing CPQ log');
}

function viewIntfImplsCmd() {

    const vscode = require('vscode');
    const root = require('../../../extension');
    const utils = require('../../utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.mjs');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    import (cpqjsPath).then(cpqJs => {
        cpqJs.viewIntfImpls(lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    });
    root.window.appendLine('Completed Processing CPQ log');
}

function viewSettingsTogglesCmd() {

    const vscode = require('vscode');
    const root = require('../../../extension');
    const utils = require('../../utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.mjs');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    import (cpqjsPath).then(cpqJs => {
        cpqJs.viewSettingsToggles(lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    });
    root.window.appendLine('Completed Processing CPQ log');
}

function analyseTimeJumpsCmd() {

    const vscode = require('vscode');
    const root = require('../../../extension');
    const utils = require('../../utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.mjs');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    import (cpqjsPath).then(cpqJs => {
        cpqJs.analyseTimeJumps(lineAt, lineCount, utils.saveOutput, root.window.appendLine);
    });
    root.window.appendLine('Completed Processing CPQ log');
}

function analyseRecurringCallsCmd() {

    const vscode = require('vscode');
    const root = require('../../../extension');
    const utils = require('../../utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.mjs');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    import (cpqjsPath).then(cpqJs => {
        cpqJs.analyseRecurringCalls(lineAt, lineCount, utils.saveOutput, root.window.appendLine);
    });
    root.window.appendLine('Completed Processing CPQ log');
}

function analyseMethodTimesCmd() {

    const vscode = require('vscode');
    const root = require('../../../extension');
    const utils = require('../../utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.mjs');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing Times of CPQ log');
    import (cpqjsPath).then(cpqJs => {
        cpqJs.analyseMethodTimes(lineAt, lineCount, utils.saveOutput, root.window.appendLine);
    });
    root.window.appendLine('Completed Processing Times of CPQ log');
}

module.exports = {
    processCpqLogCmd,
    viewIntfImplsCmd,
    viewSettingsTogglesCmd,
    analyseTimeJumpsCmd,
    analyseRecurringCallsCmd,
    analyseMethodTimesCmd
}
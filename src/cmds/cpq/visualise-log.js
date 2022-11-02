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

module.exports = {
    visualiseCpqLogCmd,
    viewIntfImplsCmd
}
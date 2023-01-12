function getExtnBasePath() {

    const vscode = require('vscode');
    for(let extn of vscode.extensions.all) {
        if(extn.id.includes('sfiapex')) {
            let basePath = vscode.extensions.getExtension(extn.id).extensionUri.path;
            return basePath;
        }
    }
}

function visualiseCpqLogCmd() {

    const vscode = require('vscode');
    const root = require(getExtnBasePath() +'/extension');
    const utils = require(getExtnBasePath() +'/src/utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.js');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    const cpqJs = require(cpqjsPath);
    cpqJs.visualiseLog(lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    root.window.appendLine('Completed Processing CPQ log');
}

function processCpqLogCmd() {

    const vscode = require('vscode');
    const root = require(getExtnBasePath() +'/extension');
    const utils = require(getExtnBasePath() +'/src/utils/utils');
    const path = require('path');
    
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.js');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    const cpqJs = require(cpqjsPath);
    cpqJs.processCpqLog(lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    root.window.appendLine('Completed Processing CPQ log');
}

function viewIntfImplsCmd() {

    const vscode = require('vscode');
    const root = require(getExtnBasePath() +'/extension');
    const utils = require(getExtnBasePath() +'/src/utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.js');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    const cpqJs = require(cpqjsPath);
    cpqJs.viewIntfImpls(lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    root.window.appendLine('Completed Processing CPQ log');
}

function viewSettingsTogglesCmd() {

    const vscode = require('vscode');
    const root = require(getExtnBasePath() +'/extension');
    const utils = require(getExtnBasePath() +'/src/utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.js');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    const cpqJs = require(cpqjsPath);
    cpqJs.viewSettingsToggles(lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    root.window.appendLine('Completed Processing CPQ log');
}

function analyseTimeJumpsCmd() {

    const vscode = require('vscode');
    const root = require(getExtnBasePath() +'/extension');
    const utils = require(getExtnBasePath() +'/src/utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.js');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    const cpqJs = require(cpqjsPath);
    cpqJs.analyseTimeJumps(lineAt, lineCount, utils.saveOutput, root.window.appendLine);
    root.window.appendLine('Completed Processing CPQ log');
}

function analyseRecurringCallsCmd() {

    const vscode = require('vscode');
    const root = require(getExtnBasePath() +'/extension');
    const utils = require(getExtnBasePath() +'/src/utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.js');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing CPQ log');
    const cpqJs = require(cpqjsPath);
    cpqJs.analyseRecurringCalls(lineAt, lineCount, utils.saveOutput, root.window.appendLine);
    root.window.appendLine('Completed Processing CPQ log');
}

function analyseMethodTimesCmd() {

    const vscode = require('vscode');
    const root = require(getExtnBasePath() +'/extension');
    const utils = require(getExtnBasePath() +'/src/utils/utils');
    const path = require('path');
    
    const extensionPath = root.extensionContext.extensionPath;
    const cpqjsPath = path.join(extensionPath, '/lib/cpq.js');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing Times of CPQ log');
    const cpqJs = require(cpqjsPath);
    cpqJs.analyseMethodTimes(lineAt, lineCount, utils.saveOutput, root.window.appendLine);
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
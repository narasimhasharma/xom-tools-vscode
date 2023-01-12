function analyseOrderOrchestrationCmd() {

    const vscode = require('vscode');
    const utils = require('../../utils/utils');
    const root = require('../../../extension');
    const path = require('path');
    const fs = require('fs');

    const extensionPath = root.extensionContext.extensionPath;
    const eventsFilePath = path.join(extensionPath, '/lib/json/orch-events.json');
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing OM Order Orchestration logs');
    fs.readFile(eventsFilePath, function read(err, eventLog) {

        let eData = JSON.parse(eventLog);
        if (err) {
            root.window.appendLine(err);
            throw err;
        }
        const omjsPath = path.join(extensionPath, '/lib/om.js');
        const omJs = require(omjsPath);
        omJs.processOrchestrationLog(eData, lineAt, lineCount, utils.renderHtml, root.window.appendLine);
    });
    root.window.appendLine('Completed Processing OM Order Orchestration logs');
}

module.exports = {
    analyseOrderOrchestrationCmd
}
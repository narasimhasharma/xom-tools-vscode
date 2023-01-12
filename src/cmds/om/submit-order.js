function analyseOriginalOrderSubmitCmd() {
    analyseSubmitOrderCmd('/lib/json/original-order.json');
}

function analyseSupplementalOrderSubmitCmd() {
    analyseSubmitOrderCmd('/lib/json/supplemental-order.json');
}

function analyseSubmitOrderCmd(fileName) {

    const vscode = require('vscode');
    const root = require('../../../extension');
    const utils = require('../../utils/utils');
    const path = require('path');
    const fs = require('fs');

    const extensionPath = root.extensionContext.extensionPath;
    const eventsFilePath = path.join(extensionPath, fileName);
    const editor = vscode.window.activeTextEditor;
    const lineCount = editor.document.lineCount;
    const lineAt = (i) => {
        return editor.document.lineAt(i).text;
    };

    root.window.appendLine('Started Processing OM Submit Order logs');
    fs.readFile(eventsFilePath, function read(err, eventLog) {

        let eData = JSON.parse(eventLog);
        if (err) {
            root.window.appendLine(err);
            throw err;
        }
        const omjsPath = path.join(extensionPath, '/lib/om.js');
        const omJs = require(omjsPath);
        omJs.processDecompositionLog(eData, lineAt, lineCount, utils.renderHtml, root.window.appendLine); 
    });
    root.window.appendLine('Completed Processing OM Submit Order logs');
}

module.exports = {
    analyseOriginalOrderSubmitCmd,
    analyseSupplementalOrderSubmitCmd
}
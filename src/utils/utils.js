
function renderHtml(content, name) {

    const root = require('../../extension');
    const path = require('path');
    const vscode = require('vscode');

    const extensionPath = root.extensionContext.extensionPath;
    const panel = vscode.window.createWebviewPanel(name, name, vscode.ViewColumn.One, 
                    {retainContextWhenHidden: true, enableFindWidget:true, enableScripts: true, localResourceRoots: [vscode.Uri.file(path.join(extensionPath, '/media'))]});
        
    let styleSrc = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, '/media/dispStyle.css')));
    let scriptSrc = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, '/media/dispScript.js')));
                    
    let vhtmlOutput = `<!DOCTYPE html>
                            <html>
                                <head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>${name}</title>
                                    <link rel="stylesheet" type="text/css" href="${styleSrc}">
                                </head>
                                <body style="font-family:Helvetica;">     
                                    ${content}
                                    <script src="${scriptSrc}"></script>        
                                </body>
                            </html>`;
    panel.webview.html = vhtmlOutput;                 
}

function saveOutput(contentArr, filename) {
                                    
    const fs = require('fs');
    const path = require('path');
    const vscode = require('vscode');
    vscode.window.showOpenDialog({canSelectFolders: true})
        .then(dirUri => {
            const dirPath = dirUri[0].fsPath;
            // fs.writeFile(path.join(dirPath, filename), content, (err) => {
            //     if (err) throw err;
            // });
            var logStream = fs.createWriteStream(path.join(dirPath, filename), {flags: 'w'});
            contentArr.forEach(content => {
                logStream.write(content);
            })
            logStream.end('-----------------');
        });
}

module.exports = {
    renderHtml,
    saveOutput
}
import path = require('path');
import * as vscode from 'vscode';
import { extnContext } from '../../extension';

export function displayLogs(content: string, name: string) {

    const panel = vscode.window.createWebviewPanel(name, name, vscode.ViewColumn.One, 
                    {enableScripts: true, localResourceRoots: [vscode.Uri.file(path.join(extnContext.extensionPath, '/media'))]});
    const styleSrc = vscode.Uri.file(path.join(extnContext.extensionPath, '/media/dispStyle.css')).with({ scheme: 'vscode-resource' });
    const scriptSrc = vscode.Uri.file(path.join(extnContext.extensionPath, '/media/dispScript.js')).with({ scheme: 'vscode-resource' });
    panel.webview.html = `<!DOCTYPE html>
                            <html>
                                <head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                    <title>Decomposition</title>
                                    <link rel="stylesheet" type="text/css" href="${styleSrc}">
                                </head>
                                <body>     
                                    ${content}
                                    <script src="${scriptSrc}"></script>        
                                </body>
                            </html>`;        
}

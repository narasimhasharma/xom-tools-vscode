import { match } from 'assert';
import * as vscode from 'vscode';
import { output } from '../../extension';
import { displayLogs } from '../utils/utils';

class Node {
    lineNo: string;
    desc: string;
    children: any[];
    constructor(lineNo: string, desc: string) {
        this.lineNo = lineNo;
        this.desc = '(' + lineNo + ') ' + desc;
        this.children = [];
    }
}

export const verifyDecompCmd = () => {

    //vscode.window.showInformationMessage('Looking for Decomposition related logs!');
    output.appendLine('Processing Decomposition logs');

    var toBeAssets: Node[] = [];
    var asIsAssets: Node[] = [];
    var deltaAssets: Node[] = [];
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        let toBeContent = '';
        let toBeAssetsData = '';
        let asIsAssetData = '';
        let deltaAssetData = '';
        let deltaContent = '';
        var assetFound = false;
        for (let i = 0; i < editor.document.lineCount; ++i) {  
            var line = editor.document.lineAt(i).text;
            try {
                if(line.includes('========== Enter : createXOMAssetDO  ==========')) {
                    let assetName, source, action, lineNumber, relation;
                    let j = i+1;
                    let sourceString = '-- with orderItem :';
                    for (; j < editor.document.lineCount; ++j) { 
                        var line = editor.document.lineAt(j).text;
                        if(line.includes('--> source orderItem ?')) {
                            if(line.split(' : ')[1] === 'true') {
                                relation = 'OI';
                            } else {
                                relation = 'PCI';
                                sourceString = '-- with parentAsset';
                            }
                            continue;
                        }
                        if (line.includes('-- OI Action is:') || line.includes('parent Asset Action')) {
                            action = line.split('is: ')[1];
                            continue;
                        }
                        if(line.includes('--  Creating Asset for : ')) {
                            assetName = line.split(' : ')[1];
                            continue;
                        }
                        if(line.includes(sourceString)) {
                            source = line.split(':')[4].split('(')[0];
                            continue;
                        }
                        if(line.includes('with LineNumber=')) {
                            assetFound = true;
                            var lineNumberContents = line.split('LineNumber=')[1].split('(DR was ');
                            lineNumber = lineNumberContents[0];
                            var drRelation = '';
                            if(lineNumberContents.length > 1) {
                                drRelation = ' -> ' + lineNumberContents[1].split(')')[0];
                            }
                            toBeContent += `<button class="accordion">${lineNumber}: (${relation}${drRelation}) ${source} -> ${assetName} (${action})</button>\n`;
                            break;
                        }
                        if(line.includes('***** -- Ignoring PCI')) {
                            break;
                        }
                    }
                    i = j+1;
                }
                
                if(line.includes('ToBe Assets Tree')) {

                    let j = i+1;
                    for (; j < editor.document.lineCount; ++j) { 
                        var line = editor.document.lineAt(j).text;
                        if(line.includes('[Asset]')) {

                            line = editor.document.lineAt(++j).text;
                            var lineNo = line.split('lineNumber: ')[1];
                            if(lineNo === undefined) {
                                output.appendLine('Null value in line no parsing -> '+ line);
                            }
                            var specName = editor.document.lineAt(++j).text.split('specName: ')[1];
                            j += 3;
                            var assetRefId = editor.document.lineAt(j).text.split('assetReferenceId: ')[1];
                            j += 5;
                            var provStatus = editor.document.lineAt(j).text.split('provisioningStatus: ')[1];
                            j += 6;
                            var drCond = editor.document.lineAt(j).text.split('condition DR: ')[1];
                            //addToAssets(toBeAssets, lineNo, specName + ' (' + provStatus + ')', line);

                            toBeAssetsData += `<button class="accordion">${lineNo}: ${specName} (${provStatus})</button>\n`;
                            toBeAssetsData += `<div class="panel"><pre style="line-height:0.5;">Asset Reference Id: ${assetRefId}\n\nDR Condition: ${drCond}</pre></div>\n`;
                        } else if(line.includes(' [End of print] ')) {
                            break;
                        }
                    }
                    i = j;
                }

                if(line.includes('AsIs Assets Tree')) {
                    
                    let j = i+1;
                    for (; j < editor.document.lineCount; ++j) { 
                        var line = editor.document.lineAt(j).text;
                        if(line.includes('[Asset]')) {

                            var lineNo = editor.document.lineAt(++j).text.split('lineNumber: ')[1];
                            var specName = editor.document.lineAt(++j).text.split('specName: ')[1];
                            j += 3;
                            var assetRefId = editor.document.lineAt(j).text.split('assetReferenceId: ')[1];
                            j += 5;
                            var provStatus = editor.document.lineAt(j).text.split('provisioningStatus: ')[1];
                            //addToAssets(asIsAssets, lineNo, specName + ' (' + provStatus + ')', line);
                            asIsAssetData += `<button class="accordion">${lineNo}: ${specName} (${provStatus})</button>\n`;
                            asIsAssetData += `<div class="panel"><pre style="line-height:0.5;">Asset Reference Id: ${assetRefId}</pre></div>\n`;
                        
                        } else if(line.includes(' [End of print] ')) {
                            output.appendLine('No AsIs Assets Found');
                            break;
                        }
                    }
                    i = j;
                }
                
                if(line.includes('DeltaAssets Tree')) {
                    
                    let j = i+1;
                    for (; j < editor.document.lineCount; ++j) { 
                        var line = editor.document.lineAt(j).text;
                        if(line.includes('[DeltaAsset]')) {
                            j += 2;
                            var action = editor.document.lineAt(j++).text.split('getAction: ')[1];
                            var subAction = editor.document.lineAt(j).text.split('getSubAction: ')[1];
                            if(subAction === 'null') {
                                subAction = '-';
                            }
                            j += 3;
                            var lineNo = editor.document.lineAt(j).text.split('lineNumber: ')[1];
                            var specName = editor.document.lineAt(++j).text.split('specName: ')[1];
                            j += 3;
                            var assetRefId = editor.document.lineAt(j).text.split('assetReferenceId: ')[1];
                            // addToAssets(deltaAssets, lineNo, specName + ' (' + action + ')', line);
                            deltaAssetData += `<button class="accordion">${lineNo}: ${specName} ${action}/${subAction}</button>\n`;
                            deltaAssetData += `<div class="panel"><pre style="line-height:0.5;">Asset Reference Id: ${assetRefId}\n\n</pre></div>\n`;
                        
                        } else if(line.includes(' [End of print] ')) {
                            break;
                        }
                    }
                    i = j;
                }                

                if(line.includes('========== Enter : calculateDeltaChange ==========')) {
                    let j = i+1;
                    line = editor.document.lineAt(j).text;
                    let assetName = line.split('spec name :')[1];

                    deltaContent += `<button class="accordion">${assetName}</button>\n`;
                    deltaContent += '<div class="panel"><pre style="line-height:0.5;">\n\n';

                    let assetRefId='', asIsFound = false, deltaAssetAction = '', toBeProvStatus = '', asIsProvStatus = '', resultLine = '';
                    for (; j < editor.document.lineCount; ++j) { 
                        line = editor.document.lineAt(j).text;
                        if(line.includes('========== Enter : calculateDeltaChange ==========') || line.includes('========== Enter : removeMarkedNodesFromTree ==========')) {
                            
                            deltaContent += '</pre></div>\n';
                            break;
                        }
                        deltaContent += line.split(']:')[1] + '<br>\n';
                        i = j-1;
                    }
                }


                if(!assetFound) {
                    continue;
                }            
                if(line.includes('========== Enter : RelatePCI ==========')) {
                    toBeContent += '<div class="panel"><pre style="line-height:0.5;">==================PCI=====================\n\n';
                    let j = i+1;
                    for (; j < editor.document.lineCount; ++j) { 
                        var line = editor.document.lineAt(j).text;
                        if(line.includes('Enter : removeAssetFromWorkLists') || line.includes('========== Exit : RelatePCI ==========')) {
                            break;
                        }
                        toBeContent += line.split(']:')[1] + '<br>\n';
                    }
                    toBeContent += '\n===========================================</pre>\n';
                    i = j-1;
                }                
                if(line.includes('========== Enter : processMergeOriginOnAsset  ==========')) {

                    toBeContent += '<pre style="line-height:0.5;">\n==============Merge Origin=================\n\n';
                    let j = i+1;
                    for (; j < editor.document.lineCount; ++j) { 
                        var line = editor.document.lineAt(j).text;
                        if(line.includes('Enter : removeAssetFromWorkLists') || line.includes('========== Exit : processMergeOriginOnAsset  ==========')) {
                            break;
                        }
                        toBeContent += line.split(']:')[1].substring(0, 180) + '<br>\n';
                    }
                    toBeContent += '===========================================</pre></div>\n';
                    i = j+1;
                    assetFound = false;
                }

                
            } catch(err) {
                output.appendLine((err as Error).stack!);
            }
        }
        
        // output.appendLine(deltaContent);
        displayLogs(toBeContent, 'ToBe Decomposition');
        displayLogs(toBeAssetsData, 'ToBe Assets');
        displayLogs(asIsAssetData, 'AsIs Assets');
        displayLogs(deltaContent, 'DeltaAsset Calculation');
        displayLogs(deltaAssetData, 'Delta Assets');
        //displayLogs(convertToHtml(toBeAssets), 'ToBeTree');
        // displayLogs(convertToHtml(asIsAssets), 'AsIsTree');
        // displayLogs(convertToHtml(deltaAssets), 'DeltaTree');


    }

    output.appendLine('Completed proessing Decomposition logs');
};

function convertToHtml(assetList: Node[]): string {
    
    if(assetList.length === 0) {
        return 'No Assets Found';
    }
    var content = '<ul>\n';
    assetList.forEach(asset => {
        if(asset.children.length > 0) {
            content += '<li> '+ asset.desc + convertToHtml(asset.children) + '</li>\n';
        } else {
            content += '<li>' + asset.desc + '</li>\n';
        }
    });
    content += '</ul>\n';
    return content;
}

function addToAssets(toBeAssets: Node[], lineNo: string, desc: string, line: string) {

    if(lineNo === undefined) {
        return;
    }
    var lineNos = lineNo.split('.');
    var levelAssets = toBeAssets;
    lineNos.forEach(line => {
        var matchingAsset: Node = null;
        levelAssets.forEach(asset => {
            if(asset.lineNo === line) {
                matchingAsset = asset;
            }
        });
        if(matchingAsset === null) {
            matchingAsset = new Node(line, desc);
            levelAssets.push(matchingAsset);
        }
        levelAssets = matchingAsset.children;
    });
}

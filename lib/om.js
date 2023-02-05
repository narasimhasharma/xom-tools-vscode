function eventsMap(eventLogData) {

    let content = '';
    for(let desc in eventLogData) {
        content += "<button class='accordion'>"+eventLogData[desc].split("|")[0] + " - " + desc + "</button>";
        content += "<div class='panel'><pre style='line-height:1.0;'></br>" 
                    + eventLogData[desc] + "<br></pre></div>";
        
    }
    return content;
}

function eventContentArr(eventLogData) {

    let content = '';
    for(let eventEntry of eventLogData) {
        content += "<button class='accordion'>"+eventEntry.text.split("|")[0] + " - " + eventEntry.description + "</button>";
        content += "<div class='panel'><pre style='line-height:1.0;'><br>" 
                    + eventEntry.text.replaceAll('\"', '\\"') + "<br></pre></div>";
    }
    return content;
}


function processDecompositionLog(eData, lineAt, lineCount, renderTab, log) {

    // Initialize Event data
    let eCounter = 0;
    let eventLogData = {};
    for(let eventEntry of eData.events) {
        eventLogData[eventEntry.description] = '';
    }

    var toBeContent = '';
    var toBeAssetsData = '';
    var asIsAssetData = '';
    var deltaAssetData = '';
    var deltaContent = '';
    var assetFound = false;
    
    for(let i=0; i< lineCount; i++) {
        var line = lineAt(i);
        // Check for Events
        if(eCounter < eData.events.length) {
            if(line.includes(eData.events[eCounter].text)) {
                eventLogData[eData.events[eCounter].description] = line;
                eCounter++;
            } else if((eCounter-1 >= 0) && line.includes(eData.events[eCounter-1].text)) {
                eventLogData[eData.events[eCounter-1].description] = line;
            }
        }

        try {

            if(line.includes('========== Enter : createXOMAssetDO  ==========')) {
                let assetName, source, action, lineNumber, relation;
                let j = i+1;
                let sourceString = '-- with orderItem :';
                for (; j < lineCount; ++j) { 
                    var line = lineAt(j);
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
                        toBeContent += `<button class='accordion'>${lineNumber}: (${relation}${drRelation}) ${source} -> ${assetName} (${action})</button>`;
                        break;
                    }
                    if(line.includes('***** -- Ignoring PCI') || line.includes('***** -- Ignoring node from PCI')) {
                        break;
                    }
                }
                i = j+1;
            }
            
            if(line.includes('ToBe Assets Tree')) {

                let j = i+1;
                for (; j < lineCount; ++j) { 
                    var line = lineAt(j);

                    if(line.includes('[Asset]')) {
                        
                        var lineNo = lineAt(++j).split('lineNumber: ')[1];
                        var specName = lineAt(++j).split('specName: ')[1];
                        j += 3;
                        var assetRefId = lineAt(j).split('assetReferenceId: ')[1];
                        j += 5;
                        var provStatus = lineAt(j).split('provisioningStatus: ')[1];
                        j += 6;
                        var drCond = lineAt(j).split('condition DR: ')[1];

                        toBeAssetsData += `<button class='accordion'>${lineNo}: ${specName} (${provStatus})</button>`;
                        toBeAssetsData += `<div class='panel'><pre style='line-height:1.0;'>Asset Reference Id: ${assetRefId}<br>DR Condition: ${drCond}</pre></div>`;
                    } else if(line.includes(' [End of print] ')) {
                        break;
                    }
                }
                i = j;
            }

            if(line.includes('AsIs Assets Tree')) {
                
                let j = i+1;
                for (; j < lineCount; ++j) { 
                    var line = lineAt(j);
                    if(line.includes('[Asset]')) {

                        var lineNo = lineAt(++j).split('lineNumber: ')[1];
                        var specName = lineAt(++j).split('specName: ')[1];
                        j += 3;
                        var assetRefId = lineAt(j).split('assetReferenceId: ')[1];
                        j += 5;
                        var provStatus = lineAt(j).split('provisioningStatus: ')[1];
                        var str = lineAt(j+10);
                        var servAcctId = lineAt(j+10).split('ServiceAccountId=')[1];
                        var billAcctId = lineAt(j+11).split('BillingAccountId=')[1];
                        
                        asIsAssetData += `<button class='accordion'>${lineNo}: ${specName} (${provStatus})</button>`;
                        asIsAssetData += `<div class='panel'><pre style='line-height:1.0;'>Asset Reference Id: ${assetRefId}<br>Service Account Id: ${servAcctId}<br>Billing Account Id: ${billAcctId}</pre></div>`;
                    
                    } else if(line.includes(' [End of print] ')) {
                        break;
                    }
                }
                i = j;
            }
            
            if(line.includes('DeltaAssets Tree')) {
                
                let j = i+1;
                for (; j < lineCount; ++j) { 
                    var line = lineAt(j);
                    if(line.includes('[DeltaAsset]')) {
                        j += 2;
                        var action = lineAt(j++).split('getAction: ')[1];
                        var subAction = lineAt(j).split('getSubAction: ')[1];
                        if(subAction === 'null') {
                            subAction = '-';
                        }
                        j += 3;
                        var lineNo = lineAt(j).split('lineNumber: ')[1];
                        var specName = lineAt(++j).split('specName: ')[1];
                        j += 3;
                        var assetRefId = lineAt(j).split('assetReferenceId: ')[1];
                        
                        deltaAssetData += `<button class='accordion'>${lineNo}: ${specName} ${action}/${subAction}</button>`;
                        deltaAssetData += `<div class='panel'><pre style='line-height:1.0;'>Asset Reference Id: ${assetRefId}</pre></div>`;
                    
                    } else if(line.includes(' [End of print] ')) {
                        break;
                    }
                }
                i = j;
            }                

            if(line.includes('========== Enter : calculateDeltaChange ==========')) {
                let j = i+1;
                let assetName = lineAt(j).split('spec name :')[1];
                deltaContent += `<button class='accordion'>${assetName}</button>`;
                deltaContent += "<div class='panel'><pre style='line-height:1.0;'>";

                for (; j < lineCount; ++j) { 
                    let line = lineAt(j);
                    if(line.includes('========== Enter : calculateDeltaChange ==========') || line.includes('========== Enter : removeMarkedNodesFromTree ==========')) {
                        
                        deltaContent += '</pre></div>';
                        break;
                    }
                    deltaContent += line.split(']:')[1] + '<br>';
                    i = j-1;
                }
            }

            if(!assetFound) {
                continue;
            }      

            if(line.includes('========== Enter : RelatePCI ==========')) {
                toBeContent += "<div class='panel'><pre style='line-height:1.0;'>==================PCI=====================<br>";
                let j = i+1;
                for (; j < lineCount; ++j) { 
                    var line = lineAt(j);
                    if(line.includes('Enter : removeAssetFromWorkLists') || line.includes('========== Exit : RelatePCI ==========')) {
                        break;
                    }
                    toBeContent += line.split(']:')[1] + '<br>';
                }
                toBeContent += '===========================================</pre>';
                i = j-1;
            }                
            if(line.includes('========== Enter : processMergeOriginOnAsset  ==========')) {

                toBeContent += "<pre style='line-height:1.0;'>==============Merge Origin=================<br>";
                let j = i+1;
                for (; j < lineCount; ++j) { 
                    var line = lineAt(j);
                    if(line.includes('Enter : removeAssetFromWorkLists') || line.includes('========== Exit : processMergeOriginOnAsset  ==========')) {
                        break;
                    }
                    toBeContent += line.split(']:')[1].substring(0, 180) + '<br>';
                }
                toBeContent += '===========================================</pre></div>';
                i = j+1;
                assetFound = false;
            }

                
        } catch(err) {
            log(err);
        }
    }
    
    renderTab(toBeContent, 'ToBe Decomposition');
    renderTab(toBeAssetsData, 'ToBe Assets');
    renderTab(asIsAssetData, 'AsIs Assets');
    renderTab(deltaContent, 'DeltaAsset Calculation');
    renderTab(deltaAssetData, 'Delta Assets');
    renderTab(eventsMap(eventLogData), 'Submit Order - Events');

}

function processOrchestrationLog(eData, lineAt, lineCount, renderTab, log) {

    let eventLogData = [];
    for (let i = 0; i < lineCount; ++i) {  
        let line = lineAt(i);  
        for(let event of eData.events) {  
            if(line.includes(event.text)) {
                eventLogData.push({'description': event.description, 'text': line});
                break;
            }
        }
    }
    renderTab(eventContentArr(eventLogData), 'Orchestration - Events');

}

module.exports = {
    processDecompositionLog,
    processOrchestrationLog
}
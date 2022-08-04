import * as vscode from 'vscode';
import { output } from '../../extension';
import { displayLogs } from '../utils/utils';

/*

    [vlocity_cmt.OrchestrationItemsManager]:  Candidate set {vlocity_cmt__OrchestrationItem__c:
    [vlocity_cmt.OrchestrationItemsManager]:    -- publishing ready items(vlocity_cmt__OrchestrationItem__c:
    [vlocity_cmt.OrchestrationEventHandler]:  orchestrationItem to process: vlocity_cmt__OrchestrationItem__c
    [vlocity_cmt.OrchestrationItemsExecutor]:  Executing [(vlocity_cmt__OrchestrationItem__c
    [vlocity_cmt.OrchestrationItemsExecutor]:  canRetry() true for item [vlocity_cmt__OrchestrationItem__c
    [vlocity_cmt.OrchestrationItemsManager]:  Setting running timestamp for vlocity_cmt__OrchestrationItem__c
    [vlocity_cmt.OrchestrationItemsManager]:  Updating (vlocity_cmt__OrchestrationItem__c
    [vlocity_cmt.OrchestrationItemsExecutor]:  Completing item [vlocity_cmt__OrchestrationItem__c
    [vlocity_cmt.OrchestrationItemsManager]:  Updating (vlocity_cmt__OrchestrationItem__c
    [vlocity_cmt.OrchestrationItemsManager]:  ** Item : vlocity_cmt__OrchestrationItem__c
    [vlocity_cmt.OrchestrationItemsManager]:  ** Item : Create Dependency With Master Order - old:Ready - new:Completed 
    [vlocity_cmt.XOMOrderOrBundleActivationManager]:    -- item = vlocity_cmt__OrchestrationItem__c:{Id=a3Y1s000000hA12EAE, Name=Create Dependency With Master Order, vlocity_cmt__State__c=Completed
    [vlocity_cmt.XOMOrderOrBundleActivationManager]:   -- item a3Y1s000000hA12EAE:Create Dependency With Master Order has a terminal state : Completed, remove reference
    [vlocity_cmt.OrchestrationItemsManager]:  ** changed Item : Create Dependency With Master Order - with  state:Completed 


    [vlocity_cmt.XOMOrderOrBundleActivationManager]:   -- item a3Y1s000000hRljEAE:uSPS Activation has a terminal state : Skipped, remove reference
    [vlocity_cmt.XOMOrderOrBundleActivationManager]:   -- item a3Y1s000000hRllEAE:Create Interaction Log has a NON terminal state : Ready -- ignored

*/

export const verifyOrchCmd = () => {

    //vscode.window.showInformationMessage('Looking for Orchestration related logs!');	
    output.appendLine('Processing Orchestration logs');

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        let content = '';
        for (let i = 0; i < editor.document.lineCount; ++i) {  
            var line = editor.document.lineAt(i).text;
            try {
                if(line.includes('Executing [(vlocity_cmt__OrchestrationItem__c')) {
                    content += extractItemDetail('Executing: ', line);                
                } else if(line.includes('Setting running timestamp for vlocity_cmt__OrchestrationItem__c')) {
                    content += extractItemDetail('Setting running: ', line);                               
                } else if(line.includes('Completing item [vlocity_cmt__OrchestrationItem__c')) {
                    //content += extractItemDetail('Completing: ', line);               
                } else if(line.includes('XOMOrderOrBundleActivationManager]:   -- item ')) {
                    var splitLine = line.split('-- item ');
                    var timestamp = splitLine[0].split('|')[0];
                    var stateSplit = splitLine[1].split('has a');  
                    if(stateSplit.length > 1) { 
                        content += `<button class="accordion">
                                    ${timestamp}: ${stateSplit[0].split(':')[1]} -> ${stateSplit[1].split(': ')[1].split(',')[0]}
                                    </button>
                                    <div class="panel">
                                        <p>
                                        Item Id: ${stateSplit[0].split(':')[0]}
                                        </p>
                                    </div>`;     
                    }     
                } else if(line.includes(' -- add to non terminal orchestration item')) {
                    //content += extractItemDetail('Add to Non-Term Items: ', line);   
                }
            } catch(err) {
                output.appendLine((err as Error).stack!);
            }
        }
        displayLogs(content, 'Orchestration');
    }

    output.appendLine('Completed processing Orchestration logs');
    
};

function extractItemDetail(message: string, line: string) {

    var splitLine = line.split('vlocity_cmt__OrchestrationItem__c:');
    var timestamp = splitLine[0].split('|')[0];
    var itemStr = splitLine[1].split(')')[0];
    var semiParseableJson = ('{"' + itemStr.substring(1)).replaceAll('=', '": "')
                                .replaceAll(', ', '", "')
                                .replaceAll('": ""', '="')
                                .replaceAll(': "{', ': {')
                                .replaceAll('}"', '}');
    var parseableJson = semiParseableJson.substring(0, semiParseableJson.length-1) + '"}';
    var orchItem = JSON.parse(parseableJson);    
    var html = `<button class="accordion">
                    ${timestamp}: ${message} -> ${orchItem.vlocity_cmt__OrchestrationPlanId__c}/${orchItem.Name}
                </button>
                <div class="panel">
                    <p>
                        Plan: ${orchItem.vlocity_cmt__OrchestrationPlanId__c}<br>
                        Item Id: ${orchItem.Id}<br>
                        Type: ${orchItem.vlocity_cmt__OrchestrationItemType__c}<br>
                        State: ${orchItem.vlocity_cmt__State__c}<br>
                        OrderItem: ${orchItem.vlocity_cmt__OrderItemId__c}<br>
                    </p>
                </div>`;
    return html;
}
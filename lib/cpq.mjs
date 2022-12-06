
export const visualiseLog = (lineAt, lineCount, renderTab, log) => {

    var invokeStack = [];
    var started = false;
    var inLoop = false;
    var htmlContent = '';
    var nestCount = 0;
    for(let i=0; i< lineCount; i++) {
        
        var line = lineAt(i);
        if(line.includes('.invokeMethod(') && line.includes('METHOD_E')) {
            let lineContents = line.split('|');
            let impl = lineContents[lineContents.length-1];
            if(line.includes('METHOD_ENTRY')) {
                invokeStack.push(impl);
                started = true;
                inLoop = true;
                htmlContent += `<button class='accordion'>${impl}</button>\n`;
                htmlContent += "<div class='panel'>";
                htmlContent += line + '<br>\n';
                nestCount++;
            } else if(line.includes('METHOD_EXIT')) {
                if (invokeStack[invokeStack.length-1] == impl) {
                    invokeStack.pop();
                    htmlContent += line + '<br>\n';
                    htmlContent += '</div>';
                    inLoop = false;
                    nestCount--;
                } else {
                    //ERROR Scenario
                }
            }        
        } else {
            if(started & (inLoop || nestCount > 0)) {
                if(line.includes('STATEMENT_EXECUTE') || line.includes('VARIABLE_ASSIGNMENT') || line.includes('USER_DEBUG') || !line.includes('|')) {
                    htmlContent += line + '<br>\n';
                }
            }
        }    
    }
    htmlContent += '</div>';

    renderTab(htmlContent, 'CPQ Logs');
    return htmlContent;
}


export const viewIntfImpls = (lineAt, lineCount, renderTab, log) => {

    var invokeStack = [];
    var htmlContent = '';
    for(let i=0; i< lineCount; i++) {
        
        var line = lineAt(i);
        try {
            if((line.includes('.invokeMethod(') || line.includes('.preExecute(') || line.includes('.execute(') 
                || line.includes('.postExecute(') || line.includes('.executeAction(')) && line.includes('METHOD_E')) {
                let lineContents = line.split('|');
                let implWithSig = lineContents[lineContents.length-1];
                let impl = implWithSig.split('(')[0];
                if(line.includes('METHOD_ENTRY')) {
                    invokeStack.push(impl);
                    let methodName = lineAt(i+4).split('methodName|')[1];
                    if(!methodName) {
                        methodName = lineAt(i+2).split('methodName|')[1];
                    }
                    htmlContent += `<button class='accordion'>${impl}(${methodName})</button>\n`;
                    htmlContent += "<div class='panel'>";
                    htmlContent += line + '<br>\n';
                } else if(line.includes('METHOD_EXIT')) {
                    if (invokeStack[invokeStack.length-1] == impl) {
                        invokeStack.pop();
                        htmlContent += line + '<br>\n';
                        htmlContent += '</div>';
                    } else {
                        //ERROR Scenario
                    }
                }        
            }  
        } catch(err) { log(err) };
    }
    htmlContent += '</div>';

    renderTab(htmlContent, 'CPQ Interface Implementations');
    return htmlContent;
}


export const viewSettingsToggles = (lineAt, lineCount, renderTab, log) => {

    var htmlContent = '';
    for(let i=0; i< lineCount; i++) {
        
        var line = lineAt(i);
        try {
            if(line.includes('|setupName|"')) {
                let lineContents = line.split('|');
                let configName = lineContents[lineContents.length-1];
                htmlContent += `<button class='accordion'>CPQ Config Setup: ${configName}</button>\n`;
                htmlContent += `<div class='panel'>\n${line}\n</div><br>\n`;
            } else if(line.includes('|issueNumber|"')) {
                let lineContents = line.split('|');
                let toggleName = lineContents[lineContents.length-1];
                htmlContent += `<button class='accordion'>Toggle: ${toggleName}</button>\n`;
                htmlContent += `<div class='panel'>\n${line}\n</div><br>\n`;
            }  

        } catch(err) { log(err) };
    }
    htmlContent += '</div>';

    renderTab(htmlContent, 'CPQ Settings, Toggles');
    return htmlContent;
}

export const analyseTimeJumps = (lineAt, lineCount, renderTab, log) => {

    var content = [];
    var stacktrace = [];
    var currentTs;
    var lastTs; // = new Date('1970-01-01T' + lineAt(0).split("(")[0].trim());

    const printStackTrace = (stack, currLine, prevLine) => {

        var iContent = '';
        var space = '';
        // log('Printing stacktrace');
        // log(stack.length);
        if(stack.length > 0) {
            for(var i=0; i<=stack.length-1; i++) {
                iContent += space + ' ' + stack[i] + '\n';
                space += ' ';
            }
        }
        iContent += '\n';
        if(prevLine) {
            iContent += prevLine + '\n';
        }
        iContent += currLine + '\n';
        iContent += '\n';
        iContent += '\n';
        iContent += '\n';
        return iContent;
    }

    for(let i=0; i< lineCount; i++) {
        
        var line = lineAt(i);
        try {
            currentTs = Date.parse('1970-01-01T' + line.split("(")[0].trim());
            if(lastTs) {
                if(currentTs - lastTs > 250) {
                    content.push(printStackTrace(stacktrace, lineAt(i), lineAt(i-1)));
                }
            }
            lastTs = currentTs;
            
            if(line.includes("METHOD_ENTRY") || line.includes("CONSTRUCTOR_ENTRY")) {
                var tokens = line.split('|');
                // log('Adding '+ tokens[tokens.length-1] + ' to stack');
                stacktrace.push(tokens[tokens.length-1]);
            } else if(line.includes("METHOD_EXIT") || line.includes("CONSTRUCTOR_EXIT")) {

                // vlocity_cmt.ApplicationUtilities.getNameSpacePrefix()
                // CONSTRUCTOR_EXIT|[11]|01p3g000000TkZu|<init>()|vlocity_cmt.VSObjectSelectorBase

                var tokens = line.split('|');
                var methodName = stacktrace.pop();
                // log('Removing '+ tokens[tokens.length-1] + ' from stack');
                if(methodName != tokens[tokens.length-1] && !methodName.includes(tokens[tokens.length-1])) {
                    log('Mismatch in stacktrace: ' + methodName + ' <-> ' + tokens[tokens.length-1]);
                    log(line);
                }
            } else if(line.includes("DML_BEGIN") || line.includes("DML_END")) {
                content.push(printStackTrace(stacktrace, lineAt(i), ''));
            } else if(line.includes("SOQL_EXECUTE_BEGIN")) {
                content.push(printStackTrace(stacktrace, lineAt(i), lineAt(i+2)));
            }

        } catch(err) { log(line); log(err.stack); };
    }

    renderTab(content, 'Time_Jump_Analysis.txt');
    log('Completed Execution');
    return content;
}
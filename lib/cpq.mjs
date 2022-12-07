
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

export const analyseRecurringCalls = (lineAt, lineCount, renderTab, log) => {

    var content = [];
    var stacktrace = [];

    const getStackTrace = (stack) => {

        var iContent = '';
        var space = '';
        if(stack.length > 0) {
            for(var i=0; i<=stack.length-1; i++) {
                iContent += space + ' ' + stack[i] + '\n';
                space += ' ';
            }
        }
        iContent += '\n';
        return iContent;
    }

    var recCountMap = new Map();
    var recTraceMap = new Map();

    for(let i=0; i< lineCount; i++) {
        
        var line = lineAt(i);
        try {
            
            if(line.includes("METHOD_ENTRY") || line.includes("CONSTRUCTOR_ENTRY")) {
                var tokens = line.split('|');
                var methodName = tokens[tokens.length-1];
                // log('Adding '+ methodName + ' to stack');
                stacktrace.push(methodName);
                // log('[A] Stack size: '+stacktrace.length);

                var methodCount = recCountMap.get(methodName);
                if(!methodCount) {
                    recCountMap.set(methodName, 1);
                } else {
                    recCountMap.set(methodName, methodCount+1);
                }

                if(methodCount > 5) {
                    if(!recTraceMap.get(methodName)) {
                        let st = getStackTrace(stacktrace);
                        if(!st) {
                            log(methodName + ' <-> ' + st);
                        }
                        log('Creating stacktrace for '+methodName+' in map as '+st);
                        recTraceMap.set(methodName, st);
                    }
                }

            } else if(line.includes("METHOD_EXIT") || line.includes("CONSTRUCTOR_EXIT")) {

                // vlocity_cmt.ApplicationUtilities.getNameSpacePrefix()
                // CONSTRUCTOR_EXIT|[11]|01p3g000000TkZu|<init>()|vlocity_cmt.VSObjectSelectorBase

                var tokens = line.split('|');
                var methodName = tokens[tokens.length-1];
                // log('Stack size: '+stacktrace.length);
                var poppedMethodName = stacktrace.pop();
                // log('Removing '+ methodName + ' from stack, Popped is '+poppedMethodName);
                if(poppedMethodName != methodName && !poppedMethodName.includes(methodName)) {
                    log('Mismatch in stacktrace: ' + poppedMethodName + ' <-> ' + methodName);
                    log(line);
                }
            } 
            // else if(line.includes("DML_BEGIN")) {
            //     content.push(printStackTrace(stacktrace, lineAt(i), ''));
            // } else if(line.includes("SOQL_EXECUTE_BEGIN")) {
            //     content.push(printStackTrace(stacktrace, lineAt(i), lineAt(i+2)));
            // } // Trigger data

        } catch(err) { log(line); log(err.stack); };
    }

    recCountMap.forEach((v, k) => {
        if(v > 5) {
            log('Preparing content for ' + k);
            content.push(recTraceMap.get(k) + '\n' + k + 'x' + v + '\n\n');
        }
    })

    renderTab(content, 'Recurring_calls.txt');
    log('Completed Execution');
    return content;
}

export const analyseMethodTimes = (lineAt, lineCount, renderTab, log) => {

    var content = [];
    var stacktrace = [];
    var recCountMap = new Map();
    var recTraceMap = new Map();
    var nodes = [];
    var nptr=0;
    var level=0;
    var current;

    class Node {
        constructor(parent, name) {
            //log('Creating new node with name - '+name+' and parent '+parent);
            this.name = name;
            this.parent = parent;
            this.children = [];
        }
        addChild(name) {

            var child = this.getChild(name);
            if(child) {
                return child;
            } else {
                //log('Add child '+name);
                child = new Node(this, name);
                this.children.push(child);
            }
            return child;
        }
        getChild(name) {
            for(let node of this.children) {
                if(node.name == name) {
                    return node;
                }
            }
        }
    }

    const dfs = (nodeList, space) => {
        //log('Inside DFS: '+nodeList.length);
        for(let node of nodeList) {
            let parent = (node.parent ? node.parent.name : '-');
            //log(parent);
            let data = space + ' ' + node.name +
            // '('+ parent + ', '+ node.children.length +')' + 
            ' x ' + recCountMap.get(node.name) + ' (' + recTraceMap.get(node.name) + 'ms)\n';
            content.push(data);
            if(node.children.length > 0) {
                dfs(node.children, space + '-----');
            }
            
        }
    }

    for(let i=0; i< lineCount; i++) {
        
        var line = lineAt(i);
        try {
            
            if(line.includes("METHOD_ENTRY") || line.includes("CONSTRUCTOR_ENTRY")) {

                log('------------------------------------------------')
                var tokens = line.split('|');
                var methodName = tokens[tokens.length-1];
                log('Adding '+ methodName + ' to stack');
                stacktrace.push(line);
                log('[A] Stack size: '+stacktrace.length);

                if(level == 0) {
                    log('Creating node at top level')
                    current = new Node(undefined, methodName);
                    nodes[nptr++] = current;
                } else {
                    current = current.addChild(methodName);
                }
                level++;
                // log('dfs');
                // dfs(nodes, '>');
                // log('end dfs')

                var methodCount = recCountMap.get(methodName);
                if(!methodCount) {
                    recCountMap.set(methodName, 1);
                } else {
                    recCountMap.set(methodName, methodCount+1);
                }

            } 
            else if(line.includes("METHOD_EXIT") || line.includes("CONSTRUCTOR_EXIT")) {

                // vlocity_cmt.ApplicationUtilities.getNameSpacePrefix()
                // CONSTRUCTOR_EXIT|[11]|01p3g000000TkZu|<init>()|vlocity_cmt.VSObjectSelectorBase

                log('=======================================================')
                var tokens = line.split('|');
                var methodName = tokens[tokens.length-1];
                var poppedLine = stacktrace.pop();
                var ptokens = poppedLine.split('|');
                var poppedMethodName = ptokens[ptokens.length-1];
                log('Removing '+ methodName + ' from stack, Popped is '+poppedMethodName);
                log('Stack size: '+stacktrace.length);
                if(poppedMethodName != methodName && !poppedMethodName.includes(methodName)) {
                    log('Mismatch in stacktrace: ' + poppedMethodName + ' <-> ' + methodName);
                    log(line);
                } else { 
                    let currentTs = Date.parse('1970-01-01T' + line.split("(")[0].trim());
                    let lastTs = Date.parse('1970-01-01T' + poppedLine.split("(")[0].trim());
                    // let elapsedMillis = parseInt(line.split(")")[0].split("(")[1]) - parseInt(poppedLine.split(")")[0].split("(")[1]);
                    let diff = currentTs - lastTs;
                    // let diff = elapsedMillis;
                    let existingTimeStored = recTraceMap.get(poppedMethodName);
                    if(!existingTimeStored) {
                        recTraceMap.set(poppedMethodName, diff);
                    } else {
                        recTraceMap.set(poppedMethodName, existingTimeStored+diff);
                    }

                    current = current.parent;
                    //log('Setting current to '+ (current ? current.name : '-'));
                    level--;

                    // dfs(nodes, '');
                    // log(line);
                    // log(poppedLine);
                    // log(poppedMethodName + ' => ' + recTraceMap.get(poppedMethodName));
                }
            } 
            // else if(line.includes("DML_BEGIN")) {
            //     content.push(printStackTrace(stacktrace, lineAt(i), ''));
            // } else if(line.includes("SOQL_EXECUTE_BEGIN")) {
            //     content.push(printStackTrace(stacktrace, lineAt(i), lineAt(i+2)));
            // } // Trigger data

        } catch(err) { 
            // log(line); 
            log(err.stack); 
            throw err;
        };
    }

    dfs(nodes, '');

    recCountMap.forEach((v, k) => {
        log('Preparing content for ' + k);
        content.push(recTraceMap.get(k) + ' => ' + k + ' x ' + v + '\n');        
    })

    renderTab(content, 'Execution_time.txt');
    log('Completed Execution');
    return content;
}

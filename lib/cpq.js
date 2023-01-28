
function visualiseLog(lineAt, lineCount, renderTab, log) {

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

function processCpqLog(lineAt, lineCount, renderTab, log) {

    //Add Line items
    var bundleCount = 0;
    var bundleText = '';
    //Advanced Rules
    var itemExistsCheck = 0;
    var addRules = 0, deleteRules = 0, modifyRules = 0;
    var replaceRules = 0, reqExcRecRules = 0;
    var entityFilters = [];
    var actions = [];
    // Pricing
    var qualifiedPLEs = [], mapPLEToWeights = {}, bestMatchPLEs = [], psr = {};
    var pc = {}, ipvPriceResult = {};
    var discountResult = {}, acdPriceResult = {};
    var overrideAdj = {};
    var manualAdj = {};
    var rollupPriceResult = {}, updatedObjects = {};
    var updatedLineItems = {}, newItems = [], allNewItemsMap = {}, records = [];
    //Context Rules
    var ctxRuleSets = {}, ctxRuleCondCount = 0;
    //Response
    var productLog = '', productCount = 0;
    var lineItemLog = '', lineItemCount = 0;
    var virtualLineItemLog = '', virtualLineItemCount = 0;
    //API
    var getCartItemApi = false, addCartItemApi = false, addPromoApi = false;

    try {

        for(let i=0; i< lineCount; i++) {
            
            var line = lineAt(i);
            
            if((line.includes('V2XLIService.addCompleteBundle') || line.includes('V2XLIService.addChildBundle')) && line.includes('METHOD_ENTRY')) {

                while(i++<lineCount && !((line.includes('V2XLIService.addCompleteBundle') || line.includes('V2XLIService.addChildBundle')) && line.includes('METHOD_EXIT'))) {
                    line = lineAt(i);
                    if(line.includes('V2XLIService.populateLineItem') && line.includes('METHOD_ENTRY')) {
                        bundleCount++;
                        addCartItemApi = true;
                        while(i++<lineCount && !((line.includes('V2XLIService.checkIfContainsPastAndEndOfLifeProducts')) && line.includes('METHOD_ENTRY'))) {
                            line = lineAt(i);
                            if(line.includes('|pbe|{')) {
                                if(line.includes('"Name"')) {
                                    bundleText += '\n<br>Line Item: '+line.split('"Name"')[1].split(',')[0];
                                }
                            }
                        }
                    }
                    // if(line.includes('ProductChildItems.getPCI') && line.includes('METHOD_ENTRY')) {
                    //     bundleCount++;
                    // }
                }
            } else if((line.includes('V2ProductHierarchyService.getCompleteHierarchy')) && line.includes('METHOD_ENTRY')) {

                while(i++<lineCount && !((line.includes('V2ProductHierarchyService.getCompleteHierarchy')) && line.includes('METHOD_EXIT'))) {
                    line = lineAt(i);
                    if(line.includes('V2XLIService.populateLineItem') && line.includes('METHOD_ENTRY')) {
                        bundleCount++;
                        addCartItemApi = true;
                        while(i++<lineCount && !((line.includes('V2XLIService.checkIfContainsPastAndEndOfLifeProducts')) && line.includes('METHOD_ENTRY'))) {
                            line = lineAt(i);
                            if(line.includes('|pbe|{')) {
                                if(line.includes('"Name"')) {
                                    bundleText += 'Line Item: '+line.split('"Name"')[1].split(',')[0]+'\n';
                                }
                            }
                        }
                    }
                    // if(line.includes('ProductChildItems.getPCI') && line.includes('METHOD_ENTRY')) {
                    //     bundleCount++;
                    // }
                }
            } else if(line.includes('ValidationRulesImplementation.validateLineItems') && line.includes('METHOD_ENTRY')) {
            
                while(i++<lineCount && !(line.includes('ValidationRulesImplementation.validateLineItems') && line.includes('METHOD_EXIT'))) {
                    line = lineAt(i);
                    if(line.includes('FilterEvaluatorV2.getAttributeFieldIdentifierFromFilter') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !((line.includes('FilterEvaluatorV2.getAttributeFieldIdentifierFromFilter')) && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('|entityFilter|{')) {
                                let efName = line.split('"Name":')[1].split(',')[0];
                                if(!entityFilters.includes(efName)) {
                                    entityFilters.push(efName);
                                }
                            }                        
                        }
                    }
                    if(line.includes('InflightOrderUtility.doesItemExist') && line.includes('METHOD_ENTRY')) {
                        itemExistsCheck++;
                    }
                    if(line.includes('createToBeAddedProductLineItemActionParam') && line.includes('METHOD_ENTRY')) {
                        addRules++;
                    }
                    if(line.includes('createToBeDeletedProductLineItemActionParam') && line.includes('METHOD_ENTRY')) {
                        deleteRules++;
                    }
                    if(line.includes('generateRuleActionMsg') && line.includes('METHOD_ENTRY')) {
                        reqExcRecRules++;
                    }
                    if(line.includes('createToBeModifiedProductLineItemActionParam') && line.includes('METHOD_ENTRY')) {
                        modifyRules++;
                    }
                    if(line.includes('DefaultV2BulkHandleActionImplementation.handleActions') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !(line.includes('DefaultV2BulkHandleActionImplementation.handleActions') && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('|input|"{lineItemsToUpdate')) {
                                let actionStr = line.split('"')[1].split('Name=')[1].split(',')[0];                                
                                // let actionJson = (actionStr);
                                actions.push(actionStr);
                            }
                        }
                    }
                }
            } else if(line.includes('V2PricingService.runPricing') && line.includes('METHOD_ENTRY')) {
                line = lineAt(i);
                while(i++<lineCount && !((line.includes('V2PricingService.runPricing')) && line.includes('METHOD_EXIT'))) {
                    line = lineAt(i);
                    if(line.includes('TightestMatchServiceImplementation.getTightestMatchPriceListEntries') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !((line.includes('TightestMatchServiceImplementation.getTightestMatchPriceListEntries')) && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('|qualifiedPLEs|[')) {
                                qualifiedPLEs = line.split('qualifiedPLEs|')[1].split('|')[0];
                            } else if(line.includes('|mapPLEToWeights|{')) {
                                mapPLEToWeights = line.split('mapPLEToWeights|')[1].split('|')[0];
                            } else if(line.includes('|bestMatchPLEs|[')) {
                                bestMatchPLEs = line.split('bestMatchPLEs|')[1].split('|')[0];
                            } else if(line.includes('|psr|')) {
                                psr = line.split('psr|')[1].split('|')[0];
                            }
                        }
                    }
                    if(line.includes('DefaultPricingPlanImplementation.initializePricingVariables') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !((line.includes('DefaultPricingPlanImplementation.initializePricingVariables')) && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('|pc|{')) {
                                pc = line.split('pc|')[1].split('|')[0];
                            } else if(line.includes('|priceResult|{')) {
                                ipvPriceResult = line.split('priceResult|')[1].split('|')[0];
                            }
                        }
                    }
                    if(line.includes('DefaultPricingPlanImplementation.applyContextDiscounts') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !((line.includes('DefaultPricingPlanImplementation.applyContextDiscounts')) && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('getAllDiscounts___discountResult::: {')) {
                                discountResult = line.split('getAllDiscounts___discountResult::: ')[1];
                            } else if(line.includes('|priceResult|{')) {
                                acdPriceResult = line.split('priceResult|')[1].split('|')[0];
                            }
                        }
                    }
                    if(line.includes('DefaultPricingPlanImplementation.applyOfferAdjustments') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !((line.includes('DefaultPricingPlanImplementation.applyOfferAdjustments')) && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('PricingServiceResult.applyOverridesOrAdjustments') && line.includes('METHOD_ENTRY')) {
                                while(i++<lineCount && !((line.includes('PricingServiceResult.applyOverridesOrAdjustments')) && line.includes('METHOD_EXIT'))) {
                                    line = lineAt(i);
                                    if(line.includes('|this|{')) {
                                        overrideAdj = line.split('this|')[1].split('|')[0];
                                    }
                                }
                            }         
                        }
                    }
                    if(line.includes('DefaultPricingPlanImplementation.applyChargeManualAdjustments') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !((line.includes('DefaultPricingPlanImplementation.applyChargeManualAdjustments')) && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('PricingServiceResult.applyManualAdjustments') && line.includes('METHOD_ENTRY')) {
                                while(i++<lineCount && !((line.includes('PricingServiceResult.applyManualAdjustments')) && line.includes('METHOD_EXIT'))) {
                                    line = lineAt(i);
                                    if(line.includes('|this|{')) {
                                        manualAdj = line.split('this|')[1].split('|')[0];
                                    }
                                }
                            }         
                        }
                    }
                    if(line.includes('DefaultPricingPlanImplementation.calculateRollups') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !((line.includes('DefaultPricingPlanImplementation.calculateRollups')) && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('DefaultPricingPlanImplementation.calculateRollupValues') && line.includes('METHOD_ENTRY')) {
                                while(i++<lineCount && !((line.includes('DefaultPricingPlanImplementation.calculateRollupValues')) && line.includes('METHOD_EXIT'))) {
                                    line = lineAt(i);
                                    if(line.includes('|priceResult|{')) {
                                        rollupPriceResult = line.split('priceResult|')[1].split('|')[0];
                                    }
                                    if(line.includes('|updatedObjects|{')) {
                                        updatedObjects = line.split('updatedObjects|')[1].split('|')[0];
                                    }
                                }
                            }         
                        }
                    }
                    if(line.includes('DefaultPricingPlanImplementation.saveLineItems') && line.includes('METHOD_ENTRY')) {
                        while(i++<lineCount && !((line.includes('DefaultPricingPlanImplementation.saveLineItems')) && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if(line.includes('|updatedLineItems|{')) {
                                updatedLineItems = line.split('updatedLineItems|')[1].split('|')[0];
                            }
                            if(line.includes('DefaultPricingPlanImplementation.processAdjList') && line.includes('METHOD_ENTRY')) {
                                while(i++<lineCount && !((line.includes('DefaultPricingPlanImplementation.processAdjList')) && line.includes('METHOD_EXIT'))) {
                                    line = lineAt(i);
                                    if(line.includes('|newItems|[')) {
                                        newItems = line.split('newItems|')[1].split('|')[0];
                                    }
                                    if(line.includes('|allNewItemsMap|{')) {
                                        allNewItemsMap = line.split('allNewItemsMap|')[1].split('|')[0];
                                    }
                                }
                            }
                            if(line.includes('VDMLTransaction.markDirty') && line.includes('METHOD_ENTRY')) {
                                while(i++<lineCount && !((line.includes('VDMLTransaction.markDirty')) && line.includes('METHOD_EXIT'))) {
                                    line = lineAt(i);
                                    if(line.includes('|records|[')) {
                                        records = line.split('records|')[1].split('|')[0];
                                        break;
                                    } 
                                }
                            }      
                        }
                    }
                }
            } else if(line.includes('CtxRuleProcessor.processRules') && line.includes('METHOD_ENTRY')) {

                while(i++<lineCount && !(line.includes('CtxRuleProcessor.processRules') && line.includes('METHOD_EXIT'))) {
                    line = lineAt(i);
                    if(line.includes('|rulesByRsId|{')) {
                        let ctxRuleJsonStr = line.split('|rulesByRsId|')[1].split('|')[0];
                        let ctxRuleJson = JSON.parse(ctxRuleJsonStr);
                        Object.keys(ctxRuleJson).forEach(ruleSetId => {
                            log(ruleSetId);
                            let rules = ctxRuleJson[ruleSetId];
                            if(!ctxRuleSets[ruleSetId]) {
                                ctxRuleSets[ruleSetId] = [];
                            }
                            rules.forEach(ruleObj => {
                                if(!ctxRuleSets[ruleSetId].includes(ruleObj['Name'])) {
                                    ctxRuleSets[ruleSetId].push(ruleObj['Name']);
                                }
                            })
                        });
                    }
                    if(line.includes('DefaultEvalCtxRuleCondImplementation.evaluate') && line.includes('METHOD_ENTRY')) {
                        ctxRuleCondCount++;
                    }
                }
            } else if(line.includes('V2ProductHierarchyService.mergeHierarchyAndItems') && line.includes('METHOD_ENTRY')) {

                while(i++<lineCount && !(line.includes('V2ProductHierarchyService.mergeHierarchyAndItems') && line.includes('METHOD_EXIT'))) {
                    line = lineAt(i);
                    if(line.includes('V2ProductHierarchyService.populateRecordFields') && line.includes('METHOD_ENTRY')) {
                        var attribCount = 0, fieldCount = 0, productName = '-';
                        while(i++<lineCount && !(line.includes('V2ProductHierarchyService.populateRecordFields') && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if((line.includes('AttributeBaseService.parseAttributesObject') || line.includes('JSONAttributeUtilities.toJSONAttribute') || line.includes('JSONUtilities.parseJSONAttributeValue')) && line.includes("METHOD_ENTRY")) {
                                attribCount++;
                            }
                            if(line.includes('CpqJSONRecordBuilder.setField') && line.includes("METHOD_ENTRY")) {
                                fieldCount++;
                            }
                            if(line.includes('|prod|{')) {
                                if(line.includes('"Name"')) {
                                    productName = line.split('"Name"')[1].split(',')[0];
                                }
                            }
                        }
                        productLog += 'Product:<br>&emsp;Name:'+productName+'<br>&emsp;Attributes:'+(attribCount==0 ? '-' : attribCount)+'<br>&emsp;Fields: '+(fieldCount==0 ? '-' : fieldCount)+'<br><br>';
                        productCount++;
                    }
                    if(line.includes('V2ProductHierarchyService.populateLineItemRecordFields') && line.includes('METHOD_ENTRY')) {
                        var attribCount = 0, fieldCount = 0, productName='-';
                        //log(line);
                        while(i++<lineCount && !(line.includes('V2ProductHierarchyService.populateLineItemRecordFields') && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if((line.includes('AttributeBaseService.parseAttributesObject') || line.includes('JSONAttributeUtilities.toJSONAttribute') || line.includes('JSONUtilities.parseJSONAttributeValue')) && line.includes("METHOD_ENTRY")) {
                                attribCount++;
                            }
                            if(line.includes('CpqJSONRecordBuilder.setField') && line.includes("METHOD_ENTRY")) {
                                fieldCount++;
                            }
                            if(line.includes('|item|{')) {
                                if(line.includes('"Name"')) {
                                    productName = line.split('"Name"')[1].split(',')[0];
                                }
                            }
                        }
                        //log(line);
                        lineItemLog += 'LineItem:<br>&emsp;Name:'+productName+'<br>&emsp;Attributes:'+(attribCount==0 ? '-' : attribCount)+'<br>&emsp;Fields: '+(fieldCount==0 ? '-' : fieldCount)+'<br><br>';
                        lineItemCount++;
                    }
                    if(line.includes('V2ProductHierarchyService.populateVirtualItemRecordFields') && line.includes('METHOD_ENTRY')) {
                        var attribCount = 0, fieldCount = 0, productName = '-';
                        while(i++<lineCount && !(line.includes('V2ProductHierarchyService.populateVirtualItemRecordFields') && line.includes('METHOD_EXIT'))) {
                            line = lineAt(i);
                            if((line.includes('AttributeBaseService.parseAttributesObject') || line.includes('JSONAttributeUtilities.toJSONAttribute') || line.includes('JSONUtilities.parseJSONAttributeValue')) && line.includes("METHOD_ENTRY")) {
                                attribCount++;
                            }
                            if(line.includes('CpqJSONRecordBuilder.setField') && line.includes("METHOD_ENTRY")) {
                                fieldCount++;
                            }
                            if(line.includes('|pbe|{')) {
                                if(line.includes('"Name"')) {
                                    productName = line.split('"Name"')[1].split(',')[0];
                                }
                            }
                        }
                        virtualLineItemLog += 'VirtualLineItem:<br>&emsp;Name:'+productName+'<br>&emsp;Attributes:'+(attribCount==0 ? '-' : attribCount)+'<br>&emsp;Fields: '+(fieldCount==0 ? '-' : fieldCount)+'<br><br>';
                        virtualLineItemCount++;
                    }
                }
            } else {
                if(line.includes('V2GetCartItemsService.executeAction')) {
                    getCartItemApi = true;
                }
            }
        }
    } catch(err) { log(err) };

    var bundleSummary = `
        <button class='accordion'>Adding Bundle</button>\n
        <div class='panel'><br>
            Bundle Size: ${bundleCount}<br>\n
            ${bundleText} <br><br>\n
        </div>        
        `
    
    var advancedRulesSummary = `
        <button class='accordion'>Validation Rules</button>\n
        <div class='panel'><br>
            Add Rules: ${addRules}<br>\n
            Delete Rules: ${deleteRules}<br>\n
            Modify Rules: ${modifyRules}<br>\n
            Replace Rules: ${replaceRules}<br>\n
            Requires + Excludes + Recommends Rules: ${reqExcRecRules}<br><br>\n
            Entity Filters: <br>${entityFilters}<br><br>\n
            Actions: <br>${actions}<br><br>\n
        </div>
        `
    function getPleData(ples) {
        let pleData = JSON.parse(ples).map(ple => {
            let pleTxt = 'PLE Id: ' + ple.Id + ' <br>\n';
            Object.entries(ple).map(([pleKey, pleValue], _) => {
                if(pleKey.includes('ProductId__r')) {
                    pleTxt += 'Product Name: ' + pleValue.Name + ' <br>\n';
                } else if(pleKey.includes('PriceListId__r')) {
                    pleTxt += 'Price List Name: ' + pleValue.Name + ' <br>\n';
                } else if(pleKey.includes('PricingElementId__r')) {
                    Object.entries(pleValue).forEach(([peKey, peValue], _) => {
                        if(peKey.includes('DisplayText')) {
                            pleTxt += 'PricingElement Name: ' + peValue + ' <br>\n';
                        }
                    });
                }
            });
            return pleTxt;
        }).join('<br>\n');
        return pleData;
    }
    function getAdj(adjStr) {
        let adj = JSON.parse(adjStr);
        let adjTxt = 'PLE Id: ' + adj.priceListEntryId + ' <br>\n' +
                'Adj Value: ' + adj.adjustmentValue + ' <br>\n' +
                'Amount: ' + adj.amount + ' <br>\n' +
                'PricingVariable: '+ adj.pricingVariableCode + ' <br>\n';
        Object.entries(adj.priceListEntry).map(([aKey, aValue], _) => {
            if(aKey.includes('ProductId__r')) {
                adjTxt += 'Product Name: ' + aValue.Name + ' <br>\n';
            }
        });
        return adjTxt;
    }
    function getPriceResult(psrStr) {
        let psr = JSON.parse(psrStr);
        let psrTxt = 'Line No: ' + psr.lineNumber+ '<br>\n' +
            'PricingTime: ' + psr.currentPricingTime + '<br>\n';
        Object.entries(psr.itemSObject).map(([pKey, pValue], _) => {
            if(pKey.includes('EffectiveOneTimeTotal')) {
                psrTxt += 'EffectiveOneTimeTotal: '+pValue+ '<br>\n';
            }
            if(pKey.includes('EffectiveRecurringTotal')) {
                psrTxt += 'EffectiveRecurringTotal: '+pValue+ '<br>\n';
            }
            if(pKey.includes('Action')) {
                psrTxt += 'Action: '+pValue+ '<br>\n';
            }
            if(pKey.includes('SubAction')) {
                psrTxt += 'SubAction: '+pValue+ '<br>\n';
            }
            if(pKey.includes('PriceBookEntry')) {
                psrTxt += 'Product: '+pValue.Product2.Name+ '<br>\n';
            }
        });
        return psrTxt;
    }
    function getX(data) {
        log(data);
        log('');
        log('');
        return '';
    }
    var pricingSummary = `
        <button class='accordion'>Default Pricing Steps Summary</button>\n
        <div class='panel'><br>\n
            <button class='accordion'>getTightestMatchPriceListEntries</button>
            <div class='panel'><br>\n
                ${getPleData(qualifiedPLEs)}<br><br>
                ${Object.entries(JSON.parse(mapPLEToWeights)).map(([ple, wt], _) => 'PLE: '+ple+'<br>\nWeight: '+wt+'<br>\n').join('<br>\n')}<br><br>
                ${getPleData(bestMatchPLEs)}<br><br>
                ${(psr)}<br><br>
            </div><br>\n
            <button class='accordion'>initializePricingVariables</button>
            <div class='panel'><br>\n
                ${getAdj(pc)}<br><br>
                ${getPriceResult(ipvPriceResult)}<br><br>
            </div><br>\n
            <button class='accordion'>applyContextDiscounts</button>
            <div class='panel'><br>\n
                ${getX(discountResult)}<br><br>
                ${getPriceResult(acdPriceResult)}<br><br>
            </div><br>\n
            <button class='accordion'>applyOfferAdjustments</button>
            <div class='panel'><br>\n
                ${getPriceResult(overrideAdj)}<br><br>
            </div><br>\n
            <button class='accordion'>applyChargeManualAdjustments</button>
            <div class='panel'><br>\n
                ${getPriceResult(manualAdj)}<br><br>
            </div><br>\n
            <button class='accordion'>calculateRollups</button>
            <div class='panel'><br>\n
                ${getPriceResult(rollupPriceResult)}<br><br>
                ${getX(updatedObjects)}<br><br>
            </div><br>\n
            <button class='accordion'>saveLineItems</button>
            <div class='panel'><br>\n
                ${getX(updatedLineItems)}<br><br>
                ${getX(newItems)}<br><br>
                ${getX(allNewItemsMap)}<br><br>
                ${getX(records)}<br><br>
            </div><br>\n
        </div>
        `;

    var ctxRuleText = '';
    Object.keys(ctxRuleSets).forEach(rsId => {
        ctxRuleText += '<br>RuleSet: ' + rsId + '<ul>\n';
        let rules = ctxRuleSets[rsId];
        rules.forEach(name => ctxRuleText += '<li>Rule: ' + name + '</li>\n');
        ctxRuleText += '</ul>\n'
    })
    var ctxRulesSummary = `
        <button class='accordion'>Context Rules</button>\n
        <div class='panel'><br>
            Context Rules: <br>${ctxRuleText}<br>\n
            Conditions Evaulated: <br>${ctxRuleCondCount} times<br><br>\n
        </div>
        `
    
    var responseSummary = `
        <button class='accordion'>Response</button>\n
        <div class='panel'>
            <button class='accordion'>LineItems (${lineItemCount})</button>\n
            <div class='panel'>
                <br>${lineItemLog}<br>\n
            </div>
            <button class='accordion'>Products (${productCount})</button>\n
            <div class='panel'>
                <br>${productLog}<br>\n
            </div>
            <button class='accordion'>VirtualLineItems (${virtualLineItemCount})</button>\n
            <div class='panel'>
                <br>${virtualLineItemLog}<br>\n
            </div>
        </div>
        `

    var htmlContent = '';

    if(addCartItemApi) {
        htmlContent = `    
            ${bundleSummary}
            ${advancedRulesSummary}
            ${pricingSummary}
            ${ctxRulesSummary}
            ${responseSummary}
        `;
    } else {
        htmlContent = `    
            ${advancedRulesSummary}
            ${pricingSummary}
            ${ctxRulesSummary}
            ${responseSummary}
        `;
    }

    renderTab(htmlContent, 'CPQ Process Log');
}



function viewIntfImpls(lineAt, lineCount, renderTab, log) {

    var invokeStack = [];
    var htmlContent = '';
    for(let i=0; i< lineCount; i++) {
        
        var line = lineAt(i);
        try {
            if((line.includes('.invokeMethod(') || line.includes('.preExecute(') || line.includes('.execute(') 
                || line.includes('populateRecordFields') || line.includes('populateChildItems') || line.includes('populateLineItemRecordFields')
                || line.includes('populateOverrideValues') || line.includes('populateSelectiveOverrideValues')
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


function viewSettingsToggles(lineAt, lineCount, renderTab, log) {

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

function analyseTimeJumps(lineAt, lineCount, renderTab, log) {

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

function analyseRecurringCall(lineAt, lineCount, renderTab, log) {

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

function analyseMethodTimes(lineAt, lineCount, renderTab, log) {

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


module.exports = {
    visualiseLog,
    processCpqLog,
    viewIntfImpls,
    viewSettingsToggles,
    analyseMethodTimes,
    analyseRecurringCall,
    analyseTimeJumps
}
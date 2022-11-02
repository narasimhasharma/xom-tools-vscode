
const vscode = require('vscode');
const orderSubmit = require('./src/cmds/om/submit-order');
const orchestration = require('./src/cmds/om/orchestration');
const cpqVisualise = require('./src/cmds/cpq/visualise-log');
const outputWnd = vscode.window.createOutputChannel("SFI Apex");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	module.exports.extensionContext = context;
	
	vscode.window.showInformationMessage('Activated extension!');
	outputWnd.appendLine('Congratulations, your extension "SFI Apex" is now active!');
	
	let analyseOriginalOrder = vscode.commands.registerCommand('sfiapex.analyseOriginalSubmit', orderSubmit.analyseOriginalOrderSubmitCmd);
	context.subscriptions.push(analyseOriginalOrder);

	let analyseSupplementalOrder = vscode.commands.registerCommand('sfiapex.analyseSupplementalSubmit', orderSubmit.analyseSupplementalOrderSubmitCmd);
	context.subscriptions.push(analyseSupplementalOrder);

	let analyseOrderOrchestration = vscode.commands.registerCommand('sfiapex.analyseOrchestration', orchestration.analyseOrderOrchestrationCmd);
	context.subscriptions.push(analyseOrderOrchestration);

	let visualiseCpqLog = vscode.commands.registerCommand('sfiapex.visualiseCpqLog', cpqVisualise.visualiseCpqLogCmd);
	context.subscriptions.push(visualiseCpqLog);

	let viewIntfImpls = vscode.commands.registerCommand('sfiapex.viewIntfImpls', cpqVisualise.viewIntfImplsCmd);
	context.subscriptions.push(viewIntfImpls);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

module.exports.window = outputWnd;

import * as vscode from 'vscode';

import { analyzeCmd } from './om/analyze/analyze_cmd';
import { verifyKeyEventsCmd } from './om/analyze/verify_key_events';
import { verifyDecompCmd } from './om/decomp/verify_decomp_cmd';
import { verifyOrchCmd } from './om/orch/verify_orch_cmd';

export const output = vscode.window.createOutputChannel("apex-tools");
const fileFnMap = new Map<string, Map<string, string>>();
export let extnContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	
	extnContext = context;
	output.show();

	let analyzeCommand = vscode.commands.registerCommand('apex-tools.analyze', analyzeCmd);
	context.subscriptions.push(analyzeCommand);
		
	let decompCommand = vscode.commands.registerCommand('apex-tools.verify-decomp', verifyDecompCmd);
	context.subscriptions.push(decompCommand);
		
	let orchCommand = vscode.commands.registerCommand('apex-tools.verify-orch', verifyOrchCmd);
	context.subscriptions.push(orchCommand);

	let keyEventsCommand = vscode.commands.registerCommand('apex-tools.verify-key-events', verifyKeyEventsCmd);
	context.subscriptions.push(keyEventsCommand);
	
}

export function deactivate() {}

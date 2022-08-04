import * as vscode from 'vscode';
import * as fs from 'fs';
import { output } from '../../extension';

export const analyzeCmd = () => {

	vscode.window.showInformationMessage('Apex Log Mapper is now Online!');
	vscode.window.showOpenDialog({canSelectFolders: true}).then(dirUri => {
		try {
			if(dirUri && dirUri[0]) {
				const dirPath = dirUri[0].fsPath;
				output.appendLine('Selected Code Directory: '+dirPath);
				let filePaths = getApexCodeFiles(dirPath);
				output.appendLine('Total files: '+filePaths.length);
			}
		} catch(e: any) {
			output.appendLine(e.message);
		}
	});
};


function getApexCodeFiles(dirPath: string): string[] {
	
	//output.appendLine('Scanning dir: '+dirPath);
	const filePaths: string[] = [];
	fs.readdirSync(dirPath).forEach((file: any) => {
		let fPath = dirPath + '/' + file;
		if(fs.lstatSync(fPath).isDirectory() ) {
			filePaths.push(...getApexCodeFiles(fPath));
		} else {
			if(fPath.endsWith('.cls') || fPath.endsWith('.trigger')) {
				filePaths.push(fPath);
			}
		}
	});
	return filePaths;
}

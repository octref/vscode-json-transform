'use strict';

import * as vscode from 'vscode';
import { Uri, ViewColumn } from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as jmespath from 'jmespath';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.initJmespath', () => {
        var editor = vscode.window.activeTextEditor;
        var selection = editor.selection;
        var originalJson = editor.document.getText(selection);
        
        if (!originalJson)
            return;

        var tmpFileUri = path.join(os.tmpdir(), 'vscode-jmespath-preview.json');
        fs.writeFileSync(tmpFileUri, JSON.stringify(JSON.parse(originalJson), null, 2));
        vscode.commands.executeCommand('vscode.open', Uri.file(tmpFileUri), getViewColumn()).then(() => {
            function liveUpdateDoc(pattern: string) {
                var selectedJson = jmespath.search(JSON.parse(originalJson), pattern);
                fs.writeFileSync(tmpFileUri, JSON.stringify(selectedJson, null, 2));

                return null;
            }

            vscode.window.showInputBox({ validateInput: liveUpdateDoc }).then((pattern) => {});
        });
    }));
}

export function deactivate() {
}

function getViewColumn(): ViewColumn {
	const active = vscode.window.activeTextEditor;
	if (!active) {
		return ViewColumn.One;
	}

	switch (active.viewColumn) {
		case ViewColumn.One:
			return ViewColumn.Two;
		case ViewColumn.Two:
			return ViewColumn.Three;
	}

	return active.viewColumn;
}

'use strict';

import * as vscode from 'vscode';
import { Uri, ViewColumn, Selection, Position } from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as jmespath from 'jmespath';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.jsonTransform', jsonTransform));
    // Disable for now. Fix bugs and add back later.
    // context.subscriptions.push(vscode.commands.registerCommand('extension.runJmespathInPlace', runJmespathInPlace));
}

export function deactivate() {
}

function jsonTransform() {
    const selectedJson = getSelectedJson();

    if (!selectedJson) {
        vscode.window.showInformationMessage('Selected string is not a valid JSON');
        return;
    }

    const tmpFilePath = path.join(os.tmpdir(), 'json-transform-preview.json');
    const tmpFileUri = Uri.file(tmpFilePath);

    fs.writeFileSync(tmpFilePath, stringifyJson(selectedJson, 2));

    vscode.commands.executeCommand('vscode.open', tmpFileUri, getViewColumn()).then(() => {
        function liveUpdateOutput(pattern: string) {
            let outputJson;
            try {
                outputJson = jmespath.search(selectedJson, pattern);
            } catch (err) {
                return null;
            }

            fs.writeFileSync(tmpFilePath, stringifyJson(outputJson, 2));
            return null;
        }

        vscode.window.showInputBox({ validateInput: liveUpdateOutput }).then((input) => {});
    });
}

function runJmespathInPlace() {
    const selectedText = getSelectedText();

    if (!selectedText || selectedText === '') {
        if (vscode.window.activeTextEditor.document.fileName.endsWith('.json')) {
            selectWholeDocument(vscode.window.activeTextEditor);
        } else {
            vscode.window.showInformationMessage('Please select some JSON');
            return;
        }
    }
    const selectedJson = getSelectedJson();
    const activeSelection = getActiveSelection();

    if (!selectedJson) {
        vscode.window.showInformationMessage('Selected string is not a valid JSON');
        return;
    }

    function liveUpdateOutput(pattern: string) {
        let outputJson;

        if (pattern === '') {
            outputJson = selectedJson;
        } else {
            try {
                outputJson = jmespath.search(selectedJson, pattern);
            } catch (err) {
                return null;
            }
        }

        vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(activeSelection, stringifyJson(outputJson, 2));
        });

        return null;
    }

    vscode.window.showInputBox({ validateInput: liveUpdateOutput }).then((input) => {
        // User cancels action
        if (input === undefined) {
            vscode.window.activeTextEditor.edit((editBuilder) => {
                editBuilder.replace(activeSelection, stringifyJson(selectedJson, 2));
            })
        }
    });
}

function selectWholeDocument(activeEditor: vscode.TextEditor) {
    const lastline = activeEditor.document.lineCount - 1;
    const lastCharInLastLine = activeEditor.document.lineAt(lastline).text.length;
    
    const anchor = new Position(0, 0);
    const active = new Position(lastline, lastCharInLastLine);
    const wholeDocumentSelection = new Selection(anchor, active);

    activeEditor.selection = wholeDocumentSelection;
}

function getSelectedJson() {
    let selectedText = getSelectedText();

    if (!selectedText)
        selectedText = getActiveDocumentText();

    let selectedJson;
    try {
        selectedJson = JSON.parse(selectedText);
    } catch (err) {

    }

    return selectedJson;
}

function getSelectedText() {
    var activeEditor = vscode.window.activeTextEditor;
    var selection = activeEditor.selection;
    return activeEditor.document.getText(selection);
}

function getActiveSelection() {
    const activeEditor = vscode.window.activeTextEditor;
    const currentSelection = activeEditor.selection;

    // Todo: when nothing is selected, select whole document
    return currentSelection;
}

function getActiveDocumentText() {
    var editor = vscode.window.activeTextEditor;
    return editor.document.getText();
}

function getViewColumn(): ViewColumn {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return ViewColumn.One;
	}

	switch (activeEditor.viewColumn) {
		case ViewColumn.One:
			return ViewColumn.Two;
		case ViewColumn.Two:
			return ViewColumn.Three;
	}

	return activeEditor.viewColumn;
}

function stringifyJson(json: any, spaceAmount: number) {
    return JSON.stringify(json, null, spaceAmount);
}
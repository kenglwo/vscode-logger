import * as vscode from 'vscode';
import { parseScript } from 'esprima';
import { ted } from 'edit-distance';
import fetch from 'node-fetch';
import { config } from 'dotenv';
config({ path: __dirname + '/../.env' });


const API_ENDPOINT: any = process.env.API_ENDPOINT;
const API_KEY: any = process.env.API_KEY;
console.log(API_KEY);

async function insertOne(id: string, savedAt: string, code: string, sloc: number, ted: number) {
  const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': API_KEY
      },
      body: JSON.stringify({
          'collection': 'codeparams',
          'database': 'test',
          'dataSource': 'Cluster0',
          'document': {
            'id': id,
            'savedAt': savedAt,
            'code': code,
            'sloc': sloc,
            'ted': ted
          }
        })
      };

  const res = await fetch(API_ENDPOINT, options);
  const resJson = await res.json();
  return resJson.insertedId;
}


function calcTed(lastSourceCode: string, currentSourceCode: string): number {
  const lastAst = parseScript(lastSourceCode);
  const currentAst = parseScript(currentSourceCode);

  let insert = function(node: any) { return 1; };
  let remove = insert;
  let update = function(nodeA: any, nodeB: any) { 
    return nodeA.body !== nodeB.body ? 1 : 0;
  };
  let children = function(node: any) { return node.body; };

  let astEditDistance: number = 0;
  try {
    astEditDistance = ted(lastAst, currentAst, children, insert, remove, update).distance;
  } catch (e) {
    console.log(e);
  }
  return astEditDistance;
}


export async function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('extension enabled');

  const disposable = vscode.commands.registerCommand('vscode-logger.helloWorld', async () => {
    const studentId: any = await vscode.window.showInputBox();

    let lastSourceCode: string = ''; 

    vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
      if (document.languageId !== 'javascript') return;
      const currentDate: string = new Date().toLocaleString(); 
      const sourceCode: string = document.getText();
      const sloc: number = sourceCode.split('\n').length;
      const ted: number = calcTed(lastSourceCode, sourceCode);

      try {
        const res = await insertOne(studentId, currentDate, sourceCode, sloc, ted);
        vscode.window.showInformationMessage(`savedId: ${res}`);
      } catch (e: any) {
        vscode.window.showInformationMessage(e.message);
      }

      lastSourceCode = sourceCode;
    });

  });
  context.subscriptions.push(disposable);
}


export function deactivate() {};

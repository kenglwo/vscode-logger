import * as vscode from 'vscode';
import { parseScript } from 'esprima';
import { ted } from 'edit-distance';
import { config } from 'dotenv';
config();
import { Schema, model, connect } from 'mongoose';


interface ICodeParams {
  id: string;
  savedAt: string;
  code: string;
  sloc: number;
  ted: number;
}

const codeParamsSchema = new Schema<ICodeParams>({
  id: { type: String, required: true },
  savedAt: { type: String, required: true },
  code: { type: String, required: true },
  sloc: { type: Number, required: true },
  ted: { type: Number, required: true },
});

const dbDriver = process.env.DBDRIVER;
const dbUser = process.env.DBUSER;
const dbPassword = process.env.DBPWD;
const dbHost = process.env.DBHOST;

const CodeParams = model<ICodeParams>('CodeParams', codeParamsSchema);


async function insertToDb(id: string, savedAt: string, code: string, sloc: number, ted: number) {
  const codeParams = new CodeParams({ id, savedAt, code, sloc, ted });
  try {
    await codeParams.save();
    vscode.window.showInformationMessage('saved');
  } catch (e: any) {
    vscode.window.showInformationMessage(e.message);
  }
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
    try {
      await connect(`${dbDriver}://${dbUser}:${dbPassword}@${dbHost}/?retryWrites=true&w=majority`);
      vscode.window.showInformationMessage(`${dbDriver}://${dbUser}:${dbPassword}@${dbHost}/?retryWrites=true&w=majority`);
    } catch (e: any) {
      vscode.window.showInformationMessage(e.message);
    }

    const studentId: any = await vscode.window.showInputBox();

    let lastSourceCode: string = ''; 
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      if (document.languageId !== 'javascript') return;
      const currentDate: string = new Date().toLocaleString(); 
      const sourceCode: string = document.getText();
      const sloc: number = sourceCode.split('\n').length;
      const ted: number = calcTed(lastSourceCode, sourceCode);

      insertToDb(studentId, currentDate, sourceCode, sloc, ted);
      lastSourceCode = sourceCode;
    });

  });
  context.subscriptions.push(disposable);
}


export function deactivate() {};

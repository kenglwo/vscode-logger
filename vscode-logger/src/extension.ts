import * as vscode from 'vscode';
import * as ep from 'esprima';
import * as ed from 'edit-distance';
import * as pg from 'pg';

export const setConfig: pg.ClientConfig = {
  user: 'hiroka',
  host: 'localhost',
  database: 'test',
  password: 'oHirokik1123',
  port: 5432
};

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('extension enabled');
  const disposable = vscode.commands.registerCommand('vscode-logger.helloWorld', async () => {
    const studentId: any = await vscode.window.showInputBox();
    const dbClient = new pg.Client(setConfig);
    dbClient.connect()
      .then(() => vscode.window.showInformationMessage('DB connected.'))
      .catch((e) => {
        console.error(e);
      }); 

    let lastSourceCode: string = ''; 

    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      const currentDate: string = new Date().toLocaleString(); 
      const sourceCode: string = document.getText();
      const sloc: number = sourceCode.split('\n').length;
      const ted: number = calcTed(lastSourceCode, sourceCode);

      vscode.window.showInformationMessage('saved.');
      postDataToDB(dbClient, studentId, currentDate, sourceCode, sloc, ted);
      lastSourceCode = sourceCode;
    });
  });
  context.subscriptions.push(disposable);
}


function postDataToDB(dbClient: any, id: string, date: string, code: string, sloc: number, ted: number): void {
  const query = {
    text: 'INSERT INTO exelog(userId, executedAt, sourceCode, sloc, ted) VALUES($1, $2, $3, $4, $5)',
    values: [id, date, code, sloc, ted],
  };
  dbClient.query(query, (err: Error, res: any) => {
    if (err) console.log(err);
  });
}


function calcTed(lastSourceCode: string, currentSourceCode: string): number {
  const lastAst = ep.parseScript(lastSourceCode);
  const currentAst = ep.parseScript(currentSourceCode);

  let insert = function(node: any) { return 1; };
  let remove = insert;
  let update = function(nodeA: any, nodeB: any) { 
    return nodeA.body !== nodeB.body ? 1 : 0;
  }
  let children = function(node: any) { return node.body; };

  let ted: number = 0;
  try {
    ted = ed.ted(lastAst, currentAst, children, insert, remove, update).distance;
  } catch (e) {
    console.log(e);
  }
  return ted;
}

export function deactivate() {};

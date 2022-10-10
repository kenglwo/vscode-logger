# vscode-logger

[English README is here](https://github.com/HirokiOka/vscode-logger/tree/main/js-logger/README.md)

VSCode内で記述しているJavaScriptファイルのログをとるVSCode拡張機能です．
この拡張機能は，神戸大学で開講されている「プログラミング基礎演習Ⅰ」の受講者の利用を想定して開発されました．

## 使い方

1. この拡張機能をインストールします．
2. VSCode内に入力ウィンドウが表示されるので，あなたの学籍番号を入力してください．
3. セッティングはこれで終了です．JavaScriptファイルを保存するたびに，コードがデータベースに保存されます．


間違った学籍番号を入力してしまった場合は，以下の手順で変更することができます．

1. VSCodeでコマンドパレット（Windows: control + shift + p, Mac: command + shift + p）を開く．
2. コマンドパレットに「changeId」と入力し，「changeId」コマンドを実行する．
3. vscodeに表示される入力ウィンドウに新しい学籍番号を入力する．

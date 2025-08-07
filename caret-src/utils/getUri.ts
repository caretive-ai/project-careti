import * as vscode from "vscode";

/**
 * A helper function that returns a URI for a resource in the webview-ui/build directory.
 *
 * @param webview The webview that the URI is being generated for.
 * @param extensionUri The URI of the extension.
 * @param pathList The path to the resource from the webview-ui/build directory.
 * @returns The URI for the resource.
 */
export function getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]): vscode.Uri {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

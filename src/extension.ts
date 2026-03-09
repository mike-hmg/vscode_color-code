import * as vscode from 'vscode';

interface ColorItem {
    path: string;
    color: string;
}

const COLORS = [
    { id: 'colormanagement.AnsiColor1', label: 'Red', color: '#800000' },
    { id: 'colormanagement.AnsiColor2', label: 'Green', color: '#008000' },
    { id: 'colormanagement.AnsiColor3', label: 'Yellow', color: '#808000' },
    { id: 'colormanagement.AnsiColor4', label: 'Blue', color: '#000080' },
    { id: 'colormanagement.AnsiColor5', label: 'Purple', color: '#800080' },
    { id: 'colormanagement.AnsiColor6', label: 'Teal', color: '#008080' },
    { id: 'colormanagement.AnsiColor7', label: 'Silver', color: '#c0c0c0' },
    { id: 'colormanagement.AnsiColor8', label: 'Grey', color: '#808080' },
    { id: 'colormanagement.AnsiColor9', label: 'Light Red', color: '#ff0000' },
    { id: 'colormanagement.AnsiColor10', label: 'Light Green', color: '#00ff00' },
    { id: 'colormanagement.AnsiColor11', label: 'Light Yellow', color: '#ffff00' },
    { id: 'colormanagement.AnsiColor12', label: 'Light Blue', color: '#0000ff' },
    { id: 'colormanagement.AnsiColor13', label: 'Magenta', color: '#ff00ff' },
    { id: 'colormanagement.AnsiColor14', label: 'Cyan', color: '#00ffff' },
    { id: 'colormanagement.AnsiColor15', label: 'White', color: '#ffffff' },
    { id: 'colormanagement.AnsiColor16', label: 'Orange', color: '#ff8000' },
];

const DECORATION_TYPE_KEY = 'colorcode.decoration';

function getColorItems(): ColorItem[] {
    const config = vscode.workspace.getConfiguration('colorcode');
    return config.get<ColorItem[]>('items', []);
}

async function saveColorItems(items: ColorItem[]): Promise<void> {
    const config = vscode.workspace.getConfiguration('colorcode');
    await config.update('items', items, vscode.ConfigurationTarget.Workspace);
}

function getPathForResource(resource: vscode.Uri): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);
    if (workspaceFolder) {
        return vscode.workspace.asRelativePath(resource, false);
    }
    return resource.fsPath;
}

function applyDecorations() {
    const items = getColorItems();
    const decorationsMap = new Map<string, vscode.TextEditorDecorationType>();

    for (const item of items) {
        const color = item.color.startsWith('colormanagement.') 
            ? COLORS.find(c => c.id === item.color)?.color || item.color
            : item.color;

        const decoration = vscode.window.createTextEditorDecorationType({
            before: {
                contentText: '\u2B24',
                color: color,
                margin: '0 5px 0 0',
                fontSize: '10px',
                lineHeight: '100%'
            }
        });
        decorationsMap.set(item.path, decoration);
    }

    for (const editor of vscode.window.textEditors) {
        const document = editor.document;
        if (!document.uri.path) { continue; }

        const relativePath = vscode.workspace.asRelativePath(document.uri, false);
        const decoration = decorationsMap.get(relativePath);
        
        if (decoration) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            editor.setDecorations(decoration, [fullRange]);
        }
    }

    decorationsMap.forEach((decoration, path) => {
        if (!items.find(i => i.path === path)) {
            decoration.dispose();
        }
    });
}

async function pickColor(): Promise<string | undefined> {
    const items = COLORS.map(c => ({
        label: c.label,
        description: c.color,
        colorId: c.id,
        color: c.color
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a color'
    });

    return selected?.colorId;
}

async function setColor(uri: vscode.Uri): Promise<void> {
    const color = await pickColor();
    if (!color) { return; }

    const path = getPathForResource(uri);
    const items = getColorItems();
    
    const existingIndex = items.findIndex(item => item.path === path);
    if (existingIndex >= 0) {
        items[existingIndex].color = color;
    } else {
        items.push({ path, color });
    }

    await saveColorItems(items);
    vscode.window.showInformationMessage(`Color set for ${path}`);
    applyDecorations();
}

async function clearColor(uri: vscode.Uri): Promise<void> {
    const path = getPathForResource(uri);
    const items = getColorItems();
    
    const filtered = items.filter(item => item.path !== path);
    
    if (filtered.length === items.length) {
        vscode.window.showInformationMessage('No color found to clear');
        return;
    }

    await saveColorItems(filtered);
    vscode.window.showInformationMessage(`Color cleared for ${path}`);
    applyDecorations();
}

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('colorcode.setFileColor', async () => {
            const uri = vscode.window.activeTextEditor?.document.uri;
            if (uri) { await setColor(uri); }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('colorcode.clearFileColor', async () => {
            const uri = vscode.window.activeTextEditor?.document.uri;
            if (uri) { await clearColor(uri); }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('colorcode.setFolderColor', async (resource: vscode.Uri) => {
            if (resource) { await setColor(resource); }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('colorcode.clearFolderColor', async (resource: vscode.Uri) => {
            if (resource) { await clearColor(resource); }
        })
    );

    vscode.workspace.onDidChangeTextDocument(() => {
        applyDecorations();
    });

    vscode.window.onDidChangeActiveTextEditor(() => {
        applyDecorations();
    });

    applyDecorations();
}

export function deactivate(): void {}

# ColorCode
Customize colors for files and folders in your VS Code workspace.
## Features
- Assign custom colors to individual files
- Assign custom colors to folders
- 16 predefined colors to choose from
- Colors persist across workspace sessions
- Right-click context menu integration
## Installation
1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions (`Cmd+Shift+P` → "Extensions: Install from VSIX")
4. Select the `colorcode-1.0.0.vsix` file
## Usage
### Setting File Colors
1. Right-click on a file in the Explorer
2. Select **Set File Color**
3. Choose a color from the picker
### Setting Folder Colors
1. Right-click on a folder in the Explorer
2. Select **Set Folder Color**
3. Choose a color from the picker
### Clearing Colors
- Right-click on a colored file and select **Clear File Color**
- Right-click on a colored folder and select **Clear Folder Color**
## Available Colors
| Color | ID |
|-------|-----|
| Red | `colormanagement.AnsiColor1` |
| Green | `colormanagement.AnsiColor2` |
| Yellow | `colormanagement.AnsiColor3` |
| Blue | `colormanagement.AnsiColor4` |
| Purple | `colormanagement.AnsiColor5` |
| Teal | `colormanagement.AnsiColor6` |
| Silver | `colormanagement.AnsiColor7` |
| Grey | `colormanagement.AnsiColor8` |
| Light Red | `colormanagement.AnsiColor9` |
| Light Green | `colormanagement.AnsiColor10` |
| Light Yellow | `colormanagement.AnsiColor11` |
| Light Blue | `colormanagement.AnsiColor12` |
| Magenta | `colormanagement.AnsiColor13` |
| Cyan | `colormanagement.AnsiColor14` |
| White | `colormanagement.AnsiColor15` |
| Orange | `colormanagement.AnsiColor16` |
## Extension Settings
Colors are stored in your workspace settings under `colorcode.items`:
```json
{
  "colorcode.items": [
    {
      "path": "src/App.tsx",
      "color": "colormanagement.AnsiColor9"
    },
    {
      "path": "docs",
      "color": "colormanagement.AnsiColor3"
    }
  ]
}
```
## Requirements
- VS Code 1.92.0 or higher
## License
MIT

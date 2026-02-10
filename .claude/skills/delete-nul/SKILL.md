---
name: delete-nul
description: Delete the Windows reserved 'nul' file that sometimes gets created in the repo root
disable-model-invocation: true
allowed-tools: Bash(rm *)
---

Delete the `nul` file from the repository root. Git Bash / MSYS2's POSIX layer can remove Windows reserved device-name files directly:

```
rm -f "C:\Sandboxes\McpApps\nul"
```

Then verify removal with `ls`. If the file does not exist, inform the user there is no `nul` file to remove.

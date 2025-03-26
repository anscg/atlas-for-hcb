#AtlasHelper

### hcb-handler.ps1

Save the following as install-hcb-protocol.reg. Replace C:\\hcb-tool\\hcb-handler.ps1 with your script's actual path:

```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\hcb]
@="URL:hcb Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\hcb\shell]

[HKEY_CLASSES_ROOT\hcb\shell\open]

[HKEY_CLASSES_ROOT\hcb\shell\open\command]
@="\"powershell.exe\" -ExecutionPolicy Bypass -WindowStyle Hidden -File \"C:\\hcb-tool\\hcb-handler.ps1\" \"%1\""
```


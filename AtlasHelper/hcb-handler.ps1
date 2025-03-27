param (
    [string]$uri
)

$path = $uri -replace '^hcb://', ''

$decodedPath = [System.Uri]::UnescapeDataString($path)

$newUrl = "http://localhost:5173/callback/$decodedPath"

# Open the URL in the default browser
Start-Process $newUrl
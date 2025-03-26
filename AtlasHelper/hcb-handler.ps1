param (
    [string]$uri
)

# Remove the 'hcb://' prefix
$path = $uri -replace '^hcb://', ''

# Decode URL-encoded characters (e.g., %20 to space)
$decodedPath = [System.Uri]::UnescapeDataString($path)

# Build the new URL
$newUrl = "http://localhost:5173/callback/$decodedPath"

# Open the URL in the default browser
Start-Process $newUrl
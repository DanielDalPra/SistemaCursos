node (Join-Path $PSScriptRoot 'integrar-home.cjs')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Set-Location (Join-Path $PSScriptRoot 'runtime')
node server

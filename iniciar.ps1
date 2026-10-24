param([System.Net.IPAddress]$EnderecoRedeLocal)

if ($EnderecoRedeLocal) {
  if ($EnderecoRedeLocal.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork -or $EnderecoRedeLocal.ToString() -notmatch '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)') {
    throw 'Informe o IPv4 privado da rede local deste computador.'
  }
  $taskConfigPath = Join-Path $PSScriptRoot 'runtime/config.yml'
  $taskConfig = [IO.File]::ReadAllText($taskConfigPath)
  $taskConfig = [regex]::Replace($taskConfig, '(?m)^bindIP:.*$', ('bindIP: ' + $EnderecoRedeLocal))
  [IO.File]::WriteAllText($taskConfigPath, $taskConfig)
  Write-Host "Rede local: http://${EnderecoRedeLocal}:3000/"
}

node (Join-Path $PSScriptRoot 'integrar-home.cjs')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Set-Location (Join-Path $PSScriptRoot 'runtime')
node server

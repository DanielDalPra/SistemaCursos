$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Instale o Node.js 20 ou mais recente antes de continuar.'
}

$runtimePath = Join-Path $PSScriptRoot 'runtime'
$configPath = Join-Path $runtimePath 'config.yml'
if (Test-Path $configPath) {
  Write-Host 'Instalação local existente preservada. Execute .\iniciar.ps1.'
  exit 0
}
if (Test-Path $runtimePath) {
  throw 'A pasta runtime já existe sem configuração. Verifique seus arquivos antes de reinstalar.'
}

New-Item -ItemType Directory -Path $runtimePath | Out-Null
$archivePath = Join-Path $runtimePath 'wiki-js-windows.tar.gz'
$releaseUrl = 'https://github.com/requarks/wiki-v2/releases/download/v2.5.317/wiki-js-windows.tar.gz'
Write-Host 'Baixando Wiki.js 2.5.317 para Windows...'
Invoke-WebRequest $releaseUrl -OutFile $archivePath
$expectedHash = '74503429DD209B4AB229BE6D2AFC1CA5A0E4F5F26C1AC70DD50C94F6C5216849'
if ((Get-FileHash $archivePath -Algorithm SHA256).Hash -ne $expectedHash) {
  throw 'O pacote baixado não corresponde ao SHA-256 esperado. Instalação interrompida.'
}
$tarPath = Join-Path $env:SystemRoot 'System32/tar.exe'
if (-not (Test-Path $tarPath)) { throw 'tar.exe do Windows não encontrado.' }
& $tarPath -xzf $archivePath -C $runtimePath
if ($LASTEXITCODE -ne 0) { throw 'Falha ao extrair o Wiki.js.' }
$config = Get-Content (Join-Path $runtimePath 'config.sample.yml') -Raw
$config = $config.Replace('type: postgres', 'type: sqlite')
$config = $config.Replace('storage: path/to/database.sqlite', 'storage: ./data/cursos.sqlite')
$config = $config.Replace('bindIP: 0.0.0.0', 'bindIP: 127.0.0.1')
Set-Content $configPath $config
node (Join-Path $PSScriptRoot 'integrar-home.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao integrar a home.' }
Write-Host 'Pronto. Execute .\iniciar.ps1 e acesse http://127.0.0.1:3000/ para configurar sua conta.'

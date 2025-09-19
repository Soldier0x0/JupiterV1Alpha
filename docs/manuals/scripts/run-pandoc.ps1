Param()

$ErrorActionPreference = 'Stop'

$Pandoc = 'C:\Program Files\Pandoc\pandoc.exe'
if (-not (Test-Path $Pandoc)) {
  Write-Host "[ERROR] Pandoc not found at $Pandoc" -ForegroundColor Red
  exit 1
}

$OutDir = "docs/manuals/pdfs"
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$Docs = @(
  @{ Src = 'docs/manuals/user-guide/README.md';        Out = "$OutDir/Jupiter-SIEM-User-Guide.pdf" },
  @{ Src = 'docs/manuals/admin-guide/README.md';       Out = "$OutDir/Jupiter-SIEM-Admin-Guide.pdf" },
  @{ Src = 'docs/manuals/developer-guide/README.md';   Out = "$OutDir/Jupiter-SIEM-Developer-Guide.pdf" },
  @{ Src = 'docs/manuals/security-guide/README.md';    Out = "$OutDir/Jupiter-SIEM-Security-Guide.pdf" },
  @{ Src = 'docs/manuals/reference-library/README.md'; Out = "$OutDir/Jupiter-SIEM-Reference-Library.pdf" }
)

foreach ($d in $Docs) {
  if (Test-Path $d.Src) {
    Write-Host "[INFO] Generating $($d.Out)" -ForegroundColor Cyan
    & $Pandoc $d.Src --toc --number-sections -o $d.Out
    if ($LASTEXITCODE -ne 0) { throw "Pandoc failed for $($d.Src)" }
  } else {
    Write-Host "[WARN] Missing source: $($d.Src)" -ForegroundColor Yellow
  }
}

Get-ChildItem $OutDir | Select-Object Name, Length | Format-Table -Auto


Param(
  [string]$DocsRoot = "docs/manuals",
  [string]$OutputDir = "docs/manuals/pdfs"
)

function Write-Info($msg)  { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Check pandoc
if (-not (Get-Command pandoc -ErrorAction SilentlyContinue)) {
  Write-Err "Pandoc not found. Install from https://pandoc.org/installing.html"
  exit 1
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
$TempDir = Join-Path $env:TEMP "jupiter-docs-pdf"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# Minimal CSS
$cssPath = Join-Path $TempDir "pdf-style.css"
@'
body { font-family: Segoe UI, Arial, sans-serif; font-size: 11pt; color: #333; }
h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 6px; }
h2 { color: #34495e; border-bottom: 1px solid #ecf0f1; }
pre, code { background: #f8f9fa; border: 1px solid #e9ecef; }
'@ | Set-Content -NoNewline -Path $cssPath -Encoding UTF8

function Convert-ToPdf($input, $output, $title) {
  Write-Info "Generating PDF: $title"
  pandoc $input `
    --toc `
    --toc-depth=3 `
    --number-sections `
    --css=$cssPath `
    --metadata title="$title" `
    --metadata author="Jupiter SIEM Team" `
    --metadata date="$(Get-Date -Format 'MMMM yyyy')" `
    -o $output
  if ($LastExitCode -ne 0) { throw "Failed to generate $output" }
  Write-Ok "Created $output"
}

# Individual volumes (cover pages)
$maps = @{
  "User Guide"       = Join-Path $DocsRoot "user-guide/README.md"
  "Admin Guide"      = Join-Path $DocsRoot "admin-guide/README.md"
  "Developer Guide"  = Join-Path $DocsRoot "developer-guide/README.md"
  "Security Guide"   = Join-Path $DocsRoot "security-guide/README.md"
  "Reference Library"= Join-Path $DocsRoot "reference-library/README.md"
}

foreach ($title in $maps.Keys) {
  $src = $maps[$title]
  if (Test-Path $src) {
    $out = Join-Path $OutputDir ("Jupiter-SIEM-" + $title.Replace(' ', '-') + ".pdf")
    Convert-ToPdf -input $src -output $out -title $title
  } else {
    Write-Warn "$src not found, skipping"
  }
}

# Complete volumes (concatenated)
function Join-Markdown($dir, $outFile) {
  $files = Get-ChildItem -Path $dir -Recurse -Filter *.md | Sort-Object FullName
  $content = ""
  foreach ($f in $files) { $content += (Get-Content -Raw $f) + "`n`n\pagebreak`n`n" }
  Set-Content -Path $outFile -Value $content -Encoding UTF8
}

$completeMap = @{
  "User-Guide-Complete"       = Join-Path $DocsRoot "user-guide"
  "Admin-Guide-Complete"      = Join-Path $DocsRoot "admin-guide"
  "Developer-Guide-Complete"  = Join-Path $DocsRoot "developer-guide"
  "Security-Guide-Complete"   = Join-Path $DocsRoot "security-guide"
  "Reference-Library-Complete"= Join-Path $DocsRoot "reference-library"
}

foreach ($name in $completeMap.Keys) {
  $dir = $completeMap[$name]
  if (Test-Path $dir) {
    $tmp = Join-Path $TempDir ("$name.md")
    Join-Markdown -dir $dir -outFile $tmp
    $out = Join-Path $OutputDir ("Jupiter-SIEM-$name.pdf")
    Convert-ToPdf -input $tmp -output $out -title $name.Replace('-', ' ')
  }
}

Write-Ok "All PDFs generated in $OutputDir"

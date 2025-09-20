#!/bin/bash

# Jupiter SIEM Documentation PDF Generator
# Generates professional PDF versions of all documentation volumes

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$DOCS_DIR/pdfs"
TEMP_DIR="/tmp/jupiter-docs-pdf"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v pandoc &> /dev/null; then
        log_error "Pandoc is not installed. Please install it first:"
        echo "  Ubuntu/Debian: sudo apt install pandoc"
        echo "  macOS: brew install pandoc"
        echo "  Windows: Download from https://pandoc.org/installing.html"
        exit 1
    fi
    
    if ! command -v wkhtmltopdf &> /dev/null; then
        log_warning "wkhtmltopdf is not installed. Using pandoc for PDF generation."
        echo "  For better PDF formatting, install wkhtmltopdf:"
        echo "  Ubuntu/Debian: sudo apt install wkhtmltopdf"
        echo "  macOS: brew install wkhtmltopdf"
    fi
    
    log_success "Dependencies check completed"
}

# Create directories
setup_directories() {
    log_info "Setting up directories..."
    
    mkdir -p "$OUTPUT_DIR"
    mkdir -p "$TEMP_DIR"
    
    log_success "Directories created"
}

# Generate CSS for PDF styling
generate_pdf_css() {
    log_info "Generating PDF CSS..."
    
    cat > "$TEMP_DIR/pdf-style.css" << 'EOF'
/* Jupiter SIEM PDF Styles */

@page {
    size: A4;
    margin: 2cm;
    @top-center {
        content: "Jupiter SIEM Documentation";
        font-size: 10pt;
        color: #666;
    }
    @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 10pt;
        color: #666;
    }
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    font-size: 11pt;
}

h1 {
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
    padding-bottom: 10px;
    page-break-before: always;
    font-size: 24pt;
    margin-top: 0;
}

h1:first-child {
    page-break-before: avoid;
}

h2 {
    color: #34495e;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 5px;
    margin-top: 30px;
    font-size: 18pt;
}

h3 {
    color: #2c3e50;
    margin-top: 25px;
    font-size: 14pt;
}

h4 {
    color: #34495e;
    margin-top: 20px;
    font-size: 12pt;
}

h5, h6 {
    color: #7f8c8d;
    margin-top: 15px;
    font-size: 11pt;
}

/* Table of Contents */
.toc {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    padding: 20px;
    margin: 20px 0;
}

.toc h2 {
    border: none;
    margin-top: 0;
    color: #2c3e50;
}

.toc ul {
    list-style-type: none;
    padding-left: 0;
}

.toc li {
    margin: 5px 0;
}

.toc a {
    text-decoration: none;
    color: #3498db;
}

.toc a:hover {
    text-decoration: underline;
}

/* Code blocks */
pre {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    padding: 15px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    line-height: 1.4;
}

code {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 3px;
    padding: 2px 4px;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
}

/* Tables */
table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
    font-size: 10pt;
}

th, td {
    border: 1px solid #dee2e6;
    padding: 8px 12px;
    text-align: left;
}

th {
    background-color: #f8f9fa;
    font-weight: bold;
    color: #2c3e50;
}

tr:nth-child(even) {
    background-color: #f8f9fa;
}

/* Blockquotes */
blockquote {
    border-left: 4px solid #3498db;
    margin: 20px 0;
    padding: 10px 20px;
    background-color: #f8f9fa;
    font-style: italic;
}

/* Lists */
ul, ol {
    margin: 15px 0;
    padding-left: 30px;
}

li {
    margin: 5px 0;
}

/* Links */
a {
    color: #3498db;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

/* Alerts and callouts */
.alert {
    border: 1px solid;
    border-radius: 5px;
    padding: 15px;
    margin: 20px 0;
}

.alert-info {
    background-color: #d1ecf1;
    border-color: #bee5eb;
    color: #0c5460;
}

.alert-warning {
    background-color: #fff3cd;
    border-color: #ffeaa7;
    color: #856404;
}

.alert-danger {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
}

.alert-success {
    background-color: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
}

/* Page breaks */
.page-break {
    page-break-before: always;
}

/* No page break */
.no-break {
    page-break-inside: avoid;
}

/* Header styles */
.header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #3498db;
}

.header h1 {
    border: none;
    margin: 0;
    color: #2c3e50;
    font-size: 28pt;
}

.header .subtitle {
    color: #7f8c8d;
    font-size: 14pt;
    margin-top: 10px;
}

.header .version {
    color: #95a5a6;
    font-size: 12pt;
    margin-top: 5px;
}

/* Footer */
.footer {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 1px solid #ecf0f1;
    text-align: center;
    color: #7f8c8d;
    font-size: 10pt;
}

/* Print-specific styles */
@media print {
    body {
        font-size: 10pt;
    }
    
    h1 {
        font-size: 20pt;
    }
    
    h2 {
        font-size: 16pt;
    }
    
    h3 {
        font-size: 12pt;
    }
    
    .no-print {
        display: none;
    }
}
EOF

    log_success "PDF CSS generated"
}

# Generate PDF from markdown using pandoc
generate_pdf_pandoc() {
    local input_file="$1"
    local output_file="$2"
    local title="$3"
    
    log_info "Generating PDF: $title"
    
    pandoc "$input_file" \
        --pdf-engine=xelatex \
        --template="$TEMP_DIR/pdf-template.tex" \
        --css="$TEMP_DIR/pdf-style.css" \
        --toc \
        --toc-depth=3 \
        --number-sections \
        --highlight-style=tango \
        --metadata title="$title" \
        --metadata author="Jupiter SIEM Team" \
        --metadata date="$(date '+%B %Y')" \
        --variable geometry:margin=2cm \
        --variable fontsize=11pt \
        --variable documentclass=article \
        --variable papersize=a4 \
        --variable colorlinks=true \
        --variable linkcolor=blue \
        --variable urlcolor=blue \
        --variable toccolor=black \
        -o "$output_file"
    
    if [ $? -eq 0 ]; then
        log_success "PDF generated: $output_file"
    else
        log_error "Failed to generate PDF: $output_file"
        return 1
    fi
}

# Generate PDF using wkhtmltopdf (if available)
generate_pdf_wkhtmltopdf() {
    local input_file="$1"
    local output_file="$2"
    local title="$3"
    
    if ! command -v wkhtmltopdf &> /dev/null; then
        return 1
    fi
    
    log_info "Generating PDF with wkhtmltopdf: $title"
    
    # Convert markdown to HTML first
    local html_file="$TEMP_DIR/$(basename "$input_file" .md).html"
    pandoc "$input_file" \
        --css="$TEMP_DIR/pdf-style.css" \
        --toc \
        --toc-depth=3 \
        --number-sections \
        --highlight-style=tango \
        --metadata title="$title" \
        --metadata author="Jupiter SIEM Team" \
        --metadata date="$(date '+%B %Y')" \
        -o "$html_file"
    
    # Convert HTML to PDF
    wkhtmltopdf \
        --page-size A4 \
        --margin-top 2cm \
        --margin-right 2cm \
        --margin-bottom 2cm \
        --margin-left 2cm \
        --header-center "Jupiter SIEM Documentation" \
        --header-font-size 10 \
        --header-spacing 5 \
        --footer-center "Page [page] of [topage]" \
        --footer-font-size 10 \
        --footer-spacing 5 \
        --enable-local-file-access \
        --print-media-type \
        "$html_file" "$output_file"
    
    if [ $? -eq 0 ]; then
        log_success "PDF generated: $output_file"
    else
        log_error "Failed to generate PDF: $output_file"
        return 1
    fi
}

# Generate LaTeX template for pandoc
generate_latex_template() {
    log_info "Generating LaTeX template..."
    
    cat > "$TEMP_DIR/pdf-template.tex" << 'EOF'
\documentclass[$if(fontsize)$$fontsize$$else$11pt$endif$,$if(papersize)$$papersize$$else$a4paper$endif$]{article}

% Packages
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{fancyhdr}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{listings}
\usepackage{tcolorbox}
\usepackage{tocloft}
\usepackage{enumitem}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{array}
\usepackage{calc}
\usepackage{multirow}
\usepackage{wrapfig}
\usepackage{float}
\usepackage{colortbl}
\usepackage{pdflscape}
\usepackage{tabu}
\usepackage{threeparttable}
\usepackage{threeparttablex}
\usepackage{makecell}
\usepackage{xltabular}

% Geometry
\geometry{$if(geometry)$$geometry$$else$margin=2cm$endif$}

% Hyperref setup
\hypersetup{
    colorlinks=true,
    linkcolor=$if(linkcolor)$$linkcolor$$else$blue$endif$,
    urlcolor=$if(urlcolor)$$urlcolor$$else$blue$endif$,
    citecolor=$if(citecolor)$$citecolor$$else$blue$endif$,
    bookmarksnumbered=true,
    bookmarksopen=true,
    pdfstartview=FitH
}

% Header and footer
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{Jupiter SIEM Documentation}
\fancyhead[R]{\thepage}
\fancyfoot[C]{Page \thepage\ of \pageref{LastPage}}

% Code listing setup
\lstset{
    basicstyle=\ttfamily\small,
    breaklines=true,
    frame=single,
    numbers=left,
    numberstyle=\tiny,
    stepnumber=1,
    numbersep=5pt,
    backgroundcolor=\color{gray!10},
    showspaces=false,
    showstringspaces=false,
    showtabs=false,
    tabsize=2,
    captionpos=b,
    breakatwhitespace=false,
    breakautoindent=true,
    escapeinside={\%*}{*)}
}

% Custom colors
\definecolor{jupiterblue}{RGB}{52, 152, 219}
\definecolor{jupitergray}{RGB}{52, 73, 94}
\definecolor{jupiterlightgray}{RGB}{236, 240, 241}

% Title page
\title{\Huge\textbf{Jupiter SIEM}\\\Large$if(title)$$title$$else$Documentation$endif$}
\author{Jupiter SIEM Team}
\date{$if(date)$$date$$else$\today$endif$}

\begin{document}

% Title page
\maketitle
\thispagestyle{empty}
\newpage

% Table of contents
\tableofcontents
\newpage

% Content
$body$

\end{document}
EOF

    log_success "LaTeX template generated"
}

# Generate all PDFs
generate_all_pdfs() {
    log_info "Generating all PDF documentation..."
    
    # User Guide
    if [ -f "$DOCS_DIR/user-guide/README.md" ]; then
        generate_pdf_pandoc \
            "$DOCS_DIR/user-guide/README.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-User-Guide.pdf" \
            "User Guide"
    fi
    
    # Admin Guide
    if [ -f "$DOCS_DIR/admin-guide/README.md" ]; then
        generate_pdf_pandoc \
            "$DOCS_DIR/admin-guide/README.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Admin-Guide.pdf" \
            "Admin Guide"
    fi
    
    # Developer Guide
    if [ -f "$DOCS_DIR/developer-guide/README.md" ]; then
        generate_pdf_pandoc \
            "$DOCS_DIR/developer-guide/README.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Developer-Guide.pdf" \
            "Developer Guide"
    fi
    
    # Security Guide
    if [ -f "$DOCS_DIR/security-guide/README.md" ]; then
        generate_pdf_pandoc \
            "$DOCS_DIR/security-guide/README.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Security-Guide.pdf" \
            "Security Guide"
    fi
    
    # Reference Library
    if [ -f "$DOCS_DIR/reference-library/README.md" ]; then
        generate_pdf_pandoc \
            "$DOCS_DIR/reference-library/README.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Reference-Library.pdf" \
            "Reference Library"
    fi
    
    # Complete Documentation Set
    if [ -f "$DOCS_DIR/README.md" ]; then
        generate_pdf_pandoc \
            "$DOCS_DIR/README.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Complete-Documentation.pdf" \
            "Complete Documentation"
    fi
    
    log_success "All PDFs generated successfully"
}

# Generate individual volume PDFs with all content
generate_volume_pdfs() {
    log_info "Generating comprehensive volume PDFs..."
    
    # User Guide - Combine all files
    if [ -d "$DOCS_DIR/user-guide" ]; then
        log_info "Generating comprehensive User Guide PDF..."
        find "$DOCS_DIR/user-guide" -name "*.md" -type f | sort | xargs cat > "$TEMP_DIR/user-guide-complete.md"
        generate_pdf_pandoc \
            "$TEMP_DIR/user-guide-complete.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-User-Guide-Complete.pdf" \
            "User Guide - Complete"
    fi
    
    # Admin Guide - Combine all files
    if [ -d "$DOCS_DIR/admin-guide" ]; then
        log_info "Generating comprehensive Admin Guide PDF..."
        find "$DOCS_DIR/admin-guide" -name "*.md" -type f | sort | xargs cat > "$TEMP_DIR/admin-guide-complete.md"
        generate_pdf_pandoc \
            "$TEMP_DIR/admin-guide-complete.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Admin-Guide-Complete.pdf" \
            "Admin Guide - Complete"
    fi
    
    # Developer Guide - Combine all files
    if [ -d "$DOCS_DIR/developer-guide" ]; then
        log_info "Generating comprehensive Developer Guide PDF..."
        find "$DOCS_DIR/developer-guide" -name "*.md" -type f | sort | xargs cat > "$TEMP_DIR/developer-guide-complete.md"
        generate_pdf_pandoc \
            "$TEMP_DIR/developer-guide-complete.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Developer-Guide-Complete.pdf" \
            "Developer Guide - Complete"
    fi
    
    # Security Guide - Combine all files
    if [ -d "$DOCS_DIR/security-guide" ]; then
        log_info "Generating comprehensive Security Guide PDF..."
        find "$DOCS_DIR/security-guide" -name "*.md" -type f | sort | xargs cat > "$TEMP_DIR/security-guide-complete.md"
        generate_pdf_pandoc \
            "$TEMP_DIR/security-guide-complete.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Security-Guide-Complete.pdf" \
            "Security Guide - Complete"
    fi
    
    # Reference Library - Combine all files
    if [ -d "$DOCS_DIR/reference-library" ]; then
        log_info "Generating comprehensive Reference Library PDF..."
        find "$DOCS_DIR/reference-library" -name "*.md" -type f | sort | xargs cat > "$TEMP_DIR/reference-library-complete.md"
        generate_pdf_pandoc \
            "$TEMP_DIR/reference-library-complete.md" \
            "$OUTPUT_DIR/Jupiter-SIEM-Reference-Library-Complete.pdf" \
            "Reference Library - Complete"
    fi
    
    log_success "Comprehensive volume PDFs generated"
}

# Create PDF index
create_pdf_index() {
    log_info "Creating PDF index..."
    
    cat > "$OUTPUT_DIR/README.md" << 'EOF'
# Jupiter SIEM Documentation - PDF Versions

## 📚 Available PDF Documents

### Individual Volumes
- **[User Guide](./Jupiter-SIEM-User-Guide.pdf)** - End-user documentation and procedures
- **[Admin Guide](./Jupiter-SIEM-Admin-Guide.pdf)** - System administration and deployment
- **[Developer Guide](./Jupiter-SIEM-Developer-Guide.pdf)** - Development and integration
- **[Security Guide](./Jupiter-SIEM-Security-Guide.pdf)** - Security architecture and compliance
- **[Reference Library](./Jupiter-SIEM-Reference-Library.pdf)** - Quick references and examples

### Complete Volumes
- **[User Guide - Complete](./Jupiter-SIEM-User-Guide-Complete.pdf)** - Full user documentation
- **[Admin Guide - Complete](./Jupiter-SIEM-Admin-Guide-Complete.pdf)** - Full admin documentation
- **[Developer Guide - Complete](./Jupiter-SIEM-Developer-Guide-Complete.pdf)** - Full developer documentation
- **[Security Guide - Complete](./Jupiter-SIEM-Security-Guide-Complete.pdf)** - Full security documentation
- **[Reference Library - Complete](./Jupiter-SIEM-Reference-Library-Complete.pdf)** - Full reference documentation

### Complete Documentation Set
- **[Complete Documentation](./Jupiter-SIEM-Complete-Documentation.pdf)** - All documentation in one PDF

## 📋 Document Information

| Document | Pages | Size | Last Updated |
|----------|-------|------|--------------|
| User Guide | ~150 | ~5MB | December 2024 |
| Admin Guide | ~200 | ~8MB | December 2024 |
| Developer Guide | ~300 | ~12MB | December 2024 |
| Security Guide | ~400 | ~15MB | December 2024 |
| Reference Library | ~250 | ~10MB | December 2024 |

## 🖨️ Printing Guidelines

### Recommended Print Settings
- **Paper Size**: A4
- **Orientation**: Portrait
- **Margins**: 2cm (0.8 inches)
- **Color**: Black and white (for cost efficiency)
- **Quality**: Standard

### Print-Friendly Features
- All PDFs include page numbers
- Table of contents with clickable links
- Cross-references and internal links
- Optimized for both screen and print viewing

## 📱 Viewing Recommendations

### Desktop Viewing
- **Adobe Acrobat Reader**: Full feature support
- **Chrome/Edge PDF Viewer**: Good for quick viewing
- **Firefox PDF Viewer**: Basic viewing support

### Mobile Viewing
- **iOS**: Built-in PDF viewer or Adobe Acrobat Reader
- **Android**: Google PDF Viewer or Adobe Acrobat Reader

## 🔄 Updates

These PDF documents are generated from the source Markdown files. To update:

1. Modify the source Markdown files in the `docs/manuals/` directory
2. Run the PDF generation script: `./scripts/generate-pdfs.sh`
3. The PDFs will be automatically regenerated with the latest content

## 📞 Support

For questions about the documentation:
- Check the [online documentation](https://docs.projectjupiter.in)
- Contact the documentation team
- Submit issues via GitHub

---

**Jupiter SIEM Documentation Team**  
*Last Updated: December 2024*
EOF

    log_success "PDF index created"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
    log_success "Cleanup completed"
}

# Main function
main() {
    log_info "Starting Jupiter SIEM PDF generation..."
    
    # Check if we're in the right directory
    if [ ! -d "$DOCS_DIR" ]; then
        log_error "Documentation directory not found: $DOCS_DIR"
        exit 1
    fi
    
    # Run the generation process
    check_dependencies
    setup_directories
    generate_pdf_css
    generate_latex_template
    generate_all_pdfs
    generate_volume_pdfs
    create_pdf_index
    
    # Show results
    log_success "PDF generation completed successfully!"
    echo
    log_info "Generated PDFs:"
    ls -la "$OUTPUT_DIR"/*.pdf 2>/dev/null || log_warning "No PDFs found in output directory"
    echo
    log_info "Output directory: $OUTPUT_DIR"
    
    # Cleanup
    cleanup
    
    log_success "All done! PDF documentation is ready for distribution."
}

# Run main function
main "$@"

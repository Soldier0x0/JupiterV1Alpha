#!/usr/bin/env python3
"""
Jupiter SIEM Documentation Cross-Reference Generator
Generates an integrated knowledge system with smart cross-references
"""

import os
import re
import json
import yaml
from pathlib import Path
from typing import Dict, List, Set, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class DocumentReference:
    """Represents a document reference"""
    title: str
    path: str
    volume: str
    section: str
    keywords: List[str]
    content_type: str
    target_audience: List[str]
    last_updated: str

@dataclass
class CrossReference:
    """Represents a cross-reference between documents"""
    source_doc: str
    target_doc: str
    source_section: str
    target_section: str
    reference_type: str
    context: str
    confidence: float

class DocumentationAnalyzer:
    """Analyzes documentation and generates cross-references"""
    
    def __init__(self, docs_dir: str):
        self.docs_dir = Path(docs_dir)
        self.documents: Dict[str, DocumentReference] = {}
        self.cross_references: List[CrossReference] = []
        self.keyword_index: Dict[str, List[str]] = {}
        self.volume_structure = {
            'user-guide': {
                'name': 'User Guide',
                'audience': ['end-users', 'security-analysts', 'soc-operators'],
                'level': 'beginner'
            },
            'admin-guide': {
                'name': 'Admin Guide',
                'audience': ['system-administrators', 'it-managers', 'devops-engineers'],
                'level': 'intermediate'
            },
            'developer-guide': {
                'name': 'Developer Guide',
                'audience': ['developers', 'integrators', 'contributors'],
                'level': 'advanced'
            },
            'security-guide': {
                'name': 'Security Guide',
                'audience': ['security-architects', 'compliance-officers', 'auditors'],
                'level': 'expert'
            },
            'reference-library': {
                'name': 'Reference Library',
                'audience': ['all-users'],
                'level': 'all'
            }
        }
        
        # Define content type patterns
        self.content_patterns = {
            'troubleshooting': [
                r'troubleshoot', r'problem', r'issue', r'error', r'fix', r'solution',
                r'debug', r'diagnose', r'resolve'
            ],
            'configuration': [
                r'config', r'setup', r'install', r'deploy', r'configure',
                r'settings', r'options', r'parameters'
            ],
            'api': [
                r'api', r'endpoint', r'request', r'response', r'http',
                r'rest', r'graphql', r'sdk'
            ],
            'security': [
                r'security', r'auth', r'permission', r'access', r'encrypt',
                r'compliance', r'audit', r'vulnerability'
            ],
            'monitoring': [
                r'monitor', r'log', r'alert', r'metric', r'dashboard',
                r'report', r'analytics'
            ],
            'development': [
                r'develop', r'code', r'programming', r'integration',
                r'custom', r'extend', r'contribute'
            ]
        }
        
        # Define keyword relationships
        self.keyword_relationships = {
            'authentication': ['login', 'password', '2fa', 'mfa', 'sso', 'jwt'],
            'deployment': ['install', 'setup', 'configure', 'docker', 'production'],
            'troubleshooting': ['error', 'problem', 'issue', 'debug', 'fix'],
            'security': ['encryption', 'permissions', 'compliance', 'audit'],
            'monitoring': ['logs', 'alerts', 'metrics', 'dashboard'],
            'api': ['endpoints', 'requests', 'responses', 'sdk'],
            'database': ['sql', 'query', 'schema', 'migration'],
            'user-management': ['users', 'roles', 'permissions', 'rbac']
        }

    def analyze_documentation(self) -> None:
        """Analyze all documentation files and build the knowledge base"""
        print("🔍 Analyzing documentation structure...")
        
        # Scan all markdown files
        for md_file in self.docs_dir.rglob("*.md"):
            if self._should_analyze_file(md_file):
                self._analyze_file(md_file)
        
        print(f"📚 Analyzed {len(self.documents)} documents")
        
        # Generate cross-references
        print("🔗 Generating cross-references...")
        self._generate_cross_references()
        
        print(f"🔗 Generated {len(self.cross_references)} cross-references")
        
        # Build keyword index
        print("📝 Building keyword index...")
        self._build_keyword_index()
        
        print(f"📝 Indexed {len(self.keyword_index)} keywords")

    def _should_analyze_file(self, file_path: Path) -> bool:
        """Determine if a file should be analyzed"""
        # Skip certain files
        skip_patterns = [
            'README.md',
            'index.md',
            'templates/',
            'scripts/',
            'assets/',
            '.git/'
        ]
        
        file_str = str(file_path)
        return not any(pattern in file_str for pattern in skip_patterns)

    def _analyze_file(self, file_path: Path) -> None:
        """Analyze a single markdown file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract metadata
            title = self._extract_title(content, file_path)
            volume = self._determine_volume(file_path)
            section = self._extract_section(file_path)
            keywords = self._extract_keywords(content)
            content_type = self._determine_content_type(content)
            target_audience = self._determine_target_audience(volume, content)
            last_updated = self._extract_last_updated(content)
            
            # Create document reference
            doc_ref = DocumentReference(
                title=title,
                path=str(file_path.relative_to(self.docs_dir)),
                volume=volume,
                section=section,
                keywords=keywords,
                content_type=content_type,
                target_audience=target_audience,
                last_updated=last_updated
            )
            
            # Store document reference
            doc_id = str(file_path.relative_to(self.docs_dir))
            self.documents[doc_id] = doc_ref
            
        except Exception as e:
            print(f"⚠️  Error analyzing {file_path}: {e}")

    def _extract_title(self, content: str, file_path: Path) -> str:
        """Extract title from markdown content"""
        # Look for H1 header
        h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if h1_match:
            return h1_match.group(1).strip()
        
        # Fallback to filename
        return file_path.stem.replace('-', ' ').replace('_', ' ').title()

    def _determine_volume(self, file_path: Path) -> str:
        """Determine which volume a file belongs to"""
        path_parts = file_path.parts
        for part in path_parts:
            if part in self.volume_structure:
                return part
        return 'unknown'

    def _extract_section(self, file_path: Path) -> str:
        """Extract section information from file path"""
        path_parts = file_path.parts
        if len(path_parts) > 2:
            return path_parts[-2]  # Parent directory name
        return 'main'

    def _extract_keywords(self, content: str) -> List[str]:
        """Extract keywords from content"""
        keywords = set()
        
        # Extract from headers
        headers = re.findall(r'^#+\s+(.+)$', content, re.MULTILINE)
        for header in headers:
            words = re.findall(r'\b\w+\b', header.lower())
            keywords.update(words)
        
        # Extract from code blocks and inline code
        code_blocks = re.findall(r'```[\s\S]*?```', content)
        for block in code_blocks:
            words = re.findall(r'\b\w+\b', block.lower())
            keywords.update(words)
        
        # Extract from emphasis and strong text
        emphasis = re.findall(r'[*_]{1,2}([^*_]+)[*_]{1,2}', content)
        for text in emphasis:
            words = re.findall(r'\b\w+\b', text.lower())
            keywords.update(words)
        
        # Filter and clean keywords
        filtered_keywords = []
        for keyword in keywords:
            if (len(keyword) > 2 and 
                keyword.isalpha() and 
                keyword not in ['the', 'and', 'or', 'but', 'for', 'with', 'from', 'this', 'that']):
                filtered_keywords.append(keyword)
        
        return sorted(filtered_keywords)

    def _determine_content_type(self, content: str) -> str:
        """Determine the type of content based on patterns"""
        content_lower = content.lower()
        
        for content_type, patterns in self.content_patterns.items():
            for pattern in patterns:
                if re.search(pattern, content_lower):
                    return content_type
        
        return 'general'

    def _determine_target_audience(self, volume: str, content: str) -> List[str]:
        """Determine target audience based on volume and content"""
        if volume in self.volume_structure:
            return self.volume_structure[volume]['audience']
        
        # Fallback based on content analysis
        content_lower = content.lower()
        audience = []
        
        if any(word in content_lower for word in ['user', 'end-user', 'analyst']):
            audience.append('end-users')
        if any(word in content_lower for word in ['admin', 'administrator', 'deploy']):
            audience.append('system-administrators')
        if any(word in content_lower for word in ['develop', 'api', 'code', 'programming']):
            audience.append('developers')
        if any(word in content_lower for word in ['security', 'compliance', 'audit']):
            audience.append('security-professionals')
        
        return audience if audience else ['all-users']

    def _extract_last_updated(self, content: str) -> str:
        """Extract last updated date from content"""
        # Look for last updated patterns
        patterns = [
            r'last updated[:\s]+([^\n]+)',
            r'updated[:\s]+([^\n]+)',
            r'date[:\s]+([^\n]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return datetime.now().strftime('%B %Y')

    def _generate_cross_references(self) -> None:
        """Generate cross-references between documents"""
        doc_ids = list(self.documents.keys())
        
        for i, source_id in enumerate(doc_ids):
            source_doc = self.documents[source_id]
            
            for j, target_id in enumerate(doc_ids):
                if i == j:  # Skip self-reference
                    continue
                
                target_doc = self.documents[target_id]
                
                # Calculate similarity and generate cross-references
                similarity = self._calculate_similarity(source_doc, target_doc)
                
                if similarity > 0.3:  # Threshold for cross-reference
                    cross_ref = CrossReference(
                        source_doc=source_id,
                        target_doc=target_id,
                        source_section=source_doc.section,
                        target_section=target_doc.section,
                        reference_type=self._determine_reference_type(source_doc, target_doc),
                        context=self._generate_context(source_doc, target_doc),
                        confidence=similarity
                    )
                    self.cross_references.append(cross_ref)

    def _calculate_similarity(self, doc1: DocumentReference, doc2: DocumentReference) -> float:
        """Calculate similarity between two documents"""
        # Keyword overlap
        keywords1 = set(doc1.keywords)
        keywords2 = set(doc2.keywords)
        keyword_overlap = len(keywords1.intersection(keywords2)) / len(keywords1.union(keywords2))
        
        # Content type similarity
        content_type_similarity = 1.0 if doc1.content_type == doc2.content_type else 0.0
        
        # Audience overlap
        audience1 = set(doc1.target_audience)
        audience2 = set(doc2.target_audience)
        audience_overlap = len(audience1.intersection(audience2)) / len(audience1.union(audience2))
        
        # Volume relationship
        volume_similarity = self._calculate_volume_similarity(doc1.volume, doc2.volume)
        
        # Weighted average
        similarity = (
            keyword_overlap * 0.4 +
            content_type_similarity * 0.2 +
            audience_overlap * 0.2 +
            volume_similarity * 0.2
        )
        
        return similarity

    def _calculate_volume_similarity(self, volume1: str, volume2: str) -> float:
        """Calculate similarity between volumes"""
        if volume1 == volume2:
            return 1.0
        
        # Define volume relationships
        relationships = {
            ('user-guide', 'admin-guide'): 0.7,
            ('admin-guide', 'developer-guide'): 0.6,
            ('developer-guide', 'security-guide'): 0.5,
            ('user-guide', 'reference-library'): 0.8,
            ('admin-guide', 'reference-library'): 0.8,
            ('developer-guide', 'reference-library'): 0.8,
            ('security-guide', 'reference-library'): 0.8,
        }
        
        # Check both directions
        key1 = (volume1, volume2)
        key2 = (volume2, volume1)
        
        return relationships.get(key1, relationships.get(key2, 0.0))

    def _determine_reference_type(self, source: DocumentReference, target: DocumentReference) -> str:
        """Determine the type of cross-reference"""
        if source.volume == target.volume:
            return 'internal'
        elif source.content_type == target.content_type:
            return 'related-content'
        elif any(audience in target.target_audience for audience in source.target_audience):
            return 'audience-specific'
        else:
            return 'general'

    def _generate_context(self, source: DocumentReference, target: DocumentReference) -> str:
        """Generate context for the cross-reference"""
        common_keywords = set(source.keywords).intersection(set(target.keywords))
        
        if common_keywords:
            return f"Related to: {', '.join(list(common_keywords)[:3])}"
        elif source.content_type == target.content_type:
            return f"Similar {source.content_type} content"
        else:
            return "Related documentation"

    def _build_keyword_index(self) -> None:
        """Build keyword index for search functionality"""
        for doc_id, doc in self.documents.items():
            for keyword in doc.keywords:
                if keyword not in self.keyword_index:
                    self.keyword_index[keyword] = []
                self.keyword_index[keyword].append(doc_id)

    def generate_knowledge_base(self) -> Dict:
        """Generate the complete knowledge base"""
        return {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_documents': len(self.documents),
                'total_cross_references': len(self.cross_references),
                'total_keywords': len(self.keyword_index),
                'version': '1.0'
            },
            'documents': {doc_id: asdict(doc) for doc_id, doc in self.documents.items()},
            'cross_references': [asdict(ref) for ref in self.cross_references],
            'keyword_index': self.keyword_index,
            'volume_structure': self.volume_structure
        }

    def generate_cross_reference_markdown(self) -> str:
        """Generate markdown with cross-references"""
        markdown = []
        
        # Header
        markdown.append("# 🔗 Jupiter SIEM - Cross-Reference Index")
        markdown.append("")
        markdown.append("*Automatically generated cross-reference system*")
        markdown.append("")
        markdown.append(f"**Generated:** {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
        markdown.append(f"**Total Documents:** {len(self.documents)}")
        markdown.append(f"**Total Cross-References:** {len(self.cross_references)}")
        markdown.append("")
        
        # Document index by volume
        markdown.append("## 📚 Document Index by Volume")
        markdown.append("")
        
        volumes = {}
        for doc_id, doc in self.documents.items():
            if doc.volume not in volumes:
                volumes[doc.volume] = []
            volumes[doc.volume].append((doc_id, doc))
        
        for volume, docs in volumes.items():
            volume_info = self.volume_structure.get(volume, {'name': volume.title()})
            markdown.append(f"### {volume_info['name']}")
            markdown.append("")
            
            for doc_id, doc in sorted(docs, key=lambda x: x[1].title):
                markdown.append(f"- **[{doc.title}]({doc.path})**")
                markdown.append(f"  - *{doc.content_type.title()}* | *{', '.join(doc.target_audience)}*")
                markdown.append(f"  - Keywords: {', '.join(doc.keywords[:5])}")
                markdown.append("")
        
        # Cross-references by type
        markdown.append("## 🔗 Cross-References by Type")
        markdown.append("")
        
        ref_types = {}
        for ref in self.cross_references:
            if ref.reference_type not in ref_types:
                ref_types[ref.reference_type] = []
            ref_types[ref.reference_type].append(ref)
        
        for ref_type, refs in ref_types.items():
            markdown.append(f"### {ref_type.replace('-', ' ').title()}")
            markdown.append("")
            
            for ref in sorted(refs, key=lambda x: x.confidence, reverse=True)[:20]:  # Top 20
                source_doc = self.documents[ref.source_doc]
                target_doc = self.documents[ref.target_doc]
                
                markdown.append(f"- **[{source_doc.title}]({source_doc.path})** → **[{target_doc.title}]({target_doc.path})**")
                markdown.append(f"  - *{ref.context}* (Confidence: {ref.confidence:.2f})")
                markdown.append("")
        
        # Keyword search index
        markdown.append("## 🔍 Keyword Search Index")
        markdown.append("")
        markdown.append("*Click on any keyword to see related documents*")
        markdown.append("")
        
        # Group keywords by first letter
        keywords_by_letter = {}
        for keyword in sorted(self.keyword_index.keys()):
            first_letter = keyword[0].upper()
            if first_letter not in keywords_by_letter:
                keywords_by_letter[first_letter] = []
            keywords_by_letter[first_letter].append(keyword)
        
        for letter, keywords in sorted(keywords_by_letter.items()):
            markdown.append(f"### {letter}")
            markdown.append("")
            
            for keyword in keywords:
                doc_count = len(self.keyword_index[keyword])
                markdown.append(f"- **{keyword}** ({doc_count} documents)")
                for doc_id in self.keyword_index[keyword][:5]:  # Show first 5
                    doc = self.documents[doc_id]
                    markdown.append(f"  - [{doc.title}]({doc.path})")
                if len(self.keyword_index[keyword]) > 5:
                    markdown.append(f"  - ... and {len(self.keyword_index[keyword]) - 5} more")
                markdown.append("")
        
        return "\n".join(markdown)

    def save_knowledge_base(self, output_dir: str) -> None:
        """Save the knowledge base to files"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Save JSON knowledge base
        kb = self.generate_knowledge_base()
        with open(output_path / 'knowledge-base.json', 'w', encoding='utf-8') as f:
            json.dump(kb, f, indent=2, ensure_ascii=False)
        
        # Save cross-reference markdown
        cross_ref_md = self.generate_cross_reference_markdown()
        with open(output_path / 'cross-references.md', 'w', encoding='utf-8') as f:
            f.write(cross_ref_md)
        
        # Save individual volume cross-references
        self._save_volume_cross_references(output_path)
        
        print(f"💾 Knowledge base saved to: {output_path}")

    def _save_volume_cross_references(self, output_path: Path) -> None:
        """Save cross-references organized by volume"""
        for volume in self.volume_structure.keys():
            volume_docs = [doc_id for doc_id, doc in self.documents.items() if doc.volume == volume]
            volume_refs = [ref for ref in self.cross_references if ref.source_doc in volume_docs]
            
            if volume_refs:
                volume_info = self.volume_structure[volume]
                markdown = []
                
                markdown.append(f"# {volume_info['name']} - Cross-References")
                markdown.append("")
                markdown.append(f"*Cross-references for {volume_info['name']} documents*")
                markdown.append("")
                
                for ref in sorted(volume_refs, key=lambda x: x.confidence, reverse=True):
                    source_doc = self.documents[ref.source_doc]
                    target_doc = self.documents[ref.target_doc]
                    
                    markdown.append(f"- **[{source_doc.title}]({source_doc.path})** → **[{target_doc.title}]({target_doc.path})**")
                    markdown.append(f"  - *{ref.context}* (Confidence: {ref.confidence:.2f})")
                    markdown.append("")
                
                with open(output_path / f'{volume}-cross-references.md', 'w', encoding='utf-8') as f:
                    f.write('\n'.join(markdown))

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate Jupiter SIEM documentation cross-references')
    parser.add_argument('--docs-dir', default='docs/manuals', help='Documentation directory')
    parser.add_argument('--output-dir', default='docs/manuals/cross-references', help='Output directory')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    print("🚀 Jupiter SIEM Cross-Reference Generator")
    print("=" * 50)
    
    # Initialize analyzer
    analyzer = DocumentationAnalyzer(args.docs_dir)
    
    # Analyze documentation
    analyzer.analyze_documentation()
    
    # Save knowledge base
    analyzer.save_knowledge_base(args.output_dir)
    
    print("\n✅ Cross-reference generation completed!")
    print(f"📁 Output directory: {args.output_dir}")
    print("📄 Generated files:")
    print("  - knowledge-base.json (Complete knowledge base)")
    print("  - cross-references.md (Main cross-reference index)")
    print("  - [volume]-cross-references.md (Volume-specific references)")

if __name__ == '__main__':
    main()

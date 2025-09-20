// OCSF Schema definitions for JupiterEmerge SIEM
// Based on OCSF 1.0.0 specification

export const OCSF_FIELD_TYPES = {
  STRING: 'string',
  INTEGER: 'integer',
  FLOAT: 'float',
  BOOLEAN: 'boolean',
  TIMESTAMP: 'timestamp',
  IP_ADDRESS: 'ip_address',
  MAC_ADDRESS: 'mac_address',
  EMAIL: 'email',
  URL: 'url',
  JSON: 'json',
  ARRAY: 'array',
  OBJECT: 'object'
};

export const OCSF_CATEGORIES = {
  ACTIVITY: 'activity',
  DATA_SOURCE: 'data_source',
  TARGET: 'target',
  TIME: 'time',
  NETWORK: 'network',
  USER: 'user',
  DEVICE: 'device',
  FILE: 'file',
  PROCESS: 'process',
  REGISTRY: 'registry',
  CLOUD: 'cloud',
  SECURITY: 'security',
  EMAIL: 'email',
  DNS: 'dns',
  HTTP: 'http',
  KERNEL: 'kernel',
  MEMORY: 'memory',
  SCHEDULED_JOB: 'scheduled_job',
  SYSTEM: 'system',
  VULNERABILITY: 'vulnerability',
  FINDINGS: 'findings',
  COMPLIANCE: 'compliance',
  INCIDENT: 'incident'
};

// OCSF Field definitions organized by category
export const OCSF_FIELDS = {
  [OCSF_CATEGORIES.ACTIVITY]: [
    {
      name: 'activity_id',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'Unique identifier for the activity',
      examples: [1, 2, 3],
      required: true
    },
    {
      name: 'activity_name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Human-readable name of the activity',
      examples: ['failed_login', 'file_created', 'process_started'],
      required: true
    },
    {
      name: 'category_uid',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'Category unique identifier',
      examples: [1, 2, 3],
      required: true
    },
    {
      name: 'class_uid',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'Class unique identifier',
      examples: [1001, 1002, 1003],
      required: true
    },
    {
      name: 'severity_id',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'Severity level identifier',
      examples: [1, 2, 3, 4, 5],
      required: false
    },
    {
      name: 'severity',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Severity level name',
      examples: ['informational', 'low', 'medium', 'high', 'critical'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.TIME]: [
    {
      name: 'time',
      type: OCSF_FIELD_TYPES.TIMESTAMP,
      description: 'Event timestamp',
      examples: ['2024-01-01T12:00:00Z'],
      required: true
    },
    {
      name: 'start_time',
      type: OCSF_FIELD_TYPES.TIMESTAMP,
      description: 'Activity start time',
      examples: ['2024-01-01T12:00:00Z'],
      required: false
    },
    {
      name: 'end_time',
      type: OCSF_FIELD_TYPES.TIMESTAMP,
      description: 'Activity end time',
      examples: ['2024-01-01T12:05:00Z'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.USER]: [
    {
      name: 'user.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'User name',
      examples: ['john.doe', 'admin', 'service_account'],
      required: false
    },
    {
      name: 'user.uid',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'User unique identifier',
      examples: ['S-1-5-21-1234567890-1234567890-1234567890-1001'],
      required: false
    },
    {
      name: 'user.type',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'User account type',
      examples: ['User', 'Admin', 'System', 'Other'],
      required: false
    },
    {
      name: 'user.domain',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'User domain',
      examples: ['corp.local', 'example.com'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.DEVICE]: [
    {
      name: 'device.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Device name',
      examples: ['WORKSTATION-01', 'SERVER-01'],
      required: false
    },
    {
      name: 'device.ip',
      type: OCSF_FIELD_TYPES.IP_ADDRESS,
      description: 'Device IP address',
      examples: ['192.168.1.100', '10.0.0.5'],
      required: false
    },
    {
      name: 'device.mac',
      type: OCSF_FIELD_TYPES.MAC_ADDRESS,
      description: 'Device MAC address',
      examples: ['00:11:22:33:44:55'],
      required: false
    },
    {
      name: 'device.os.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Operating system name',
      examples: ['Windows', 'Linux', 'macOS'],
      required: false
    },
    {
      name: 'device.os.version',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Operating system version',
      examples: ['10.0.19041', 'Ubuntu 20.04'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.NETWORK]: [
    {
      name: 'src_endpoint.ip',
      type: OCSF_FIELD_TYPES.IP_ADDRESS,
      description: 'Source IP address',
      examples: ['192.168.1.100', '10.0.0.5'],
      required: false
    },
    {
      name: 'src_endpoint.port',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'Source port number',
      examples: [80, 443, 22, 3389],
      required: false
    },
    {
      name: 'dst_endpoint.ip',
      type: OCSF_FIELD_TYPES.IP_ADDRESS,
      description: 'Destination IP address',
      examples: ['192.168.1.200', '8.8.8.8'],
      required: false
    },
    {
      name: 'dst_endpoint.port',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'Destination port number',
      examples: [80, 443, 22, 3389],
      required: false
    },
    {
      name: 'network_protocol',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Network protocol',
      examples: ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.FILE]: [
    {
      name: 'file.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'File name',
      examples: ['document.pdf', 'script.exe', 'config.json'],
      required: false
    },
    {
      name: 'file.path',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'File path',
      examples: ['C:\\Users\\john\\Documents\\file.txt', '/home/user/file.txt'],
      required: false
    },
    {
      name: 'file.size',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'File size in bytes',
      examples: [1024, 1048576, 52428800],
      required: false
    },
    {
      name: 'file.type',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'File type',
      examples: ['PDF', 'EXE', 'TXT', 'JPG'],
      required: false
    },
    {
      name: 'file.hash.md5',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'File MD5 hash',
      examples: ['d41d8cd98f00b204e9800998ecf8427e'],
      required: false
    },
    {
      name: 'file.hash.sha256',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'File SHA256 hash',
      examples: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.PROCESS]: [
    {
      name: 'process.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Process name',
      examples: ['notepad.exe', 'chrome.exe', 'python.exe'],
      required: false
    },
    {
      name: 'process.pid',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'Process ID',
      examples: [1234, 5678, 9012],
      required: false
    },
    {
      name: 'process.cmd_line',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Process command line',
      examples: ['notepad.exe C:\\temp\\file.txt'],
      required: false
    },
    {
      name: 'process.parent.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Parent process name',
      examples: ['explorer.exe', 'cmd.exe'],
      required: false
    },
    {
      name: 'process.parent.pid',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'Parent process ID',
      examples: [1234, 5678],
      required: false
    }
  ],

  [OCSF_CATEGORIES.REGISTRY]: [
    {
      name: 'registry.key',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Registry key path',
      examples: ['HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run'],
      required: false
    },
    {
      name: 'registry.value',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Registry value name',
      examples: ['StartupProgram', 'AutoRun'],
      required: false
    },
    {
      name: 'registry.data',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Registry data value',
      examples: ['C:\\Program Files\\App\\app.exe'],
      required: false
    },
    {
      name: 'registry.data_type',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Registry data type',
      examples: ['REG_SZ', 'REG_DWORD', 'REG_BINARY'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.CLOUD]: [
    {
      name: 'cloud.provider',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Cloud service provider',
      examples: ['AWS', 'Azure', 'GCP', 'OCI'],
      required: false
    },
    {
      name: 'cloud.region',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Cloud region',
      examples: ['us-east-1', 'westeurope', 'asia-southeast1'],
      required: false
    },
    {
      name: 'cloud.account.uid',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Cloud account unique identifier',
      examples: ['123456789012', 'tenant-id-123'],
      required: false
    },
    {
      name: 'cloud.resource.uid',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Cloud resource unique identifier',
      examples: ['i-1234567890abcdef0', 'vm-12345'],
      required: false
    },
    {
      name: 'cloud.resource.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Cloud resource name',
      examples: ['web-server-01', 'database-cluster'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.EMAIL]: [
    {
      name: 'email.from',
      type: OCSF_FIELD_TYPES.EMAIL,
      description: 'Email sender address',
      examples: ['sender@example.com', 'noreply@company.com'],
      required: false
    },
    {
      name: 'email.to',
      type: OCSF_FIELD_TYPES.EMAIL,
      description: 'Email recipient address',
      examples: ['recipient@example.com', 'admin@company.com'],
      required: false
    },
    {
      name: 'email.subject',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Email subject line',
      examples: ['Security Alert', 'Password Reset Request'],
      required: false
    },
    {
      name: 'email.message_id',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Email message ID',
      examples: ['<1234567890@mail.example.com>'],
      required: false
    },
    {
      name: 'email.attachments',
      type: OCSF_FIELD_TYPES.ARRAY,
      description: 'Email attachments',
      examples: ['document.pdf', 'script.exe'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.DNS]: [
    {
      name: 'dns.question.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'DNS query name',
      examples: ['example.com', 'malicious-domain.net'],
      required: false
    },
    {
      name: 'dns.question.type',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'DNS query type',
      examples: ['A', 'AAAA', 'MX', 'TXT', 'CNAME'],
      required: false
    },
    {
      name: 'dns.answer.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'DNS answer name',
      examples: ['example.com', '192.168.1.100'],
      required: false
    },
    {
      name: 'dns.answer.data',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'DNS answer data',
      examples: ['192.168.1.100', 'mail.example.com'],
      required: false
    },
    {
      name: 'dns.response_code',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'DNS response code',
      examples: [0, 1, 2, 3, 5],
      required: false
    }
  ],

  [OCSF_CATEGORIES.HTTP]: [
    {
      name: 'http.request.method',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'HTTP request method',
      examples: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
      required: false
    },
    {
      name: 'http.request.url',
      type: OCSF_FIELD_TYPES.URL,
      description: 'HTTP request URL',
      examples: ['https://example.com/api/data', 'http://192.168.1.100/admin'],
      required: false
    },
    {
      name: 'http.request.headers',
      type: OCSF_FIELD_TYPES.JSON,
      description: 'HTTP request headers',
      examples: ['{"User-Agent": "Mozilla/5.0", "Authorization": "Bearer token"}'],
      required: false
    },
    {
      name: 'http.response.status_code',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'HTTP response status code',
      examples: [200, 301, 404, 500, 403],
      required: false
    },
    {
      name: 'http.response.headers',
      type: OCSF_FIELD_TYPES.JSON,
      description: 'HTTP response headers',
      examples: ['{"Content-Type": "application/json", "Server": "nginx"}'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.VULNERABILITY]: [
    {
      name: 'vulnerability.cve_id',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'CVE identifier',
      examples: ['CVE-2023-1234', 'CVE-2024-5678'],
      required: false
    },
    {
      name: 'vulnerability.title',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Vulnerability title',
      examples: ['Remote Code Execution in Apache HTTP Server'],
      required: false
    },
    {
      name: 'vulnerability.severity',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Vulnerability severity',
      examples: ['Critical', 'High', 'Medium', 'Low'],
      required: false
    },
    {
      name: 'vulnerability.cvss_score',
      type: OCSF_FIELD_TYPES.FLOAT,
      description: 'CVSS score',
      examples: [9.8, 7.5, 4.2, 2.1],
      required: false
    },
    {
      name: 'vulnerability.affected_software',
      type: OCSF_FIELD_TYPES.ARRAY,
      description: 'Affected software',
      examples: ['Apache HTTP Server 2.4.41', 'Windows 10'],
      required: false
    }
  ],

  [OCSF_CATEGORIES.SYSTEM]: [
    {
      name: 'system.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'System name',
      examples: ['DC01', 'WEB-SERVER-01', 'DATABASE-01'],
      required: false
    },
    {
      name: 'system.ip',
      type: OCSF_FIELD_TYPES.IP_ADDRESS,
      description: 'System IP address',
      examples: ['192.168.1.10', '10.0.0.5'],
      required: false
    },
    {
      name: 'system.os.name',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Operating system name',
      examples: ['Windows Server 2019', 'Ubuntu 20.04', 'CentOS 7'],
      required: false
    },
    {
      name: 'system.os.version',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Operating system version',
      examples: ['10.0.17763', '20.04.3 LTS', '7.9.2009'],
      required: false
    },
    {
      name: 'system.uptime',
      type: OCSF_FIELD_TYPES.INTEGER,
      description: 'System uptime in seconds',
      examples: [86400, 604800, 2592000],
      required: false
    }
  ],

  [OCSF_CATEGORIES.INCIDENT]: [
    {
      name: 'incident.uid',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Incident unique identifier',
      examples: ['INC-2024-001', 'SEC-2024-123'],
      required: false
    },
    {
      name: 'incident.title',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Incident title',
      examples: ['Malware Detection', 'Data Breach Investigation'],
      required: false
    },
    {
      name: 'incident.status',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Incident status',
      examples: ['New', 'In Progress', 'Resolved', 'Closed'],
      required: false
    },
    {
      name: 'incident.priority',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Incident priority',
      examples: ['Critical', 'High', 'Medium', 'Low'],
      required: false
    },
    {
      name: 'incident.assignee',
      type: OCSF_FIELD_TYPES.STRING,
      description: 'Incident assignee',
      examples: ['john.doe', 'security-team', 'admin'],
      required: false
    }
  ]
};

// Query operators for different field types
export const QUERY_OPERATORS = {
  [OCSF_FIELD_TYPES.STRING]: [
    { value: 'equals', label: 'Equals', description: 'Exact match' },
    { value: 'contains', label: 'Contains', description: 'Contains text' },
    { value: 'starts_with', label: 'Starts With', description: 'Begins with text' },
    { value: 'ends_with', label: 'Ends With', description: 'Ends with text' },
    { value: 'regex', label: 'Regex', description: 'Regular expression match' },
    { value: 'in', label: 'In List', description: 'Matches any value in list' },
    { value: 'not_in', label: 'Not In List', description: 'Does not match any value in list' }
  ],
  [OCSF_FIELD_TYPES.INTEGER]: [
    { value: 'equals', label: 'Equals', description: 'Exact match' },
    { value: 'not_equals', label: 'Not Equals', description: 'Not equal to' },
    { value: 'greater_than', label: 'Greater Than', description: 'Greater than value' },
    { value: 'less_than', label: 'Less Than', description: 'Less than value' },
    { value: 'greater_equal', label: 'Greater or Equal', description: 'Greater than or equal to' },
    { value: 'less_equal', label: 'Less or Equal', description: 'Less than or equal to' },
    { value: 'in', label: 'In List', description: 'Matches any value in list' },
    { value: 'between', label: 'Between', description: 'Between two values' }
  ],
  [OCSF_FIELD_TYPES.IP_ADDRESS]: [
    { value: 'equals', label: 'Equals', description: 'Exact IP match' },
    { value: 'in_subnet', label: 'In Subnet', description: 'IP in subnet (CIDR)' },
    { value: 'in', label: 'In List', description: 'Matches any IP in list' },
    { value: 'not_in', label: 'Not In List', description: 'Does not match any IP in list' }
  ],
  [OCSF_FIELD_TYPES.TIMESTAMP]: [
    { value: 'equals', label: 'Equals', description: 'Exact timestamp match' },
    { value: 'greater_than', label: 'After', description: 'After timestamp' },
    { value: 'less_than', label: 'Before', description: 'Before timestamp' },
    { value: 'between', label: 'Between', description: 'Between two timestamps' },
    { value: 'last_hour', label: 'Last Hour', description: 'Within last hour' },
    { value: 'last_day', label: 'Last Day', description: 'Within last 24 hours' },
    { value: 'last_week', label: 'Last Week', description: 'Within last 7 days' }
  ]
};

// Pre-built query templates for common security scenarios
export const QUERY_TEMPLATES = [
  // Authentication & Access Control
  {
    id: 'failed_logins',
    name: 'Failed Login Attempts',
    description: 'Find failed authentication attempts',
    category: 'Authentication',
    query: {
      activity_name: 'failed_login',
      severity: 'medium'
    },
    fields: ['activity_name', 'user.name', 'src_endpoint.ip', 'time']
  },
  {
    id: 'privilege_escalation',
    name: 'Privilege Escalation',
    description: 'Detect privilege escalation attempts',
    category: 'Authentication',
    query: {
      activity_name: 'privilege_escalation',
      severity: 'high'
    },
    fields: ['activity_name', 'user.name', 'device.name', 'severity']
  },
  {
    id: 'admin_actions',
    name: 'Administrative Actions',
    description: 'Monitor administrative user activities',
    category: 'Authentication',
    query: {
      'user.type': 'Admin',
      severity: 'medium'
    },
    fields: ['activity_name', 'user.name', 'user.type', 'time']
  },
  {
    id: 'service_account_usage',
    name: 'Service Account Usage',
    description: 'Track service account activities',
    category: 'Authentication',
    query: {
      'user.type': 'Service',
      activity_name: 'user_session_start'
    },
    fields: ['activity_name', 'user.name', 'user.type', 'device.name']
  },

  // Process & Execution Monitoring
  {
    id: 'suspicious_processes',
    name: 'Suspicious Process Execution',
    description: 'Find potentially malicious process executions',
    category: 'Process Monitoring',
    query: {
      activity_name: 'process_started',
      'process.name': ['powershell.exe', 'cmd.exe', 'wscript.exe']
    },
    fields: ['activity_name', 'process.name', 'process.cmd_line', 'device.name']
  },
  {
    id: 'lateral_movement',
    name: 'Lateral Movement Indicators',
    description: 'Detect potential lateral movement activities',
    category: 'Process Monitoring',
    query: {
      'process.name': ['psexec.exe', 'wmic.exe', 'sc.exe'],
      severity: 'high'
    },
    fields: ['activity_name', 'process.name', 'process.cmd_line', 'src_endpoint.ip']
  },
  {
    id: 'process_injection',
    name: 'Process Injection Attempts',
    description: 'Monitor for process injection techniques',
    category: 'Process Monitoring',
    query: {
      activity_name: 'process_injection',
      severity: 'critical'
    },
    fields: ['activity_name', 'process.name', 'process.parent.name', 'severity']
  },

  // File System Monitoring
  {
    id: 'file_creation',
    name: 'File Creation Events',
    description: 'Monitor file creation activities',
    category: 'File Monitoring',
    query: {
      activity_name: 'file_created'
    },
    fields: ['activity_name', 'file.name', 'file.path', 'user.name']
  },
  {
    id: 'suspicious_files',
    name: 'Suspicious File Activities',
    description: 'Monitor suspicious file operations',
    category: 'File Monitoring',
    query: {
      'file.name': ['*.exe', '*.bat', '*.ps1', '*.vbs'],
      activity_name: 'file_created'
    },
    fields: ['activity_name', 'file.name', 'file.path', 'file.hash.sha256']
  },
  {
    id: 'file_encryption',
    name: 'File Encryption Activities',
    description: 'Detect potential ransomware file encryption',
    category: 'File Monitoring',
    query: {
      activity_name: 'file_modified',
      'file.name': ['*.encrypted', '*.locked', '*.crypto']
    },
    fields: ['activity_name', 'file.name', 'file.path', 'user.name']
  },

  // Network Monitoring
  {
    id: 'network_connections',
    name: 'External Network Connections',
    description: 'Find connections to external IP addresses',
    category: 'Network Monitoring',
    query: {
      activity_name: 'network_connection',
      'dst_endpoint.ip': 'external'
    },
    fields: ['activity_name', 'src_endpoint.ip', 'dst_endpoint.ip', 'dst_endpoint.port']
  },
  {
    id: 'dns_queries',
    name: 'Suspicious DNS Queries',
    description: 'Monitor DNS queries for malicious domains',
    category: 'Network Monitoring',
    query: {
      activity_name: 'dns_query',
      'dns.question.name': 'suspicious'
    },
    fields: ['activity_name', 'dns.question.name', 'dns.question.type', 'src_endpoint.ip']
  },
  {
    id: 'port_scanning',
    name: 'Port Scanning Activities',
    description: 'Detect potential port scanning attempts',
    category: 'Network Monitoring',
    query: {
      activity_name: 'network_connection',
      'dst_endpoint.port': 'multiple'
    },
    fields: ['activity_name', 'src_endpoint.ip', 'dst_endpoint.port', 'network_protocol']
  },
  {
    id: 'http_anomalies',
    name: 'HTTP Anomalies',
    description: 'Detect suspicious HTTP activities',
    category: 'Network Monitoring',
    query: {
      'http.response.status_code': [404, 500, 403],
      'http.request.method': 'POST'
    },
    fields: ['activity_name', 'http.request.url', 'http.response.status_code', 'src_endpoint.ip']
  },

  // Registry Monitoring
  {
    id: 'registry_modifications',
    name: 'Registry Modifications',
    description: 'Monitor Windows registry changes',
    category: 'Registry Monitoring',
    query: {
      activity_name: 'registry_modified',
      'registry.key': 'startup'
    },
    fields: ['activity_name', 'registry.key', 'registry.value', 'registry.data']
  },
  {
    id: 'persistence_mechanisms',
    name: 'Persistence Mechanisms',
    description: 'Detect persistence techniques in registry',
    category: 'Registry Monitoring',
    query: {
      'registry.key': ['Run', 'RunOnce', 'Services'],
      activity_name: 'registry_created'
    },
    fields: ['activity_name', 'registry.key', 'registry.value', 'registry.data']
  },

  // Cloud Security
  {
    id: 'cloud_anomalies',
    name: 'Cloud Resource Anomalies',
    description: 'Detect unusual cloud resource activities',
    category: 'Cloud Security',
    query: {
      'cloud.provider': 'AWS',
      activity_name: 'resource_created'
    },
    fields: ['activity_name', 'cloud.resource.name', 'cloud.region', 'user.name']
  },
  {
    id: 'unauthorized_cloud_access',
    name: 'Unauthorized Cloud Access',
    description: 'Monitor unauthorized cloud resource access',
    category: 'Cloud Security',
    query: {
      'cloud.provider': 'Azure',
      severity: 'high'
    },
    fields: ['activity_name', 'cloud.resource.name', 'cloud.account.uid', 'severity']
  },

  // Email Security
  {
    id: 'phishing_emails',
    name: 'Phishing Email Detection',
    description: 'Detect potential phishing emails',
    category: 'Email Security',
    query: {
      activity_name: 'email_received',
      'email.subject': 'phishing'
    },
    fields: ['activity_name', 'email.from', 'email.subject', 'email.attachments']
  },
  {
    id: 'malicious_attachments',
    name: 'Malicious Email Attachments',
    description: 'Monitor emails with suspicious attachments',
    category: 'Email Security',
    query: {
      'email.attachments': ['*.exe', '*.bat', '*.scr'],
      activity_name: 'email_received'
    },
    fields: ['activity_name', 'email.from', 'email.attachments', 'email.subject']
  },

  // Vulnerability Management
  {
    id: 'critical_vulnerabilities',
    name: 'Critical Vulnerabilities',
    description: 'Find critical security vulnerabilities',
    category: 'Vulnerability Management',
    query: {
      'vulnerability.severity': 'Critical',
      'vulnerability.cvss_score': '>8.0'
    },
    fields: ['vulnerability.cve_id', 'vulnerability.title', 'vulnerability.severity', 'vulnerability.cvss_score']
  },
  {
    id: 'unpatched_systems',
    name: 'Unpatched Systems',
    description: 'Identify systems with known vulnerabilities',
    category: 'Vulnerability Management',
    query: {
      'vulnerability.affected_software': 'unpatched',
      severity: 'high'
    },
    fields: ['vulnerability.cve_id', 'system.name', 'vulnerability.affected_software', 'severity']
  },

  // Incident Management
  {
    id: 'open_incidents',
    name: 'Open Security Incidents',
    description: 'View all open security incidents',
    category: 'Incident Management',
    query: {
      'incident.status': 'Open',
      'incident.priority': 'High'
    },
    fields: ['incident.uid', 'incident.title', 'incident.status', 'incident.priority']
  },
  {
    id: 'critical_incidents',
    name: 'Critical Incidents',
    description: 'Find critical priority incidents',
    category: 'Incident Management',
    query: {
      'incident.priority': 'Critical',
      'incident.status': 'In Progress'
    },
    fields: ['incident.uid', 'incident.title', 'incident.assignee', 'incident.priority']
  },

  // System Monitoring
  {
    id: 'system_anomalies',
    name: 'System Anomalies',
    description: 'Detect unusual system activities',
    category: 'System Monitoring',
    query: {
      'system.uptime': '<3600',
      severity: 'medium'
    },
    fields: ['activity_name', 'system.name', 'system.uptime', 'severity']
  },
  {
    id: 'service_failures',
    name: 'Service Failures',
    description: 'Monitor service failures and restarts',
    category: 'System Monitoring',
    query: {
      activity_name: 'service_stopped',
      severity: 'high'
    },
    fields: ['activity_name', 'system.name', 'system.os.name', 'severity']
  }
];

// Helper functions
export const getFieldByCategory = (category) => {
  return OCSF_FIELDS[category] || [];
};

export const getFieldByName = (fieldName) => {
  for (const category in OCSF_FIELDS) {
    const field = OCSF_FIELDS[category].find(f => f.name === fieldName);
    if (field) return field;
  }
  return null;
};

export const getOperatorsForField = (fieldName) => {
  const field = getFieldByName(fieldName);
  if (!field) return [];
  return QUERY_OPERATORS[field.type] || [];
};

export const getFieldExamples = (fieldName) => {
  const field = getFieldByName(fieldName);
  return field ? field.examples : [];
};

export const validateFieldValue = (fieldName, value, operator) => {
  const field = getFieldByName(fieldName);
  if (!field) return { valid: false, error: 'Unknown field' };

  // Basic validation based on field type
  switch (field.type) {
    case OCSF_FIELD_TYPES.INTEGER:
      if (isNaN(value)) return { valid: false, error: 'Must be a number' };
      break;
    case OCSF_FIELD_TYPES.IP_ADDRESS:
      // Basic IP validation
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(value) && !value.includes('/')) {
        return { valid: false, error: 'Must be a valid IP address or CIDR' };
      }
      break;
    case OCSF_FIELD_TYPES.TIMESTAMP:
      if (isNaN(Date.parse(value))) {
        return { valid: false, error: 'Must be a valid timestamp' };
      }
      break;
  }

  return { valid: true };
};

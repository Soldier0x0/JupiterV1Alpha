-- Jupiter SIEM ClickHouse Database Initialization
-- Creates OCSF-compliant tables for security event storage

-- Create database
CREATE DATABASE IF NOT EXISTS jupiter_siem;
USE jupiter_siem;

-- OCSF Events Table - Main log storage
-- Partitioned by date for efficient querying and archival
CREATE TABLE IF NOT EXISTS ocsf_events (
    -- Metadata
    event_uid String,
    tenant_id String,
    time DateTime64(3),
    event_date Date MATERIALIZED toDate(time),
    
    -- OCSF Core Fields
    metadata_version String DEFAULT '1.6.0',
    class_uid UInt16,
    category_uid UInt8,
    class_name LowCardinality(String),
    category_name LowCardinality(String),
    
    -- Activity
    activity_id UInt8 DEFAULT 0,
    activity_name LowCardinality(String) DEFAULT 'Unknown',
    type_uid UInt32 DEFAULT 0,
    type_name LowCardinality(String) DEFAULT 'Unknown',
    
    -- Severity and Status
    severity LowCardinality(String) DEFAULT 'Unknown',
    severity_id UInt8 DEFAULT 0,
    status LowCardinality(String) DEFAULT 'Unknown',
    status_id UInt8 DEFAULT 0,
    
    -- Message and Description
    message String DEFAULT '',
    raw_data String DEFAULT '',
    
    -- Actor (User)
    actor_user_name String DEFAULT '',
    actor_user_uid String DEFAULT '',
    actor_user_type LowCardinality(String) DEFAULT '',
    actor_user_domain String DEFAULT '',
    actor_user_email String DEFAULT '',
    
    -- Device/Asset Information
    device_name String DEFAULT '',
    device_type LowCardinality(String) DEFAULT '',
    device_ip IPv4 DEFAULT toIPv4('0.0.0.0'),
    device_hostname String DEFAULT '',
    device_mac String DEFAULT '',
    device_os_name LowCardinality(String) DEFAULT '',
    device_os_version String DEFAULT '',
    
    -- Network Information
    src_endpoint_ip Nullable(IPv4),
    src_endpoint_port Nullable(UInt16),
    dst_endpoint_ip Nullable(IPv4),
    dst_endpoint_port Nullable(UInt16),
    network_protocol LowCardinality(String) DEFAULT '',
    network_direction LowCardinality(String) DEFAULT '',
    
    -- Process Information
    process_name String DEFAULT '',
    process_pid Nullable(UInt32),
    process_cmd_line String DEFAULT '',
    process_parent_name String DEFAULT '',
    process_parent_pid Nullable(UInt32),
    
    -- File Information
    file_name String DEFAULT '',
    file_path String DEFAULT '',
    file_size Nullable(UInt64),
    file_hash_md5 String DEFAULT '',
    file_hash_sha1 String DEFAULT '',
    file_hash_sha256 String DEFAULT '',
    
    -- Registry Information (Windows)
    registry_key String DEFAULT '',
    registry_value String DEFAULT '',
    registry_type LowCardinality(String) DEFAULT '',
    
    -- Authentication Information
    auth_method LowCardinality(String) DEFAULT '',
    auth_result LowCardinality(String) DEFAULT '',
    logon_type LowCardinality(String) DEFAULT '',
    
    -- HTTP Information
    http_method LowCardinality(String) DEFAULT '',
    http_status_code Nullable(UInt16),
    http_url String DEFAULT '',
    http_user_agent String DEFAULT '',
    http_referrer String DEFAULT '',
    
    -- DNS Information
    dns_query String DEFAULT '',
    dns_response String DEFAULT '',
    dns_type LowCardinality(String) DEFAULT '',
    
    -- Enrichment Fields
    enrichment_geo_country String DEFAULT '',
    enrichment_geo_city String DEFAULT '',
    enrichment_threat_score Nullable(Float32),
    enrichment_reputation LowCardinality(String) DEFAULT '',
    
    -- MITRE ATT&CK
    mitre_technique_id String DEFAULT '',
    mitre_technique_name String DEFAULT '',
    mitre_tactic_id String DEFAULT '',
    mitre_tactic_name String DEFAULT '',
    
    -- Compliance Fields
    compliance_frameworks Array(String) DEFAULT [],
    risk_score Nullable(Float32),
    confidence Nullable(Float32),
    
    -- Custom Fields (JSON for flexibility)
    custom_fields String DEFAULT '{}',
    
    -- Indexing and performance columns
    INDEX idx_tenant_time (tenant_id, time) TYPE minmax GRANULARITY 1,
    INDEX idx_class_activity (class_uid, activity_name) TYPE set(100) GRANULARITY 1,
    INDEX idx_severity (severity) TYPE set(10) GRANULARITY 1,
    INDEX idx_user (actor_user_name) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_device (device_name) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_src_ip (src_endpoint_ip) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_dst_ip (dst_endpoint_ip) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_process (process_name) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_file_name (file_name) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_file_hash (file_hash_sha256) TYPE bloom_filter GRANULARITY 1
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(time)
ORDER BY (tenant_id, time, class_uid, event_uid)
TTL time + INTERVAL 30 DAY TO DISK 'cold'
SETTINGS index_granularity = 8192;

-- Query Audit Table
CREATE TABLE IF NOT EXISTS query_audit (
    query_id String,
    user_id String,
    tenant_id String,
    backend LowCardinality(String),
    query_text String,
    success UInt8,
    execution_time Float32,
    result_count UInt64,
    error_message String DEFAULT '',
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, tenant_id, user_id)
TTL timestamp + INTERVAL 90 DAY
SETTINGS index_granularity = 8192;

-- System Health Table
CREATE TABLE IF NOT EXISTS system_health (
    component LowCardinality(String),
    metric_name LowCardinality(String),
    metric_value Float32,
    status LowCardinality(String),
    timestamp DateTime64(3) DEFAULT now64(),
    metadata String DEFAULT '{}'
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, component, metric_name)
TTL timestamp + INTERVAL 7 DAY
SETTINGS index_granularity = 8192;

-- Archive Audit Table
CREATE TABLE IF NOT EXISTS archive_audit (
    partition_name String,
    action LowCardinality(String), -- 'detach', 'attach', 'export', 'import'
    file_path String,
    file_size UInt64,
    record_count UInt64,
    start_date Date,
    end_date Date,
    tenant_id String,
    status LowCardinality(String),
    error_message String DEFAULT '',
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY timestamp
SETTINGS index_granularity = 8192;

-- RBAC Audit Table
CREATE TABLE IF NOT EXISTS rbac_audit (
    user_id String,
    tenant_id String,
    action LowCardinality(String), -- 'role_assigned', 'role_removed', 'permission_changed'
    old_role String DEFAULT '',
    new_role String DEFAULT '',
    changed_by String,
    timestamp DateTime64(3) DEFAULT now64(),
    metadata String DEFAULT '{}'
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, tenant_id, user_id)
TTL timestamp + INTERVAL 365 DAY
SETTINGS index_granularity = 8192;

-- Authentication Audit Table
CREATE TABLE IF NOT EXISTS auth_audit (
    user_id String,
    tenant_id String,
    action LowCardinality(String), -- 'login', 'logout', 'failed_login', 'jwt_issued', 'jwt_revoked'
    source_ip IPv4,
    user_agent String,
    success UInt8,
    failure_reason String DEFAULT '',
    session_id String DEFAULT '',
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, tenant_id, user_id)
TTL timestamp + INTERVAL 365 DAY
SETTINGS index_granularity = 8192;

-- Materialized Views for Performance

-- Hourly aggregation for dashboards
CREATE MATERIALIZED VIEW IF NOT EXISTS ocsf_events_hourly
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (tenant_id, hour, class_uid, severity)
AS SELECT
    tenant_id,
    toStartOfHour(time) as hour,
    class_uid,
    class_name,
    severity,
    count() as event_count,
    countIf(severity = 'High') as high_severity_count,
    countIf(severity = 'Critical') as critical_severity_count,
    uniqExact(actor_user_name) as unique_users,
    uniqExact(device_name) as unique_devices,
    uniqExact(src_endpoint_ip) as unique_src_ips
FROM ocsf_events
GROUP BY tenant_id, hour, class_uid, class_name, severity;

-- Top processes materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS top_processes_daily
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (tenant_id, date, process_name)
AS SELECT
    tenant_id,
    toDate(time) as date,
    process_name,
    count() as execution_count,
    countIf(severity IN ('High', 'Critical')) as suspicious_count,
    uniqExact(actor_user_name) as unique_users,
    uniqExact(device_name) as unique_devices
FROM ocsf_events
WHERE process_name != ''
GROUP BY tenant_id, date, process_name;

-- Network connections summary
CREATE MATERIALIZED VIEW IF NOT EXISTS network_connections_hourly
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (tenant_id, hour, src_endpoint_ip, dst_endpoint_ip)
AS SELECT
    tenant_id,
    toStartOfHour(time) as hour,
    src_endpoint_ip,
    dst_endpoint_ip,
    dst_endpoint_port,
    network_protocol,
    count() as connection_count,
    sum(toUInt64(file_size)) as total_bytes
FROM ocsf_events
WHERE class_uid IN (1003, 1004, 1005) -- Network-related events
  AND isNotNull(src_endpoint_ip)
  AND isNotNull(dst_endpoint_ip)
GROUP BY tenant_id, hour, src_endpoint_ip, dst_endpoint_ip, dst_endpoint_port, network_protocol;

-- Create users
CREATE USER IF NOT EXISTS jupiter_user IDENTIFIED BY 'jupiter_secure_2024';
GRANT ALL ON jupiter_siem.* TO jupiter_user;

-- Create read-only user for Grafana
CREATE USER IF NOT EXISTS jupiter_readonly IDENTIFIED BY 'jupiter_readonly_2024';
GRANT SELECT ON jupiter_siem.* TO jupiter_readonly;

-- Insert sample data for testing
INSERT INTO ocsf_events (
    event_uid, tenant_id, time, class_uid, category_uid, class_name, category_name,
    activity_name, severity, message, actor_user_name, device_name, src_endpoint_ip
) VALUES 
(
    'test_001', 'main_tenant', now() - INTERVAL 1 HOUR,
    1001, 1, 'Authentication', 'Identity & Access Management',
    'failed_login', 'Medium', 'Failed SSH login attempt',
    'john.doe', 'WORKSTATION-01', toIPv4('192.168.1.100')
),
(
    'test_002', 'main_tenant', now() - INTERVAL 30 MINUTE,
    1002, 1, 'Process Activity', 'System Activity',
    'process_started', 'High', 'Suspicious PowerShell execution',
    'admin', 'SERVER-01', toIPv4('10.0.0.50')
),
(
    'test_003', 'main_tenant', now() - INTERVAL 15 MINUTE,
    1003, 2, 'File System Activity', 'System Activity',
    'file_created', 'Critical', 'Malicious file detected',
    'user1', 'WORKSTATION-02', toIPv4('172.16.0.100')
);

-- Optimize tables
OPTIMIZE TABLE ocsf_events;
OPTIMIZE TABLE query_audit;
OPTIMIZE TABLE system_health;
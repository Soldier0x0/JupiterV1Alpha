# OCSF Query Builder

## Overview

The OCSF Query Builder is a powerful, user-friendly interface for building security log queries using the Open Cybersecurity Schema Framework (OCSF) standard. It provides both visual and text-based query building capabilities, making it accessible to both beginners and experienced security professionals.

## Features

### 🎯 **Dual Interface Modes**
- **Visual Mode**: Drag-and-drop interface with dropdowns and form fields
- **Text Mode**: Advanced text editor with syntax highlighting and auto-completion
- **Template Mode**: Pre-built queries for common security scenarios

### 📊 **OCSF Schema Integration**
- Complete OCSF field definitions organized by category
- Field validation and type checking
- Example values and descriptions for each field
- Operator suggestions based on field types

### 🔍 **Smart Query Building**
- Real-time query validation
- Field suggestions and auto-completion
- Query preview and syntax highlighting
- Performance hints and optimization suggestions

### 💾 **Query Management**
- Save and load queries
- Query history and versioning
- Share queries between team members
- Export query results in multiple formats

## OCSF Field Categories

### Activity Fields
- `activity_id`: Unique identifier for the activity
- `activity_name`: Human-readable name of the activity
- `category_uid`: Category unique identifier
- `class_uid`: Class unique identifier
- `severity_id`: Severity level identifier
- `severity`: Severity level name

### Time Fields
- `time`: Event timestamp
- `start_time`: Activity start time
- `end_time`: Activity end time

### User Fields
- `user.name`: User name
- `user.uid`: User unique identifier
- `user.type`: User account type
- `user.domain`: User domain

### Device Fields
- `device.name`: Device name
- `device.ip`: Device IP address
- `device.mac`: Device MAC address
- `device.os.name`: Operating system name
- `device.os.version`: Operating system version

### Network Fields
- `src_endpoint.ip`: Source IP address
- `src_endpoint.port`: Source port number
- `dst_endpoint.ip`: Destination IP address
- `dst_endpoint.port`: Destination port number
- `network_protocol`: Network protocol

### File Fields
- `file.name`: File name
- `file.path`: File path
- `file.size`: File size in bytes
- `file.type`: File type
- `file.hash.md5`: File MD5 hash
- `file.hash.sha256`: File SHA256 hash

### Process Fields
- `process.name`: Process name
- `process.pid`: Process ID
- `process.cmd_line`: Process command line
- `process.parent.name`: Parent process name
- `process.parent.pid`: Parent process ID

## Query Operators

### String Operators
- `equals`: Exact match
- `contains`: Contains text
- `starts_with`: Begins with text
- `ends_with`: Ends with text
- `regex`: Regular expression match
- `in`: Matches any value in list
- `not_in`: Does not match any value in list

### Numeric Operators
- `equals`: Exact match
- `not_equals`: Not equal to
- `greater_than`: Greater than value
- `less_than`: Less than value
- `greater_equal`: Greater than or equal to
- `less_equal`: Less than or equal to
- `in`: Matches any value in list
- `between`: Between two values

### IP Address Operators
- `equals`: Exact IP match
- `in_subnet`: IP in subnet (CIDR)
- `in`: Matches any IP in list
- `not_in`: Does not match any IP in list

### Timestamp Operators
- `equals`: Exact timestamp match
- `greater_than`: After timestamp
- `less_than`: Before timestamp
- `between`: Between two timestamps
- `last_hour`: Within last hour
- `last_day`: Within last 24 hours
- `last_week`: Within last 7 days

## Pre-built Templates

### Authentication Events
- **Failed Login Attempts**: Find failed authentication attempts
- **Privilege Escalation**: Detect privilege escalation attempts

### Process Monitoring
- **Suspicious Process Execution**: Find potentially malicious process executions
- **Process Monitoring**: Monitor process activities

### File Monitoring
- **File Creation Events**: Monitor file creation activities
- **File Modification**: Track file changes

### Network Monitoring
- **External Network Connections**: Find connections to external IP addresses
- **DNS Queries**: Monitor DNS activity

## Usage Examples

### Visual Mode
1. Select a field from the dropdown (e.g., `activity_name`)
2. Choose an operator (e.g., `equals`)
3. Enter a value (e.g., `failed_login`)
4. Add additional conditions as needed
5. Click "Run Query" to execute

### Text Mode
```sql
activity_name = "failed_login" 
AND src_endpoint.ip = "192.168.1.100" 
AND time >= "2024-01-01T00:00:00Z"
```

### Template Mode
1. Browse available templates
2. Click on a template to load it
3. Modify the conditions as needed
4. Execute the query

## API Integration

The query builder integrates with the backend through the `queryService`:

```javascript
import { queryService } from '../api/queryService';

// Execute a query
const result = await queryService.executeQuery(query, {
  timeRange: '1h',
  limit: 100
});

// Validate a query
const validation = await queryService.validateQuery(query);

// Get suggestions
const suggestions = await queryService.getSuggestions(partialQuery, cursorPosition);
```

## Best Practices

### For Beginners
1. Start with templates to understand common query patterns
2. Use the visual mode to build queries step by step
3. Preview your query before executing
4. Use the help system to understand field meanings

### For Professionals
1. Use text mode for complex queries
2. Leverage advanced operators like regex and CIDR
3. Save frequently used queries
4. Monitor query performance and optimize as needed

### Performance Tips
1. Always include time filters for better performance
2. Use specific field names instead of wildcards
3. Limit result sets with appropriate limits
4. Use indexes on frequently queried fields

## Accessibility

The query builder includes comprehensive accessibility features:
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

## Future Enhancements

- Query optimization suggestions
- Real-time collaboration
- Advanced analytics integration
- Machine learning-powered query suggestions
- Custom field definitions
- Query performance monitoring
- Integration with threat intelligence feeds

## Support

For questions or issues with the query builder:
1. Check the help system within the interface
2. Review the OCSF documentation
3. Contact the development team
4. Submit issues through the project repository

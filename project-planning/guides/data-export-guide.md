# Data Export API Guide

## Overview

This guide documents the data export API implemented during Sprint Four. It provides information about the available endpoints, supported formats, and integration with other platform features.

## Export Feature Structure

The data export API allows users to export their data in multiple formats with various filtering and customization options.

### Supported Formats

- **JSON**: Default format, provides complete data structure
- **CSV**: Tabular format suitable for spreadsheet applications

### Export Types

The API supports exporting different types of user data:

1. **User Profile Data**: Personal information and settings
2. **Meditation Sessions**: Records of completed meditation sessions
3. **Stress Levels**: Historical stress level measurements
4. **Achievements**: Completed achievements and progress
5. **Full User Data**: Complete export of all user information

## API Endpoints

The following RESTful endpoints are available for data export:

### Export User Data

```
GET /api/export/user-data
```

Query parameters:
- `format` (optional): Export format, either `json` (default) or `csv`
- `fields` (optional): Comma-separated list of fields to include
- `dateRange[startDate]` (optional): Start date for filtering data (ISO format)
- `dateRange[endDate]` (optional): End date for filtering data (ISO format)
- `full` (optional): Set to `true` to export all user data

### Export Meditation Sessions

```
GET /api/export/meditation-sessions
```

Query parameters:
- `format` (optional): Export format, either `json` (default) or `csv`
- `dateRange[startDate]` (optional): Start date for filtering sessions (ISO format)
- `dateRange[endDate]` (optional): End date for filtering sessions (ISO format)
- `category` (optional): Filter by meditation category

### Export Stress Data

```
GET /api/export/stress-data
```

Query parameters:
- `format` (optional): Export format, either `json` (default) or `csv`
- `dateRange[startDate]` (optional): Start date for filtering data (ISO format)
- `dateRange[endDate]` (optional): End date for filtering data (ISO format)
- `aggregation` (optional): Time-based aggregation (`daily`, `weekly`, or `monthly`)

### Export Achievements

```
GET /api/export/achievements
```

Query parameters:
- `format` (optional): Export format, either `json` (default) or `csv`
- `status` (optional): Filter by achievement status (`completed`, `in-progress`, or `all`)

## Authentication and Security

All export endpoints require authentication. The API implements the following security measures:

1. **Authentication**: JWT-based authentication required for all export operations
2. **Authorization**: Users can only export their own data
3. **Rate Limiting**: Limits on export frequency to prevent abuse
4. **Data Sanitization**: Sensitive information is properly sanitized in exports
5. **Pagination**: Large exports are paginated to prevent server overload

## Mobile Considerations

The data export API is optimized for mobile usage with:

- Chunked responses for large data sets
- Background processing for full exports
- Network resilience for intermittent connections
- Bandwidth-efficient responses
- Battery impact optimization

For detailed mobile integration, see the [Mobile Integration Guide](./mobile-integration-guide.md).

## Response Structure

### JSON Format

```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "exportedAt": "2025-03-25T12:34:56.789Z",
    "format": "json",
    "count": 25,
    "filters": {}
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 120,
    "itemsPerPage": 25
  }
}
```

### CSV Format

CSV exports include:
- A header row with column names
- Data rows representing the exported items
- Consistent date formatting (ISO 8601)
- Proper escaping of special characters
- UTF-8 encoding

## Implementation Details

The data export feature consists of:

1. **Controller**: `src/controllers/export.controller.ts`
2. **Routes**: `src/routes/export.routes.ts`
3. **Validation**: `src/validations/export.validation.ts`
4. **Service**: `src/services/export.service.ts`
5. **Utilities**: `src/utils/export/formatters.ts`

## Testing

Test files related to data export:

- `src/__tests__/routes/export.routes.test.ts`
- `src/__tests__/controllers/export.controller.test.ts`
- `src/__tests__/services/export.service.test.ts`
- `src/__tests__/mobile-integration/network-resilience.test.ts` (for mobile network testing)
- `src/__tests__/mobile-integration/api-performance.test.ts` (for performance testing)
- `scripts/battery-impact-test.js` (for battery impact testing)

## Performance Considerations

The data export API includes several performance optimizations:

1. **Pagination**: All list exports are paginated by default
2. **Streaming**: Large CSV exports use streaming to minimize memory usage
3. **Field Selection**: Unnecessary fields can be excluded to reduce payload size
4. **Caching**: Frequent export queries are cached to improve response times
5. **Background Processing**: Full exports run in the background for large datasets

## Integration with Other Features

The data export feature integrates with:

1. **User Authentication**: Ensures users can only export their own data
2. **MongoDB Models**: Leverages optimized queries for efficient data retrieval
3. **Mobile Experience**: Optimized for mobile network conditions
4. **Analytics**: Export operations are tracked for user behavior analysis

## Best Practices for Using Exports

When implementing client applications that use the export API:

1. Use pagination for large datasets
2. Implement proper retry logic for mobile connections
3. Request only needed fields using the `fields` parameter
4. Use appropriate date ranges to limit export size
5. Cache downloaded exports locally when appropriate
6. Implement background downloads for large exports

## Swagger Documentation

The API is fully documented using Swagger. Access the interactive API documentation at:

```
/api-docs
```

## Related Documentation

- [Mobile Integration Guide](./mobile-integration-guide.md)
- [MongoDB Connection Guide](./mongodb-connection-guide.md)
- [Sprint Four Implementation](../sprints/sprint-four-tasks/implement-remaining-features.md) 
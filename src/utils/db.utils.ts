import mongoose from 'mongoose';

/**
 * Converts a string ID to a MongoDB ObjectId
 * @param id String ID or existing ObjectId
 * @returns MongoDB ObjectId
 */
export function convertToObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  
  try {
    return new mongoose.Types.ObjectId(id);
  } catch (error) {
    throw new Error(`Invalid ID format: ${id}`);
  }
}

/**
 * Safely handles query with ObjectId conversion
 * @param id String ID to convert to ObjectId
 * @param field Field name for the ID (defaults to '_id')
 * @returns Query object with properly converted ObjectId
 */
export function buildIdQuery(id: string, field: string = '_id'): Record<string, mongoose.Types.ObjectId> {
  try {
    const objectId = convertToObjectId(id);
    return { [field]: objectId };
  } catch (error) {
    throw new Error(`Invalid ID format for ${field}: ${id}`);
  }
}

/**
 * Creates a date range query for MongoDB
 * @param fieldName Name of the date field to query
 * @param startDate Optional start date
 * @param endDate Optional end date
 * @returns MongoDB query object for date range
 */
export function createDateRangeQuery(
  fieldName: string, 
  startDate?: Date | string, 
  endDate?: Date | string
): Record<string, any> {
  if (!startDate && !endDate) {
    return {};
  }
  
  const query: Record<string, any> = {};
  const dateCondition: Record<string, any> = {};
  
  if (startDate) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    dateCondition.$gte = start;
  }
  
  if (endDate) {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    dateCondition.$lte = end;
  }
  
  if (Object.keys(dateCondition).length) {
    query[fieldName] = dateCondition;
  }
  
  return query;
}

/**
 * Safely converts query params to date objects
 * @param dateStr Date string to convert
 * @returns Date object or undefined if invalid
 */
export function parseDateParam(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date;
  } catch (error) {
    return undefined;
  }
}

/**
 * Safely parses pagination parameters from query params
 * @param page Page number from query
 * @param limit Items per page from query
 * @returns Object with validated page and limit values
 */
export function parsePaginationParams(
  page?: string | number, 
  limit?: string | number
): { page: number; limit: number } {
  let pageNum = typeof page === 'string' ? parseInt(page, 10) : (page || 1);
  let limitNum = typeof limit === 'string' ? parseInt(limit, 10) : (limit || 20);
  
  // Validate and set defaults/max values
  pageNum = pageNum < 1 ? 1 : pageNum;
  limitNum = limitNum < 1 ? 20 : limitNum > 100 ? 100 : limitNum;
  
  return { page: pageNum, limit: limitNum };
} 
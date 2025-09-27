# IndexedDB Boolean Value Fix

## Problem Description

The offline service was encountering a `DataError: Failed to execute 'getAll' on 'IDBIndex': The parameter is not a valid key` error when trying to query IndexedDB indices with boolean values.

### Root Cause

IndexedDB indices expect consistent data types as keys. Boolean values (`true`/`false`) can cause issues when used as index keys, especially when the index contains mixed data types or when the IndexedDB implementation has strict key validation.

### Error Location

- **File:** `client/src/services/indexedDBService.js` line 221
- **Function:** `getAllItems()`
- **Trigger:** Query with `{indexName: "synced", value: false}` from `syncFloodReports()`

## Solution Implemented

### 1. Updated IndexedDB Query Logic

Modified the `getAllItems` function in `indexedDBService.js` to automatically convert boolean values to numeric equivalents:

- `false` → `0`
- `true` → `1`

```javascript
// Convert boolean values to ensure IndexedDB compatibility
let keyValue = query.value;
if (typeof keyValue === "boolean") {
  keyValue = keyValue ? 1 : 0;
  console.log(
    `Converting boolean ${query.value} to numeric ${keyValue} for IndexedDB index "${query.indexName}"`
  );
}
```

### 2. Updated Data Storage

Changed all boolean field assignments to use numeric values:

**Synced Field (Flood Reports):**

- Store: `synced: 0` (instead of `synced: false`)
- Update: `synced: 1` (instead of `synced: true`)

**Read Field (Alerts):**

- Store: `read: 0` (instead of `read: false`)
- Update: `read: 1` (instead of `read: true`)

### 3. Updated Query Values

Modified all queries to use numeric values:

```javascript
// Before
const unsyncedReports = await getAllItems(STORES_ENUM.FLOOD_REPORTS, {
  indexName: "synced",
  value: false,
});

// After
const unsyncedReports = await getAllItems(STORES_ENUM.FLOOD_REPORTS, {
  indexName: "synced",
  value: 0, // 0 = false for IndexedDB compatibility
});
```

### 4. Added Migration Function

Created `migrateBooleanFields()` to automatically convert existing boolean data to numeric values during app initialization.

## Files Modified

1. **`client/src/services/indexedDBService.js`**

   - Added boolean-to-numeric conversion in `getAllItems()`
   - Added `migrateBooleanFields()` function
   - Added debug logging for conversions

2. **`client/src/services/offlineService.js`**
   - Updated `synced` field assignments (false→0, true→1)
   - Updated `read` field assignments (false→0, true→1)
   - Updated query values for both indices
   - Added migration calls in `initOfflineService()`

## Migration Strategy

The fix includes automatic migration that runs during app initialization:

1. Scans flood reports for boolean `synced` fields
2. Scans alerts for boolean `read` fields
3. Converts any boolean values to numeric equivalents
4. Updates records in-place

This ensures existing data works with the new system without requiring manual intervention.

## Benefits

1. **Resolves IndexedDB Errors:** Eliminates the "parameter is not a valid key" error
2. **Backward Compatible:** Automatically migrates existing data
3. **Performance:** Maintains fast index queries with consistent data types
4. **Future-Proof:** Prevents similar issues with other boolean indices

## Testing Recommendations

1. Test offline flood report synchronization
2. Test alert filtering by read/unread status
3. Verify migration runs successfully on app startup
4. Check that new records use numeric values correctly

## Implementation Notes

- The conversion is bidirectional (queries and storage both use 0/1)
- Console logging helps debug conversion issues during development
- Migration is non-destructive and can be run multiple times safely
- Numeric values maintain the same logical meaning (0=false, 1=true)

# 🧪 Batch Transfer Testing Guide

## 📁 Sample Files Created

Two CSV files have been created in the `sample-data/` directory for testing:

### 1. `valid-transactions.csv` ✅
Contains 5 valid transactions that should pass all validation:
- All dates in YYYY-MM-DD format
- All account numbers in 000-000000000-00 format  
- All names present
- All amounts positive

### 2. `invalid-transactions.csv` ❌
Contains validation errors to test error handling:
- Row 2: Wrong date format (2025/02/21 instead of 2025-02-21)
- Row 2: Wrong account format (missing dashes)
- Row 3: Invalid date (Feb 30th doesn't exist)
- Row 3: Empty account holder name
- Row 4: Invalid date format ("invalid-date")
- Row 4: Negative amount (-50.00)
- Row 5: Invalid account number (contains letter 'A')

## 🧪 Testing Steps

### Step 1: Test Valid Flow
1. Click "Batch Transfer" button
2. Enter batch name: "Test Batch 1"
3. Select any approver from dropdown
4. Upload `valid-transactions.csv`
5. Click "Next"
6. Verify all 5 records show green checkmarks
7. Click "Next" 
8. Review summary shows:
   - Total Amount: $1,051.50
   - Number of Payments: 5
   - Average Payment: $210.30
9. Click "Submit Batch"
10. Verify transactions appear in main table with "Pending" status

### Step 2: Test Validation Errors
1. Click "Batch Transfer" button
2. Enter batch name: "Test Batch 2"
3. Select any approver
4. Upload `invalid-transactions.csv`
5. Click "Next"
6. Verify validation errors:
   - Row 1: ✅ Valid (green checkmark)
   - Row 2: ❌ Date format error, Account format error
   - Row 3: ❌ Invalid date, Missing name
   - Row 4: ❌ Invalid date, Negative amount
   - Row 5: ❌ Invalid account number
7. Click "Next" (should work with partial valid data)
8. Summary should show only 1 valid transaction ($100.00)

### Step 3: Test Form Validation
1. Click "Batch Transfer" button
2. Try clicking "Next" without filling anything
3. Verify error messages appear for:
   - Batch name required
   - Approver required  
   - File required
4. Test file type validation by uploading a .txt file

### Step 4: Test Navigation
1. Complete Step 1 with valid data
2. Go to Step 2, then click "Previous"
3. Verify data is preserved
4. Navigate forward again
5. Test "Cancel" button at any step

## 🎯 Expected Validation Rules

### Date Format
- ✅ Valid: `2025-02-20`
- ❌ Invalid: `2025/02/20`, `20-02-2025`, `invalid-date`

### Account Number
- ✅ Valid: `000-123456789-01`
- ❌ Invalid: `00012345678901`, `000-123456789-0A`, `123-456-789`

### Account Holder Name
- ✅ Valid: Any non-empty string
- ❌ Invalid: Empty string or whitespace only

### Amount
- ✅ Valid: `100.00`, `250.50`, `1000`
- ❌ Invalid: `-50.00`, `abc`, empty

## 🔍 What to Look For

1. **UI Responsiveness**: Modal should be responsive on different screen sizes
2. **Error Display**: Clear error messages with red indicators
3. **Success Indicators**: Green checkmarks for valid records
4. **Data Persistence**: Form data preserved when navigating between steps
5. **File Handling**: Proper CSV parsing and error handling
6. **Summary Calculations**: Correct totals and averages
7. **Transaction Integration**: New transactions appear in main table

## 🐛 Known Issues to Test

1. Cancel button visibility (should be visible with gray styling)
2. File upload accepts only .csv files
3. Large CSV files (test with 100+ records)
4. Special characters in names
5. Very large amounts (test with $999,999.99)
6. Edge case dates (leap years, month boundaries)

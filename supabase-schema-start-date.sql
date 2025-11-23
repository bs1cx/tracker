-- Add start_date column to trackables table
ALTER TABLE trackables 
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;

-- Create index for start_date
CREATE INDEX IF NOT EXISTS idx_trackables_start_date ON trackables(user_id, start_date);

-- Update existing records to have start_date as created_at date
UPDATE trackables SET start_date = created_at::DATE WHERE start_date IS NULL;


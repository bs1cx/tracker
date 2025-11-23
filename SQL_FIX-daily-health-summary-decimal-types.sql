-- Fix daily_health_summary table: Change INTEGER columns to DECIMAL for decimal values
-- This allows decimal values like 8.9 for energy and stress levels

-- Change avg_energy_level from INTEGER to DECIMAL
ALTER TABLE daily_health_summary 
ALTER COLUMN avg_energy_level TYPE DECIMAL(3,1) 
USING CASE 
  WHEN avg_energy_level IS NULL THEN NULL 
  ELSE avg_energy_level::DECIMAL(3,1) 
END;

-- Update constraint to allow decimal values
ALTER TABLE daily_health_summary 
DROP CONSTRAINT IF EXISTS daily_health_summary_avg_energy_level_check;

ALTER TABLE daily_health_summary 
ADD CONSTRAINT daily_health_summary_avg_energy_level_check 
CHECK (avg_energy_level IS NULL OR (avg_energy_level >= 0 AND avg_energy_level <= 10));

-- Change avg_stress_level from INTEGER to DECIMAL
ALTER TABLE daily_health_summary 
ALTER COLUMN avg_stress_level TYPE DECIMAL(3,1) 
USING CASE 
  WHEN avg_stress_level IS NULL THEN NULL 
  ELSE avg_stress_level::DECIMAL(3,1) 
END;

-- Update constraint to allow decimal values
ALTER TABLE daily_health_summary 
DROP CONSTRAINT IF EXISTS daily_health_summary_avg_stress_level_check;

ALTER TABLE daily_health_summary 
ADD CONSTRAINT daily_health_summary_avg_stress_level_check 
CHECK (avg_stress_level IS NULL OR (avg_stress_level >= 0 AND avg_stress_level <= 10));

-- Also ensure overall_wellness_score can handle decimals (if needed)
-- Note: overall_wellness_score can stay INTEGER if it's always whole numbers
-- But if you want to allow decimals, uncomment below:
-- ALTER TABLE daily_health_summary 
-- ALTER COLUMN overall_wellness_score TYPE DECIMAL(3,1) 
-- USING CASE 
--   WHEN overall_wellness_score IS NULL THEN NULL 
--   ELSE overall_wellness_score::DECIMAL(3,1) 
-- END;


# Intent: Analytics & Learning Loop (SYS-ANALYTICS)

## 1. Goals
Collect platform performance metrics to continuously train and optimize topic scoring and writing styles, completing the flywheel.

## 2. Constraints
- Respect YouTube API quota usage limits.
- Avoid over-correcting weights based on minor statistical outliers.

## 3. Success Criteria
- Dynamically shift trend weights based on high-performing videos (e.g. increase weight of "Evergreen Score" if retention remains high).

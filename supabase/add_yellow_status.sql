-- status 컬럼 CHECK 제약을 4단계로 업데이트
ALTER TABLE stage_items DROP CONSTRAINT IF EXISTS stage_items_status_check;
ALTER TABLE stage_items ADD CONSTRAINT stage_items_status_check
  CHECK (status IN ('green', 'yellow', 'red', 'gray'));

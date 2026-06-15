-- =====================================================
-- 영업 파이프라인 대시보드 Supabase 스키마
-- 이미 실행한 경우: IF NOT EXISTS / OR REPLACE 처리됨
-- =====================================================

-- 영업 리드 테이블
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  current_packaging TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 스테이지(대항목) 테이블
CREATE TABLE IF NOT EXISTS stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 스테이지 항목(소항목) 테이블
CREATE TABLE IF NOT EXISTS stage_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID REFERENCES stages(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'gray' CHECK (status IN ('green', 'red', 'gray')),
  notes TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 (이미 존재하면 무시)
DO $$ BEGIN
  CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_stage_items_updated_at
    BEFORE UPDATE ON stage_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS 활성화
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_items ENABLE ROW LEVEL SECURITY;

-- 정책 (이미 존재하면 무시)
DO $$ BEGIN
  CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all on stages" ON stages FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all on stage_items" ON stage_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

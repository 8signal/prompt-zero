CREATE TABLE IF NOT EXISTS brain_dumps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  answers JSONB DEFAULT '[]'::jsonb,
  time_spent TEXT,
  answered_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE brain_dumps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own dumps"
  ON brain_dumps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dumps"
  ON brain_dumps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dumps"
  ON brain_dumps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dumps"
  ON brain_dumps FOR DELETE
  USING (auth.uid() = user_id);

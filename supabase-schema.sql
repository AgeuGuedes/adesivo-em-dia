-- =============================================
-- SCHEMA: Adesivo da Vovó (Rivastigmina)
-- Execute no SQL Editor do Supabase
-- =============================================

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de cuidadoras
CREATE TABLE IF NOT EXISTS caregivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Tabela de aplicações do adesivo
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  caregiver_id UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  position TEXT NOT NULL,
  observations TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários autenticados podem ler/escrever tudo
CREATE POLICY "Authenticated users can read patients"
  ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert patients"
  ON patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients"
  ON patients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read caregivers"
  ON caregivers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert caregivers"
  ON caregivers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete caregivers"
  ON caregivers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read applications"
  ON applications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert applications"
  ON applications FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- ÍNDICES para performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_patient_id ON applications(patient_id);
CREATE INDEX IF NOT EXISTS idx_caregivers_user_id ON caregivers(user_id);

-- =============================================
-- SEQUÊNCIA dos 12 locais de rodízio:
-- SD1, SE1, ID1, IE1
-- SD2, SE2, ID2, IE2
-- SD3, SE3, ID3, IE3
-- SD = Superior Direito
-- SE = Superior Esquerdo
-- ID = Inferior Direito
-- IE = Inferior Esquerdo
-- =============================================

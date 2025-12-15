ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_student_progress_self ON student_progress
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY insert_student_progress_self ON student_progress
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY update_student_progress_self ON student_progress
FOR UPDATE
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY select_question_bank_authenticated ON question_bank
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY select_topics_authenticated ON topics
FOR SELECT
TO authenticated
USING (true);

ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_battle_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_squads_for_members ON squads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM squad_members sm
    WHERE sm.squad_id = squads.id
      AND sm.user_id = auth.uid()
      AND sm.is_active = true
  )
);

CREATE POLICY insert_squads_leader ON squads
FOR INSERT
WITH CHECK (leader_id = auth.uid());

CREATE POLICY update_squads_leader ON squads
FOR UPDATE
USING (leader_id = auth.uid())
WITH CHECK (leader_id = auth.uid());

CREATE POLICY select_squad_members_for_squad ON squad_members
FOR SELECT
USING (
  squad_members.user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM squad_members sm2
    WHERE sm2.squad_id = squad_members.squad_id
      AND sm2.user_id = auth.uid()
      AND sm2.is_active = true
  )
);

CREATE POLICY insert_squad_members_self ON squad_members
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY update_squad_members_self ON squad_members
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY select_squad_battles_for_members ON squad_battles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM squad_members sm
    WHERE sm.squad_id = squad_battles.squad_id
      AND sm.user_id = auth.uid()
      AND sm.is_active = true
  )
);

CREATE POLICY insert_squad_battles_leader ON squad_battles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM squads s
    WHERE s.id = squad_battles.squad_id
      AND s.leader_id = auth.uid()
  )
);

CREATE POLICY update_squad_battles_leader ON squad_battles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM squads s
    WHERE s.id = squad_battles.squad_id
      AND s.leader_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM squads s
    WHERE s.id = squad_battles.squad_id
      AND s.leader_id = auth.uid()
  )
);

CREATE POLICY select_participants_for_members ON squad_battle_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM squad_battles b
    JOIN squad_members sm ON sm.squad_id = b.squad_id
    WHERE b.id = squad_battle_participants.battle_id
      AND sm.user_id = auth.uid()
      AND sm.is_active = true
  )
);

CREATE POLICY insert_participants_self ON squad_battle_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY update_participants_self ON squad_battle_participants
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY select_battle_questions_for_members ON squad_battle_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM squad_battles b
    JOIN squad_members sm ON sm.squad_id = b.squad_id
    WHERE b.id = squad_battle_questions.battle_id
      AND sm.user_id = auth.uid()
      AND sm.is_active = true
  )
);

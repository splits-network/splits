-- RLS policies for firm_invitations table
-- Service role key bypasses RLS, but these provide defense-in-depth

-- SELECT: firm owners and active members can view invitations for their firm
CREATE POLICY firm_invitations_select_policy ON firm_invitations
    FOR SELECT USING (
        firm_id IN (
            SELECT f.id FROM firms f WHERE f.owner_user_id = auth.uid()
            UNION
            SELECT fm.firm_id FROM firm_members fm
                JOIN recruiters r ON r.id = fm.recruiter_id
                WHERE r.user_id = auth.uid() AND fm.status = 'active'
        )
    );

-- INSERT: firm owners and admin members can create invitations
CREATE POLICY firm_invitations_insert_policy ON firm_invitations
    FOR INSERT WITH CHECK (
        firm_id IN (
            SELECT f.id FROM firms f WHERE f.owner_user_id = auth.uid()
            UNION
            SELECT fm.firm_id FROM firm_members fm
                JOIN recruiters r ON r.id = fm.recruiter_id
                WHERE r.user_id = auth.uid() AND fm.status = 'active' AND fm.role IN ('owner', 'admin')
        )
    );

-- UPDATE: firm owners and admin members can update invitations (e.g., revoke)
CREATE POLICY firm_invitations_update_policy ON firm_invitations
    FOR UPDATE USING (
        firm_id IN (
            SELECT f.id FROM firms f WHERE f.owner_user_id = auth.uid()
            UNION
            SELECT fm.firm_id FROM firm_members fm
                JOIN recruiters r ON r.id = fm.recruiter_id
                WHERE r.user_id = auth.uid() AND fm.status = 'active' AND fm.role IN ('owner', 'admin')
        )
    );

-- DELETE: firm owners can delete invitations
CREATE POLICY firm_invitations_delete_policy ON firm_invitations
    FOR DELETE USING (
        firm_id IN (
            SELECT f.id FROM firms f WHERE f.owner_user_id = auth.uid()
        )
    );

-- Migration 005: Add subject and make phone_number optional in contact_messages

ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS subject VARCHAR(255) DEFAULT '';
ALTER TABLE contact_messages ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE contact_messages ALTER COLUMN phone_number SET DEFAULT '';

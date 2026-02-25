-- Google's OAuth verification requires that scopes on the consent screen
-- match scopes requested by the app. The fetchAccountInfo() method calls
-- the Google userinfo endpoint, which requires 'openid' + 'userinfo.email' scopes.
-- Add these to the Google Calendar provider so the consent screen matches actual usage.

UPDATE integration_providers
SET oauth_scopes = ARRAY[
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar.events.owned',
    'https://www.googleapis.com/auth/calendar.events.freebusy',
    'https://www.googleapis.com/auth/calendar.calendarlist.readonly'
]
WHERE slug = 'google_calendar';
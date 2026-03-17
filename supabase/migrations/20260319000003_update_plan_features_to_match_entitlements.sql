-- Update plan features (pricing card display text) to accurately reflect
-- the entitlements system implemented in 20260319000001.
-- These are marketing feature lists shown on pricing cards, NOT the
-- entitlements JSONB that drives actual code behavior.

-- Starter (Free)
UPDATE plans SET features = jsonb_build_object(
    'headline', 'Start making split placements — no commitment required',
    'subheadline', 'Perfect for recruiters exploring split recruiting and building momentum inside the network.',
    'cta', 'Get Started',
    'footnote', 'Payout percentages are finalized at hire time and depend on role participation.',
    'is_popular', false,
    'included', jsonb_build_array(
        'Access to open roles across the network',
        'Unlimited candidate submissions',
        'Full ATS workflow and application tracking',
        'In-app notifications and activity updates',
        'Participation in split placements',
        '5 messaging initiations per month',
        'Save up to 10 candidates and 10 roles',
        '1 referral code'
    ),
    'not_included', jsonb_build_array(
        'Email notifications and alerts',
        'Early access to new roles',
        'Advanced analytics and data export',
        'Call recording and transcription',
        'Email and calendar integrations',
        'AI match scoring and call summaries',
        'Firm and team management',
        'API access'
    )
) WHERE slug = 'starter';

-- Pro ($99/mo)
UPDATE plans SET features = jsonb_build_object(
    'headline', 'Higher upside for serious recruiters',
    'subheadline', 'Designed for active recruiters who want better economics, faster access, and deeper insight.',
    'cta', 'Get Started with Pro',
    'footnote', 'Subscription tier increases incentive potential but does not guarantee placements.',
    'is_popular', true,
    'annual_savings_text', 'Save ~16%',
    'included', jsonb_build_array(
        'Everything in Starter, plus:',
        'Email notifications and alerts',
        'Early access to newly released roles',
        'Advanced analytics dashboard and data export',
        'Call recording and transcription',
        'Email and calendar integrations',
        'Unlimited messaging',
        'Save up to 100 candidates and 50 roles',
        '5 referral codes',
        'Higher payout bonuses on placements'
    ),
    'not_included', jsonb_build_array(
        'Priority role access',
        'AI match scoring (True Score)',
        'AI call summaries',
        'Firm and team management',
        'API access'
    )
) WHERE slug = 'pro';

-- Partner ($249/mo)
UPDATE plans SET features = jsonb_build_object(
    'headline', 'Built for firms, power users, and sourcing partners',
    'subheadline', 'Maximum incentives, early access, and the tools needed to scale recruiting as a business.',
    'cta', 'Become a Partner',
    'footnote', 'All payouts are determined at hire time and follow platform placement rules.',
    'is_popular', false,
    'annual_savings_text', 'Save ~16%',
    'included', jsonb_build_array(
        'Everything in Pro, plus:',
        'Priority access to high-value roles',
        'AI match scoring (True Score)',
        'AI-powered call summaries',
        'Multi-recruiter firm and team management',
        'Unlimited saved candidates, roles, and referral codes',
        'Maximum payout bonuses',
        'Priority support and account management',
        'API access'
    ),
    'not_included', jsonb_build_array()
) WHERE slug = 'partner';

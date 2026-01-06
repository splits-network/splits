#!/usr/bin/env tsx

/**
 * Test script for notification service
 * This script simulates submitting a candidate and triggering a notification
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://einhgkqmxbkgdohwfayv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const ATS_SERVICE_URL = process.env.ATS_SERVICE_URL || 'http://localhost:3002';

async function testNotification() {
    console.log('🧪 Testing Notification Service\n');

    // Step 1: Get or create test data
    console.log('Step 1: Fetching test data...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Get a test job
    const { data: jobs, error: jobError } = await supabase
        
        .from('jobs')
        .select('*')
        .limit(1);
    
    if (jobError || !jobs || jobs.length === 0) {
        console.error('❌ No test jobs found. Please create a job first.');
        return;
    }
    
    const testJob = jobs[0];
    console.log(`✅ Found test job: ${testJob.title}`);
    
    // Get a test recruiter
    const { data: recruiters, error: recruiterError } = await supabase
        
        .from('recruiters')
        .select('*')
        .eq('status', 'active')
        .limit(1);
    
    if (recruiterError || !recruiters || recruiters.length === 0) {
        console.error('❌ No active recruiters found. Please create a recruiter first.');
        return;
    }
    
    const testRecruiter = recruiters[0];
    console.log(`✅ Found test recruiter: ${testRecruiter.display_name}\n`);
    
    // Step 2: Submit a test candidate
    console.log('Step 2: Submitting test candidate...');
    
    const candidateData = {
        job_id: testJob.id,
        full_name: 'Test Candidate ' + Date.now(),
        email: `test${Date.now()}@example.com`,
        linkedin_url: 'https://linkedin.com/in/test',
        notes: 'This is a test submission from the notification test script',
        recruiter_id: testRecruiter.id,
    };
    
    try {
        const response = await fetch(`${ATS_SERVICE_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(candidateData),
        });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Failed to submit candidate: ${response.status} ${text}`);
        }
        
        const result = await response.json();
        console.log('✅ Candidate submitted successfully!');
        console.log(`   Application ID: ${result.data.id}`);
        console.log(`   Candidate: ${result.data.candidate?.full_name || candidateData.full_name}\n`);
        
        console.log('✉️  Check your email (or notification service logs) for the notification!');
        console.log('   Note: Emails are sent to the recruiter\'s email address.\n');
        
        // Wait a bit for async processing
        console.log('⏳ Waiting 3 seconds for event processing...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check notification logs
        const { data: logs, error: logError } = await supabase
            
            .from('notification_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (!logError && logs && logs.length > 0) {
            const latestLog = logs[0];
            console.log('\n📋 Latest notification log:');
            console.log(`   Status: ${latestLog.status}`);
            console.log(`   Event: ${latestLog.event_type}`);
            console.log(`   Recipient: ${latestLog.recipient_email}`);
            console.log(`   Subject: ${latestLog.subject}`);
            if (latestLog.resend_message_id) {
                console.log(`   Resend Message ID: ${latestLog.resend_message_id}`);
            }
            if (latestLog.error_message) {
                console.log(`   Error: ${latestLog.error_message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testNotification().catch(console.error);

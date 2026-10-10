const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

// @route   POST /api/issues/raise
// @desc    A team raises an issue by their group number
router.post('/raise', async (req, res) => {
    try {
        const { groupNumber, issueDescription } = req.body;

        if (!groupNumber) {
            return res.status(400).json({ error: 'Group number is required' });
        }

        // Check if there's already an active issue for this group
        const existingActive = await Issue.findOne({ groupNumber, status: 'active' });

        if (existingActive) {
            // Update time to bring it to the top and optionally update description
            existingActive.createdAt = Date.now();
            if (issueDescription) {
                existingActive.issueDescription = issueDescription;
            }
            await existingActive.save();
            return res.status(200).json({ message: 'Issue flagged again!', issue: existingActive });
        }

        const newIssue = new Issue({
            groupNumber,
            issueDescription: issueDescription || 'General Assistance Required'
        });
        await newIssue.save();

        res.status(201).json({ message: 'Our team is on the way!', issue: newIssue });
    } catch (error) {
        console.error('Error raising issue:', error);
        res.status(500).json({ error: 'Server error while raising issue' });
    }
});

// @route   GET /api/issues
// @desc    Get all active issues for the admin dashboard
router.get('/', async (req, res) => {
    try {
        const activeIssues = await Issue.find({ status: 'active' }).sort({ createdAt: -1 });
        res.status(200).json(activeIssues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ error: 'Server error while fetching issues' });
    }
});

// @route   POST /api/issues/resolve/:id
// @desc    Admin marks an issue as resolved
router.post('/resolve/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        issue.status = 'resolved';
        await issue.save();

        res.status(200).json({ message: 'Issue resolved successfully', issue });
    } catch (error) {
        console.error('Error resolving issue:', error);
        res.status(500).json({ error: 'Server error while resolving issue' });
    }
});

// @route   PUT /api/issues/:id/resolve
// @desc    Admin marks an issue as resolved (PUT fallback)
router.put('/:id/resolve', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        issue.status = 'resolved';
        await issue.save();
        res.status(200).json({ message: 'Issue resolved successfully', issue });
    } catch (error) {
        console.error('Error resolving issue:', error);
        res.status(500).json({ error: 'Server error while resolving issue' });
    }
});

module.exports = router;

// routes/problem.router.js
const express = require('express');
const router = express.Router();
// Update the path to match your project structure
const Problem = require('../models/problem.model'); // Ensure the correct file name is used
const nodemailer = require('nodemailer');

// ... rest of your router code

// Create new problem
router.post('/contact-us', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const problem = new Problem({ name, email, message });
        await problem.save();
        res.redirect('/contact-us?success=true');
    } catch (error) {
        res.status(500).send('Error submitting problem');
    }
});

// Admin route to get all problems
router.get('/admin/problems', async (req, res) => {
    try {
        let filter = {};
        
        // Add filter for isAnswered
        if (req.query.filterAnswered === 'true') {
            filter.isAnswered = true;
        } else if (req.query.filterAnswered === 'false') {
            filter.isAnswered = false;
        }

        const problems = await Problem.find(filter).sort({ createdAt: -1 });
        res.render('admin/problems', { 
            layout: 'admin/admin-layout',
            problems,
            currentFilter: req.query.filterAnswered
        });
    } catch (error) {
        res.status(500).send('Error fetching problems');
    }
});


// Route to submit answer and send email
router.post('/admin/problems/:id/answer', async (req, res) => {
    try {
        const { answer } = req.body;
        const problem = await Problem.findById(req.params.id);
        
        problem.answer = answer;
        problem.isAnswered = true;
        await problem.save();

        // Configure email transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'saudshakeel3109@gmail.com',
                pass: 'navv lkuz idhz kfzs'
            }
        });

        // Send email
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to: problem.email,
            subject: 'Response to Your Query',
            text: `Dear ${problem.name},\n\n${answer}\n\nBest regards,\nLala's Support Team`

        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// routes/problem.router.js

// Add this new route for deletion
router.delete('/admin/problems/:id', async (req, res) => {
    try {
        const problemId = req.params.id;
        console.log('Attempting to delete problem:', problemId);
        
        const problem = await Problem.findById(problemId);
        
        if (!problem) {
            console.log('Problem not found:', problemId);
            return res.status(404).json({ 
                success: false, 
                message: 'Problem not found' 
            });
        }

        if (!problem.isAnswered) {
            console.log('Cannot delete unanswered problem:', problemId);
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete unanswered problems' 
            });
        }

        await Problem.findByIdAndDelete(problemId);
        console.log('Problem deleted successfully:', problemId);
        
        res.json({ 
            success: true, 
            message: 'Problem deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting problem:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting problem' 
        });
    }
});



module.exports = router;

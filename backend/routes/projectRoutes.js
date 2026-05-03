const express = require('express');
const { getProjects, createProject, addMember, removeMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.post('/:id/add-member', addMember);
router.delete('/:id/remove-member', removeMember);

module.exports = router;

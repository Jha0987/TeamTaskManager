const express = require('express');
const { getUsers, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(roleMiddleware('Admin'));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);

module.exports = router;
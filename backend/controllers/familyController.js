const User = require('../models/User');
const Baby = require('../models/Baby');

// ── Rules ─────────────────────────────────────────────────────────────────────
// mother  → can add: father, babysitter
// father  → can add: mother, babysitter
// (grandmother / babysitter / pregnant cannot initiate sharing)

const CAN_ADD = {
    mother:  ['father', 'babysitter'],
    father:  ['mother', 'babysitter'],
};

function canInitiate(role) { return !!CAN_ADD[role]; }
function allowedTargetRoles(role) { return CAN_ADD[role] || []; }

// ── GET /api/family/search?q=&role= ──────────────────────────────────────────
// Search for users to add (babysitters, or the other parent)
exports.searchUsers = async (req, res, next) => {
    try {
        const { q = '', role } = req.query;
        const initiatorRole = req.user.role;

        if (!canInitiate(initiatorRole))
            return res.status(403).json({ success: false, error: 'Only mothers and fathers can add caretakers.' });

        const allowed = allowedTargetRoles(initiatorRole);
        const roleFilter = role && allowed.includes(role) ? [role] : allowed;

        if (!q.trim())
            return res.status(400).json({ success: false, error: 'Search query required.' });

        const users = await User.find({
            role: { $in: roleFilter },
            isActive: true,
            _id: { $ne: req.user._id },
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName:  { $regex: q, $options: 'i' } },
                { email:     { $regex: q, $options: 'i' } },
            ],
        }).select('firstName lastName email role profileImage').limit(20);

        res.json({ success: true, users });
    } catch (err) { next(err); }
};

// ── POST /api/family/add ──────────────────────────────────────────────────────
// Add a caretaker to all babies owned by the current user
// Body: { userId, permissions: ['view','log'] }
exports.addCaretaker = async (req, res, next) => {
    try {
        const { userId, permissions = ['view', 'log'] } = req.body;
        const initiatorRole = req.user.role;

        if (!canInitiate(initiatorRole))
            return res.status(403).json({ success: false, error: 'Only mothers and fathers can add caretakers.' });

        if (!userId)
            return res.status(400).json({ success: false, error: 'userId required.' });

        const target = await User.findById(userId);
        if (!target || !target.isActive)
            return res.status(404).json({ success: false, error: 'User not found.' });

        const allowed = allowedTargetRoles(initiatorRole);
        if (!allowed.includes(target.role))
            return res.status(400).json({
                success: false,
                error: `A ${initiatorRole} can only add: ${allowed.join(', ')}.`,
            });

        // Share all babies owned by the current user
        const babies = await Baby.find({ owner: req.user._id, isActive: true });
        if (!babies.length)
            return res.status(400).json({ success: false, error: 'You have no babies to share yet.' });

        let alreadyShared = 0;
        for (const baby of babies) {
            const already = baby.sharedWith.some(s => s.userId.toString() === userId);
            if (already) { alreadyShared++; continue; }
            baby.sharedWith.push({ userId, role: target.role, permissions });
            await baby.save();
        }

        if (alreadyShared === babies.length)
            return res.status(409).json({ success: false, error: 'This person already has access to all your babies.' });

        // Also update target user's sharedBabies list
        for (const baby of babies) {
            const alreadyInUser = target.sharedBabies.some(s => s.babyId.toString() === baby._id.toString());
            if (!alreadyInUser) {
                target.sharedBabies.push({ babyId: baby._id, permissions, sharedBy: req.user._id });
            }
        }
        await target.save();

        res.json({
            success: true,
            message: `${target.firstName} ${target.lastName} now has access to your baby data.`,
            sharedWith: { id: target._id, name: `${target.firstName} ${target.lastName}`, role: target.role },
        });
    } catch (err) { next(err); }
};

// ── DELETE /api/family/remove/:userId ────────────────────────────────────────
// Remove a caretaker from all babies owned by the current user
exports.removeCaretaker = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const initiatorRole = req.user.role;

        if (!canInitiate(initiatorRole))
            return res.status(403).json({ success: false, error: 'Only mothers and fathers can remove caretakers.' });

        const babies = await Baby.find({ owner: req.user._id, isActive: true });
        for (const baby of babies) {
            baby.sharedWith = baby.sharedWith.filter(s => s.userId.toString() !== userId);
            await baby.save();
        }

        // Remove from target user's sharedBabies
        const target = await User.findById(userId);
        if (target) {
            const babyIds = babies.map(b => b._id.toString());
            target.sharedBabies = target.sharedBabies.filter(
                s => !babyIds.includes(s.babyId.toString())
            );
            await target.save();
        }

        res.json({ success: true, message: 'Access removed successfully.' });
    } catch (err) { next(err); }
};

// ── GET /api/family/my ───────────────────────────────────────────────────────
// List all people who have access to the current user's babies
exports.getMyCaretakers = async (req, res, next) => {
    try {
        const babies = await Baby.find({ owner: req.user._id, isActive: true })
            .populate('sharedWith.userId', 'firstName lastName email role profileImage');

        // Deduplicate by userId
        const map = new Map();
        for (const baby of babies) {
            for (const s of baby.sharedWith) {
                if (!s.userId) continue;
                const id = s.userId._id.toString();
                if (!map.has(id)) {
                    map.set(id, {
                        id,
                        firstName: s.userId.firstName,
                        lastName:  s.userId.lastName,
                        email:     s.userId.email,
                        role:      s.userId.role,
                        profileImage: s.userId.profileImage,
                        permissions: s.permissions,
                        babies: [],
                    });
                }
                map.get(id).babies.push({ id: baby._id, name: baby.name });
            }
        }

        res.json({ success: true, caretakers: [...map.values()] });
    } catch (err) { next(err); }
};

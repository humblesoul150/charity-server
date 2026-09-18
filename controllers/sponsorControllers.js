const { child } = require("winston");
const Childern = require("../models/childProfile");
const Sponsor = require("../models/sponsor");
const Sponsorships = require("../models/sponsorships");

const ACTIVE_SPONSORSHIP_STATUSES = ["Active", "Pending"];
const CLOSING_SPONSORSHIP_STATUSES = ["Completed", "Cancelled", "Paused"];
const PROFILE_COMPLETION_FIELDS = ["fullName", "email", "phone", "country", "city", "state", "region", "zipCode"];

const getProfileStatus = (profile) =>
    PROFILE_COMPLETION_FIELDS.every((field) => String(profile?.[field] || "").trim())
        ? "Complete"
        : "Incomplete";

const getProfileCompletion = (profile) => Math.round(
    (PROFILE_COMPLETION_FIELDS.filter((field) => String(profile?.[field] || "").trim()).length /
        PROFILE_COMPLETION_FIELDS.length) * 100,
);

const normalizeSponsorProfile = (data) => {
    const source = data.profile || data.sponsor || {};
    const location = data.location || {};

    return {
        fullName: source.fullName || source.name || data.name || "",
        email: source.email || data.email || "",
        phone: source.phone || data.phone || "",
        country: source.country || location.country || data.country || "",
        city: source.city || location.city || data.city || "",
        state: source.state || location.state || data.state || "",
        region: source.region || location.region || data.region || "",
        zipCode: source.zipCode || location.zipCode || location.zip || data.zipCode || data.zip || "",
        bio: source.bio || data.bio || "",
    };
};

const syncChildSponsorState = async (childId, sponsorId, status = "Sponsored") => {
    if (!childId) return;

    const childProfile = await Childern.findById(childId);
    if (!childProfile) return;

    const isActive = ["Active", "Pending"].includes(status);

    childProfile.sponsor = isActive ? sponsorId : null;
    childProfile.sponsorshipStatus = isActive ? "Sponsored" : "Available";
    await childProfile.save();
};

const upsertSponsorSponsorship = async ({ childId, sponsorId, donation, data }) => {
    if (!childId || !sponsorId) return null;

    const existingSponsorship = await Sponsorships.findOne({ child: childId }).sort({ createdAt: -1 });

    if (!existingSponsorship) {
        const newSponsorship = new Sponsorships({
            child: childId,
            donor: sponsorId,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : null,
            amount: donation.amount || 0,
            frequency: donation.period || "Monthly",
            status: (data.status || "Pending").trim() || "Pending",
            payments: [],
            lastPayment: null,
            totalPaid: 0,
            notes: data.notes || "",
        });

        await newSponsorship.save();
        await syncChildSponsorState(childId, sponsorId, newSponsorship.status);
        return newSponsorship;
    }

    existingSponsorship.donor = sponsorId;
    existingSponsorship.amount = donation.amount || existingSponsorship.amount || 0;
    existingSponsorship.frequency = donation.period || existingSponsorship.frequency || "Monthly";
    existingSponsorship.startDate = existingSponsorship.startDate || new Date(data.startDate || Date.now());
    existingSponsorship.endDate = data.endDate ? new Date(data.endDate) : existingSponsorship.endDate;
    existingSponsorship.status = data.status || "Active";
    existingSponsorship.notes = data.notes || existingSponsorship.notes || "";
    await existingSponsorship.save();
    await syncChildSponsorState(childId, sponsorId, existingSponsorship.status);
    return existingSponsorship;
};

//create sponsor
exports.createSponsor = async (req, res) => { 
    try {
        const data = req.body;
        const profile = normalizeSponsorProfile(data);
        const safeSponsor = {
            email: profile.email,
            name: profile.fullName,
            phone: profile.phone,
        };

        const paymentMethod = typeof data.paymentMethod === 'string'
            ? data.paymentMethod
            : data.paymentMethod?.paymentMethod || data.paymentMethod?.method || "Not specified";

        const donation = data.donation || {
            amount: Number(data.amount || 0),
            period: data.period || "Monthly",
            remindByEmail: Boolean(data.remindByEmail),
        };

        const childId = data.childId || data.child || null;

        const payLoad = {
            ...data,
            profile,
            sponsor: safeSponsor,
            child: childId,
            paymentMethod,
            donation,
            profileStatus: getProfileStatus(profile),
            source: data.source || "website",
        };

        const newSponsor = new Sponsor(payLoad);
        await newSponsor.save();

        if (childId) {
            await upsertSponsorSponsorship({
                childId,
                sponsorId: newSponsor._id,
                donation,
                data,
            });
        }

        res.status(201).json({
            message: "Sponsor created successfully",
            sponsor: newSponsor,
            profileStatus: newSponsor.profileStatus,
            profileCompletion: getProfileCompletion(newSponsor.profile),
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.getSponsorRecords = async (req, res) => { 
    try {
        const sponsors = await Sponsorships.find().sort({ createdAt: -1 }).populate([
            {path: 'child'},{path: 'donor'}
        ]);
        res.status(200).json(sponsors);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.getProfiles = async (req, res) => {
    try{
const profiles = await Sponsor.find().sort({ createdAt: -1 });
        res.status(200).json(profiles);
    }catch(error){
        console.error(error)
        res.status(500).json({message:'server error'})
}}

exports.getSponsorById = async (req, res) => {
    try {
        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) {
            return res.status(404).json({ message: "Sponsor not found" });
        }

        const sponsorships = await Sponsorships.find({ donor: req.params.id })
            .populate('child')
            .populate('donor')
            .sort({ createdAt: -1 });

        const children = sponsorships.map((item) => ({
            _id: item._id,
            child: item.child,
            status: item.status,
            amount: item.amount,
            totalPaid: item.totalPaid || 0,
            lastPayment: item.lastPayment,
            startDate: item.startDate,
        }));

        const totalPledged = sponsorships.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const totalPaid = sponsorships.reduce((sum, item) => sum + (Number(item.totalPaid) || 0), 0);
        const activeChildren = sponsorships.filter((item) => item.status === "Active").length;

        res.status(200).json({
            sponsor,
            profileStatus: sponsor.profileStatus || getProfileStatus(sponsor.profile),
            profileCompletion: getProfileCompletion(sponsor.profile),
            children,
            summary: {
                totalChildren: sponsorships.length,
                activeChildren,
                pendingChildren: sponsorships.filter((item) => item.status === "Pending").length,
                totalPledged,
                totalPaid,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateSponsorProfile = async (req, res) => {
    try {
        const allowedFields = ["fullName", "email", "phone", "country", "city", "state", "region", "zipCode", "bio"];
        const incoming = req.body.profile || req.body;
        const profile = {};

        allowedFields.forEach((field) => {
            if (incoming[field] !== undefined) profile[field] = String(incoming[field]).trim();
        });

        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

        const legacyProfile = normalizeSponsorProfile({
            sponsor: sponsor.sponsor,
            location: sponsor.location,
        });
        const mergedProfile = {
            ...legacyProfile,
            ...(sponsor.profile?.toObject?.() || sponsor.profile || {}),
            ...profile,
        };
        const profileStatus = getProfileStatus(mergedProfile);

        await Sponsor.findByIdAndUpdate(
            req.params.id,
            { $set: { profile: mergedProfile, profileStatus, source: "dashboard" } },
            { new: true, runValidators: true },
        );

        const updatedSponsor = await Sponsor.findById(req.params.id);
        res.status(200).json({
            message: "Sponsor profile updated successfully",
            sponsor: updatedSponsor,
            profileStatus,
            profileCompletion: getProfileCompletion(updatedSponsor.profile),
        });
    } catch (error) {
        res.status(400).json({ message: "Unable to update sponsor profile", error: error.message });
    }
};

exports.createPaymentRecord = async (req, res) => { 
    try {
        const data = req.body;
        const sponsorship = await Sponsorships.findById(req.params.id);
        if (!sponsorship) {
            return res.status(404).json({ message: "Sponsorship record not found" });
        }
        const newPayment = {
            date: new Date(),
            amount: data.amount,
            method: data.method,
            transactionId: data.transactionId,
            notes: data.notes || "",
            status: data.amount > 0 ? "Completed" : "Pending",
        };
        sponsorship.payments.push(newPayment);
        sponsorship.status = "Active";
        sponsorship.totalPaid = (sponsorship.totalPaid || 0) + Number(data.amount || 0);
        sponsorship.lastPayment = new Date();
        await sponsorship.save();
        res.status(201).json({ message: "Payment record created successfully", payment: newPayment });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.getSponsorChildren = async (req, res) => {
    try {
        const sponsorships = await Sponsorships.find({ donor: req.params.id })
            .populate('child')
            .populate('donor')
            .sort({ createdAt: -1 });

        res.status(200).json(sponsorships);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getChildSponsor = async (req, res) => {
    try {
        const sponsorships = await Sponsorships.find({ child: req.params.childId })
            .populate('child')
            .populate('donor')
            .sort({ createdAt: -1 });

        res.status(200).json(sponsorships);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateSponsorshipStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Active", "Pending", "Paused", "Completed", "Cancelled"];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: "A valid sponsorship status is required." });
        }

        const sponsorship = await Sponsorships.findById(req.params.id).populate('child');
        if (!sponsorship) {
            return res.status(404).json({ message: "Sponsorship record not found" });
        }

        sponsorship.status = status;
        await sponsorship.save();

        if (sponsorship.child) {
            const isActive = ["Active", "Pending"].includes(status);
            sponsorship.child.sponsor = isActive ? sponsorship.donor : null;
            sponsorship.child.sponsorshipStatus = isActive ? "Sponsored" : "Available";
            await sponsorship.child.save();
        }

        res.status(200).json({
            message: "Sponsorship status updated successfully",
            sponsorship,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.reassignSponsor = async (req, res) => {
    try {
        const data = req.body;
        const childId = data.childId || data.child || req.params.childId;

        if (!childId) {
            return res.status(400).json({ message: "Child id is required for sponsor reassignment." });
        }

        let targetSponsor = null;
        const sponsorId = data.sponsorId || data.sponsor?._id || null;

        if (sponsorId) {
            targetSponsor = await Sponsor.findById(sponsorId);
        }

        if (!targetSponsor) {
            const profile = normalizeSponsorProfile(data);
            const safeSponsor = {
                email: profile.email,
                name: profile.fullName,
                phone: profile.phone,
            };

            if (!profile.fullName || !profile.email || !profile.phone) {
                return res.status(400).json({ message: "Sponsor name, email and phone are required." });
            }

            targetSponsor = new Sponsor({
                profile,
                sponsor: safeSponsor,
                child: childId,
                location: data.location || {},
                donation: data.donation || {
                    amount: Number(data.amount || 0),
                    period: data.period || "Monthly",
                    remindByEmail: Boolean(data.remindByEmail),
                },
                paymentMethod: data.paymentMethod || "zelle",
            });

            await targetSponsor.save();
        }

        const donation = data.donation || {
            amount: Number(data.amount || 0),
            period: data.period || "Monthly",
            remindByEmail: Boolean(data.remindByEmail),
        };

        const sponsorship = await upsertSponsorSponsorship({
            childId,
            sponsorId: targetSponsor._id,
            donation,
            data,
        });

        await syncChildSponsorState(childId, targetSponsor._id, sponsorship?.status || "Active");

        return res.status(200).json({
            message: "Sponsor reassigned successfully",
            sponsor: targetSponsor,
            sponsorship,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

 
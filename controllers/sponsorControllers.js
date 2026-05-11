const { child } = require("winston");
const Childern = require("../models/childProfile");
const Sponsor = require("../models/sponsor");
const Sponsorships = require("../models/sponsorships");


//create sponsor
exports.createSponsor = async (req, res) => { 
    try {
        const data = req.body;
        const payLoad = {
            ...data,
            paymentMethod: data.paymentMethod.paymentMethod || "Not specified",
            child: data.childId || null,
            
        }

        const newSponsor = new Sponsor(payLoad);
        await newSponsor.save();

        // Update the child profile to link the sponsor
        const childProfile = await Childern.findById(data.childId);
        if (childProfile) {
            childProfile.sponsor = newSponsor._id;
            childProfile.sponsorshipStatus = "Sponsored";
            await childProfile.save();
        }

        // Create a new sponsorship record
        const findSponsorship = await Sponsorships.findOne({ child: data.childId });
        if (!findSponsorship) {
            const newSponsorship = new Sponsorships({
                child: data.childId,    
                donor:newSponsor._id,
                startDate: new Date(),
                amount: data.amount || 0,
                status: "Pending",
                payments: [],
                lastPayment: null,
                totalPaid: 0,
             });
            await newSponsorship.save();
        }  
        res.status(201).json({ message: "Sponsor created successfully", sponsor: newSponsor });

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
        await sponsorship.save();
        res.status(201).json({ message: "Payment record created successfully", payment: newPayment });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

 
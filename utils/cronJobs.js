const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Swimmer = require('../models/Swimmer');
const { Op } = require('sequelize');
const https = require('https');

// ── Send WhatsApp message via CallMeBot (free API, no account needed)
// Setup: swimmer/parent must send "I allow callmebot to send me messages" to +34 644 597 87 1 on WhatsApp first
// Then use their phone number + apikey from .env
const sendWhatsApp = async (phone, message) => {
    try {
        const apiKey = process.env.WHATSAPP_APIKEY || '';
        if (!apiKey || !phone) {
            console.log(`📵 WhatsApp non configuré — message pour ${phone}: ${message}`);
            return;
        }

        // Format Tunisian number: 58480870 -> 21658480870
        let formattedPhone = phone.replace(/\s/g, '').replace(/^0/, '216');
        if (!formattedPhone.startsWith('216')) formattedPhone = '216' + formattedPhone;

        const encodedMsg = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodedMsg}&apikey=${apiKey}`;

        await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log(`✅ WhatsApp envoyé à ${formattedPhone}`);
                    resolve(data);
                });
            }).on('error', reject);
        });
    } catch (err) {
        console.error(`❌ Erreur WhatsApp pour ${phone}:`, err.message);
    }
};

const initCronJobs = () => {
    // Runs every day at 08:00
    cron.schedule('0 8 * * *', async () => {
        console.log('🔄 Cron Job: Vérification des abonnements...');

        try {
            const today = new Date().toISOString().slice(0, 10);

            // 1. Mark expired subscriptions
            const [expiredCount] = await Subscription.update(
                { status: 'expired' },
                { where: { endDate: { [Op.lt]: today }, status: 'active' } }
            );
            if (expiredCount > 0) console.log(`✅ ${expiredCount} abonnements expirés.`);

            // 2. Find subscriptions expiring in exactly 3 days → send WhatsApp
            const in3days = new Date();
            in3days.setDate(in3days.getDate() + 3);
            const alertDate = in3days.toISOString().slice(0, 10);

            const expiringSoon = await Subscription.findAll({
                where: { endDate: alertDate, status: 'active' },
                include: [{ model: Swimmer }]
            });

            for (const sub of expiringSoon) {
                const swimmer = sub.Swimmer;
                if (!swimmer) continue;

                const name = `${swimmer.firstName} ${swimmer.lastName}`;
                const endDate = new Date(sub.endDate).toLocaleDateString('fr-FR');

                const msgFr = `🏊 CSGN Club\n\nBonjour,\n\nL'abonnement de *${name}* expire le *${endDate}* (dans 3 jours).\n\nMerci de le renouveler pour continuer à bénéficier des séances d'entraînement.\n\nContact: csgn.finswimming.diving@gmail.com\nTél: 58 480 870`;

                // Send to swimmer phone
                if (swimmer.phoneNumber) {
                    await sendWhatsApp(swimmer.phoneNumber, msgFr);
                }

                // Also send to parent phone if different
                if (swimmer.parentPhoneNumber && swimmer.parentPhoneNumber !== swimmer.phoneNumber) {
                    const msgParent = `🏊 CSGN Club\n\nBonjour,\n\nL'abonnement de votre enfant *${name}* expire le *${endDate}* (dans 3 jours).\n\nMerci de contacter le club pour le renouvellement.\n\nTél: 58 480 870`;
                    await sendWhatsApp(swimmer.parentPhoneNumber, msgParent);
                }

                console.log(`📲 Alerte envoyée pour ${name} (expire ${endDate})`);
            }

            // 3. Also check subscriptions expiring in 1 day (final reminder)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowDate = tomorrow.toISOString().slice(0, 10);

            const expiringTomorrow = await Subscription.findAll({
                where: { endDate: tomorrowDate, status: 'active' },
                include: [{ model: Swimmer }]
            });

            for (const sub of expiringTomorrow) {
                const swimmer = sub.Swimmer;
                if (!swimmer) continue;
                const name = `${swimmer.firstName} ${swimmer.lastName}`;
                const msgUrgent = `⚠️ CSGN Club — URGENT\n\nL'abonnement de *${name}* expire *demain*.\n\nContactez-nous immédiatement pour le renouveler.\nTél: 58 480 870`;

                if (swimmer.phoneNumber) await sendWhatsApp(swimmer.phoneNumber, msgUrgent);
                if (swimmer.parentPhoneNumber && swimmer.parentPhoneNumber !== swimmer.phoneNumber) {
                    await sendWhatsApp(swimmer.parentPhoneNumber, msgUrgent);
                }
            }

            if (expiringSoon.length === 0 && expiringTomorrow.length === 0) {
                console.log('✅ Aucune alerte WhatsApp à envoyer aujourd\'hui.');
            }

        } catch (error) {
            console.error('❌ Erreur Cron Job:', error.message);
        }
    });

    console.log('⏰ Cron jobs initialisés (vérification quotidienne à 08:00)');
};

module.exports = initCronJobs;
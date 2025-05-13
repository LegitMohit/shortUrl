const shortid = require("shortid");
const URL = require("../models/url");

async function handleGenrateNewShortUrl(req, res) {
    const shortId = shortid();
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: "url is required" });
    await URL.create({
        shortId: shortId,
        redirectURL: body.url,
        visithistory: [],
        createdBy: req.user._id,
    });
    const allUrls = await URL.find({ createdBy: req.user._id });
    return res.render("home", {
        id: shortId,
        urls: allUrls
    });
}

async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });
    return res.json({totalclicks: result.visithistory.length});
}


module.exports = {
    handleGenrateNewShortUrl,
    handleGetAnalytics,
};

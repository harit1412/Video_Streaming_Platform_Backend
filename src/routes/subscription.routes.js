const {Router}= require("express")
const {getChannelSubscribers,getSubscribedChannels,toggleSubscription} = require("../controllers/subscription.controller.js")

const verifyJWT = require("../middlewares/auth.middleware.js")

const SubscriptionRouter = Router();

SubscriptionRouter.use(verifyJWT)

SubscriptionRouter.route("/c/:channelId").get(getChannelSubscribers)
SubscriptionRouter.route("/c/:channelId").post(toggleSubscription)
SubscriptionRouter.route("/u/:userId").get(getSubscribedChannels)

module.exports = SubscriptionRouter
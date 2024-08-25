const {Router}= require("express")
const {getChannelSubscribers,getSubscribedChannels,toggleSubscription} = require("../controllers/subscription.controller.js")
const asyncHandler = require("../utils/asyncHandlers.js")

const verifyJWT = require("../middlewares/auth.middleware.js")

const SubscriptionRouter = Router();

SubscriptionRouter.use(asyncHandler(verifyJWT))

SubscriptionRouter.route("/c/:channelId").get(asyncHandler(getChannelSubscribers))
SubscriptionRouter.route("/c/:channelId").post(asyncHandler(toggleSubscription))
SubscriptionRouter.route("/u/:userId").get(asyncHandler(getSubscribedChannels))

module.exports = SubscriptionRouter
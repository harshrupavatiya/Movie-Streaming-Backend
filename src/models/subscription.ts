import mongoose, { Schema, Document } from "mongoose";
import { ISubscription } from "../types/db.model";

// Define the TypeScript interface for Subscription


// Define the Mongoose schema
const SubscriptionSchema: Schema = new Schema<ISubscription>({
    subscriptionID: {
        type: String,
        required: true, unique: true
    },
    userID: {
        type: String, required: true
    },
    paymentDate: {
        type: Date, required: true

    },
    planEndingDate: {
        type: Date, required: true

    },
    amount: {
        type: Number, required: true

    },
    subscriptionType: {
        type: String,
        enum: ["basic", "free", "premium"],
        required: true
    },
    transactionId: {
        type: String, required: true
    },
}, { timestamps: true });

// Create the model
const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;

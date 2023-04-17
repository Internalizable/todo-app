import {getModelForClass, modelOptions, mongoose, prop, Ref} from "@typegoose/typegoose";

@modelOptions({
    schemaOptions: {
        collection: "users",
        timestamps: false
    },
})
export class User {
    public _id!: mongoose.Types.ObjectId;

    @prop({unique: true})
    public email!: string;

    @prop()
    public password!: string;
}

export const UserModel = getModelForClass(User);
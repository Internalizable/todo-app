import {getModelForClass, modelOptions, mongoose, prop, Ref} from "@typegoose/typegoose";

@modelOptions({
    schemaOptions: {
        collection: "todos",
        timestamps: false
    },
})
export class Todo {
    public _id!: mongoose.Types.ObjectId;

    @prop()
    public guestId!: string;

    @prop()
    public message!: string;

    @prop({default: false})
    public completed!: boolean;

    @prop({default: Date.now()})
    public date!: string;
}

export const TodoModel = getModelForClass(Todo);
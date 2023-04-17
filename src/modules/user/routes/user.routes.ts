import express, {Request, Response} from 'express';
import {validateRequestBody} from "../../../middlewares/validator";
import {StatusCodes} from "http-status-codes";
import {Builder} from "builder-pattern";
import FunctionResponse from "../../../utils/appError";
import {userSchema} from "../schema/user.schema";
import {UserModel} from "../models/user.model";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../../../config/config";
import bcrypt from 'bcrypt';
const router = express.Router();

router.post('/signup', validateRequestBody(userSchema), async (req: Request, res: Response) => {
    try {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);

        const userDetails = {
            ...req.body,
            password: bcrypt.hashSync(req.body.password, salt)
        }

        const userDatabase: any = await UserModel.create(userDetails)

        if(userDatabase) {
            const token = jwt.sign(userDatabase.toObject(), JWT_SECRET, { expiresIn: '2h' });

            return res.status(StatusCodes.OK).json(Builder(FunctionResponse)
                .code(StatusCodes.OK)
                .message("Successfully created the required user account.")
                .data(userDatabase.toObject(({
                    versionKey: false, transform: (_doc: any, ret: any) => {
                        ret.token = token;
                        ret.id = ret._id;
                        delete ret._id;
                        delete ret.password;
                    }
                })))
                .build())
        } else
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("An error occurred whilst contacting the database")
                .build())

    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
            .code(StatusCodes.INTERNAL_SERVER_ERROR)
            .message("An error occurred whilst creating the required user: " + err.message)
            .build())
    }
});
router.post('/login', validateRequestBody(userSchema), async (req: Request, res: Response) => {
    try {
        const userDB = await UserModel.findOne({email: req.body.email}).exec()

        if(!userDB)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("A user with that email does not exist")
                .build())

        const isMatch = bcrypt.compareSync(req.body.password, userDB.password);

        if (isMatch) {
            const token = jwt.sign(userDB.toObject(), JWT_SECRET, { expiresIn: '2h' });

            return res.status(StatusCodes.OK).json(Builder(FunctionResponse)
                .code(StatusCodes.OK)
                .message("Successfully logged in the required user account.")
                .data(userDB.toObject(({
                    versionKey: false, transform: (_doc: any, ret: any) => {
                        ret.token = token;
                        ret.id = ret._id;
                        delete ret._id;
                        delete ret.password;
                    }
                })))
                .build())
        } else {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("The password provided does not match.")
                .build())
        }

    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
            .code(StatusCodes.INTERNAL_SERVER_ERROR)
            .message("An error occurred whilst logging in the required user: " + err.message)
            .build())
    }
});
export default router;
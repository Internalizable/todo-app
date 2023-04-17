import express, {Request, Response} from 'express';
import {validateRequestBody} from "../../../middlewares/validator";
import {StatusCodes} from "http-status-codes";
import {Builder} from "builder-pattern";
import FunctionResponse from "../../../utils/appError";
import {createTodoSchema, updateTodoSchema} from "../schemas/todo.schema";
import {TodoModel} from "../models/todo.model";
import {authenticateToken} from "../../../middlewares/authenticate";
const router = express.Router();

router.post('/create', authenticateToken, validateRequestBody(createTodoSchema), async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user._id;

        const todoItem = {
            ...req.body,
            userId: userId
        }

        const todoDatabase: any = await TodoModel.create(todoItem)

        if(todoDatabase)
            return res.status(StatusCodes.OK).json(Builder(FunctionResponse)
                .code(StatusCodes.OK)
                .message("Successfully created the required todo item.")
                .data(todoDatabase.toObject(({ versionKey: false, transform: (_doc: any, ret: any) => {
                    ret.id = ret._id;
                    delete ret._id;
                }})))
                .build())
        else
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("An error occurred whilst contacting the database")
                .build())

    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
            .code(StatusCodes.INTERNAL_SERVER_ERROR)
            .message("An error occurred whilst creating the required todo item: " + err.message)
            .build())
    }
});
router.delete('/:itemId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const todoItem = await TodoModel.findById(req.params.itemId)

        if(!todoItem)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("A todo item with that id does not exist")
                .build())

        const userId = res.locals.user._id;

        if(todoItem.userId != userId)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("The todo item provided and the user id provided do not match.")
                .build())

        await TodoModel.findByIdAndDelete(req.params.itemId)

        return res.status(StatusCodes.OK).json(Builder(FunctionResponse)
            .code(StatusCodes.OK)
            .message("Successfully deleted the required todo item.")
            .build())

    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
            .code(StatusCodes.INTERNAL_SERVER_ERROR)
            .message("An error occurred whilst deleting the required todo item: " + err.message)
            .build())
    }
});
router.put('/:itemId', authenticateToken, validateRequestBody(updateTodoSchema), async (req: Request, res: Response) => {
    try {
        const todoItem = await TodoModel.findById(req.params.itemId)

        if(!todoItem)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("A todo item with that id does not exist")
                .build())

        const userId = res.locals.user._id;

        if(todoItem.userId != userId)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("The todo item provided and the user id provided do not match.")
                .build())

        const updatedDatabase = await TodoModel.findByIdAndUpdate(req.params.itemId, req.body, {new: true}).exec();

        if(updatedDatabase) {
            return res.status(StatusCodes.OK).json(Builder(FunctionResponse)
                .code(StatusCodes.OK)
                .message("Successfully updated the required todo item.")
                .data(updatedDatabase.toObject(({ versionKey: false, transform: (_doc: any, ret: any) => {
                        ret.id = ret._id;
                        delete ret._id;
                    }})))
                .build())
        } else
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
                .code(StatusCodes.INTERNAL_SERVER_ERROR)
                .message("An error occurred whilst updating the required todo item")
                .build())


    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Builder(FunctionResponse)
            .code(StatusCodes.INTERNAL_SERVER_ERROR)
            .message("An error occurred whilst updating the required todo item: " + err.message)
            .build())
    }
});
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const todos = await TodoModel.find({
        userId: res.locals.user._id
    })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .exec();

    const todosWithId = todos.map(todo => {
        return todo.toObject(({ versionKey: false, transform: (_doc: any, ret: any) => {
                ret.id = ret._id;
                delete ret._id;
        }}))
    });

    const count = await TodoModel.countDocuments();
    const totalPages = Math.ceil(count / limit);

    return res.status(StatusCodes.OK).json(Builder(FunctionResponse)
        .code(StatusCodes.OK)
        .message("Found the requested todos from the selected page")
        .data({
            page: page,
            limit: limit,
            totalPages: totalPages,
            todos: todosWithId
        })
        .build())
})

export default router;
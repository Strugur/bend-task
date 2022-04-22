import { Router, RequestHandler, response } from 'express';
import { Op } from 'sequelize';
import { BadRequestError, UnauthorizedError } from '../errors';
import type { SequelizeClient } from '../sequelize';
import { initTokenValidationRequestHandler, initAdminValidationRequestHandler, RequestAuth } from '../middleware/security';
import { UserType } from '../constants';
import { Post } from '../repositories/posts';
import { createPostValidationSchema, 
    togglePostStatusValidationSchema, 
    updatePostValidationSchema,
    removePostValidationSchema } from "../request-validation";

export function initPostsRouter(sequelizeClient: SequelizeClient): Router {
    const router = Router({ mergeParams: true });

    const tokenValidation = initTokenValidationRequestHandler(sequelizeClient);
    
    router.route('/')
        .get(tokenValidation, initListPostsRequestHandler(sequelizeClient));

    router.route('/create')
        .post(tokenValidation, initCreatePostRequestHandler(sequelizeClient));

    router.route('/update')
        .post(tokenValidation, initUpdatePostRequestHandler(sequelizeClient));

    router.route('/remove')
        .post(tokenValidation, initRemovePostRequestHandler(sequelizeClient));

    router.route('/toggle-status')
        .post(tokenValidation, tokenValidation, initTogglePostStatusRequestHandler(sequelizeClient));

    return router;
}

function initListPostsRequestHandler(sequelizeClient: SequelizeClient): RequestHandler{
    return async function listPostsRequestHandler(req, res, next): Promise<void> {
        const { models } = sequelizeClient;
        const { auth } = req as unknown as { auth: RequestAuth };
        const isAdmin = auth.user.type === UserType.ADMIN;
        
        try {
            let posts: Post[] = [];
            if(isAdmin){
                posts = await models.posts.findAll();
            }else{
                posts = await models.posts.findAll({ where: {
                    [Op.or]: [{isHidden: false}, { authorId: auth.user.id}]
                } });
            }

            res.send(posts);
            return res.end();
        } catch (error) {
            next(error);
        }
        
    }
}

function initCreatePostRequestHandler(sequelizeClient: SequelizeClient): RequestHandler{
    return async function (req, res, next): Promise<void> {
        try {
            await createPostValidationSchema.validateAsync(req.body);
            const { models } = sequelizeClient;
            const {title, content, authorId, isHidden} = req.body;
           
            await models.posts.create({ title, content, authorId, isHidden });
            
            res.sendStatus(204);
            return res.end();
        } catch (error) {
            next(error);
        }
    }
}

function initTogglePostStatusRequestHandler(sequelizeClient: SequelizeClient): RequestHandler{
    return async function (req, res, next): Promise<void> {
        try {
            await togglePostStatusValidationSchema.validateAsync(req.body);
            const { models } = sequelizeClient;
            const {postId, isHidden} = req.body;
            const { auth } = req as unknown as { auth: RequestAuth };
            const isAdmin = auth.user.type === UserType.ADMIN;

            let toggleResult = [];

            if(isAdmin){
                toggleResult = await models.posts.update(
                    { isHidden },
                    { where: { id: postId } }
                );
            }else{
                toggleResult = await models.posts.update(
                    { isHidden },
                    { where: { id: postId, authorId: auth.user.id } }
                );
            }
            if(toggleResult[0] == 0){
                throw new BadRequestError('TOGGLE_STATUS_FAILED');
            }
            res.status(204).send();
            return res.end();
        } catch (error) {
            next(error);
        }

    }
}

function initUpdatePostRequestHandler(sequelizeClient: SequelizeClient): RequestHandler{
    return async function (req, res, next): Promise<void> {
        try {
            await updatePostValidationSchema.validateAsync(req.body);
            const { models } = sequelizeClient;
            const {postId, title, content} = req.body;
            const { auth } = req as unknown as { auth: RequestAuth };
            const isAdmin = auth.user.type === UserType.ADMIN;
            console.log(auth);
            
            let updateResult = [];
            if(isAdmin){
                updateResult = await models.posts.update(
                    { title, content},
                    { where: { id: postId }}
                );
            }else{
                updateResult = await models.posts.update(
                    { title, content},
                    { where: { id: postId , authorId:auth.user.id }, }
                );
            }
            if(updateResult[0] == 0){
                throw new BadRequestError('UPDATE_POST_FAILED');
            }
            
            res.status(204).send();
            return res.end();
        } catch (error) {
            next(error);
        }
    }
}

function initRemovePostRequestHandler(sequelizeClient: SequelizeClient): RequestHandler{
    return async function (req, res, next): Promise<void> {
        try {
            await removePostValidationSchema.validateAsync(req.body);
            const { models } = sequelizeClient;
            const {postId} = req.body;
            const { auth } = req as unknown as { auth: RequestAuth };
            const isAdmin = auth.user.type === UserType.ADMIN;
            console.log("auth.user.id ", auth.user.id );
            let removeResult:number;
            if(isAdmin){
                removeResult = await models.posts.destroy({
                    where: { id: postId },
                });
            }else{
                removeResult = await models.posts.destroy({
                    where: { id: postId , authorId:auth.user.id },
                });
            }
            if(removeResult == 0){
                throw new BadRequestError('REMOVE_POST_FAILDED');
            }

			res.sendStatus(204);
            return res.end();
        } catch (error) {
            next(error);
        }

    }
}


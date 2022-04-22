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
    const adminValidation = initAdminValidationRequestHandler();

    // postsDataAccess =  initPostsDataAccess

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
        const { auth: { user: { type: userType } } } = req as unknown as { auth: RequestAuth };
        const isAdmin = userType === UserType.ADMIN;
        
        try {
            let posts: Post[] = [];
            if(isAdmin){
                console.log("siAdmin");
                posts = await models.posts.findAll();
            }else{
                posts = await models.posts.findAll({ where: { authorId: 1} });
            }

            // const posts = await models.posts.findAll({
            //     attributes: isAdmin ? ['id','title','content'] : ['title', 'content'],
            //     // ...!isAdmin && { where: { type: { [Op.ne]: UserType.ADMIN } } },
            //     raw: true,
            //   });

            // const posts = await models.posts.findAll();
            res.send(posts);
            return res.end();
        } catch (error) {
            next(error);
        }
       

        
    }
}

function initCreatePostRequestHandler(sequelizeClient: SequelizeClient): RequestHandler{
    return async function (req, res, next): Promise<void> {
        const { models } = sequelizeClient;
        const {title, content, authorId} = req.body;
        console.log(req.body);
        try {
            await createPostValidationSchema.validateAsync(req.body);
            

            await models.posts.create({ title, content, authorId });
            res.send("Create Post");
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

            const updateResult = await models.posts.update(
				{ isHidden },
				{ where: { id: postId } }
			);
            if(updateResult[0] == 0){
                throw new BadRequestError('INVALID_POST_ID');
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
        console.log(req.body);
        try {
            await updatePostValidationSchema.validateAsync(req.body);
            const { models } = sequelizeClient;
            const {postId, title, content} = req.body;
            const { auth } = req as unknown as { auth: RequestAuth };
            // const isAdmin = auth.user.type === UserType.ADMIN;
            console.log(auth);

            // if(isAdmin){
            //     await models.posts.update(
            //         { title, content},
            //         { where: { id: postId }}
            //     );
            // }else{
            //     await models.posts.update(
            //         { title, content},
            //         { where: { id: postId , authorId:auth.user.id }, }
            //     );
            // }
            
            res.status(204).send();
            return res.end();
        } catch (error) {
            next(error);
        }
    }
}

function initRemovePostRequestHandler(sequelizeClient: SequelizeClient): RequestHandler{
    return async function (req, res, next): Promise<void> {
        
        console.log(req.body);
        try {
            await removePostValidationSchema.validateAsync(req.body);
            const { models } = sequelizeClient;
            const {postId} = req.body;
            // const { auth: { user: { type: userType } } } = req as unknown as { auth: RequestAuth };
            const { auth } = req as unknown as { auth: RequestAuth };
            const isAdmin = auth.user.type === UserType.ADMIN;
            if(isAdmin){
                await models.posts.destroy({
                    where: { id: postId },
                });
            }else{
                await models.posts.destroy({
                    where: { id: postId , authorId:auth.user.id },
                });
            }
            
			res.sendStatus(200);
            return res.end();
        } catch (error) {
            next(error);
        }

    }
}


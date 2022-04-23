export interface CreatePostRequest {
    title: string, 
    content: string, 
    isHidden: boolean
};

export interface UpdatePostRequest {
    postId: number,
    title: string, 
    content: string, 
    isHidden: boolean
};

export interface RemovePostRequest {
    postId: number, 
};
export interface TogglePostStatusRequest {
    postId: number, 
    isHidden: boolean
};
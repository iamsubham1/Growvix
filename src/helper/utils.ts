export const userObjectCleanUp = (obj: any) => {
    if (obj && typeof obj.toObject === 'function') {
        obj = obj.toObject();
    }
    delete obj.password;
    delete obj.__v;
    return obj;
};

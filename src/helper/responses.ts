export const responseStatus = (res: any, status: any, message: any, data: any) => {
    if (status === 200) {
        res.status(status).json({
            statusMessage: 'Success',
            status,
            success: true,
            message,
            data,
        });
    } else if (status === 400) {
        res.status(status).json({
            statusMessage: 'Bad Request',
            status,
            success: false,
            message,
            data,
        });
    } else if (status === 204) {
        res.status(200).json({
            statusMessage: 'No Content',
            status,
            success: false,
            message,
            data,
        });
    } else if (status === 500) {
        res.status(status).json({
            statusMessage: 'Error',
            status,
            success: false,
            message,
            err: data,
        });
    } else if (status === 403) {
        res.status(status).json({
            statusMessage: 'Forbidden',
            status,
            success: false,
            message,
            forbidden: data,
        });
    } else if (status === 401) {
        res.status(status).json({
            statusMessage: 'Unauthorized',
            status,
            success: false,
            message,
            forbidden: data,
        });
    } else if (status === 404) {
        res.status(status).json({
            statusMessage: 'Page not found',
            status,
            success: false,
            message,
            err: data,
        });
    }
};

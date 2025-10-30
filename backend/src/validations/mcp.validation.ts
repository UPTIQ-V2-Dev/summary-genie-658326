import Joi from 'joi';

const mcpPost = {
    body: Joi.object().keys({
        jsonrpc: Joi.string().valid('2.0').required(),
        method: Joi.string().required(),
        params: Joi.object().optional(),
        id: Joi.alternatives().try(Joi.string(), Joi.number()).allow(null).required()
    })
};

const mcpGet = {
    // No body validation needed for GET request
};

const mcpDelete = {
    // No body validation needed for DELETE request
};

export default {
    mcpPost,
    mcpGet,
    mcpDelete
};

import Joi from 'joi';

const generateSummary = {
    body: Joi.object().keys({
        text: Joi.string().required().min(10).max(50000),
        length: Joi.string().valid('short', 'medium', 'long').default('medium'),
        style: Joi.string().valid('paragraph', 'bullets', 'outline').default('paragraph')
    })
};

const getSummaryHistory = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        dateFrom: Joi.date().iso().optional(),
        dateTo: Joi.date().iso().optional(),
        sortBy: Joi.string().valid('createdAt', 'updatedAt', 'wordCount', 'characterCount').default('createdAt')
    })
};

const getSummaryById = {
    params: Joi.object().keys({
        id: Joi.number().integer().required()
    })
};

const updateSummary = {
    params: Joi.object().keys({
        id: Joi.number().integer().required()
    }),
    body: Joi.object()
        .keys({
            title: Joi.string().min(1).max(200).optional()
        })
        .min(1)
};

const deleteSummary = {
    params: Joi.object().keys({
        id: Joi.number().integer().required()
    })
};

export default {
    generateSummary,
    getSummaryHistory,
    getSummaryById,
    updateSummary,
    deleteSummary
};

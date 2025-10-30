import { summaryController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { summaryValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router();

// All summary routes require authentication with proper permissions
router
    .route('/generate')
    .post(auth('manageSummaries'), validate(summaryValidation.generateSummary), summaryController.generateSummary);

router
    .route('/history')
    .get(auth('getSummaries'), validate(summaryValidation.getSummaryHistory), summaryController.getSummaryHistory);

router
    .route('/:id')
    .get(auth('getSummaries'), validate(summaryValidation.getSummaryById), summaryController.getSummaryById)
    .delete(auth('manageSummaries'), validate(summaryValidation.deleteSummary), summaryController.deleteSummary);

export default router;

/**
 * @swagger
 * tags:
 *   name: Summaries
 *   description: AI text summarization and summary management
 */

/**
 * @swagger
 * /api/summary/generate:
 *   post:
 *     summary: Generate a text summary
 *     description: Generate AI-powered text summary with specified parameters
 *     tags: [Summaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10000
 *                 description: Text to summarize
 *               length:
 *                 type: string
 *                 enum: [short, medium, long]
 *                 default: medium
 *                 description: Summary length
 *               style:
 *                 type: string
 *                 enum: [paragraph, bullet, numbered]
 *                 default: paragraph
 *                 description: Summary style format
 *             example:
 *               text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
 *               length: "medium"
 *               style: "paragraph"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 originalText:
 *                   type: string
 *                 summary:
 *                   type: string
 *                 length:
 *                   type: string
 *                 style:
 *                   type: string
 *                 wordCount:
 *                   type: integer
 *                 characterCount:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "422":
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/summary/history:
 *   get:
 *     summary: Get user's summary history
 *     description: Get user's summary history with filtering and pagination
 *     tags: [Summaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of summaries
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, summary, and original text
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter summaries from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter summaries to this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, wordCount, characterCount, newest, oldest]
 *           default: createdAt
 *         description: Sort by field
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       originalText:
 *                         type: string
 *                       summary:
 *                         type: string
 *                       title:
 *                         type: string
 *                       wordCount:
 *                         type: integer
 *                       characterCount:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "422":
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/summary/{id}:
 *   get:
 *     summary: Get specific summary by ID
 *     description: Get a specific summary by its ID (user can only access their own summaries)
 *     tags: [Summaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Summary ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 originalText:
 *                   type: string
 *                 summary:
 *                   type: string
 *                 title:
 *                   type: string
 *                 wordCount:
 *                   type: integer
 *                 characterCount:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a summary
 *     description: Delete a specific summary (user can only delete their own summaries)
 *     tags: [Summaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Summary ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

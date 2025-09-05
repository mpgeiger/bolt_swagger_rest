import { Router } from 'express';
import { convertSwaggerToBolt } from '../services/swagger-converter';
const router = Router();
router.post('/swagger-bolt', async (req, res) => {
    try {
        // Validate request body exists
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400)
                .type('text/plain')
                .send('Body must contain a valid OpenAPI/Swagger JSON document.');
        }
        // Check if it's a valid OpenAPI/Swagger document
        const doc = req.body;
        if (!isValidSwaggerDoc(doc)) {
            return res.status(400)
                .type('text/plain')
                .send('Body must contain a valid OpenAPI/Swagger JSON document.');
        }
        // Convert to Bolt format
        const boltDescriptors = convertSwaggerToBolt(doc);
        res.type('text/plain; charset=utf-8').send(boltDescriptors);
    }
    catch (error) {
        console.error('Error processing swagger document:', error);
        res.status(400)
            .type('text/plain')
            .send('Body must contain a valid OpenAPI/Swagger JSON document.');
    }
});
function isValidSwaggerDoc(doc) {
    // Check for OpenAPI 3.x
    if (doc.openapi && typeof doc.openapi === 'string' && doc.openapi.startsWith('3.')) {
        return doc.paths && typeof doc.paths === 'object';
    }
    // Check for Swagger 2.0
    if (doc.swagger && doc.swagger === '2.0') {
        return doc.paths && typeof doc.paths === 'object';
    }
    return false;
}
export { router as swaggerBoltRouter };

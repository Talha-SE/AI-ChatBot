const TrainingData = require('../models/trainingData');
const { processTrainingFile } = require('../utils/helpers');

class TrainingController {
    async uploadTrainingFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'No file uploaded' 
                });
            }

            const { originalname, mimetype, buffer } = req.file;
            const { category, source } = req.body;
            
            console.log(`Processing file: ${originalname} (${mimetype})`);
            
            // Process the file based on its type
            const processedData = processTrainingFile(buffer, mimetype);
            
            if (processedData.error) {
                return res.status(400).json({ 
                    success: false, 
                    error: processedData.error 
                });
            }

            // Save training data to database
            const savedItems = [];
            const errors = [];
            
            console.log(`Saving ${processedData.length} items from file`);

            for (const item of processedData) {
                try {
                    // Skip items with insufficient content
                    if (!item.content && !item.text && !item.answer) {
                        errors.push({
                            item: item.title || 'Unknown item',
                            error: 'Missing content'
                        });
                        continue;
                    }
                    
                    const content = item.content || item.text || item.answer || '';
                    if (content.length < 10) {
                        errors.push({
                            item: item.title || 'Unknown item',
                            error: 'Content too short (min 10 characters)'
                        });
                        continue;
                    }

                    const trainingItem = new TrainingData({
                        title: item.title || item.question || 'Untitled',
                        content: content,
                        category: item.category || category || 'General',
                        source: item.source || source || 'User Upload',
                        fileType: mimetype.split('/')[1],
                        originalFileName: originalname,
                        isActive: true,
                        metadata: {
                            originalItem: item,
                            wordCount: content.split(/\s+/).length,
                            charCount: content.length,
                            dateProcessed: new Date()
                        }
                    });
                    
                    const savedItem = await trainingItem.save();
                    savedItems.push(savedItem);
                } catch (itemError) {
                    console.error('Error saving training item:', itemError);
                    errors.push({
                        item: item.title || 'Unknown item',
                        error: itemError.message
                    });
                }
            }

            if (savedItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid training items found in file',
                    errors
                });
            }

            res.json({
                success: true,
                message: `File processed successfully. Added ${savedItems.length} training items for chatbot.`,
                itemsAdded: savedItems.length,
                totalItems: processedData.length,
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (error) {
            console.error('Error uploading training file:', error);
            res.status(500).json({
                success: false,
                error: `Failed to process training file: ${error.message}`
            });
        }
    }

    async getTrainingData(req, res) {
        try {
            const { category, source, limit, search } = req.query;
            const query = {};
            
            if (category) query.category = category;
            if (source) query.source = source;
            if (search) {
                query.$text = { $search: search };
            }
            
            const data = await TrainingData.find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit) || 100);
            
            // Calculate stats
            const totalWordCount = data.reduce((sum, item) => {
                const wordCount = item.metadata?.wordCount || item.content.split(/\s+/).length;
                return sum + wordCount;
            }, 0);
            
            const categories = [...new Set(data.map(item => item.category))];
            const sources = [...new Set(data.map(item => item.source))];
                
            res.json({
                success: true,
                count: data.length,
                stats: {
                    totalWordCount,
                    categories,
                    sources
                },
                data
            });
        } catch (error) {
            console.error('Error fetching training data:', error);
            res.status(500).json({
                success: false,
                error: `Failed to fetch training data: ${error.message}`
            });
        }
    }

    async deleteTrainingData(req, res) {
        try {
            const { id } = req.params;
            const result = await TrainingData.findByIdAndDelete(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'Training data not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Training data deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting training data:', error);
            res.status(500).json({
                success: false,
                error: `Failed to delete training data: ${error.message}`
            });
        }
    }
}

module.exports = TrainingController;

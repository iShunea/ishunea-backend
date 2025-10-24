const express = require('express');
const router = express.Router();
const Translation = require('../schemas/translation');

// GET /api/translations - Get all translations for a language
router.get('/api/translations', async (req, res) => {
  try {
    const { lang, category } = req.query;

    // Validate required lang parameter
    if (!lang) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Missing required parameter: lang' 
      });
    }

    // Validate language code
    if (!['en', 'ro', 'ru'].includes(lang)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Invalid language code. Allowed values: en, ro, ru' 
      });
    }

    // Build query
    const query = { language: lang };
    if (category) {
      query.category = category;
    }

    // Fetch translations
    const translations = await Translation.find(query)
      .select('id key value language category page updated_at')
      .sort({ key: 1 });

    // Transform _id to id for frontend
    const result = translations.map(t => ({
      id: t._id,
      key: t.key,
      value: t.value,
      language: t.language,
      category: t.category,
      page: t.page,
      updated_at: t.updated_at
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Error retrieving translations' 
    });
  }
});

// GET /api/translations/:key - Get a specific translation by key and language
router.get('/api/translations/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { lang } = req.query;

    // Validate required lang parameter
    if (!lang) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Missing required parameter: lang' 
      });
    }

    // Validate language code
    if (!['en', 'ro', 'ru'].includes(lang)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Invalid language code. Allowed values: en, ro, ru' 
      });
    }

    // Fetch specific translation
    const translation = await Translation.findOne({ 
      key: key, 
      language: lang 
    });

    if (!translation) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: `Translation not found for key: ${key} and language: ${lang}` 
      });
    }

    // Return translation
    res.status(200).json({
      id: translation._id,
      key: translation.key,
      value: translation.value,
      language: translation.language,
      category: translation.category,
      page: translation.page,
      updated_at: translation.updated_at
    });
  } catch (error) {
    console.error('Error fetching translation:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Error retrieving translation' 
    });
  }
});

// POST /api/translations - Create or update a translation (admin endpoint)
router.post('/api/translations', async (req, res) => {
  try {
    const { key, value, language, category, page } = req.body;

    // Validate required fields
    if (!key || !value || !language) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Missing required fields: key, value, language' 
      });
    }

    // Validate language code
    if (!['en', 'ro', 'ru'].includes(language)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Invalid language code. Allowed values: en, ro, ru' 
      });
    }

    // Check if translation exists
    const existingTranslation = await Translation.findOne({ key, language });

    if (existingTranslation) {
      // Update existing translation
      existingTranslation.value = value;
      if (category) existingTranslation.category = category;
      if (page) existingTranslation.page = page;
      existingTranslation.updated_at = new Date();
      
      await existingTranslation.save();
      
      res.status(200).json({
        message: 'Translation updated successfully',
        translation: {
          id: existingTranslation._id,
          key: existingTranslation.key,
          value: existingTranslation.value,
          language: existingTranslation.language,
          category: existingTranslation.category,
          updated_at: existingTranslation.updated_at
        }
      });
    } else {
      // Create new translation
      const newTranslation = new Translation({
        key,
        value,
        language,
        category,
        page
      });

      await newTranslation.save();

      res.status(201).json({
        message: 'Translation created successfully',
        translation: {
          id: newTranslation._id,
          key: newTranslation.key,
          value: newTranslation.value,
          language: newTranslation.language,
          category: newTranslation.category,
          updated_at: newTranslation.updated_at
        }
      });
    }
  } catch (error) {
    console.error('Error creating/updating translation:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Error creating/updating translation' 
    });
  }
});

// PUT /api/translations/:key - Update a specific translation
router.put('/api/translations/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { lang } = req.query;
    const { value, category, page } = req.body;

    // Validate required parameters
    if (!lang) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Missing required parameter: lang' 
      });
    }

    if (!value) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Missing required field: value' 
      });
    }

    // Find and update translation
    const translation = await Translation.findOne({ key, language: lang });

    if (!translation) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: `Translation not found for key: ${key} and language: ${lang}` 
      });
    }

    translation.value = value;
    if (category !== undefined) translation.category = category;
    if (page !== undefined) translation.page = page;
    translation.updated_at = new Date();

    await translation.save();

    res.status(200).json({
      message: 'Translation updated successfully',
      translation: {
        id: translation._id,
        key: translation.key,
        value: translation.value,
        language: translation.language,
        category: translation.category,
        updated_at: translation.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating translation:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Error updating translation' 
    });
  }
});

// DELETE /api/translations/:key - Delete a specific translation
router.delete('/api/translations/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { lang } = req.query;

    // Validate required parameters
    if (!lang) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Missing required parameter: lang' 
      });
    }

    // Find and delete translation
    const translation = await Translation.findOneAndDelete({ key, language: lang });

    if (!translation) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: `Translation not found for key: ${key} and language: ${lang}` 
      });
    }

    res.status(200).json({
      message: 'Translation deleted successfully',
      translation: {
        id: translation._id,
        key: translation.key,
        language: translation.language
      }
    });
  } catch (error) {
    console.error('Error deleting translation:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Error deleting translation' 
    });
  }
});

module.exports = router;

const pdfParse = require('pdf-parse');
const fs = require('fs');
const ollamaService = require('../services/ollamaService');

exports.processPdf = async (req, res) => {
  try {
    const pdfFile = req.file;
    const dataBuffer = await fs.promises.readFile(pdfFile.path);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    const processedText = await ollamaService.processText(text);

    res.json({ result: processedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

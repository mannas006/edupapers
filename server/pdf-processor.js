import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Warning: Missing Supabase environment variables');
    console.warn('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.warn('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
    console.warn('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    console.warn('📝 PDF processing will work without Supabase integration');
    console.warn('🔧 Create a .env file with Supabase credentials to enable full functionality');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const app = express();
app.use(cors());
app.use(express.json());

// Force console output
const originalLog = console.log;
console.log = (...args) => {
    originalLog(...args);
    // Force flush
    process.stdout.write('');
};

// In-memory storage for processing status (in production, use Redis or database)
const processingStatus = new Map();

// Temporary directory for processing
const tempDir = './temp-processing';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Download file from URL
const downloadFile = (url, filepath, processingId = null) => {
    return new Promise((resolve, reject) => {
        console.log(`Starting download from: ${url}`);
        console.log(`Downloading to: ${filepath}`);
        console.log(`Processing ID: ${processingId}`);
        
        const client = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);
        
        const request = client.get(url, (response) => {
            console.log(`Response status: ${response.statusCode}`);
            console.log(`Response headers:`, response.headers);
            
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
                return;
            }
            
            const totalSize = parseInt(response.headers['content-length'] || '0');
            let downloadedSize = 0;
            
            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                
                if (totalSize > 0 && processingId) {
                    const downloadPercentage = Math.round((downloadedSize / totalSize) * 100);
                    const downloadedMB = (downloadedSize / 1024 / 1024).toFixed(1);
                    const totalMB = (totalSize / 1024 / 1024).toFixed(1);
                    
                    console.log(`Download progress: ${downloadPercentage}% (${downloadedMB}MB/${totalMB}MB)`);
                    
                    // Update processing status with download progress
                    const currentStatus = processingStatus.get(processingId);
                    if (currentStatus) {
                        processingStatus.set(processingId, {
                            ...currentStatus,
                            status: 'downloading',
                            message: 'Downloading PDF file...',
                            downloadPercentage: downloadPercentage,
                            downloadedSize: downloadedMB,
                            totalSize: totalMB,
                            progress: `Downloaded ${downloadedMB}MB of ${totalMB}MB (${downloadPercentage}%)`
                        });
                    }
                }
            });
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`Download completed: ${filepath}`);
                
                // Verify file exists and has content
                if (fs.existsSync(filepath)) {
                    const stats = fs.statSync(filepath);
                    console.log(`Downloaded file size: ${stats.size} bytes`);
                    if (stats.size > 0) {
                        // Update status to show download complete
                        if (processingId) {
                            const currentStatus = processingStatus.get(processingId);
                            if (currentStatus) {
                                processingStatus.set(processingId, {
                                    ...currentStatus,
                                    downloadPercentage: 100,
                                    progress: `Download completed (${(stats.size / 1024 / 1024).toFixed(1)}MB)`
                                });
                            }
                        }
                        resolve();
                    } else {
                        reject(new Error('Downloaded file is empty'));
                    }
                } else {
                    reject(new Error('Downloaded file does not exist'));
                }
            });
            
            file.on('error', (err) => {
                console.error('File write error:', err);
                fs.unlink(filepath, () => {}); // Delete the file async
                reject(err);
            });
        });
        
        request.on('error', (err) => {
            console.error('Download request error:', err);
            fs.unlink(filepath, () => {}); // Delete the file async
            reject(err);
        });
        
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Download timeout after 30 seconds'));
        });
    });
};

// Test progress endpoint (for demonstration)
app.post('/test-progress/:id', (req, res) => {
    const { id } = req.params;
    const { percentage } = req.body;
    
    processingStatus.set(id, {
        status: 'processing',
        message: 'Testing progress bar...',
        timestamp: new Date(),
        progress: `Analyzing question ${Math.ceil(percentage/5)} of 20 (${percentage}%)`,
        percentage: percentage,
        currentQuestion: Math.ceil(percentage/5),
        totalQuestions: 20
    });
    
    res.json({ success: true, message: 'Progress updated' });
});

// Process PDF endpoint
app.post('/webhook/process-pdf', async (req, res) => {
    try {
        const { file_url, filename, metadata, paper_id } = req.body;
        
        if (!file_url || !filename) {
            return res.status(400).json({
                success: false,
                message: 'file_url and filename are required'
            });
        }

        // Only process PDF files
        if (!filename.toLowerCase().endsWith('.pdf')) {
            return res.json({
                success: false,
                message: 'Only PDF files can be processed for question extraction'
            });
        }

        const processingId = uuidv4();
        
        // Clear any existing status for safety (should not happen, but just in case)
        processingStatus.delete(processingId);
        
        // Update status
        processingStatus.set(processingId, {
            status: 'queued',
            message: 'Processing queued',
            timestamp: new Date(),
            paper_id: paper_id
        });

        // Start processing asynchronously
        processPDFAsync(processingId, file_url, filename, metadata, paper_id);

        res.json({
            success: true,
            processing_id: processingId,
            message: 'PDF processing started'
        });

    } catch (error) {
        console.error('Error in PDF processing endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get processing status
app.get('/status/:processing_id', (req, res) => {
    const { processing_id } = req.params;
    const status = processingStatus.get(processing_id);
    
    if (!status) {
        return res.status(404).json({
            success: false,
            message: 'Processing ID not found'
        });
    }

    res.json({
        success: true,
        status: status.status,
        message: status.message,
        questions_count: status.questions_count || 0,
        timestamp: status.timestamp,
        progress: status.progress || null,
        percentage: status.percentage || 0,
        currentQuestion: status.currentQuestion || 0,
        totalQuestions: status.totalQuestions || 0,
        downloadPercentage: status.downloadPercentage || 0,
        downloadedSize: status.downloadedSize || 0,
        totalSize: status.totalSize || 0
    });
});

// Async PDF processing function
async function processPDFAsync(processingId, fileUrl, filename, metadata, paperId) {
    console.log(`\n=== STARTING NEW PROCESSING SESSION ===`);
    console.log(`Processing ID: ${processingId}`);
    console.log(`File URL: ${fileUrl}`);
    console.log(`Filename: ${filename}`);
    console.log(`Paper ID: ${paperId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`==========================================\n`);
    
    try {
        // Update status to downloading
        processingStatus.set(processingId, {
            status: 'downloading',
            message: 'Downloading PDF file...',
            timestamp: new Date(),
            paper_id: paperId
        });

        // Download the PDF file with timestamp for uniqueness
        const timestamp = Date.now();
        const tempFilePath = path.join(tempDir, `${processingId}_${timestamp}.pdf`);
        console.log(`Attempting to download file from: ${fileUrl}`);
        console.log(`Temp file path: ${tempFilePath}`);
        
        // Clean up any existing temp file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        
        try {
            await downloadFile(fileUrl, tempFilePath, processingId);
            console.log(`Successfully downloaded file to: ${tempFilePath}`);
            
            // Verify file exists before proceeding
            if (!fs.existsSync(tempFilePath)) {
                throw new Error(`Downloaded file does not exist at: ${tempFilePath}`);
            }
            
            // Add file verification
            const fileStats = fs.statSync(tempFilePath);
            console.log(`Downloaded file info:`);
            console.log(`- Size: ${fileStats.size} bytes`);
            console.log(`- Created: ${fileStats.birthtime}`);
            console.log(`- Modified: ${fileStats.mtime}`);
            
            // Calculate file hash for verification
            const fileBuffer = fs.readFileSync(tempFilePath);
            const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
            console.log(`- MD5 Hash: ${fileHash}`);
            console.log(`- This will help identify if the same PDF is being processed repeatedly`);
        } catch (downloadError) {
            console.error('Download failed:', downloadError);
            throw new Error(`Failed to download PDF: ${downloadError.message}`);
        }

        // Update status to processing
        processingStatus.set(processingId, {
            status: 'processing',
            message: 'Extracting questions from PDF and analyzing with AI...',
            timestamp: new Date(),
            paper_id: paperId,
            progress: 'Starting question extraction...'
        });

        // Check if PDF processor exists
        const processorPath = path.join(__dirname, '..', 'PDF Question Processor', 'src', 'main.py');
        if (!fs.existsSync(processorPath)) {
            throw new Error('PDF processor not found. Please ensure the PDF Question Processor is properly set up.');
        }

        // Run the Python PDF processor
        const absoluteTempFilePath = path.resolve(tempFilePath);
        console.log(`Passing absolute path to Python: ${absoluteTempFilePath}`);
        
        // Pre-clean any existing output file  
        const originalFileName = path.parse(absoluteTempFilePath).name; // This will be the processingId_timestamp
        const expectedOutputPath = path.join(__dirname, '..', 'PDF Question Processor', 'output', `${originalFileName}_answers.json`);
        console.log(`Will expect output at: ${expectedOutputPath}`);
        if (fs.existsSync(expectedOutputPath)) {
            fs.unlinkSync(expectedOutputPath);
            console.log(`Cleaned up existing output file: ${expectedOutputPath}`);
        }
        
        const pythonProcess = spawn('python3', [processorPath, absoluteTempFilePath], {
            cwd: path.join(__dirname, '..', 'PDF Question Processor'),
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log('PDF Processor Output:', data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
            const output = data.toString();
            console.error('PDF Processor Error:', output);
            
            // Parse progress from tqdm output
            const progressMatch = output.match(/Analyzing questions:\s+(\d+)%/);
            if (progressMatch) {
                const percentage = parseInt(progressMatch[1]);
                const currentCount = output.match(/(\d+)\/(\d+)/);
                
                let progressMessage = `Processing questions... ${percentage}%`;
                if (currentCount) {
                    const current = currentCount[1];
                    const total = currentCount[2];
                    progressMessage = `Analyzing question ${current} of ${total} (${percentage}%)`;
                }
                
                // Update status with progress
                processingStatus.set(processingId, {
                    status: 'processing',
                    message: 'Extracting questions from PDF and analyzing with AI...',
                    timestamp: new Date(),
                    paper_id: paperId,
                    progress: progressMessage,
                    percentage: percentage,
                    currentQuestion: currentCount ? parseInt(currentCount[1]) : 0,
                    totalQuestions: currentCount ? parseInt(currentCount[2]) : 0
                });
            }
        });

        pythonProcess.on('close', async (code) => {
            // Clean up temp file
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });

            if (code === 0) {
                // Success - try to read the results and store in Supabase
                try {
                    const outputPath = path.join(__dirname, '..', 'PDF Question Processor', 'output', `${path.parse(tempFilePath).name}_answers.json`);
                    console.log(`Looking for output file at: ${outputPath}`);
                    console.log(`Temp file used: ${tempFilePath}`);
                    console.log(`Processing ID: ${processingId}`);
                    
                    if (fs.existsSync(outputPath)) {
                        console.log(`Output file found, reading results...`);
                        console.log(`File stats:`, fs.statSync(outputPath));
                        console.log(`File creation time:`, fs.statSync(outputPath).birthtime);
                        console.log(`File modification time:`, fs.statSync(outputPath).mtime);
                        
                        const fileContent = fs.readFileSync(outputPath, 'utf8');
                        console.log(`Raw file content (first 500 chars): ${fileContent.substring(0, 500)}...`);
                        
                        const results = JSON.parse(fileContent);
                        const questionsCount = results.length || 0;
                        console.log(`Parsed ${questionsCount} questions from output file`);
                        
                        // Log first question for debugging
                        if (results.length > 0) {
                            console.log(`First question preview: ${results[0].question.substring(0, 100)}...`);
                            console.log(`Full first question: ${JSON.stringify(results[0], null, 2)}`);
                        }
                        
                        // Store questions in Supabase papers table
                        if (paperId && questionsCount > 0) {
                            console.log(`SAVING TO SUPABASE - Paper ID: ${paperId}, Questions: ${questionsCount}`);
                            console.log(`First question content check: ${results[0]?.question?.substring(0, 200)}...`);
                            
                            const { error: updateError } = await supabase
                                .from('papers')
                                .update({
                                    questions_data: results,
                                    questions_count: questionsCount,
                                    processing_status: 'completed',
                                    processed_at: new Date().toISOString()
                                })
                                .eq('id', paperId);

                            if (updateError) {
                                console.error('Error updating paper with questions:', updateError);
                                processingStatus.set(processingId, {
                                    status: 'failed',
                                    message: 'Error saving questions to database',
                                    timestamp: new Date(),
                                    paper_id: paperId
                                });
                                return;
                            }
                            
                            console.log(`Successfully saved to Supabase`);
                        }
                        
                        processingStatus.set(processingId, {
                            status: 'completed',
                            message: `Successfully extracted and stored ${questionsCount} questions`,
                            questions_count: questionsCount,
                            timestamp: new Date(),
                            paper_id: paperId,
                            results: results
                        });

                        // Clean up output file
                        fs.unlink(outputPath, (err) => {
                            if (err) console.error('Error deleting output file:', err);
                        });
                    } else {
                        processingStatus.set(processingId, {
                            status: 'completed',
                            message: 'PDF processed but no questions found',
                            questions_count: 0,
                            timestamp: new Date(),
                            paper_id: paperId
                        });
                    }
                } catch (parseError) {
                    console.error('Error parsing results:', parseError);
                    processingStatus.set(processingId, {
                        status: 'failed',
                        message: 'Error parsing processing results',
                        timestamp: new Date(),
                        paper_id: paperId
                    });
                }
            } else {
                // Failed
                processingStatus.set(processingId, {
                    status: 'failed',
                    message: `PDF processing failed with code ${code}. Error: ${stderr}`,
                    timestamp: new Date(),
                    paper_id: paperId
                });

                // Update paper status in database
                if (paperId) {
                    await supabase
                        .from('papers')
                        .update({
                            processing_status: 'failed',
                            processed_at: new Date().toISOString()
                        })
                        .eq('id', paperId);
                }
            }
        });

        pythonProcess.on('error', async (error) => {
            console.error('Error spawning Python process:', error);
            processingStatus.set(processingId, {
                status: 'failed',
                message: `Failed to start PDF processor: ${error.message}`,
                timestamp: new Date(),
                paper_id: paperId
            });

            // Update paper status in database
            if (paperId) {
                await supabase
                    .from('papers')
                    .update({
                        processing_status: 'failed',
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', paperId);
            }
        });

    } catch (error) {
        console.error('Error in PDF processing:', error);
        processingStatus.set(processingId, {
            status: 'failed',
            message: `Processing error: ${error.message}`,
            timestamp: new Date(),
            paper_id: paperId
        });

        // Update paper status in database
        if (paperId) {
            await supabase
                .from('papers')
                .update({
                    processing_status: 'failed',
                    processed_at: new Date().toISOString()
                })
                .eq('id', paperId);
        }
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'PDF Processor API is running',
        timestamp: new Date()
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`PDF Processor API running on port ${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook/process-pdf`);
    console.log(`Status endpoint: http://localhost:${PORT}/status/:processing_id`);
});

export default app;

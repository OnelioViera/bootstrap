/**
 * API endpoint to check if content files are actually deployed
 * Compares local file timestamps with GitHub
 */

export default async function handler(req, res) {
    const fs = require('fs');
    const path = require('path');
    
    try {
        // Get GitHub latest commit info
        const githubResponse = await fetch('https://api.github.com/repos/OnelioViera/bootstrap/commits/main');
        const githubCommit = await githubResponse.json();
        
        // Read local content files
        const contentDir = path.join(process.cwd(), 'content');
        const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
        
        const fileInfo = {};
        for (const file of files) {
            const filePath = path.join(contentDir, file);
            const stats = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            
            fileInfo[file] = {
                size: stats.size,
                modified: stats.mtime,
                firstLine: content.split('\n')[0].substring(0, 100)
            };
        }
        
        res.status(200).json({
            timestamp: new Date().toISOString(),
            githubLatestCommit: {
                sha: githubCommit.sha.substring(0, 7),
                message: githubCommit.commit.message,
                date: githubCommit.commit.author.date
            },
            deployedFiles: fileInfo,
            note: 'If modified dates are old, Vercel may not be deploying content changes'
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            note: 'This endpoint checks if content files are actually on the server'
        });
    }
}

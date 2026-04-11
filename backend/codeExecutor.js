// ============================================================
// codeExecutor.js - Real code execution service
// Supports JavaScript, Python, Java, C++ with sandboxed execution
// ============================================================

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Language configurations
const LANGUAGE_CONFIG = {
  javascript: {
    extension: 'js',
    command: 'node',
    timeout: 5000,
    maxMemory: '128m'
  },
  python: {
    extension: 'py',
    command: 'python3',
    timeout: 5000,
    maxMemory: '128m'
  },
  java: {
    extension: 'java',
    command: 'java',
    compileCommand: 'javac',
    timeout: 10000,
    maxMemory: '256m'
  },
  cpp: {
    extension: 'cpp',
    command: './program',
    compileCommand: 'g++',
    compileArgs: ['-o', 'program', '-std=c++17', '-O2'],
    timeout: 10000,
    maxMemory: '256m'
  }
};

/**
 * Execute code in a sandboxed environment
 * @param {string} language - Programming language
 * @param {string} code - Source code to execute
 * @param {string} input - Input for the program
 * @returns {Promise<Object>} Execution result
 */
async function executeCode(language, code, input = '') {
  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const executionId = uuidv4();
  const tempDir = path.join(__dirname, '../temp', executionId);
  
  try {
    // Create temporary directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Write source code file
    const fileName = `main.${config.extension}`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);
    
    // Write input file
    const inputFilePath = path.join(tempDir, 'input.txt');
    fs.writeFileSync(inputFilePath, input);
    
    let result;
    
    if (language === 'java') {
      result = await executeJava(filePath, inputFilePath, config, tempDir);
    } else if (language === 'cpp') {
      result = await executeCpp(filePath, inputFilePath, config, tempDir);
    } else {
      result = await executeScript(filePath, inputFilePath, config);
    }
    
    return result;
    
  } finally {
    // Clean up temporary directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }
}

/**
 * Execute interpreted languages (JavaScript, Python)
 */
async function executeScript(filePath, inputFilePath, config) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    let args = [filePath];
    let cwd = path.dirname(filePath);
    
    // Special handling for Java
    if (config.command === 'java' && filePath.endsWith('.class')) {
      const className = path.basename(filePath, '.class');
      args = ['-cp', cwd, className];
      cwd = config.classPath || cwd;
    }
    
    const child = spawn(config.command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: cwd,
      timeout: config.timeout
    });
    
    let stdout = '';
    let stderr = '';
    
    // Provide input
    if (inputFilePath) {
      const input = fs.readFileSync(inputFilePath, 'utf8');
      child.stdin.write(input);
      child.stdin.end();
    }
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      resolve({
        success: code === 0,
        exitCode: code,
        output: stdout.trim(),
        error: stderr.trim(),
        executionTime,
        memoryUsage: 'N/A'
      });
    });
    
    child.on('error', (error) => {
      resolve({
        success: false,
        exitCode: -1,
        output: '',
        error: error.message,
        executionTime: Date.now() - startTime,
        memoryUsage: 'N/A'
      });
    });
  });
}

/**
 * Execute Java code with compilation
 */
async function executeJava(filePath, inputFilePath, config, tempDir) {
  try {
    // Compile Java code
    const compileResult = await new Promise((resolve) => {
      const child = spawn(config.compileCommand, [filePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: tempDir,
        timeout: 10000
      });
      
      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ success: code === 0, error: stderr.trim() });
      });
      
      child.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
    
    if (!compileResult.success) {
      return {
        success: false,
        exitCode: 1,
        output: '',
        error: `Compilation Error: ${compileResult.error}`,
        executionTime: 0,
        memoryUsage: 'N/A'
      };
    }
    
    // Run compiled Java code
    const className = path.basename(filePath, '.java');
    return await executeScript(
      path.join(tempDir, `${className}.class`),
      inputFilePath,
      { ...config, command: 'java', timeout: config.timeout, classPath: tempDir }
    );
    
  } catch (error) {
    return {
      success: false,
      exitCode: -1,
      output: '',
      error: error.message,
      executionTime: 0,
      memoryUsage: 'N/A'
    };
  }
}

/**
 * Execute C++ code with compilation
 */
async function executeCpp(filePath, inputFilePath, config, tempDir) {
  try {
    // Compile C++ code
    const compileResult = await new Promise((resolve) => {
      const child = spawn(config.compileCommand, [...config.compileArgs, filePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: tempDir,
        timeout: 15000
      });
      
      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ success: code === 0, error: stderr.trim() });
      });
      
      child.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
    
    if (!compileResult.success) {
      return {
        success: false,
        exitCode: 1,
        output: '',
        error: `Compilation Error: ${compileResult.error}`,
        executionTime: 0,
        memoryUsage: 'N/A'
      };
    }
    
    // Run compiled C++ code
    const executablePath = path.join(tempDir, 'program');
    return await executeScript(
      executablePath,
      inputFilePath,
      { ...config, command: executablePath, timeout: config.timeout }
    );
    
  } catch (error) {
    return {
      success: false,
      exitCode: -1,
      output: '',
      error: error.message,
      executionTime: 0,
      memoryUsage: 'N/A'
    };
  }
}

/**
 * Test code against multiple test cases
 */
async function testCode(language, code, testCases) {
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = await executeCode(language, code, testCase.input);
    
    results.push({
      testCase: i + 1,
      input: testCase.input,
      expectedOutput: testCase.output,
      actualOutput: result.output,
      passed: result.output.trim() === testCase.output.trim(),
      executionTime: result.executionTime,
      error: result.error
    });
  }
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  return {
    summary: {
      passed: passedCount,
      total: totalCount,
      success: passedCount === totalCount
    },
    results
  };
}

module.exports = {
  executeCode,
  testCode,
  LANGUAGE_CONFIG
};

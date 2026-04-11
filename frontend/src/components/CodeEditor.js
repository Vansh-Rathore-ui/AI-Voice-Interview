// ============================================================
// CodeEditor.js - Monaco-based code editor for DSA problems
// ============================================================

import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import BuiltInFunctions from './BuiltInFunctions';
import './CodeEditor.css';

export default function CodeEditor({ problem, onRunCode }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showFunctions, setShowFunctions] = useState(false);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Set default template based on problem
    const template = generateTemplate(problem, language);
    editor.setValue(template);
    setCode(template);
  };

  const generateTemplate = (problem, lang) => {
    if (!problem) return '';

    const templates = {
      javascript: `// ${problem.title || 'DSA Problem'}
// Difficulty: ${problem.difficulty || 'Medium'}
// Topic: ${problem.topic || 'General'}

function solve(nums, target) {
    // TODO: Implement your solution here
    // Handle both single parameter (nums) and double parameter (nums, target) problems
    if (target !== undefined) {
        // Problem with target parameter
        return -1; // placeholder
    } else {
        // Problem with only nums parameter
        return nums.length; // placeholder
    }
}

// Read input and run the function
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let input = '';
rl.on('line', (line) => {
    input += line;
});

rl.on('close', () => {
    let nums, target;
    if (input.trim()) {
        try {
            // Parse input format like "nums = [1,2,3], target = 4"
            const numsMatch = input.match(/nums\s*=\s*(\[.*?\])/);
            const targetMatch = input.match(/target\s*=\s*(\d+)/);
            
            if (numsMatch) {
                nums = JSON.parse(numsMatch[1]);
            } else {
                nums = JSON.parse(input);
            }
            
            if (targetMatch) {
                target = parseInt(targetMatch[1]);
                // For problems with target
                const result = solve(nums, target);
                console.log(result);
            } else {
                // For problems without target
                const result = solve(nums);
                console.log(result);
            }
        } catch {
            nums = input.split(' ').map(Number);
            const result = solve(nums);
            console.log(result);
        }
    } else {
        nums = [10,9,2,5,3,7,101,18]; // default test case
        const result = solve(nums);
        console.log(result);
    }
});`,
      
      python: `# ${problem.title || 'DSA Problem'}
# Difficulty: ${problem.difficulty || 'Medium'}
# Topic: ${problem.topic || 'General'}

def solve(nums, target=None):
    # TODO: Implement your solution here
    # Handle both single parameter (nums) and double parameter (nums, target) problems
    if target is not None:
        # Problem with target parameter
        pass
    else:
        # Problem with only nums parameter
        pass

# Read input and run the function
if __name__ == "__main__":
    import sys
    import re
    input_data = sys.stdin.read().strip()
    
    if input_data:
        # Parse input format like "nums = [1,2,3], target = 4"
        try:
            # Extract nums array
            nums_match = re.search(r'nums\s*=\s*(\[.*?\])', input_data)
            if nums_match:
                nums = eval(nums_match.group(1))
            else:
                # Fallback to simple list format
                nums = eval(input_data)
            
            # Extract target if present
            target_match = re.search(r'target\s*=\s*(\d+)', input_data)
            if target_match:
                target = int(target_match.group(1))
                # For problems with target, pass both nums and target
                result = solve(nums, target)
            else:
                # For problems without target, just pass nums
                result = solve(nums)
                
        except:
            # Fallback parsing
            nums = list(map(int, input_data.split()))
            result = solve(nums)
    else:
        nums = [10,9,2,5,3,7,101,18]  # default test case
        result = solve(nums)
    
    print(result)`,
      
      java: `// ${problem.title || 'DSA Problem'}
// Difficulty: ${problem.difficulty || 'Medium'}
// Topic: ${problem.topic || 'General'}

import java.util.*;

public class Main {
    public static int solve(int[] nums) {
        // TODO: Implement your solution here
        return nums.length; // placeholder
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine().trim();
        
        int[] nums;
        if (input.isEmpty()) {
            nums = new int[]{10,9,2,5,3,7,101,18}; // default test case
        } else {
            // Parse input like [1,2,3] or 1 2 3
            input = input.replaceAll("[\\[\\]]", "").trim();
            String[] parts = input.split("[,\\s]+");
            nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                nums[i] = Integer.parseInt(parts[i]);
            }
        }
        
        int result = solve(nums);
        System.out.println(result);
        scanner.close();
    }
}`,
      
      cpp: `// ${problem.title || 'DSA Problem'}
// Difficulty: ${problem.difficulty || 'Medium'}
// Topic: ${problem.topic || 'General'}

#include <iostream>
using namespace std;

int main() {
    // TODO: Implement your solution here
    return 0;
}`
    };

    return templates[lang] || templates.javascript;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    setSubmissionResult(null);
    
    try {
      console.log('Using direct API for code execution: https://ai-voice-interview.onrender.com/execute-code');
      
      const requestBody = JSON.stringify({
        language,
        code,
        input,
        testCases: problem?.examples?.map(ex => ({
          input: ex.input,
          output: ex.output
        })) || []
      });
      console.log('Code execution request body:', requestBody);
      
      const response = await fetch('https://ai-voice-interview.onrender.com/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      
      console.log('Code execution response status:', response.status);
      
      // Get response text first to debug
      const responseText = await response.text();
      console.log('Code execution raw response:', responseText);
      
      if (!responseText) {
        throw new Error('Empty response from code execution server');
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`Invalid JSON response from code execution: ${jsonError.message}. Raw response: ${responseText.substring(0, 200)}`);
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Execution failed');
      }

      // Format output based on result
      let outputText = '';
      if (result.summary) {
        // Test case results
        outputText = `Test Results:\n`;
        outputText += `Passed: ${result.summary.passed}/${result.summary.total}\n\n`;
        
        result.results.forEach((test, index) => {
          outputText += `Test Case ${index + 1}: ${test.passed ? 'PASS' : 'FAIL'}\n`;
          outputText += `Input: ${test.input}\n`;
          outputText += `Expected: ${test.expectedOutput}\n`;
          outputText += `Actual: ${test.actualOutput}\n`;
          if (test.error) {
            outputText += `Error: ${test.error}\n`;
          }
          outputText += `Time: ${test.executionTime}ms\n\n`;
        });
      } else {
        // Single execution
        outputText = `Exit Code: ${result.exitCode}\n`;
        if (result.output) {
          outputText += `Output:\n${result.output}\n`;
        }
        if (result.error) {
          outputText += `Error:\n${result.error}\n`;
        }
        outputText += `Execution Time: ${result.executionTime}ms\n`;
        outputText += `Status: ${result.success ? 'Success' : 'Failed'}`;
      }
      
      setOutput(outputText);
      
      if (onRunCode) {
        onRunCode({ code, language, input, result });
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setOutput('Submitting...');
    setSubmissionResult(null);
    
    try {
      // Generate hidden test cases (more challenging than examples)
      const hiddenTestCases = generateHiddenTestCases(problem);
      
      console.log('Using direct API for submission: https://ai-voice-interview.onrender.com/execute-code');
      
      const requestBody = JSON.stringify({
        language,
        code,
        testCases: hiddenTestCases
      });
      console.log('Submission request body:', requestBody);
      
      const response = await fetch('https://ai-voice-interview.onrender.com/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      
      console.log('Submission response status:', response.status);
      
      // Get response text first to debug
      const responseText = await response.text();
      console.log('Submission raw response:', responseText);
      
      if (!responseText) {
        throw new Error('Empty response from submission server');
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`Invalid JSON response from submission: ${jsonError.message}. Raw response: ${responseText.substring(0, 200)}`);
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      // Store submission result for UI display
      setSubmissionResult(result);
      
      // Format submission output
      let outputText = `SUBMISSION RESULTS\n`;
      outputText += `==================\n\n`;
      outputText += `Hidden Test Cases: ${result.summary.passed}/${result.summary.total}\n`;
      outputText += `Status: ${result.summary.success ? 'ACCEPTED' : 'WRONG ANSWER'}\n\n`;
      
      if (!result.summary.success) {
        outputText += `FAILED TEST CASES:\n`;
        result.results.filter(test => !test.passed).forEach((test, index) => {
          outputText += `Test ${test.testCase}: FAIL\n`;
          outputText += `Input: ${test.input}\n`;
          outputText += `Expected: ${test.expectedOutput}\n`;
          outputText += `Actual: ${test.actualOutput}\n`;
          if (test.error) {
            outputText += `Error: ${test.error}\n`;
          }
          outputText += `Time: ${test.executionTime}ms\n\n`;
        });
      }
      
      outputText += `Performance: Average ${Math.round(result.results.reduce((acc, test) => acc + test.executionTime, 0) / result.results.length)}ms per test`;
      
      setOutput(outputText);
      
      if (onRunCode) {
        onRunCode({ code, language, input, result, isSubmission: true });
      }
    } catch (error) {
      setOutput(`Submission Error: ${error.message}`);
      setSubmissionResult({ success: false, error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateHiddenTestCases = (problem) => {
    // Generate more challenging hidden test cases based on problem type
    const testCases = [];
    
    if (problem?.topic?.includes('Array') || problem?.title?.includes('Array')) {
      // Array problems - test edge cases
      testCases.push(
        { input: '[]', output: '0' },
        { input: '[1]', output: '1' },
        { input: '[1,1,1,1]', output: '1' },
        { input: '[-1,-2,-3]', output: '2' },
        { input: '[1000,999,998]', output: '1' }
      );
    }
    
    if (problem?.topic?.includes('String') || problem?.title?.includes('String')) {
      // String problems
      testCases.push(
        { input: '""', output: '0' },
        { input: '"a"', output: '1' },
        { input: '"aaaa"', output: '1' },
        { input: '"abc"', output: '3' }
      );
    }
    
    // Default hidden test cases
    if (testCases.length === 0) {
      testCases.push(
        { input: '[1,2,3,4,5]', output: '5' },
        { input: '[5,4,3,2,1]', output: '5' },
        { input: '[2,2,2,2,2]', output: '1' },
        { input: '[]', output: '0' },
        { input: '[100]', output: '1' }
      );
    }
    
    return testCases;
  };

  
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (editorRef.current) {
      const template = generateTemplate(problem, newLanguage);
      editorRef.current.setValue(template);
      setCode(template);
    }
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <h3>Code Editor</h3>
        <div className="editor-controls">
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button 
            onClick={() => setShowFunctions(!showFunctions)}
            className={`functions-button ${showFunctions ? 'active' : ''}`}
          >
            {showFunctions ? 'Hide Functions' : 'Show Functions'}
          </button>
          <button 
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="run-button"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button 
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="editor-container">
        <div className="code-section">
          <div className="section-label">Solution Code</div>
          <Editor
            height="400px"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="io-section">
          <div className="input-section">
            <div className="section-label">Custom Input</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter custom input here..."
              className="input-textarea"
            />
          </div>

          <div className="output-section">
            <div className="section-label">Output</div>
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className={`output-textarea ${isRunning ? 'running' : ''}`}
            />
          </div>
        </div>
      </div>

      {submissionResult && (
        <div className={`submission-status ${submissionResult.summary?.success ? 'success' : 'failed'}`}>
          <div className="status-header">
            <span className="status-icon">
              {submissionResult.summary?.success ? (
                <>
                  <span className="checkmark">{'\u2713'}</span>
                  ACCEPTED
                </>
              ) : 'WRONG ANSWER'}
            </span>
            <span className="status-details">
              Hidden Test Cases: {submissionResult.summary?.passed || 0}/{submissionResult.summary?.total || 0}
            </span>
          </div>
        </div>
      )}

      {problem?.examples && problem.examples.length > 0 && (
        <div className="examples-section">
          <div className="section-label">Example Test Cases</div>
          {problem.examples.map((example, index) => (
            <div key={index} className="example-case">
              <div className="example-io">
                <span className="example-label">Input:</span>
                <pre>{example.input}</pre>
              </div>
              <div className="example-io">
                <span className="example-label">Output:</span>
                <pre>{example.output}</pre>
              </div>
              {example.explanation && (
                <div className="example-explanation">
                  <span className="example-label">Explanation:</span>
                  <p>{example.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showFunctions && (
        <BuiltInFunctions 
          language={language} 
          onClose={() => setShowFunctions(false)} 
        />
      )}
    </div>
  );
}

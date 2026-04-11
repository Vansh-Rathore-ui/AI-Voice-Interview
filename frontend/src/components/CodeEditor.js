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

${(() => {
  const title = problem?.title || '';
  const topic = problem?.topic || '';
  const title_lower = title.toLowerCase();
  const topic_lower = topic.toLowerCase();
  
  // String problems
  if (title_lower.includes('window') && title_lower.includes('substring')) {
    return `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
    // TODO: Implement your solution here
    // Find the minimum window in s which contains all characters of t
    return "";
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
    if (input.trim()) {
        try {
            // Parse string inputs: s = "...", t = "..."
            const sMatch = input.match(/s\\s*=\\s*"([^"]*)"/);
            const tMatch = input.match(/t\\s*=\\s*"([^"]*)"/);
            
            if (sMatch && tMatch) {
                const s = sMatch[1];
                const t = tMatch[1];
                const result = minWindow(s, t);
                console.log(result);
            } else {
                // Fallback
                const result = minWindow("ADOBECODEBANC", "ABC");
                console.log(result);
            }
        } catch (error) {
            console.error("Input parsing error:", error.message);
        }
    } else {
        // Default test case
        const result = minWindow("ADOBECODEBANC", "ABC");
        console.log(result);
    }
});`;
  }
  
  // Array problems
  else if (title_lower.includes('two sum') || (title_lower.includes('sum') && title_lower.includes('two'))) {
    return `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // TODO: Implement your solution here
    // Find indices of two numbers that add up to target
    return [];
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
    if (input.trim()) {
        try {
            // Parse array inputs: nums = [...], target = ...
            const numsMatch = input.match(/nums\\s*=\\s*(\\[.*?\\])/);
            const targetMatch = input.match(/target\\s*=\\s*(\\d+)/);
            
            if (numsMatch) {
                const nums = JSON.parse(numsMatch[1]);
                if (targetMatch) {
                    const target = parseInt(targetMatch[1]);
                    const result = twoSum(nums, target);
                    console.log(result);
                } else {
                    const result = twoSum(nums, 9); // default target
                    console.log(result);
                }
            } else {
                // Fallback parsing
                const result = twoSum([2,7,11,15], 9);
                console.log(result);
            }
        } catch (error) {
            console.error("Input parsing error:", error.message);
        }
    } else {
        // Default test case
        const result = twoSum([2,7,11,15], 9);
        console.log(result);
    }
});`;
  }
  
  // Default generic function
  else {
    return `function solve(nums, target) {
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
            const numsMatch = input.match(/nums\\s*=\\s*(\\[.*?\\])/);
            const targetMatch = input.match(/target\\s*=\\s*(\\d+)/);
            
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
});`;
  }
})()}`,
      
      python: `# ${problem.title || 'DSA Problem'}
# Difficulty: ${problem.difficulty || 'Medium'}
# Topic: ${problem.topic || 'General'}

# Detect problem type and use appropriate function signature
def get_function_signature(problem_title, problem_topic):
    title = (problem_title or '').lower()
    topic = (problem_topic or '').lower()
    
    # String problems
    if 'window' in title and 'substring' in title:
        return 'def minWindow(s: str, t: str) -> str:'
    elif 'longest' in title and 'substring' in title:
        return 'def lengthOfLongestSubstring(s: str) -> int:'
    elif 'valid' in title and 'parentheses' in title:
        return 'def isValid(s: str) -> bool:'
    elif 'palindrome' in title:
        return 'def isPalindrome(s: str) -> bool:'
    
    # Array problems
    elif 'two sum' in title or 'sum' in title and 'two' in title:
        return 'def twoSum(nums: List[int], target: int) -> List[int]:'
    elif 'contains duplicate' in title:
        return 'def containsDuplicate(nums: List[int]) -> bool:'
    elif 'maximum' in title and 'subarray' in title:
        return 'def maxSubArray(nums: List[int]) -> int:'
    elif 'product' in title and 'array' in title:
        return 'def productExceptSelf(nums: List[int]) -> List[int]:'
    
    # Tree problems
    elif 'invert' in title and 'tree' in title:
        return 'def invertTree(root: Optional[TreeNode]) -> Optional[TreeNode]:'
    elif 'maximum' in title and 'depth' in title:
        return 'def maxDepth(root: Optional[TreeNode]) -> int:'
    
    # Linked List problems
    elif 'reverse' in title and 'list' in title:
        return 'def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:'
    elif 'merge' in title and 'two' in title:
        return 'def mergeTwoLists(list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:'
    
    # Default generic function
    else:
        return 'def solve(*args) -> Any:'

# Generate the appropriate function
${(() => {
  const title = problem?.title || '';
  const topic = problem?.topic || '';
  const title_lower = title.toLowerCase();
  const topic_lower = topic.toLowerCase();
  
  // String problems
  if (title_lower.includes('window') && title_lower.includes('substring')) {
    return `def minWindow(s: str, t: str) -> str:
    # TODO: Implement your solution here
    # Find the minimum window in s which contains all characters of t
    pass

# Read input and run the function
if __name__ == "__main__":
    import sys
    import re
    input_data = sys.stdin.read().strip()
    
    if input_data:
        # Parse string inputs: s = "...", t = "..."
        s_match = re.search(r's\\s*=\\s*"([^"]*)"', input_data)
        t_match = re.search(r't\\s*=\\s*"([^"]*)"', input_data)
        
        if s_match and t_match:
            s = s_match.group(1)
            t = t_match.group(1)
            result = minWindow(s, t)
        else:
            # Fallback parsing
            result = minWindow("ADOBECODEBANC", "ABC")
    else:
        result = minWindow("ADOBECODEBANC", "ABC")
        
    print(result)`;
  }
  
  // Array problems
  else if (title_lower.includes('two sum') || (title_lower.includes('sum') && title_lower.includes('two'))) {
    return `def twoSum(nums: List[int], target: int) -> List[int]:
    # TODO: Implement your solution here
    # Find indices of two numbers that add up to target
    pass

# Read input and run the function
if __name__ == "__main__":
    import sys
    import re
    from typing import List
    
    input_data = sys.stdin.read().strip()
    
    if input_data:
        # Parse array inputs: nums = [...], target = ...
        nums_match = re.search(r'nums\\s*=\\s*(\\[.*?\\])', input_data)
        target_match = re.search(r'target\\s*=\\s*(\\d+)', input_data)
        
        if nums_match:
            nums = eval(nums_match.group(1))
            if target_match:
                target = int(target_match.group(1))
                result = twoSum(nums, target)
            else:
                result = twoSum(nums, 9)  # default target
        else:
            # Fallback parsing
            result = twoSum([2,7,11,15], 9)
    else:
        result = twoSum([2,7,11,15], 9)
        
    print(result)`;
  }
  
  // Default generic function
  else {
    return `def solve(*args) -> Any:
    # TODO: Implement your solution here
    # Handle different problem types based on input
    if len(args) == 2:
        # Two parameters (e.g., s and t for string problems)
        s, t = args
        pass
    elif len(args) == 1:
        # Single parameter (e.g., nums for array problems)
        nums = args[0]
        pass
    else:
        # Default case
        pass

# Read input and run the function
if __name__ == "__main__":
    import sys
    import re
    from typing import Any, List
    
    input_data = sys.stdin.read().strip()
    
    if input_data:
        try:
            # Check for string inputs (s = "...", t = "...")
            s_match = re.search(r's\\s*=\\s*"([^"]*)"', input_data)
            t_match = re.search(r't\\s*=\\s*"([^"]*)"', input_data)
            
            if s_match and t_match:
                # String problem
                s = s_match.group(1)
                t = t_match.group(1)
                result = solve(s, t)
            else:
                # Check for array inputs (nums = [...], target = ...)
                nums_match = re.search(r'nums\\s*=\\s*(\\[.*?\\])', input_data)
                if nums_match:
                    nums = eval(nums_match.group(1))
                    
                    target_match = re.search(r'target\\s*=\\s*(\\d+)', input_data)
                    if target_match:
                        target = int(target_match.group(1))
                        result = solve(nums, target)
                    else:
                        result = solve(nums)
                else:
                    # Fallback to simple list format
                    nums = eval(input_data)
                    result = solve(nums)
                    
        except:
            # Fallback parsing for simple integer arrays
            try:
                nums = list(map(int, input_data.split()))
                result = solve(nums)
            except:
                # If all else fails, use default test case
                result = solve([10,9,2,5,3,7,101,18])
    else:
        # Default test case
        result = solve([10,9,2,5,3,7,101,18])
        
    print(result)`;
  }
})()}`,
      
            
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
    // Generate sophisticated hidden test cases based on specific problem
    const testCases = [];
    const title = (problem?.title || '').toLowerCase();
    const topic = (problem?.topic || '').toLowerCase();
    
    // Minimum Window Substring
    if (title.includes('window') && title.includes('substring')) {
      testCases.push(
        { input: 's = "a", t = "a"', output: '"a"' },
        { input: 's = "a", t = "aa"', output: '""' },
        { input: 's = "aa", t = "aa"', output: '"aa"' },
        { input: 's = "ab", t = "b"', output: '"b"' },
        { input: 's = "abcdebdde", t = "bde"', output: '"bdde"' },
        { input: 's = "aaaaaaaaaaaabbbbbcddddddeeeeeeeaaaaaffffffffffffgggggggggghhhhhhhhh", t = "abcdefg"', output: '"abbbbbcddddddeeeeeeeaaaaaffffffffffffggggggggg"' },
        { input: 's = "", t = "a"', output: '""' },
        { input: 's = "abc", t = ""', output: '""' }
      );
    }
    
    // Two Sum
    else if (title.includes('two sum') || (title.includes('sum') && title.includes('two'))) {
      testCases.push(
        { input: 'nums = [0,4,3,0], target = 0', output: '[0,3]' },
        { input: 'nums = [-3,4,3,90], target = 0', output: '[0,2]' },
        { input: 'nums = [1,2,3,4,5], target = 10', output: '[3,4]' },
        { input: 'nums = [-1,-2,-3,-4,-5], target = -8', output: '[2,4]' },
        { input: 'nums = [2,5,5,11], target = 10', output: '[1,2]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
        { input: 'nums = [3,3], target = 6', output: '[0,1]' }
      );
    }
    
    // Longest Substring Without Repeating Characters
    else if (title.includes('longest') && title.includes('substring')) {
      testCases.push(
        { input: 's = ""', output: '0' },
        { input: 's = "a"', output: '1' },
        { input: 's = "aa"', output: '1' },
        { input: 's = "abcabcbb"', output: '3' },
        { input: 's = "bbbbb"', output: '1' },
        { input: 's = "pwwkew"', output: '3' },
        { input: 's = "dvdf"', output: '3' },
        { input: 's = "abcdefghijklmnopqrstuvwxyz"', output: '26' }
      );
    }
    
    // Valid Parentheses
    else if (title.includes('valid') && title.includes('parentheses')) {
      testCases.push(
        { input: 's = ""', output: 'true' },
        { input: 's = "()', output: 'true' },
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "(]"', output: 'false' },
        { input: 's = "([)]"', output: 'false' },
        { input: 's = "{[]}"', output: 'true' },
        { input: 's = "((((((((((', output: 'false' },
        { input: 's = ")))))))))"', output: 'false' }
      );
    }
    
    // Contains Duplicate
    else if (title.includes('contains duplicate')) {
      testCases.push(
        { input: 'nums = [1,2,3,1]', output: 'true' },
        { input: 'nums = [1,2,3,4]', output: 'false' },
        { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' },
        { input: 'nums = []', output: 'false' },
        { input: 'nums = [1]', output: 'false' },
        { input: 'nums = [0,0,0,0]', output: 'true' },
        { input: 'nums = [-1,-2,-3,-1]', output: 'true' }
      );
    }
    
    // Maximum Subarray
    else if (title.includes('maximum') && title.includes('subarray')) {
      testCases.push(
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
        { input: 'nums = [1]', output: '1' },
        { input: 'nums = [5,4,-1,7,8]', output: '23' },
        { input: 'nums = [-1,-2,-3,-4]', output: '-1' },
        { input: 'nums = [-2,-1]', output: '-1' },
        { input: 'nums = [0,0,0,0]', output: '0' },
        { input: 'nums = [2,3,-2,4]', output: '7' }
      );
    }
    
    // Product of Array Except Self
    else if (title.includes('product') && title.includes('array')) {
      testCases.push(
        { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
        { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
        { input: 'nums = [1,2]', output: '[2,1]' },
        { input: 'nums = [0,0]', output: '[0,0]' },
        { input: 'nums = [-1,-1,-1,-1]', output: '[-1,-1,-1,-1]' },
        { input: 'nums = [1,0,1,0]', output: '[0,0,0,0]' }
      );
    }
    
    // Generic Array Problems (fallback)
    else if (topic.includes('array') || title.includes('array')) {
      testCases.push(
        { input: '[]', output: '0' },
        { input: '[1]', output: '1' },
        { input: '[1,1,1,1]', output: '1' },
        { input: '[-1,-2,-3]', output: '2' },
        { input: '[1000,999,998]', output: '1' },
        { input: '[2,7,11,15]', output: '4' },
        { input: '[3,2,1]', output: '3' },
        { input: '[0,0,0]', output: '1' }
      );
    }
    
    // Generic String Problems (fallback)
    else if (topic.includes('string') || title.includes('string')) {
      testCases.push(
        { input: '""', output: '""' },
        { input: '"a"', output: '"a"' },
        { input: '"aaaa"', output: '"a"' },
        { input: '"abc"', output: '"abc"' },
        { input: '"racecar"', output: '"racecar"' },
        { input: '"hello"', output: '"olleh"' },
        { input: '"12345"', output: '"12345"' },
        { input: '"!@#$%"', output: '"%$#@!"' }
      );
    }
    
    // Default hidden test cases (ultimate fallback)
    if (testCases.length === 0) {
      testCases.push(
        { input: '[1,2,3,4,5]', output: '5' },
        { input: '[5,4,3,2,1]', output: '5' },
        { input: '[2,2,2,2,2]', output: '1' },
        { input: '[]', output: '0' },
        { input: '[100]', output: '1' },
        { input: '[-1,-2,-3,-4]', output: '4' },
        { input: '[0]', output: '1' },
        { input: '[1,2,2,3,3,3]', output: '3' }
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

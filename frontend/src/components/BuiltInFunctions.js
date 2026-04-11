// ============================================================
// BuiltInFunctions.js - Language-specific function reference
// ============================================================

import React, { useState } from 'react';
import './BuiltInFunctions.css';

const LANGUAGE_FUNCTIONS = {
  javascript: {
    title: 'JavaScript Built-in Functions',
    categories: {
      'Array Methods': [
        { name: 'push(item)', description: 'Add item to end of array' },
        { name: 'pop()', description: 'Remove and return last item' },
        { name: 'shift()', description: 'Remove and return first item' },
        { name: 'unshift(item)', description: 'Add item to beginning' },
        { name: 'slice(start, end)', description: 'Extract portion of array' },
        { name: 'splice(start, deleteCount, items)', description: 'Remove/replace items' },
        { name: 'sort(compareFn)', description: 'Sort array elements' },
        { name: 'reverse()', description: 'Reverse array order' },
        { name: 'join(separator)', description: 'Join elements into string' },
        { name: 'concat(arrays)', description: 'Combine arrays' },
        { name: 'forEach(callback)', description: 'Execute function for each element' },
        { name: 'map(callback)', description: 'Create new array with transformed elements' },
        { name: 'filter(callback)', description: 'Create array with elements that pass test' },
        { name: 'reduce(callback, initial)', description: 'Reduce array to single value' },
        { name: 'find(callback)', description: 'Find first element that satisfies condition' },
        { name: 'findIndex(callback)', description: 'Find index of first matching element' },
        { name: 'includes(item)', description: 'Check if array contains item' },
        { name: 'indexOf(item)', description: 'Find first index of item' },
        { name: 'lastIndexOf(item)', description: 'Find last index of item' },
        { name: 'fill(value, start, end)', description: 'Fill array with value' },
        { name: 'flat(depth)', description: 'Flatten nested arrays' },
        { name: 'some(callback)', description: 'Test if some elements pass condition' },
        { name: 'every(callback)', description: 'Test if all elements pass condition' }
      ],
      'String Methods': [
        { name: 'length', description: 'Get string length' },
        { name: 'charAt(index)', description: 'Get character at index' },
        { name: 'charCodeAt(index)', description: 'Get Unicode value of character' },
        { name: 'concat(strings)', description: 'Combine strings' },
        { name: 'includes(searchString)', description: 'Check if string contains substring' },
        { name: 'indexOf(searchString)', description: 'Find first occurrence of substring' },
        { name: 'lastIndexOf(searchString)', description: 'Find last occurrence of substring' },
        { name: 'slice(start, end)', description: 'Extract portion of string' },
        { name: 'substring(start, end)', description: 'Extract portion of string' },
        { name: 'substr(start, length)', description: 'Extract portion of string' },
        { name: 'toLowerCase()', description: 'Convert to lowercase' },
        { name: 'toUpperCase()', description: 'Convert to uppercase' },
        { name: 'trim()', description: 'Remove whitespace from ends' },
        { name: 'split(separator)', description: 'Split string into array' },
        { name: 'replace(search, replacement)', description: 'Replace substring' },
        { name: 'replaceAll(search, replacement)', description: 'Replace all occurrences' },
        { name: 'startsWith(searchString)', description: 'Check if string starts with substring' },
        { name: 'endsWith(searchString)', description: 'Check if string ends with substring' },
        { name: 'repeat(count)', description: 'Repeat string' },
        { name: 'padStart(targetLength, padString)', description: 'Pad start of string' },
        { name: 'padEnd(targetLength, padString)', description: 'Pad end of string' },
        { name: 'match(regex)', description: 'Match string against regex' },
        { name: 'search(regex)', description: 'Search for regex match' }
      ],
      'Math Functions': [
        { name: 'Math.abs(x)', description: 'Absolute value' },
        { name: 'Math.round(x)', description: 'Round to nearest integer' },
        { name: 'Math.floor(x)', description: 'Round down to integer' },
        { name: 'Math.ceil(x)', description: 'Round up to integer' },
        { name: 'Math.max(...values)', description: 'Maximum value' },
        { name: 'Math.min(...values)', description: 'Minimum value' },
        { name: 'Math.sqrt(x)', description: 'Square root' },
        { name: 'Math.pow(x, y)', description: 'x to the power of y' },
        { name: 'Math.random()', description: 'Random number between 0 and 1' },
        { name: 'Math.sin(x)', description: 'Sine' },
        { name: 'Math.cos(x)', description: 'Cosine' },
        { name: 'Math.tan(x)', description: 'Tangent' },
        { name: 'Math.log(x)', description: 'Natural logarithm' },
        { name: 'Math.log10(x)', description: 'Base 10 logarithm' },
        { name: 'Math.exp(x)', description: 'Exponential function' },
        { name: 'Math.PI', description: 'Pi constant' },
        { name: 'Math.E', description: 'Euler\'s number' }
      ],
      'Object Methods': [
        { name: 'Object.keys(obj)', description: 'Get array of object keys' },
        { name: 'Object.values(obj)', description: 'Get array of object values' },
        { name: 'Object.entries(obj)', description: 'Get array of key-value pairs' },
        { name: 'Object.assign(target, sources)', description: 'Copy properties from sources to target' },
        { name: 'Object.create(proto)', description: 'Create object with prototype' },
        { name: 'Object.freeze(obj)', description: 'Freeze object (prevent modifications)' },
        { name: 'Object.seal(obj)', description: 'Seal object (prevent additions/deletions)' }
      ]
    }
  },
  
  python: {
    title: 'Python Built-in Functions',
    categories: {
      'List Methods': [
        { name: 'append(item)', description: 'Add item to end of list' },
        { name: 'extend(iterable)', description: 'Extend list with iterable' },
        { name: 'insert(index, item)', description: 'Insert item at index' },
        { name: 'remove(item)', description: 'Remove first occurrence of item' },
        { name: 'pop(index)', description: 'Remove and return item at index' },
        { name: 'clear()', description: 'Remove all items' },
        { name: 'index(item)', description: 'Find index of item' },
        { name: 'count(item)', description: 'Count occurrences of item' },
        { name: 'sort(key=None, reverse=False)', description: 'Sort list in place' },
        { name: 'reverse()', description: 'Reverse list in place' },
        { name: 'copy()', description: 'Return shallow copy' }
      ],
      'String Methods': [
        { name: 'len(string)', description: 'Get string length' },
        { name: 'str.capitalize()', description: 'Capitalize first character' },
        { name: 'str.upper()', description: 'Convert to uppercase' },
        { name: 'str.lower()', description: 'Convert to lowercase' },
        { name: 'str.title()', description: 'Convert to title case' },
        { name: 'str.strip()', description: 'Remove whitespace from ends' },
        { name: 'str.lstrip()', description: 'Remove whitespace from left' },
        { name: 'str.rstrip()', description: 'Remove whitespace from right' },
        { name: 'str.split(sep=None)', description: 'Split string into list' },
        { name: 'str.join(iterable)', description: 'Join iterable with string' },
        { name: 'str.replace(old, new)', description: 'Replace substring' },
        { name: 'str.find(sub)', description: 'Find first occurrence (returns -1 if not found)' },
        { name: 'str.index(sub)', description: 'Find first occurrence (raises ValueError if not found)' },
        { name: 'str.startswith(prefix)', description: 'Check if string starts with prefix' },
        { name: 'str.endswith(suffix)', description: 'Check if string ends with suffix' },
        { name: 'str.isalpha()', description: 'Check if all characters are alphabetic' },
        { name: 'str.isdigit()', description: 'Check if all characters are digits' },
        { name: 'str.isalnum()', description: 'Check if all characters are alphanumeric' },
        { name: 'str.isspace()', description: 'Check if all characters are whitespace' },
        { name: 'str.zfill(width)', description: 'Pad string with zeros' },
        { name: 'str.center(width, fillchar)', description: 'Center string in field' },
        { name: 'str.ljust(width, fillchar)', description: 'Left justify string' },
        { name: 'str.rjust(width, fillchar)', description: 'Right justify string' }
      ],
      'Built-in Functions': [
        { name: 'print(*objects)', description: 'Print objects to stdout' },
        { name: 'len(obj)', description: 'Return length of object' },
        { name: 'range(start, stop, step)', description: 'Create range object' },
        { name: 'enumerate(iterable)', description: 'Return index and value pairs' },
        { name: 'zip(*iterables)', description: 'Combine iterables' },
        { name: 'map(function, iterable)', description: 'Apply function to iterable' },
        { name: 'filter(function, iterable)', description: 'Filter iterable by function' },
        { name: 'sum(iterable)', description: 'Sum of iterable items' },
        { name: 'max(iterable)', description: 'Maximum value' },
        { name: 'min(iterable)', description: 'Minimum value' },
        { name: 'abs(x)', description: 'Absolute value' },
        { name: 'round(number, ndigits)', description: 'Round number' },
        { name: 'sorted(iterable)', description: 'Return sorted list' },
        { name: 'reversed(iterable)', description: 'Return reversed iterator' },
        { name: 'all(iterable)', description: 'Check if all elements are truthy' },
        { name: 'any(iterable)', description: 'Check if any element is truthy' },
        { name: 'type(obj)', description: 'Return type of object' },
        { name: 'isinstance(obj, class)', description: 'Check if object is instance of class' },
        { name: 'str(obj)', description: 'Convert object to string' },
        { name: 'int(x)', description: 'Convert to integer' },
        { name: 'float(x)', description: 'Convert to float' },
        { name: 'list(iterable)', description: 'Convert to list' },
        { name: 'tuple(iterable)', description: 'Convert to tuple' },
        { name: 'set(iterable)', description: 'Convert to set' },
        { name: 'dict(iterable)', description: 'Convert to dictionary' }
      ],
      'Math Functions': [
        { name: 'import math', description: 'Import math module' },
        { name: 'math.sqrt(x)', description: 'Square root' },
        { name: 'math.pow(x, y)', description: 'x to the power of y' },
        { name: 'math.exp(x)', description: 'Exponential function' },
        { name: 'math.log(x)', description: 'Natural logarithm' },
        { name: 'math.log10(x)', description: 'Base 10 logarithm' },
        { name: 'math.sin(x)', description: 'Sine' },
        { name: 'math.cos(x)', description: 'Cosine' },
        { name: 'math.tan(x)', description: 'Tangent' },
        { name: 'math.pi', description: 'Pi constant' },
        { name: 'math.e', description: 'Euler\'s number' },
        { name: 'math.ceil(x)', description: 'Round up to integer' },
        { name: 'math.floor(x)', description: 'Round down to integer' },
        { name: 'math.fabs(x)', description: 'Absolute value' },
        { name: 'math.factorial(x)', description: 'Factorial' },
        { name: 'math.gcd(a, b)', description: 'Greatest common divisor' },
        { name: 'math.lcm(a, b)', description: 'Least common multiple' }
      ],
      'Dictionary Methods': [
        { name: 'dict.keys()', description: 'Return view of keys' },
        { name: 'dict.values()', description: 'Return view of values' },
        { name: 'dict.items()', description: 'Return view of key-value pairs' },
        { name: 'dict.get(key, default)', description: 'Get value with default' },
        { name: 'dict.pop(key, default)', description: 'Remove and return value' },
        { name: 'dict.popitem()', description: 'Remove and return key-value pair' },
        { name: 'dict.update(other)', description: 'Update dictionary' },
        { name: 'dict.clear()', description: 'Remove all items' },
        { name: 'dict.copy()', description: 'Return shallow copy' },
        { name: 'dict.setdefault(key, default)', description: 'Get or set default value' }
      ]
    }
  },
  
  java: {
    title: 'Java Built-in Functions',
    categories: {
      'Arrays': [
        { name: 'Arrays.sort(array)', description: 'Sort array' },
        { name: 'Arrays.binarySearch(array, key)', description: 'Binary search' },
        { name: 'Arrays.fill(array, value)', description: 'Fill array with value' },
        { name: 'Arrays.copyOf(array, newLength)', description: 'Copy array' },
        { name: 'Arrays.copyOfRange(array, start, end)', description: 'Copy array range' },
        { name: 'Arrays.equals(array1, array2)', description: 'Check if arrays are equal' },
        { name: 'Arrays.toString(array)', description: 'Convert array to string' },
        { name: 'Arrays.asList(array)', description: 'Convert array to List' },
        { name: 'array.length', description: 'Get array length' },
        { name: 'System.arraycopy(src, srcPos, dest, destPos, length)', description: 'Copy array elements' }
      ],
      'ArrayList': [
        { name: 'add(item)', description: 'Add item to list' },
        { name: 'add(index, item)', description: 'Add item at index' },
        { name: 'remove(index)', description: 'Remove item at index' },
        { name: 'remove(Object)', description: 'Remove specific item' },
        { name: 'get(index)', description: 'Get item at index' },
        { name: 'set(index, item)', description: 'Replace item at index' },
        { name: 'size()', description: 'Get list size' },
        { name: 'isEmpty()', description: 'Check if list is empty' },
        { name: 'contains(Object)', description: 'Check if list contains item' },
        { name: 'indexOf(Object)', description: 'Find index of item' },
        { name: 'clear()', description: 'Remove all items' },
        { name: 'sort(Comparator)', description: 'Sort list' },
        { name: 'toArray()', description: 'Convert to array' }
      ],
      'String': [
        { name: 'length()', description: 'Get string length' },
        { name: 'charAt(index)', description: 'Get character at index' },
        { name: 'substring(start, end)', description: 'Get substring' },
        { name: 'toLowerCase()', description: 'Convert to lowercase' },
        { name: 'toUpperCase()', description: 'Convert to uppercase' },
        { name: 'trim()', description: 'Remove whitespace' },
        { name: 'split(regex)', description: 'Split string into array' },
        { name: 'replace(old, new)', description: 'Replace substring' },
        { name: 'replaceAll(regex, replacement)', description: 'Replace all occurrences' },
        { name: 'indexOf(str)', description: 'Find first occurrence' },
        { name: 'lastIndexOf(str)', description: 'Find last occurrence' },
        { name: 'startsWith(str)', description: 'Check if string starts with' },
        { name: 'endsWith(str)', description: 'Check if string ends with' },
        { name: 'contains(str)', description: 'Check if string contains' },
        { name: 'isEmpty()', description: 'Check if string is empty' },
        { name: 'equals(str)', description: 'Check if strings are equal' },
        { name: 'equalsIgnoreCase(str)', description: 'Check equality ignoring case' },
        { name: 'toCharArray()', description: 'Convert to character array' },
        { name: 'getBytes()', description: 'Convert to byte array' }
      ],
      'Math': [
        { name: 'Math.abs(x)', description: 'Absolute value' },
        { name: 'Math.round(x)', description: 'Round to nearest integer' },
        { name: 'Math.floor(x)', description: 'Round down to integer' },
        { name: 'Math.ceil(x)', description: 'Round up to integer' },
        { name: 'Math.max(a, b)', description: 'Maximum of two values' },
        { name: 'Math.min(a, b)', description: 'Minimum of two values' },
        { name: 'Math.sqrt(x)', description: 'Square root' },
        { name: 'Math.pow(x, y)', description: 'x to the power of y' },
        { name: 'Math.random()', description: 'Random number between 0.0 and 1.0' },
        { name: 'Math.sin(x)', description: 'Sine' },
        { name: 'Math.cos(x)', description: 'Cosine' },
        { name: 'Math.tan(x)', description: 'Tangent' },
        { name: 'Math.log(x)', description: 'Natural logarithm' },
        { name: 'Math.log10(x)', description: 'Base 10 logarithm' },
        { name: 'Math.exp(x)', description: 'Exponential function' },
        { name: 'Math.PI', description: 'Pi constant' },
        { name: 'Math.E', description: 'Euler\'s number' }
      ],
      'Collections': [
        { name: 'Collections.sort(list)', description: 'Sort list' },
        { name: 'Collections.reverse(list)', description: 'Reverse list' },
        { name: 'Collections.shuffle(list)', description: 'Shuffle list randomly' },
        { name: 'Collections.max(collection)', description: 'Find maximum element' },
        { name: 'Collections.min(collection)', description: 'Find minimum element' },
        { name: 'Collections.frequency(collection, object)', description: 'Count occurrences' },
        { name: 'Collections.addAll(collection, elements)', description: 'Add all elements' },
        { name: 'Collections.binarySearch(list, key)', description: 'Binary search' },
        { name: 'Collections.replaceAll(list, old, new)', description: 'Replace all occurrences' },
        { name: 'Collections.unmodifiableCollection(collection)', description: 'Create unmodifiable view' }
      ]
    }
  },
  
  cpp: {
    title: 'C++ Standard Library Functions',
    categories: {
      'Vector': [
        { name: 'push_back(value)', description: 'Add element to end' },
        { name: 'pop_back()', description: 'Remove last element' },
        { name: 'size()', description: 'Get vector size' },
        { name: 'empty()', description: 'Check if vector is empty' },
        { name: 'clear()', description: 'Remove all elements' },
        { name: 'resize(new_size)', description: 'Resize vector' },
        { name: 'reserve(capacity)', description: 'Reserve capacity' },
        { name: 'at(index)', description: 'Access element with bounds check' },
        { name: 'front()', description: 'Access first element' },
        { name: 'back()', description: 'Access last element' },
        { name: 'begin()', description: 'Iterator to first element' },
        { name: 'end()', description: 'Iterator to past last element' },
        { name: 'erase(position)', description: 'Remove element at position' },
        { name: 'insert(position, value)', description: 'Insert element at position' },
        { name: 'sort(begin, end)', description: 'Sort vector elements' },
        { name: 'reverse(begin, end)', description: 'Reverse vector elements' }
      ],
      'String': [
        { name: 'length()', description: 'Get string length' },
        { name: 'size()', description: 'Get string size' },
        { name: 'empty()', description: 'Check if string is empty' },
        { name: 'clear()', description: 'Clear string contents' },
        { name: 'at(index)', description: 'Access character with bounds check' },
        { name: 'substr(pos, count)', description: 'Get substring' },
        { name: 'substring(pos, count)', description: 'Get substring' },
        { name: 'append(str)', description: 'Append string' },
        { name: 'push_back(char)', description: 'Add character to end' },
        { name: 'pop_back()', description: 'Remove last character' },
        { name: 'insert(pos, str)', description: 'Insert string at position' },
        { name: 'erase(pos, count)', description: 'Remove characters' },
        { name: 'replace(pos, count, str)', description: 'Replace characters' },
        { name: 'find(str)', description: 'Find substring' },
        { name: 'rfind(str)', description: 'Find substring from end' },
        { name: 'find_first_of(str)', description: 'Find first character from set' },
        { name: 'find_last_of(str)', description: 'Find last character from set' },
        { name: 'compare(str)', description: 'Compare strings' },
        { name: 'c_str()', description: 'Get C-style string' }
      ],
      'Algorithm': [
        { name: 'sort(begin, end)', description: 'Sort range' },
        { name: 'stable_sort(begin, end)', description: 'Stable sort range' },
        { name: 'reverse(begin, end)', description: 'Reverse range' },
        { name: 'find(begin, end, value)', description: 'Find value in range' },
        { name: 'binary_search(begin, end, value)', description: 'Binary search' },
        { name: 'lower_bound(begin, end, value)', description: 'First position not less than value' },
        { name: 'upper_bound(begin, end, value)', description: 'First position greater than value' },
        { name: 'equal_range(begin, end, value)', description: 'Range of elements equal to value' },
        { name: 'min_element(begin, end)', description: 'Iterator to minimum element' },
        { name: 'max_element(begin, end)', description: 'Iterator to maximum element' },
        { name: 'minmax_element(begin, end)', description: 'Iterators to min and max elements' },
        { name: 'count(begin, end, value)', description: 'Count occurrences of value' },
        { name: 'for_each(begin, end, function)', description: 'Apply function to each element' },
        { name: 'transform(begin, end, result, function)', description: 'Transform elements' },
        { name: 'copy(begin, end, result)', description: 'Copy range' },
        { name: 'fill(begin, end, value)', description: 'Fill range with value' },
        { name: 'generate(begin, end, function)', description: 'Generate values' },
        { name: 'accumulate(begin, end, init)', description: 'Accumulate sum of range' },
        { name: 'next_permutation(begin, end)', description: 'Generate next permutation' },
        { name: 'prev_permutation(begin, end)', description: 'Generate previous permutation' }
      ],
      'Math': [
        { name: 'abs(x)', description: 'Absolute value' },
        { name: 'fabs(x)', description: 'Absolute value (float)' },
        { name: 'round(x)', description: 'Round to nearest integer' },
        { name: 'floor(x)', description: 'Round down to integer' },
        { name: 'ceil(x)', description: 'Round up to integer' },
        { name: 'sqrt(x)', description: 'Square root' },
        { name: 'pow(x, y)', description: 'x to the power of y' },
        { name: 'exp(x)', description: 'Exponential function' },
        { name: 'log(x)', description: 'Natural logarithm' },
        { name: 'log10(x)', description: 'Base 10 logarithm' },
        { name: 'sin(x)', description: 'Sine' },
        { name: 'cos(x)', description: 'Cosine' },
        { name: 'tan(x)', description: 'Tangent' },
        { name: 'asin(x)', description: 'Arc sine' },
        { name: 'acos(x)', description: 'Arc cosine' },
        { name: 'atan(x)', description: 'Arc tangent' },
        { name: 'M_PI', description: 'Pi constant' },
        { name: 'M_E', description: 'Euler\'s number' },
        { name: 'min(a, b)', description: 'Minimum of two values' },
        { name: 'max(a, b)', description: 'Maximum of two values' }
      ],
      'Utility': [
        { name: 'swap(a, b)', description: 'Swap two values' },
        { name: 'make_pair(a, b)', description: 'Create pair' },
        { name: 'make_tuple(args...)', description: 'Create tuple' },
        { name: 'get<index>(tuple)', description: 'Get tuple element' },
        { name: 'tie(args...)', description: 'Unpack tuple' },
        { name: 'move(object)', description: 'Convert to rvalue reference' },
        { name: 'forward<T>(arg)', description: 'Forward argument' },
        { name: 'declval<T>()', description: 'Pretend to create instance' }
      ]
    }
  }
};

export default function BuiltInFunctions({ language, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentLanguage = LANGUAGE_FUNCTIONS[language] || LANGUAGE_FUNCTIONS.javascript;
  
  const filteredFunctions = selectedCategory
    ? currentLanguage.categories[selectedCategory]
    : Object.values(currentLanguage.categories).flat();

  const searchedFunctions = searchTerm
    ? filteredFunctions.filter(func => 
        func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredFunctions;

  return (
    <div className="builtin-functions">
      <div className="builtin-header">
        <h3>{currentLanguage.title}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="builtin-search">
        <input
          type="text"
          placeholder="Search functions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="builtin-content">
        <div className="builtin-sidebar">
          <div className="category-list">
            <button
              className={`category-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Functions
            </button>
            {Object.keys(currentLanguage.categories).map(category => (
              <button
                key={category}
                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="builtin-main">
          <div className="function-list">
            {searchedFunctions.map((func, index) => (
              <div key={index} className="function-item">
                <div className="function-name">{func.name}</div>
                <div className="function-description">{func.description}</div>
              </div>
            ))}
            {searchedFunctions.length === 0 && (
              <div className="no-results">No functions found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

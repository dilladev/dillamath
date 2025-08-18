import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Switch } from './components/ui/switch';
import { SmallSwitch } from './components/ui/switch-small';
import jsPDF from 'jspdf';

// List of supported operation types, including algebra equations.
const OP_TYPES = [
  { key: "addition", label: "Addition", symbol: "+" },
  { key: "subtraction", label: "Subtraction", symbol: "-" },
  { key: "multiplication", label: "Multiplication", symbol: "×" },
  { key: "division", label: "Division", symbol: "÷" },
  { key: "algebra", label: "Algebra Equations", symbol: "=" }
];

export default function MathWorksheetGenerator() {
  // ====== State Management ======
  // Number of questions to generate
  const [numQuestions, setNumQuestions] = useState(10);
  // Selected operation type (addition, subtraction, etc, or 'mixed')
  const [operation, setOperation] = useState('addition');
  // Maximum number to use in generated questions
  const [maxNumber, setMaxNumber] = useState(10);
  // Whether to allow negative answers in subtraction
  const [allowNegatives, setAllowNegatives] = useState(false);
  // Whether division problems should yield whole numbers only
  const [wholeDivision, setWholeDivision] = useState(true);
  // Whether to allow zero in the generated numbers
  const [allowZero, setAllowZero] = useState(false);
  // Whether to allow one in the generated numbers
  const [allowOne, setAllowOne] = useState(false);
  // Whether to generate multiple choice questions
  const [multipleChoice, setMultipleChoice] = useState(false);
  // Whether to show answer boxes in the worksheet
  const [showBoxes, setShowBoxes] = useState(false);
  // Whether to show an answer sheet in the PDF
  const [showAnswers, setShowAnswers] = useState(false);
  // Array of multiplication facts to use when generating multiplication problems
  const [multiplicationFacts, setMultiplicationFacts] = useState<number[]>([]);
  // In mixed mode, which operation types to include
  const [mixedOps, setMixedOps] = useState({
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true,
    algebra: false
  });

  // True if the user selected 'mixed' operation mode
  const isMixed = operation === 'mixed';

  // Array of allowed operations for problem generation
  const availableOps = isMixed
    ? OP_TYPES.filter(o => mixedOps[o.key])
    : OP_TYPES.filter(o => o.key === operation);

  /**
   * Generates a random simple algebra equation and its solution.
   * Supported formats: ax + b = c, x + b = c, x - b = c, ax = c
   * Returns { display, answer }
   */
  function generateAlgebraProblem() {
    // Various algebra formats to pick from randomly
    const formats = [
      // ax + b = c        (a ≠ 0, b, c integers)
      () => {
        const a = Math.floor(Math.random() * 10) + 1; // [1,10]
        const x = Math.floor(Math.random() * maxNumber) + 1;
        const b = Math.floor(Math.random() * 11) - 5; // [-5,5]
        const c = a * x + b;
        return {
          display: `${a !== 1 ? a : ''}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`,
          answer: x
        };
      },
      // x + b = c
      () => {
        const x = Math.floor(Math.random() * maxNumber) + 1;
        const b = Math.floor(Math.random() * 11) - 5;
        const c = x + b;
        return {
          display: `x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`,
          answer: x
        };
      },
      // x - b = c
      () => {
        const x = Math.floor(Math.random() * maxNumber) + 1;
        const b = Math.floor(Math.random() * 11);
        const c = x - b;
        return {
          display: `x - ${b} = ${c}`,
          answer: x
        };
      },
      // ax = c
      () => {
        const a = Math.floor(Math.random() * 9) + 2;
        const x = Math.floor(Math.random() * maxNumber) + 1;
        const c = a * x;
        return {
          display: `${a}x = ${c}`,
          answer: x
        };
      }
    ];
    // Pick a random format and generate a problem
    const f = formats[Math.floor(Math.random() * formats.length)];
    return f();
  }
  
  /**
   * Fisher-Yates shuffle for an array (in-place).
   */
  function shuffleArray<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generates an array of problems according to the current state/settings.
   * For mixed mode, ensures each enabled operation is represented equally.
   */
  const generateProblems = () => {
    const problems = [];
    const seen = new Set();

    // If not mixed, just generate
    if (!isMixed) {
      let attempts = 0;
      while (problems.length < numQuestions && attempts < numQuestions * 20) {
        const opObj = OP_TYPES.find(o => o.key === operation);
        if (!opObj) break;
        const op = opObj.key, opSymbol = opObj.symbol;
      }
      return problems;
    }

    // Mixed mode: build an array of operation keys to use
    const enabledOps = OP_TYPES.filter(o => mixedOps[o.key]);
    if (enabledOps.length === 0) return [];

    // Distribute the questions as evenly as possible
    const opsList: string[] = [];
    for (let i = 0; i < numQuestions; i++) {
      opsList.push(enabledOps[i % enabledOps.length].key);
    }
    shuffleArray(opsList);

    // For each operation, try to generate one valid problem
    let attempts = 0;
    for (let idx = 0; idx < opsList.length; idx++) {
      const op = opsList[idx];
      const opObj = OP_TYPES.find(o => o.key === op);
      if (!opObj) continue;
      const opSymbol = opObj.symbol;

      let added = false;
      // Try up to 15 times for this slot to get a valid problem
      for (let retry = 0; retry < 15 && !added; retry++) {
        if (op === 'algebra') {
          const { display, answer } = generateAlgebraProblem();
          if (!seen.has(display)) {
            seen.add(display);
            problems.push({ algebra: true, display, answer });
            added = true;
          }
        } else {
          let a = Math.floor(Math.random() * (maxNumber + 1));
          let b = Math.floor(Math.random() * (maxNumber + 1));
          if (op === 'multiplication' && multiplicationFacts.length > 0) {
            a = multiplicationFacts[Math.floor(Math.random() * multiplicationFacts.length)];
          }
          if (!allowZero && (a === 0 || b === 0)) continue;
          if (!allowOne && (a === 1 || b === 1)) continue;
          if (op === 'subtraction' && !allowNegatives && a < b) [a, b] = [b, a];
          if (op === 'division') {
            b = Math.max(1, b);
            if (wholeDivision) a = a - (a % b);
          }
          if (a !== 0 && (allowOne || correctAnswer({ a, b, op: opSymbol }) !== 1)) {
            const key = `${a}${opSymbol}${b}`;
            if (!seen.has(key)) {
              seen.add(key);
              problems.push({ a, b, op: opSymbol });
              added = true;
            }
          }
        }
      }
      // If after 15 tries we failed, just skip this question.
    }
    return problems;
  };

  /**
   * Generates 3 unique distractors plus the correct answer for a multiple choice question.
   * @param correct the correct answer
   * @returns sorted array of choices including the correct answer
   */
  const generateChoices = (correct: number) => {
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const offset = Math.floor(Math.random() * 11) - 5;
      const distractor = correct + offset;
      if (distractor !== correct && distractor >= 0) {
        choices.add(distractor);
      }
    }
    return Array.from(choices).sort((a, b) => a - b);
  };

  /**
   * Draws the worksheet page header on a PDF document.
   * @param doc jsPDF instance
   * @param actualCount number of problems
   */
  const addPageHeader = (doc: jsPDF, actualCount: number) => {
    doc.setFontSize(12);
    doc.text('Name: ________________________', 20, 20);
    doc.text(`Date: ____________`, 150, 20);
    doc.text(`Score: ______ / ${actualCount}`, 20, 30);
  };

  /**
   * Computes the correct answer for an arithmetic problem.
   * @param p the problem object (a, b, op)
   * @returns the numeric answer
   */
  const correctAnswer = (p: { a: number; b: number; op: string }) => {
    // Use eval for simple arithmetic, replacing symbols as needed
    return eval(`${p.a} ${p.op === '×' ? '*' : p.op === '÷' ? '/' : p.op} ${p.b}`);
  };

  /**
   * Generates the PDF worksheet and triggers a download.
   * Handles both worksheet and optional answer sheet.
   */
  const generatePDF = () => {
    const doc = new jsPDF();
    const problems = generateProblems();
    const actualCount = problems.length;
    const colCount = 5; // number of columns per row
    const pageWidth = 190;
    const marginX = 20;
    const colWidth = (pageWidth - marginX) / colCount;
    const rowHeight = multipleChoice ? 60 : 30;
    let xStart = marginX;
    let yStart = 45;
    let x = xStart;
    let y = yStart;

    // Draw worksheet header
    addPageHeader(doc, actualCount);

    // Loop through problems and render each one
    problems.forEach((p, i) => {
      // Move to next page if at bottom
      if (y > 250) {
        doc.addPage();
        addPageHeader(doc,actualCount);
        y = yStart;
        x = xStart;
      }

      // Algebra questions: display as equation (e.g., 3x + 2 = 11)
      if (p.algebra) {
        doc.setFontSize(14);
        doc.text(`${i + 1}.`, x, y);
        doc.text(p.display, x + 7, y);
        // Draw answer line/box if needed
        // Multiple choice for algebra
        if (multipleChoice) {
          const choices = generateChoices(p.answer);
          const labels = ['A', 'B', 'C', 'D'];
          choices.forEach((choice, idx) => {
            const bubbleX = x + 2;
            const bubbleY = y + 25 + idx * 7;
            doc.circle(bubbleX, bubbleY, 2);
            doc.text(`${labels[idx]}. ${choice}`, bubbleX + 6, bubbleY + 1.5);
          });
        }
      } else {
        // Arithmetic question display
        const aStr = p.a.toString();
        const bStr = `${p.op} ${p.b}`;
        const answer = correctAnswer(p);

        doc.setFontSize(14);
        doc.text(`${i + 1}.`, x, y);
        doc.text(aStr, x + 20, y, { align: 'right' });
        doc.text(bStr, x + 20, y + 7, { align: 'right' });
        // Draw answer line
        doc.line(x + 8, y + 10, x + colWidth - 10, y + 10);

        // Draw answer box if enabled
        if (showBoxes) {
          const yOffset = 7;
          const xOffset = 5;
          doc.line(x - xOffset, y - yOffset, x + colWidth - xOffset, y - yOffset);
          doc.line(x + colWidth - xOffset, y - yOffset, x + colWidth - xOffset, y + rowHeight - yOffset);
          doc.line(x + colWidth - xOffset, y + rowHeight - yOffset, x - xOffset, y + rowHeight - yOffset);
          doc.line(x - xOffset, y + rowHeight - yOffset, x - xOffset, y - yOffset);
        }

        // Multiple choice distractors for arithmetic
        if (multipleChoice) {
          const choices = generateChoices(answer);
          const labels = ['A', 'B', 'C', 'D'];
          choices.forEach((choice, idx) => {
            const bubbleX = x + 2;
            const bubbleY = y + 25 + idx * 7;
            doc.circle(bubbleX, bubbleY, 2);
            doc.text(`${labels[idx]}. ${choice}`, bubbleX + 6, bubbleY + 1.5);
          });
        }
      }

      // Advance position for next problem
      x += colWidth;
      if (x + colWidth > pageWidth) {
        x = xStart;
        y += rowHeight;
      }
    });

    // If answer sheet is enabled, add a new page with answers
    if (showAnswers) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Answer Sheet', 20, 20);
      doc.setFontSize(12);

      problems.forEach((p, i) => {
        let answer;
        if (p.algebra) {
          answer = p.answer;
        } else {
          answer = correctAnswer(p);
        }
        doc.text(`${i + 1}. ${answer}`, 20, 30 + i * 8);
      });
    }

    // Save/download the PDF
    doc.save('math-worksheet.pdf');
  };

  // ----- UI Rendering -----
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Math Worksheet Generator</h1>
      <Card>
        <CardContent className="space-y-4 p-4">

          {/* Number of Questions */}
          <div>
            <label className="block font-medium">Number of Questions</label>
            <Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} min={1} />
          </div>

          {/* Operation Selection */}
          <div>
            <label className="block font-medium mb-1">Operation</label>
            <RadioGroup value={operation} onValueChange={setOperation} className="space-y-2">
              <RadioGroupItem value="addition" label="Addition" />
              <RadioGroupItem value="subtraction" label="Subtraction" />
              <RadioGroupItem value="multiplication" label="Multiplication" />
              <RadioGroupItem value="division" label="Division" />
              <RadioGroupItem value="algebra" label="Algebra Equations" />
              <RadioGroupItem value="mixed" label="Mixed (Random)" />
            </RadioGroup>
          </div>

          {/* Mixed Mode: Enable/disable which operation types to include */}
          {isMixed && (
            <div>
              <label className="block font-medium mb-1">Include Operations</label>
              <div className="grid grid-cols-2 gap-2">
                {OP_TYPES.map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-1">
                    <SmallSwitch
                      checked={mixedOps[key]}
                      onCheckedChange={(checked) => setMixedOps(prev => ({ ...prev, [key]: checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Multiplication Facts Selector */}
          {(operation === 'multiplication' || (isMixed && mixedOps.multiplication)) && (
            <div>
              <label className="block font-medium mb-1">Multiplication Facts</label>
              <hr className="border-t border-gray-300 mb-2 mt-2" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(11)].map((_, i) => {
                  const fact = i + 2;
                  const isSelected = multiplicationFacts.includes(fact);
                  return (
                    <label key={fact} className="flex items-center space-x-1">
                      <SmallSwitch
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          setMultiplicationFacts((prev) =>
                            checked ? [...prev, fact] : prev.filter((f) => f !== fact)
                          );
                        }}
                      />
                      <span>{fact}</span>
                    </label>
                  );
                })}
              </div>
              <hr className="border-t border-gray-300 mb-2 mt-2" />
            </div>
          )}

          {/* Allow Negative Answers for subtraction */}
          <div className="flex items-center">
            <Switch checked={allowNegatives} onCheckedChange={setAllowNegatives} />
            <label className="font-medium ml-2">Allow Negative Answers</label>
          </div>

          {/* Whole Number Division toggle */}
          {(operation === 'division' || (isMixed && mixedOps.division)) && (
            <div className="flex items-center">
              <Switch checked={wholeDivision} onCheckedChange={setWholeDivision} />
              <label className="font-medium ml-2">Whole Number Division Only</label>
            </div>
          )}

          {/* Allow Zeros toggle */}
          <div className="flex items-center">
            <Switch checked={allowZero} onCheckedChange={setAllowZero} />
            <label className="font-medium ml-2">Allow Zeros</label>
          </div>

          {/* Allow Ones toggle */}
          <div className="flex items-center">
            <Switch checked={allowOne} onCheckedChange={setAllowOne} />
            <label className="font-medium ml-2">Allow Ones</label>
          </div>

          {/* Multiple Choice toggle */}
          <div className="flex items-center">
            <Switch checked={multipleChoice} onCheckedChange={setMultipleChoice} />
            <label className="font-medium ml-2">Use Multiple Choice</label>
          </div>

          {/* Show Boxes toggle */}
          <div className="flex items-center">
            <Switch checked={showBoxes} onCheckedChange={setShowBoxes} />
            <label className="font-medium ml-2">Show Boxes</label>
          </div>

          {/* Show Answer Sheet toggle */}
          <div className="flex items-center">
            <Switch checked={showAnswers} onCheckedChange={setShowAnswers} />
            <label className="font-medium ml-2">Show Answer Sheet</label>
          </div>

          {/* Largest Number setting */}
          <div>
            <label className="block font-medium">Largest Number</label>
            <Input type="number" value={maxNumber} onChange={(e) => setMaxNumber(Number(e.target.value))} min={1} />
          </div>

          {/* Generate PDF Button */}
          <Button onClick={generatePDF}>Generate PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}
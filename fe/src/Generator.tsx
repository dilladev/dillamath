import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Switch } from './components/ui/switch';
import jsPDF from 'jspdf';

export default function MathWorksheetGenerator() {
  // ====== State Management ======
  // Basic settings for worksheet configuration
  const [numQuestions, setNumQuestions] = useState(10); // Number of questions
  const [operation, setOperation] = useState('addition'); // Operation type: addition, subtraction, etc.
  const [maxNumber, setMaxNumber] = useState(10); // Largest number allowed in problems

  // Filters and options
  const [allowNegatives, setAllowNegatives] = useState(false); // Allow negative answers (for subtraction)
  const [wholeDivision, setWholeDivision] = useState(true); // Require whole number division answers
  const [allowZero, setAllowZero] = useState(false); // Allow zero in operands
  const [allowOne, setAllowOne] = useState(false); // Allow one in operands
  const [multipleChoice, setMultipleChoice] = useState(false); // Enable multiple choice questions
  const [showBoxes, setShowBoxes] = useState(false); // Show surrounding boxes around questions
  const [showAnswers, setShowAnswers] = useState(false); // Print answer sheet page at the end

  // ====== Utility Functions ======

  // Generates a unique list of problems based on filters and type
  const generateProblems = () => {
    const problems = [];
    const seen = new Set(); // Prevent duplicate problems
    const ops = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷'
    };

    let attempts = 0;
    while (problems.length < numQuestions && attempts < numQuestions * 20) {
      let a = Math.floor(Math.random() * (maxNumber + 1));
      let b = Math.floor(Math.random() * (maxNumber + 1));

      // Skip invalid entries based on zero and one filters
      if (!allowZero && (a === 0 || b === 0)) continue;
      if (!allowOne && (a === 1 || b === 1)) continue;

      // Handle subtraction filtering
      if (operation === 'subtraction' && !allowNegatives && a < b) {
        [a, b] = [b, a];
      }

      // Handle division filtering
      if (operation === 'division') {
        b = Math.max(1, b);
        if (wholeDivision) {
          a = a - (a % b);
        }
      }

      // Only store unique problems and skip trivial (e.g., answer = 1)
      if (a !== 0 && (allowOne == true || (correctAnswer({ a, b, op: ops[operation] }) !== 1))) {
        const key = `${a}${ops[operation]}${b}`;
        if (seen.has(key)) {
          attempts++;
          continue;
        }

        seen.add(key);
        problems.push({ a, b, op: ops[operation] });
      }
    }

    return problems;
  };

  // Generates a list of 4 choices (1 correct + 3 distractors)
  const generateChoices = (correct) => {
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

  // Renders the worksheet header: Name, Date, Score
  const addPageHeader = (doc) => {
    doc.setFontSize(12);
    doc.text('Name: ________________________', 20, 20);
    doc.text(`Date: ____________`, 150, 20);
    doc.text(`Score: ______ / ${numQuestions}`, 20, 30);
  };

  // Calculates the actual result of a problem
  const correctAnswer = (p) => {
    return eval(`${p.a} ${p.op === '×' ? '*' : p.op === '÷' ? '/' : p.op} ${p.b}`);
  }

  // Generates and renders the worksheet PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    const problems = generateProblems();
    const colCount = 3; // Number of columns on the page
    const pageWidth = 190;
    const marginX = 20;
    const colWidth = (pageWidth - marginX) / colCount;
    const rowHeight = multipleChoice ? 60 : 50;
    let xStart = marginX;
    let yStart = 45;
    let x = xStart;
    let y = yStart;

    addPageHeader(doc);

    // Render each math problem
    problems.forEach((p, i) => {
      // Start new page if needed
      if (y > 250) {
        doc.addPage();
        addPageHeader(doc);
        y = yStart;
        x = xStart;
      }

      const aStr = p.a.toString();
      const bStr = `${p.op} ${p.b}`;
      const answer = correctAnswer(p);

      // Print problem layout
      doc.setFontSize(14);
      doc.text(`${i + 1}.`, x, y);
      doc.text(aStr, x + 20, y, { align: 'right' });
      doc.text(bStr, x + 20, y + 7, { align: 'right' });
      doc.line(x + 8, y + 10, x + colWidth - 30, y + 10); // Answer line

      // Optional boxed layout
      if (showBoxes) {
        const yOffset = 7;
        const xOffset = 5;
        doc.line(x - xOffset, y - yOffset, x + colWidth - xOffset, y - yOffset);
        doc.line(x + colWidth - xOffset, y - yOffset, x + colWidth - xOffset, y + rowHeight - yOffset);
        doc.line(x + colWidth - xOffset, y + rowHeight - yOffset, x - xOffset, y + rowHeight - yOffset);
        doc.line(x - xOffset, y + rowHeight - yOffset, x - xOffset, y - yOffset);
      }

      // Render multiple choice options if enabled
      if (multipleChoice) {
        const choices = generateChoices(answer);
        const labels = ['A', 'B', 'C', 'D'];

        choices.forEach((choice, idx) => {
          const bubbleX = x + 10;
          const bubbleY = y + 25 + idx * 7;
          doc.circle(bubbleX, bubbleY, 2); // Draw bubble
          doc.text(`${labels[idx]}. ${choice}`, bubbleX + 6, bubbleY + 1.5);
        });
      }

      // Advance position
      x += colWidth;
      if (x + colWidth > pageWidth) {
        x = xStart;
        y += rowHeight;
      }
    });

    // Render answer sheet if enabled
    if (showAnswers) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Answer Sheet', 20, 20);
      doc.setFontSize(12);

      problems.forEach((p, i) => {
        const answer = correctAnswer(p);
        doc.text(`${i + 1}. ${answer}`, 20, 30 + i * 8);
      });
    }

    doc.save('math-worksheet.pdf'); // Trigger file download
  };

  // ====== UI Rendering ======
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Math Worksheet Generator</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          {/* Input: Number of Questions */}
          <div>
            <label className="block font-medium">Number of Questions</label>
            <Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} min={1} />
          </div>

          {/* Input: Operation Type */}
          <div>
            <label className="block font-medium mb-1">Operation</label>
            <RadioGroup value={operation} onValueChange={setOperation} className="space-y-2">
              <RadioGroupItem value="addition" label="Addition" />
              <RadioGroupItem value="subtraction" label="Subtraction" />
              <RadioGroupItem value="multiplication" label="Multiplication" />
              <RadioGroupItem value="division" label="Division" />
            </RadioGroup>
          </div>

          {/* Conditional toggles for additional settings */}
          {operation === 'subtraction' && (
            <div className="flex items-center">
              <Switch checked={allowNegatives} onCheckedChange={setAllowNegatives} />
              <label className="font-medium">Allow Negative Answers</label>
            </div>
          )}

          {operation === 'division' && (
            <div className="flex items-center">
              <Switch checked={wholeDivision} onCheckedChange={setWholeDivision} />
              <label className="font-medium">Whole Number Answers Only</label>
            </div>
          )}

          {/* General toggles */}
          <div className="flex items-center">
            <Switch checked={allowZero} onCheckedChange={setAllowZero} />
            <label className="font-medium">Allow Zeros in Problems</label>
          </div>

          <div className="flex items-center">
            <Switch checked={allowOne} onCheckedChange={setAllowOne} />
            <label className="font-medium">Allow Ones in Problems</label>
          </div>

          <div className="flex items-center">
            <Switch checked={multipleChoice} onCheckedChange={setMultipleChoice} />
            <label className="font-medium">Use Multiple Choice</label>
          </div>

          <div className="flex items-center">
            <Switch checked={showBoxes} onCheckedChange={setShowBoxes} />
            <label className="font-medium">Show Boxes</label>
          </div>

          <div className="flex items-center">
            <Switch checked={showAnswers} onCheckedChange={setShowAnswers} />
            <label className="font-medium">Show Answer Sheet</label>
          </div>

          {/* Input: Maximum Number */}
          <div>
            <label className="block font-medium">Largest Number</label>
            <Input type="number" value={maxNumber} onChange={(e) => setMaxNumber(Number(e.target.value))} min={1} />
          </div>

          {/* Generate PDF button */}
          <Button onClick={generatePDF}>Generate PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Switch } from './components/ui/switch';
import jsPDF from 'jspdf';

export default function MathWorksheetGenerator() {
  // ====== State Management ======
  // Settings that determine worksheet content and behavior
  const [numQuestions, setNumQuestions] = useState(10); // Number of math questions to generate
  const [operation, setOperation] = useState('addition'); // Selected operation (addition, subtraction, etc.)
  const [maxNumber, setMaxNumber] = useState(10); // Upper limit for generated numbers
  const [allowNegatives, setAllowNegatives] = useState(false); // Toggle for allowing negative answers
  const [wholeDivision, setWholeDivision] = useState(true); // Restrict division to whole number results
  const [allowZero, setAllowZero] = useState(false); // Allow 0 in generated numbers
  const [allowOne, setAllowOne] = useState(false); // Allow 1 in generated numbers
  const [multipleChoice, setMultipleChoice] = useState(false); // Toggle for multiple-choice format
  const [showBoxes, setShowBoxes] = useState(false); // Surround problems with boxes for better structure
  const [showAnswers, setShowAnswers] = useState(false); // Include an answer sheet page
  const [multiplicationFact, setMultiplicationFact] = useState(null); // Fixed value for multiplication (if selected)

  // Generates an array of unique math problems based on the selected settings
  const generateProblems = () => {
    const problems = [];
    const seen = new Set();
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

      // If using a multiplication fact, override 'a' with the selected value
      if (operation === 'multiplication' && multiplicationFact) {
        a = multiplicationFact;
      }

      // Filter based on zero and one rules
      if (!allowZero && (a === 0 || b === 0)) continue;
      if (!allowOne && (a === 1 || b === 1)) continue;

      // Enforce subtraction rules to avoid negative results if disallowed
      if (operation === 'subtraction' && !allowNegatives && a < b) {
        [a, b] = [b, a];
      }

      // Adjust division problems to result in whole numbers if required
      if (operation === 'division') {
        b = Math.max(1, b);
        if (wholeDivision) {
          a = a - (a % b);
        }
      }

      // Create a unique key for the problem and add if not already used
      if (a !== 0 && (allowOne || correctAnswer({ a, b, op: ops[operation] }) !== 1)) {
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

  // Generate 4 possible answer choices (1 correct, 3 distractors)
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

  // Render header information on each PDF page
  const addPageHeader = (doc) => {
    doc.setFontSize(12);
    doc.text('Name: ________________________', 20, 20);
    doc.text(`Date: ____________`, 150, 20);
    doc.text(`Score: ______ / ${numQuestions}`, 20, 30);
  };

  // Evaluate and return the correct answer for a given problem
  const correctAnswer = (p) => {
    return eval(`${p.a} ${p.op === '×' ? '*' : p.op === '÷' ? '/' : p.op} ${p.b}`);
  }

  // Render all questions to the PDF document, and optionally an answer sheet
  const generatePDF = () => {
    const doc = new jsPDF();
    const problems = generateProblems();
    const colCount = 5;
    const pageWidth = 190;
    const marginX = 20;
    const colWidth = (pageWidth - marginX) / colCount;
    const rowHeight = multipleChoice ? 60 : 30;
    let xStart = marginX;
    let yStart = 45;
    let x = xStart;
    let y = yStart;

    addPageHeader(doc);

    problems.forEach((p, i) => {
      if (y > 250) {
        doc.addPage();
        addPageHeader(doc);
        y = yStart;
        x = xStart;
      }

      const aStr = p.a.toString();
      const bStr = `${p.op} ${p.b}`;
      const answer = correctAnswer(p);

      doc.setFontSize(14);
      doc.text(`${i + 1}.`, x, y);
      doc.text(aStr, x + 20, y, { align: 'right' });
      doc.text(bStr, x + 20, y + 7, { align: 'right' });
      doc.line(x + 8, y + 10, x + colWidth - 10, y + 10);

      // Optionally draw a box around the question
      if (showBoxes) {
        const yOffset = 7;
        const xOffset = 5;
        doc.line(x - xOffset, y - yOffset, x + colWidth - xOffset, y - yOffset);
        doc.line(x + colWidth - xOffset, y - yOffset, x + colWidth - xOffset, y + rowHeight - yOffset);
        doc.line(x + colWidth - xOffset, y + rowHeight - yOffset, x - xOffset, y + rowHeight - yOffset);
        doc.line(x - xOffset, y + rowHeight - yOffset, x - xOffset, y - yOffset);
      }

      // Render multiple choice bubbles and options
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

      x += colWidth;
      if (x + colWidth > pageWidth) {
        x = xStart;
        y += rowHeight;
      }
    });

    // Optionally append answer sheet
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

    doc.save('math-worksheet.pdf');
  };

  // ====== UI Rendering ======
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Math Worksheet Generator</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          {/* Number of questions */}
          <div>
            <label className="block font-medium">Number of Questions</label>
            <Input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              min={1}
            />
          </div>

          {/* Operation selection */}
          <div>
            <label className="block font-medium mb-1">Operation</label>
            <RadioGroup
              value={operation}
              onValueChange={(val) => {
                setOperation(val);
                if (val !== 'multiplication') setMultiplicationFact(null);
              }}
              className="space-y-2"
            >
              <RadioGroupItem value="addition" label="Addition" />
              <RadioGroupItem value="subtraction" label="Subtraction" />
              <RadioGroupItem value="multiplication" label="Multiplication" />
              <RadioGroupItem value="division" label="Division" />
            </RadioGroup>
          </div>

          {/* Multiplication Fact Selector */}
          {operation === 'multiplication' && (
            <div>
              <label className="block font-medium">Multiplication Fact</label>
              <select
                className="border rounded px-2 py-1 bg-transparent "
                value={multiplicationFact || ''}
                onChange={(e) => setMultiplicationFact(Number(e.target.value))}
              >
                <option value="" style={{ backgroundColor: 'black', color: 'white' }}>Random</option>
                {[...Array(11)].map((_, i) => (
                  <option
                  key={i + 2}
                  value={i + 2}
                  style={{ backgroundColor: 'black', color: 'white' }}
                >
                  {i + 2}
                </option>
                ))}
              </select>
            </div>
          )}

          {/* Subtraction specific toggle */}
          {operation === 'subtraction' && (
            <div className="flex items-center">
              <Switch checked={allowNegatives} onCheckedChange={setAllowNegatives} />
              <label className="font-medium ml-2">Allow Negative Answers</label>
            </div>
          )}

          {/* Division specific toggle */}
          {operation === 'division' && (
            <div className="flex items-center">
              <Switch checked={wholeDivision} onCheckedChange={setWholeDivision} />
              <label className="font-medium ml-2">Whole Number Answers Only</label>
            </div>
          )}

          {/* General toggles */}
          <div className="flex items-center">
            <Switch checked={allowZero} onCheckedChange={setAllowZero} />
            <label className="font-medium ml-2">Allow Zeros in Problems</label>
          </div>

          <div className="flex items-center">
            <Switch checked={allowOne} onCheckedChange={setAllowOne} />
            <label className="font-medium ml-2">Allow Ones in Problems</label>
          </div>

          <div className="flex items-center">
            <Switch checked={multipleChoice} onCheckedChange={setMultipleChoice} />
            <label className="font-medium ml-2">Use Multiple Choice</label>
          </div>

          <div className="flex items-center">
            <Switch checked={showBoxes} onCheckedChange={setShowBoxes} />
            <label className="font-medium ml-2">Show Boxes</label>
          </div>

          <div className="flex items-center">
            <Switch checked={showAnswers} onCheckedChange={setShowAnswers} />
            <label className="font-medium ml-2">Show Answer Sheet</label>
          </div>

          {/* Largest number input */}
          <div>
            <label className="block font-medium">Largest Number</label>
            <Input
              type="number"
              value={maxNumber}
              onChange={(e) => setMaxNumber(Number(e.target.value))}
              min={1}
            />
          </div>

          {/* Generate PDF */}
          <Button onClick={generatePDF}>Generate PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}


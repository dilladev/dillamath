import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Switch } from './components/ui/switch';
import jsPDF from 'jspdf';

export default function MathWorksheetGenerator() {
  // State variables for worksheet settings
  const [numQuestions, setNumQuestions] = useState(10);
  const [operation, setOperation] = useState('addition');
  const [maxNumber, setMaxNumber] = useState(10);
  const [allowNegatives, setAllowNegatives] = useState(false);
  const [wholeDivision, setWholeDivision] = useState(true);
  const [allowZero, setAllowZero] = useState(false);
  const [allowOne, setAllowOne] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [showBoxes, setShowBoxes] = useState(false);

  // Generate a unique list of math problems
  const generateProblems = () => {
    const problems = [];
    const seen = new Set(); // Keep track of problems we've already seen to avoid duplicates
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

      // Apply zero and one filters
      if (!allowZero && (a === 0 || b === 0)) continue;
      if (!allowOne && (a === 1 || b === 1)) continue;

      // Ensure subtraction results are non-negative
      if (operation === 'subtraction' && !allowNegatives && a < b) {
        [a, b] = [b, a];
      }

      // Ensure whole number division
      if (operation === 'division') {
        b = Math.max(1, b);
        if (wholeDivision) {
          a = a - (a % b);
        }
      }

      // Avoid duplicates and filter invalid results
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

  // Generate 4 answer choices: 1 correct and 3 distractors
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

  // Add header (name/date/score) to the PDF page
  const addPageHeader = (doc) => {
    doc.setFontSize(12);
    doc.text('Name: ________________________', 20, 20);
    doc.text(`Date: ____________`, 150, 20);
    doc.text(`Score: ______ / ${numQuestions}`, 20, 30);
  };

  // Evaluate the correct answer for a given problem
  const correctAnswer = (p) =>{
    return eval(`${p.a} ${p.op === '×' ? '*' : p.op === '÷' ? '/' : p.op} ${p.b}`);
  }

  // Generate and render the PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    const problems = generateProblems();
    const colCount = 3;
    const pageWidth = 190;
    const marginX = 20;
    const colWidth = (pageWidth - marginX) / colCount;
    const rowHeight = multipleChoice ? 60: 50;
    let xStart = marginX;
    let yStart = 45;
    let x = xStart;
    let y = yStart;

    addPageHeader(doc);

    problems.forEach((p, i) => {
      // Start a new page if we run out of space
      if (y > 250) {
        doc.addPage();
        addPageHeader(doc);
        y = yStart;
        x = xStart;
      }

      const aStr = p.a.toString();
      const bStr = `${p.op} ${p.b}`;
      const answer = correctAnswer(p);

      // Draw the stacked problem
      doc.setFontSize(14);
      doc.text(`${i + 1}.`, x, y);
      doc.text(aStr, x + 20, y, { align: 'right' });
      doc.text(bStr, x + 20, y + 7, { align: 'right' });
      doc.line(x + 8, y + 10, x + colWidth - 30, y + 10);

      // Show boxes around questions
      if(showBoxes){
        const yOffset = 7;
        const xOffset = 5
        doc.line(x - xOffset, y - yOffset, x + colWidth - + xOffset, y - yOffset);
        doc.line(x + colWidth - xOffset, y - yOffset, x + colWidth - xOffset, y + rowHeight - yOffset );
        doc.line(x + colWidth - xOffset, y + rowHeight - yOffset, x - xOffset, y + rowHeight - yOffset );
        doc.line(x - xOffset, y + rowHeight - yOffset , x - xOffset, y - yOffset);
      }

      // Draw multiple choice options with bubbles
      if (multipleChoice) {
        const choices = generateChoices(answer);
        const labels = ['A', 'B', 'C', 'D'];
       
        choices.forEach((choice, idx) => {
          const bubbleX = x + 10;
          const bubbleY = y + 25 + idx * 7;
          doc.circle(bubbleX, bubbleY, 2);
          doc.text(`${labels[idx]}. ${choice}`, bubbleX + 6, bubbleY + 1.5);
        });
      }

      // Move to next column or row
      x += colWidth;
      if (x + colWidth > pageWidth) {
        x = xStart;
        y += rowHeight;
      }
    });

    doc.save('math-worksheet.pdf');
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Math Worksheet Generator</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          {/* Form controls for worksheet customization */}
          <div>
            <label className="block font-medium">Number of Questions</label>
            <Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} min={1} />
          </div>

          <div>
            <label className="block font-medium mb-1">Operation</label>
            <RadioGroup value={operation} onValueChange={setOperation} className="space-y-2">
              <RadioGroupItem value="addition" label="Addition" />
              <RadioGroupItem value="subtraction" label="Subtraction" />
              <RadioGroupItem value="multiplication" label="Multiplication" />
              <RadioGroupItem value="division" label="Division" />
            </RadioGroup>
          </div>

          {/* Toggles for operation-specific settings */}
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

          {/* General problem filters */}
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

          <div>
            <label className="block font-medium">Largest Number</label>
            <Input type="number" value={maxNumber} onChange={(e) => setMaxNumber(Number(e.target.value))} min={1} />
          </div>

          {/* Trigger PDF generation */}
          <Button onClick={generatePDF}>Generate PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}
